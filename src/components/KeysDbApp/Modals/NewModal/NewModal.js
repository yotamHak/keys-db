import React from "react";
import { Modal, Search, Segment, Header, Item, Icon, Container, Form, Input } from "semantic-ui-react";
import useFormValidation from '../../../Authentication/useFormValidation';
import validateNewKey from '../../../Authentication/validateNewKey';
import itadApi from "../../../../itad";
import _ from 'lodash';
import { getFormattedDate } from "../../../../utils";
import Spreadsheets from "../../../../google/Spreadsheets";
import steamApi from "../../../../steam/steam";

// const newRowValues = Object.keys(initialValue.headers)
//     .reduce((result, header) => _.concat(result, {
//         id: initialValue.headers[header].id,
//         header: header,
//         value: ''
//     }), [])
//     .sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)



function NewModal({ onSelect, initialValue, children }) {
    const INITIAL_STATE = Object.keys(initialValue.headers).reduce((acc, header) => ({ ...acc, [header]: '' }), {})

    const [showModal, setShowModal] = React.useState(true)
    const [isSearching, setIsSearching] = React.useState(false)
    const [searchResults, setSearchResults] = React.useState(null)
    const { handleSubmit, handleChange, updateValues, values, errors } = useFormValidation(INITIAL_STATE, validateNewKey, handleCreateKey);

    const ownedGames = steamApi.ownedGames

    React.useEffect(() => { console.log(initialValue); }, [])

    function handleCreateKey() {
        const sortedArray = Object.keys(values)
            .reduce((acc, key) => (_.concat(acc, [{ key: [key], value: values[key] }])), [])
            .sort((a, b) => initialValue.headers[a.key].id < initialValue.headers[b.key].id ? -1 : initialValue.headers[a.key].id > initialValue.headers[b.key].id ? 1 : 0)
            .reduce((acc, item) => _.concat(acc, [item.value]), [])

        Spreadsheets.InsertNewRow(sortedArray)
            .then(response => {
                debugger
                if (response.updatedRows === 1) {
                    closeModal()
                }
            })
            .then(reason => {
                console.error(reason)
            })

    }

    const Child = React.Children.only(children);
    const newChildren = React.cloneElement(Child, { onClick: openModal });

    function openModal() { setShowModal(true) }
    function closeModal() { setShowModal(false) }

    async function handleSearchResultSelect(e, { result }) {
        console.log("selected:", result);

        handleChange(e, { name: 'Name', value: result.title })

        const newRowValues = Object.keys(initialValue.headers)
            .reduce((result, header) => ({
                ...result,
                [header]: {
                    id: initialValue.headers[header].id,
                    header: header,
                    value: ''
                }
            }), [])

        newRowValues['Name'].value = result.title;
        newRowValues['AppId'].value = parseInt(result.appid);
        newRowValues['Steam URL'].value = result.urls.steam;
        newRowValues['isthereanydeal URL'].value = result.urls.itad;
        newRowValues['Date Added'].value = getFormattedDate(new Date());
        newRowValues['Own Status'].value = _.indexOf(ownedGames.games, parseInt(result.appid)) > -1 ? 'Own' : 'Missing';

        await itadApi.GetInfoAboutGame(result.plain).then(response => {
            console.log("More Info from ITAD:", response)
            newRowValues['Cards'].value = response.trading_cards ? 'Have' : 'Missing';
        })

        updateValues(e, newRowValues)
    }

    function handleSearchChange(e, { value }) {
        if (e.type === "focus" && searchResults !== null) return

        handleChange(e, { name: "Name", value: value })

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

            console.log("filteredResults", filteredResults);

            setIsSearching(false);
            setSearchResults(filteredResults);
        }, response => { console.error(response); setIsSearching(false); })
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

    function selectInput(header) {
        switch (header.label) {
            case 'Note':
                return <Form.TextArea
                    name={header.label}
                    label={header.label}
                    onChange={handleChange}
                    placeholder={`Add ${header.label}...`}
                    value={values[header.label]}
                    key={header.label}
                />
            case 'Date Added':
                return <Form.Input
                    name={header.label}
                    label={header.label}
                    onChange={handleChange}
                    value={values[header.label]}
                    key={header.label}
                />
            case 'Key':
                return <Form.Input
                    inline fluid
                    name={header.label}
                    label={header.label}
                    onChange={handleChange}
                    placeholder={`Add ${header.label}...`}
                    value={values[header.label]}
                    key={header.label}
                />

            default:
                if (header.options && header.options.length > 0) {
                    const options = header.options.reduce((result, option) => (
                        _.concat(result,
                            [{
                                key: option,
                                text: option,
                                value: option,
                            }])), []
                    )

                    return (
                        <Form.Field key={header.label}>
                            <Form.Select
                                fluid search
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
                } else {
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
    }

    return (
        <Modal
            closeIcon={<Icon name="close" onClick={closeModal} />}
            trigger={newChildren}
            centered={false}
            size="small"
            open={showModal}
        >
            <Modal.Header>Add Key</Modal.Header>
            <Modal.Content>
                <Modal.Description>
                    <Form onSubmit={handleSubmit}>
                        {
                            initialValue && (
                                <Form.Field width='16' key="Name">
                                    <label>Name</label>
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
                                        value={values.Name}
                                        style={{ width: '100%' }}
                                        className={'search-fluid-input'}
                                    />
                                </Form.Field>
                            )
                        }
                        {
                            initialValue && _.chunk(_.pull(Object.keys(initialValue.headers), "ID", "Name"), 2)
                                .map(group => {
                                    return (
                                        <Form.Group widths='equal' key={_.flatten(group)}>
                                            {
                                                group.map(key => selectInput(initialValue.headers[key]))
                                            }
                                        </Form.Group>
                                    )
                                })
                        }
                        <Form.Button type="submit">Submit</Form.Button>
                    </Form>
                </Modal.Description>
            </Modal.Content>
        </Modal >
    );
}

export default NewModal;