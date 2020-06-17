import React from "react";
import { Table, Modal, Search, Label, Item, Segment } from "semantic-ui-react";
import itadApi from "../../../itad";
import _ from 'lodash';

function NameCell({ name }) {
    const [showModal, setShowModal] = React.useState(false)
    const [isSearching, setIsSearching] = React.useState(false)
    const [searchResults, setSearchResults] = React.useState(null)
    const [searchValue, setSearchValue] = React.useState(null)
    const [resultSelect, setResultSelect] = React.useState(null)

    function findGame(name) {
        setSearchValue(name)
        setShowModal(true)
    }

    function gameSelected() {

    }

    function handleResultSelect(e, { result }) { setResultSelect(result.title) }

    function handleSearchChange(e, { value }) {
        setSearchValue(value);

        if (value.length < 3 || isSearching) return

        setIsSearching(true)

        setTimeout(() => {
            itadApi.FindGame(value).then(response => {
                console.log(response)

                const filteredResults = response.data.data.list.reduce((results, item) => {
                    const categoryName = item.urls.buy.split('/')[3].toUpperCase();
                    const newResult = {
                        'plain': item.plain,
                        'title': item.title,
                    }

                    if (results[categoryName]) {
                        return {
                            ...results,
                            [categoryName]: {
                                "name": categoryName,
                                "results": results[categoryName].results.concat(newResult)
                            }
                        }
                    } else {
                        const newCategory = {
                            [categoryName]: {
                                "name": categoryName,
                                "results": [newResult]
                            }
                        }
                        return {
                            ...results,
                            ...newCategory
                        }
                    }
                }, {})

                console.log(filteredResults)
                setSearchResults(filteredResults)
            })
            setIsSearching(false)
        }, 300)
    }

    const resultRenderer = ({ plain, title }) => <Label key={plain} content={title} />

    const categoryRenderer = ({ name }) => <Label as='span' content={name} />

    const categoryLayoutRenderer = ({ categoryContent, resultsContent }) => (
        // <div style={{ maxHeight: "250px", overflow: "auto" }}>
        //     <h3>{categoryContent}</h3>
        //     <div>
        //         {resultsContent}
        //     </div>
        // </div>
        <Segment.Group style={{ maxHeight: "250px", overflow: "auto" }}>
            <Segment>{categoryContent}</Segment>
            <Segment.Group>
                <Segment>{resultsContent}</Segment>
            </Segment.Group>
        </Segment.Group>
    )

    function handleModalClose() { setShowModal(false) }

    return (
        <>
            <Modal open={showModal} onClose={handleModalClose} centered={false} >
                <Modal.Header>Find Game</Modal.Header>
                <Modal.Content>
                    <Modal.Description>
                        <Search
                            category
                            categoryLayoutRenderer={categoryLayoutRenderer}
                            categoryRenderer={categoryRenderer}
                            resultRenderer={resultRenderer}
                            loading={isSearching}
                            onResultSelect={gameSelected}
                            onSearchChange={_.debounce(handleSearchChange, 500, { leading: true, })}
                            results={searchResults}
                            value={searchValue}
                        />
                    </Modal.Description>
                </Modal.Content>
            </Modal>
            <Table.Cell onClick={() => { findGame(name) }}>{name}</Table.Cell>
        </>
    );
}

export default NameCell;
