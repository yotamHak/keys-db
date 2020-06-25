import React from "react";
import { Modal, Search, Segment, Header, Item, Icon, Container, Button, Input, Divider } from "semantic-ui-react";
import itadApi from "../../../../itad";
import _ from 'lodash';

function SearchModal({ onSelect, initialValue, children }) {
    const [showModal, setShowModal] = React.useState(false)
    const [isSearching, setIsSearching] = React.useState(false)
    const [searchResults, setSearchResults] = React.useState(null)
    const [value, setValue] = React.useState(initialValue)
    const manualInputRef = React.createRef();

    React.useEffect(() => { }, [])

    const Child = React.Children.only(children);
    const newChildren = React.cloneElement(Child, { onClick: openModal });

    function openModal() { setShowModal(true) }
    function closeModal() { setShowModal(false) }

    function handleResultSelect(e, { result }) {
        onSelect(result);
        closeModal();
    }

    function handleSearchChange(e, { value }) {
        if (e.type === "focus" && searchResults !== null) { return }

        setValue(value)
        if (isSearching || !value || value.length < 3) return
        setIsSearching(true)
        itadApi.FindGame(value).then(response => {
            console.log("response", response);

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

    function handleManualSelect(e) {
        onSelect(manualInputRef.current.value);
        closeModal();
    }

    return (
        <Modal
            closeIcon={<Icon name="close" onClick={closeModal} />}
            trigger={newChildren}
            centered={false}
            size="small"
            open={showModal}
        >
            <Modal.Header>Find Game</Modal.Header>
            <Modal.Content>
                <Modal.Description>
                    <Search
                        category fluid
                        categoryLayoutRenderer={categoryLayoutRenderer}
                        categoryRenderer={categoryRenderer}
                        resultRenderer={resultRenderer}
                        results={searchResults}
                        onResultSelect={handleResultSelect}
                        onSearchChange={_.debounce(handleSearchChange, 500, { leading: true, })}
                        onFocus={handleSearchChange}
                        minCharacters={3}
                        showNoResults={true}
                        loading={isSearching}
                        value={value}
                        className={'search-fluid-input'}
                    />
                    <Divider horizontal>Or</Divider>
                    <Input type='text' placeholder='Title...' fluid action>
                        <input ref={manualInputRef} />
                        <Button onClick={handleManualSelect} type='submit'>Change</Button>
                    </Input>
                </Modal.Description>
            </Modal.Content>
        </Modal >
    );
}

export default SearchModal;