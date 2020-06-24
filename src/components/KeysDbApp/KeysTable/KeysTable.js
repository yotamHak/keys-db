import React from "react";
import { Table, Button, Dimmer, List, Label, Icon, Segment, Loader } from 'semantic-ui-react';
import KeyRow from "../KeyRow/KeyRow";
// import dateFns from "date-fns";
import HeaderCell from "../HeaderCell/HeaderCell";
import spreadsheet from '../../../google/spreadsheet';
import spreadsheets from "../../../google/spreadsheet";
import _ from 'lodash';

// { key: 'From', values: ['Humblebundle'] }, { key: 'Status', values: ['Unused', 'Given'] }
function KeysTable({ inverted, spreadsheetId }) {
    const [rowsToDisplay, setRowsToDisplay] = React.useState(50);
    const [sortingFunction, setSortingFunction] = React.useState({ callback: sortByDate });
    const [filters, setFilters] = React.useState([]);
    const [descending, setDescending] = React.useState(true);
    const [headers, setHeaders] = React.useState([]);
    const [games, setGames] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (_.isEmpty(headers)) {
            console.log("First time loading Table");
            spreadsheets.GetInitialTable(spreadsheetId)
                .then(response => {
                    setHeaders(response.headers)
                    setGames(response.rows)
                })
        } else {
            console.log("Loading Table");
            console.log("Filters:", filters)
            getGames(filters);
        }
    }, [filters])

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
        }, []));
    }

    function addFilter(newFilter) {
        const oldSelectedFilter = filters.filter(filter => { return filter.key === newFilter.key })[0];

        setFilters(
            oldSelectedFilter
                ? _.concat(
                    filters.filter(filter => { return filter.key !== newFilter.key }),
                    { "key": newFilter["key"], "values": _.concat(oldSelectedFilter["values"], newFilter.values) }
                )
                : _.concat(
                    filters,
                    newFilter
                )
        )
    }

    function getGames(filters) {
        setLoading(true)
        spreadsheets.GetFilteredData(undefined, undefined, undefined, undefined, filters)
            .then(games => {
                console.log("Got filtered games:", games.rows)
                setGames(games.rows)
                setLoading(false)
            })
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
                        <Table celled striped inverted={inverted}>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell></Table.HeaderCell>
                                    {
                                        Object.keys(headers)
                                            .filter(headerKey => headerKey !== "ID")
                                            .map(headerKey => {
                                                return <HeaderCell
                                                    filterCallback={addFilter}
                                                    filters={filters}
                                                    header={headerKey}
                                                    values={headers[headerKey]}
                                                    key={headerKey}
                                                />
                                            })
                                    }
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {
                                    loading
                                        ? (
                                            <Table.Row verticalAlign="middle" textAlign="center">
                                                <Table.Cell colSpan={Object.keys(headers).length}>
                                                    <Loader active inline='centered' content='Loading' />
                                                </Table.Cell>
                                            </Table.Row>
                                        )
                                        : games.map(game => <KeyRow
                                            gameData={game}
                                            headers={Object.keys(headers)}
                                            key={`${game[0]}-${game[1]}`}
                                        />)
                                }

                            </Table.Body>
                        </Table>
                    </Segment>
                </Segment.Group>
            )
    );
}

export default KeysTable;

// {

//     false && Object.keys(games)
//         .map((game, keysIndex) => {
//             return games[game]
//                 .sort(sortingFunction.callback)
//                 .map((gameRow, gamesIndex) => {
//                     return keysIndex < rowsToDisplay && <KeyRow
//                         gameData={gameRow}
//                         isFirst={gamesIndex === 0}
//                         headers={headers}
//                         numberOfDuplicates={games[game].length}
//                         key={gameRow.ssLocation.row}
//                     ></KeyRow>
//                 })

//         })
// }


// games
//                                             .filter(game => {
//                                                 let result = true;
//                                                 filters.forEach(filter => { result = result && filter.values.some((currentValue) => { return game[filter.key] === currentValue }) });
//                                                 return result;
//                                             })
//                                             .sort(sortingFunction.callback)
//                                             .map((game, index) => {
//                                                 return index < rowsToDisplay && <KeyRow
//                                                     gameData={game}
//                                                     headers={headers}
//                                                     key={game.ssLocation.row}
//                                                 />
//                                             })