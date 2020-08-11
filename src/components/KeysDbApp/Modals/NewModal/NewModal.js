import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Modal, Search, Segment, Header, Item, Icon, Container, Form, Label, Button, } from "semantic-ui-react";
import _ from 'lodash';

import { reloadTable } from "../../../../actions";
import useFormValidation from '../../../Authentication/useFormValidation';
import validateNewKey from '../../../Authentication/validateNewKey';
import { parseSpreadsheetDate, parseOptions, genericSort } from "../../../../utils";
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
    const INITIAL_STATE = initialValue

    const [modalOpen, setModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmittinError, setIsSubmittinError] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [searchResults, setSearchResults] = useState(null)
    const { handleSubmit, handleChange, updateValues, reset, values, errors } = useFormValidation(INITIAL_STATE, validateNewKey, handleCreate)

    const dispatch = useDispatch()

    const handleOpen = () => setModalOpen(true)
    const handleClose = () => setModalOpen(false)

    const Child = React.Children.only(children);
    const newChildren = React.cloneElement(Child, { onClick: handleOpen });

    const steamTitleLabel = Object.keys(headers).find(key => headers[key].type === "steam_title")
    const steamAppIdLabel = Object.keys(headers).find(key => headers[key].type === "steam_appid")
    const steamUrlLabel = Object.keys(headers).find(key => headers[key].type === "steam_url")
    const steamCardsLabel = Object.keys(headers).find(key => headers[key].type === "steam_cards")
    const steamOwnershipLabel = Object.keys(headers).find(key => headers[key].type === "steam_ownership")
    const dateAddedLabel = Object.keys(headers).find(key => headers[key].type === "date")

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

    async function handleSearchResultSelect(e, { result }) {
        handleChange(e, { name: steamTitleLabel, value: result.title })

        const newRowValues = Object.keys(headers)
            .reduce((result, header) => ({
                ...result,
                [header]: {
                    id: headers[header].id,
                    header: header,
                    value: values[header]
                }
            }), [])

        newRowValues[steamTitleLabel].value = result.title;
        newRowValues[steamAppIdLabel].value = parseInt(result.appid);
        newRowValues[steamUrlLabel].value = result.urls.steam;
        newRowValues['isthereanydeal URL'].value = result.urls.itad;

        if (steam.loggedIn === true) {
            newRowValues[steamOwnershipLabel].value = DoesUserOwnGame(steam.ownedGames.games, result.appid) ? 'Own' : 'Missing'
        }

        await itadApi.GetInfoAboutGame(result.plain).then(response => {
            // console.log("More Info from ITAD:", response)
            newRowValues[steamCardsLabel].value = response.trading_cards ? 'Have' : 'Missing';
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

        switch (header.type) {
            case 'date':
                return <Form.Input
                    name={header.label}
                    label={header.label}
                    onChange={handleChange}
                    value={values[header.label]}
                    key={header.label}
                    type='date'
                />
            case 'text':
                return <Form.TextArea
                    name={header.label}
                    label={header.label}
                    onChange={handleChange}
                    placeholder={`Add ${header.label}...`}
                    value={values[header.label]}
                    key={header.label}
                />
            case 'steam_ownership':
            case 'steam_cards':
            case 'dropdown':
                const options = parseOptions(header.options)

                return (
                    <Form.Field key={header.label}>
                        <Form.Select
                            fluid
                            search

                            name={header.label}
                            label={header.label}
                            onChange={handleChange}
                            placeholder={`Add ${header.label}...`}
                            options={options}
                            value={values[header.label]}
                            key={header.label}
                        />
                    </Form.Field>
                )
            case 'string':
            case 'key':
            default:
                return (
                    <Form.Input
                        fluid
                        name={header.label}
                        label={header.label}
                        onChange={handleChange}
                        placeholder={`Add ${header.label}...`}
                        value={values[header.label]}
                        key={header.label}
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
                                    .filter(key => key !== "ID" && headers[key].type !== 'steam_title' && headers[key].type.indexOf('steam_') > -1)
                                    , 2).map(group => {
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
                                _.chunk(Object.keys(headers).filter(key => key !== "ID" && headers[key].type.indexOf('steam_') === -1), 2)
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