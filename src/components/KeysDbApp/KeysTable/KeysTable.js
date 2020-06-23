import React from "react";
import { Table, Button, Dimmer, List, Label, Icon, Segment, Loader } from 'semantic-ui-react';
import KeyRow from "../KeyRow/KeyRow";
// import dateFns from "date-fns";
import HeaderCell from "../HeaderCell/HeaderCell";
import spreadsheet from '../../../google/spreadsheet';
import spreadsheets from "../../../google/spreadsheet";
import _ from 'lodash';

// { key: 'From', values: ['Humblebundle'] }, { key: 'Status', values: ['Unused', 'Given'] }
function KeysTable({ inverted, allOptions, spreadsheetId }) {
    const [rowsToDisplay, setRowsToDisplay] = React.useState(50);
    const [sortingFunction, setSortingFunction] = React.useState({ callback: sortByDate });
    const [filters, setFilters] = React.useState([]);
    const [descending, setDescending] = React.useState(true);
    const [headers, setHeaders] = React.useState([]);

    const [games, setGames] = React.useState([]);

    React.useEffect(() => {
        if (_.isEmpty(games) && _.isEmpty(filters)) {
            console.log("First time loading Table");
            spreadsheets.GetInitialTable(spreadsheetId)
                .then(response => {
                    console.log("Table recieved:", response)
                })
        } else {
            console.log("Loading Table");
            spreadsheets.Query(spreadsheetId, filters)
                .then(response => {
                    console.log("Table recieved:", response)
                })
        }
    }, [])

    const addUsedFilter = () => setFilters([...filters, { key: 'Status', values: ['Used'] }])

    const sortByName = (a, b) => a.Name < b.Name ? -1 : a.Name > b.Name ? 1 : 0;

    function sortByDate(a, b) {
        const value = descending ? 1 : -1;
        // return new Date(b.Added) - new Date(a.Added);
        return new Date(a.Added) < new Date(b.Added) ? 1 * value : new Date(a.Added) > new Date(b.Added) ? -1 * value : 0;
    }

    function removeFilter(filterKey, valueToRemove) {
        setFilters(filters.reduce((result, filter) => {
            return filter.key === filterKey
                ? filter.values.length === 1
                    ? result
                    : result.concat([{
                        key: filterKey,
                        values: filter.values.filter(filter => { return filter !== valueToRemove })
                    }])
                : result.concat(filter)
        }, []))
    }

    function getGames(filters) {
        spreadsheets.Query(spreadsheetId, filters)
            .then(response => { console.log(response) })
    }

    function addFilter(newFilter) {
        const oldSelectedFilter = filters.filter(filter => { return filter.key === newFilter.key })[0]
        const oldFiltersWithoutNew = filters.filter(filter => { return filter.key !== newFilter.key })

        const newFilters = oldSelectedFilter
            ? oldFiltersWithoutNew.concat({ "key": newFilter["key"], "values": oldSelectedFilter["values"].concat(newFilter.values) })
            : filters.concat(newFilter)

        getGames(newFilters)
        setFilters(newFilters)

        // console.log("adding filter", filter)
    }

    return (
        _.isEmpty(games)
            ? (
                <Dimmer active>
                    <Loader />
                </Dimmer>
            )
            : (
                <Segment.Group raised>
                    <Segment size="mini">
                        <Button onClick={() => { setRowsToDisplay(rowsToDisplay + 25) }}>load more</Button>
                        <Button onClick={() => { spreadsheet.updateSingleCell() }}>write</Button>
                    </Segment>
                    <Segment size="mini">
                        <List verticalAlign="middle" size="small" divided horizontal >
                            {/* <List.Item header={<Icon name="filter" />} /> */}
                            {
                                filters.map((filter, filterIndex) => {
                                    return (
                                        <List.Item key={filterIndex}>
                                            <List.Content>
                                                <List.Header>{filter.key}</List.Header>
                                                {
                                                    filter.values.map((filterValue, valueIndex) => <Label key={valueIndex} basic>
                                                        {filterValue}
                                                        <Icon name='close' onClick={() => { removeFilter(filter.key, filterValue) }} />
                                                    </Label>)
                                                }
                                            </List.Content>
                                        </List.Item>
                                    )
                                })
                            }

                        </List>
                    </Segment>
                    <Segment size="mini">
                        <Table celled structured inverted={inverted}>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell></Table.HeaderCell>
                                    {
                                        headers.map(rowName => {
                                            return <HeaderCell
                                                filterCallback={addFilter}
                                                filters={filters}
                                                header={rowName}
                                                values={allOptions[rowName]}
                                                key={rowName}
                                            />
                                        })
                                    }
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {
                                    _.isEmpty(games)
                                        ? (
                                            <Dimmer active>
                                                <Loader />
                                            </Dimmer>
                                        )
                                        : games
                                            .filter(game => {
                                                let result = true;
                                                filters.forEach(filter => { result = result && filter.values.some((currentValue) => { return game[filter.key] === currentValue }) });
                                                return result;
                                            })
                                            .sort(sortingFunction.callback)
                                            .map((game, index) => {
                                                return index < rowsToDisplay && <KeyRow
                                                    gameData={game}
                                                    headers={headers}
                                                    key={game.ssLocation.row}
                                                />
                                            })
                                }
                                {

                                    false && Object.keys(games)
                                        .map((game, keysIndex) => {
                                            return games[game]
                                                .sort(sortingFunction.callback)
                                                .map((gameRow, gamesIndex) => {
                                                    return keysIndex < rowsToDisplay && <KeyRow
                                                        gameData={gameRow}
                                                        isFirst={gamesIndex === 0}
                                                        headers={headers}
                                                        numberOfDuplicates={games[game].length}
                                                        key={gameRow.ssLocation.row}
                                                    ></KeyRow>
                                                })

                                        })
                                }
                            </Table.Body>
                        </Table>
                    </Segment>
                </Segment.Group>
            )
    );
}

export default KeysTable;
