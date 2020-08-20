import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Modal, Search, Segment, Header, Item, Icon, Container, Form, Label, Button, } from "semantic-ui-react";
import _ from 'lodash';

import { reloadTable } from "../../../../actions";
import useFormValidation from '../../../Authentication/useFormValidation';
import validateNewKey from '../../../Authentication/validateNewKey';
import { parseSpreadsheetDate, parseOptions, genericSort, isDropdownType, getLabelByType } from "../../../../utils";
import ErrorBox from "../../../Authentication/ErrorBox/ErrorBox";
import itadApi from "../../../../itad";
import Spreadsheets from "../../../../google/Spreadsheets";
import { DoesUserOwnGame } from "../../../../steam/steamApi";

function NewModal({ initialValue, isEdit, children }) {
    const headers = useSelector((state) => state.table.headers)
    const spreadsheetId = useSelector((state) => state.authentication.currentSpreadsheetId)
    const sheetId = useSelector((state) => state.authentication.currentSheetId)
    const steam = useSelector((state) => state.authentication.steam)
    const isTableEmpty = useSelector((state) => state.table.isEmpty)

    const [modalOpen, setModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmittinError, setIsSubmittinError] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [searchResults, setSearchResults] = useState(null)

    const INITIAL_STATE = initialValue
    const { handleSubmit, handleChange, updateValues, reset, values, errors } = useFormValidation(INITIAL_STATE, validateNewKey, handleCreate)

    const dispatch = useDispatch()

    const handleOpen = () => setModalOpen(true)
    const handleClose = () => setModalOpen(false)

    const Child = React.Children.only(children);
    const newChildren = React.cloneElement(Child, { onClick: handleOpen });

    const steamTitleLabel = getLabelByType(headers, "steam_title")
    const steamAppIdLabel = getLabelByType(headers, "steam_appid")
    const steamUrlLabel = getLabelByType(headers, "steam_url")
    const steamCardsLabel = getLabelByType(headers, "steam_cards")
    const steamOwnershipLabel = getLabelByType(headers, "steam_ownership")
    const steamAchievementsLabel = getLabelByType(headers, "steam_achievements")
    const steamBundledLabel = getLabelByType(headers, "steam_bundled")
    const dateAddedLabel = getLabelByType(headers, "date")

    function afterResponse() {
        handleClose();
        setIsLoading(false);
    }

    function onResponse(response) {
        if (response.success) {
            reset()
            dispatch(reloadTable(true))
        } else {
            console.error(response);
            setIsSubmittinError(true);
        }
    }

    function handleCreate() {
        setIsLoading(true)

        const sortedArray = Object.keys(values)
            .reduce((acc, key) => (_.concat(acc, [{ key: [key], value: values[key] }])), [])
            .sort((a, b) => genericSort(headers[a.key].id, headers[b.key].id))
            .reduce((acc, item) => _.concat(acc, [item.value]), [])

        if (isEdit) {
            Spreadsheets.Update(spreadsheetId, sheetId, sortedArray, INITIAL_STATE["ID"])
                .then(onResponse)
                .finally(afterResponse)
        }
        else {
            Spreadsheets.Insert(spreadsheetId, sheetId, [sortedArray], isTableEmpty ? "B3:Z3" : "B:Z")
                .then(onResponse)
                .finally(afterResponse)
        }
    }

    function fillValueIfFieldExist(label, values, onExist) {
        if (label) {
            values[label].value = onExist()
        }

        return values
    }

    async function handleSearchResultSelect(e, { result }) {
        handleChange(e, { name: steamTitleLabel, value: result.title })

        let newRowValues = Object.keys(headers)
            .reduce((result, header) => ({
                ...result,
                [header]: {
                    id: headers[header].id,
                    header: header,
                    value: values[header]
                }
            }), [])

        newRowValues = fillValueIfFieldExist(steamTitleLabel, newRowValues, () => result.title)
        newRowValues = fillValueIfFieldExist(steamAppIdLabel, newRowValues, () => parseInt(result.appid))
        newRowValues = fillValueIfFieldExist(steamUrlLabel, newRowValues, () => result.urls.steam)
        newRowValues = fillValueIfFieldExist('isthereanydeal URL', newRowValues, () => result.urls.itad)

        if (steam.loggedIn === true) {
            newRowValues = fillValueIfFieldExist(steamOwnershipLabel, newRowValues, () => DoesUserOwnGame(steam.ownedGames.games, result.appid) ? 'Own' : 'Missing')
        }

        await itadApi.GetOverview(result.plain)
            .then(response => {
                // console.log("ITAD data:", response.data)

                if (!response.success) {
                    console.error("Error getting overview from ITAD", response)
                    return
                }

                newRowValues = fillValueIfFieldExist(steamBundledLabel, newRowValues, () => response.data.bundles && response.data.bundles.count ? response.data.bundles.count : 0)
            })

        await itadApi.GetInfoAboutGame(result.plain)
            .then(response => {
                // console.log("More Info from ITAD:", response)

                if (!response.success) {
                    console.error("Error getting info about game from ITAD", response)
                    return
                }

                newRowValues = fillValueIfFieldExist(steamCardsLabel, newRowValues, () => response.data.trading_cards ? 'Have' : 'Missing')
                newRowValues = fillValueIfFieldExist(steamAchievementsLabel, newRowValues, () => response.data.achievements ? 'Have' : 'Missing')
            })

        updateValues(e, newRowValues)
    }

    function handleSearchChange(e, { value }) {
        if (e.type === "focus" && searchResults !== null) return

        handleChange(e, { name: steamTitleLabel, value: value })

        if (isSearching || !value || value.length < 3) return

        setIsSearching(true);

        itadApi.FindGame(value).then(response => {
            const uniqueResultsObject = response.data.data.list.reduce((acc, item) => Object.assign(acc, { [item.plain]: item }), {});
            const uniqueResultsArray = Object.keys(uniqueResultsObject).map(s => ({ ...uniqueResultsObject[s] }));
            const filteredResults = uniqueResultsArray.reduce((results, item) => {
                const categoryName = item.urls.buy.split('/')[3].toUpperCase();
                const appId = item.urls.buy.split('/')[4];
                const newResult = {
                    'title': item.title,
                    'appid': appId,
                    'image': categoryName === "APP" ? `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/header.jpg` : "",
                    'plain': item.plain,
                    'urls': {
                        'steam': item.urls.buy,
                        'itad': item.urls.game
                    }
                }

                return results[categoryName]
                    ? {
                        ...results,
                        [categoryName]: {
                            "name": categoryName,
                            "results": results[categoryName].results.concat(newResult)
                        }
                    }
                    : {
                        ...results,
                        [categoryName]: {
                            "name": categoryName,
                            "results": [newResult]
                        }
                    }
            }, {})

            // console.log("filteredResults", filteredResults);

            setIsSearching(false);
            setSearchResults(filteredResults);
        }, response => { console.error(response); setIsSearching(false); })
    }

    function selectInput(header) {
        if (header.label === dateAddedLabel && values[header.label] === "") {
            values[header.label] = parseSpreadsheetDate(new Date())
        }

        const label = header.label
        const headerKey = Object.keys(headers).find(headerKey => headers[headerKey].label === header.label)

        if (isDropdownType(header.type)) {
            const options = parseOptions(header.options)

            return (
                <Form.Field key={headerKey}>
                    <Form.Select
                        fluid
                        search
                        name={headerKey}
                        label={label}
                        onChange={handleChange}
                        placeholder={`Add ${label}...`}
                        options={options}
                        value={values[headerKey]}
                        key={headerKey}
                    />
                </Form.Field>
            )
        } else if (header.type === 'date') {
            return <Form.Input
                name={headerKey}
                label={label}
                onChange={handleChange}
                value={values[headerKey]}
                key={label}
                type='date'
            />
        } else if (header.type === 'text') {
            return <Form.TextArea
                name={headerKey}
                label={label}
                onChange={handleChange}
                placeholder={`Add ${label}...`}
                value={values[headerKey]}
                key={label}
            />
        } else {
            return (
                <Form.Input
                    fluid
                    name={headerKey}
                    label={label}
                    onChange={handleChange}
                    placeholder={`Add ${label}...`}
                    value={values[headerKey]}
                    key={label}
                />
            )
        }
    }

    const categoryLayoutRenderer = ({ categoryContent, resultsContent }) => (
        <Container>
            {categoryContent}
            <Segment attached style={{ maxHeight: "250px", overflow: "auto" }}>
                {resultsContent}
            </Segment>
        </Container>
    )

    const categoryRenderer = ({ name }) => (
        <Header as='h3' attached='top' textAlign="left">
            {name}
        </Header>
    )

    const resultRenderer = ({ title, image }) => (
        <Item.Group divided>
            <Item>
                {image !== "" && <Item.Image size='huge' src={image} />}
                <Item.Content verticalAlign='middle' content={title} />
            </Item>
        </Item.Group>
    )

    return (
        <Modal
            trigger={newChildren}
            open={modalOpen}
            onClose={handleClose}
            closeIcon={<Icon name="close" onClick={handleClose} />}
            centered={false}
            size="small"
        >
            <Modal.Header>{isEdit ? "Edit" : "Add"} Key</Modal.Header>
            <Modal.Content scrolling>
                <Modal.Description>
                    <Form autoComplete="off">
                        <Segment basic>
                            <Label attached='top'>Steam</Label>
                            {
                                initialValue && (
                                    <Form.Field width='16'>
                                        <label>{steamTitleLabel}</label>
                                        <Search
                                            category fluid
                                            categoryLayoutRenderer={categoryLayoutRenderer}
                                            categoryRenderer={categoryRenderer}
                                            resultRenderer={resultRenderer}
                                            results={searchResults}
                                            onSearchChange={_.debounce(handleSearchChange, 500, { leading: true, })}
                                            onFocus={handleSearchChange}
                                            onResultSelect={handleSearchResultSelect}
                                            minCharacters={3}
                                            showNoResults={true}
                                            loading={isSearching}
                                            value={values[steamTitleLabel]}
                                            style={{ width: '100%' }}
                                            className={'search-fluid-input'}
                                        />
                                    </Form.Field>
                                )
                            }
                            {
                                _.chunk(Object.keys(headers)
                                    .filter(key => key !== "ID" && headers[key].type && headers[key].type !== 'steam_title' && headers[key].type.indexOf('steam_') > -1), 2)
                                    .map(group => {
                                        return (
                                            <Form.Group widths='equal' key={_.flatten(group)}>
                                                {
                                                    group.map(key => selectInput(headers[key]))
                                                }
                                            </Form.Group>
                                        )
                                    })
                            }
                        </Segment>
                        <Segment basic>
                            <Label attached='top'>General</Label>
                            {
                                _.chunk(Object.keys(headers).filter(key => key !== "ID" && headers[key].type && headers[key].type.indexOf('steam_') === -1), 2)
                                    .map(group => {
                                        return (
                                            <Form.Group widths='equal' key={_.flatten(group)}>
                                                {
                                                    group.map(key => selectInput(headers[key]))
                                                }
                                            </Form.Group>
                                        )
                                    })
                            }
                        </Segment>
                    </Form>
                    <ErrorBox errors={errors} />
                </Modal.Description>
            </Modal.Content>

            <Modal.Actions>
                <Button onClick={reset}>Reset</Button>
                <Button onClick={handleClose} negative>Cancel</Button>
                <Button type="submit" loading={isLoading} onClick={handleSubmit} positive>Save</Button>
            </Modal.Actions>
        </Modal >
    )
}

export default NewModal;