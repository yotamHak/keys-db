import React, { useEffect, useState } from "react";
import { Table, Button, Dimmer, List, Label, Icon, Segment, Loader, Placeholder } from 'semantic-ui-react';
import KeyRow from "../KeyRow/KeyRow";
import HeaderCell from "../Cells/HeaderCell/HeaderCell";
import Spreadsheets from '../../../google/Spreadsheets';
import _ from 'lodash';
import { usePrevious, genericSort } from "../../../utils";

// { key: 'From', values: ['Humblebundle'] }, { key: 'Status', values: ['Unused', 'Given'] }
function KeysTable({ inverted, spreadsheetId }) {
    const [headers, setHeaders] = useState({});
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(50);
    const [orderBy, setOrderBy] = useState({ sort: '', asc: true });
    const [filters, setFilters] = useState([]);


    const prevOffset = usePrevious(offset)

    useEffect(() => {
        if (_.isEmpty(headers)) {                                           // Initializing
            // console.log("First time loading Table");
            Spreadsheets.GetInitialTable(spreadsheetId)
                .then(response => {
                    setHeaders(response.headers)
                    setGames(response.rows)
                }, response => {
                    console.error('error in keytable', response)
                    setError(true)
                })
        } else {
            if (prevOffset !== offset && offset !== 0) {                    // Fetching more
                // console.log("Loading more...");
                // console.log("Offset:", offset);
                loadMoreGames(offset, limit, orderBy, filters);
            } else {                                                        // Resetting and ReFetching
                console.log("Loading Table");
                console.log("Offset:", offset);
                console.log("Limit:", limit);
                console.log("Order:", orderBy);
                console.log("Filters:", filters);
                getGames(offset, limit, orderBy, filters);
            }
        }
    }, [filters, offset, orderBy])

    const getOptionsWithoutValues = (options, values) => _.without(options, ...values)

    const getOptionsWithValues = (options, values) => _.concat(options, values).sort(genericSort)

    function getNewHeadersOptions(options) {
        // return {
        //     ...headers,
        //     ...{
        //         ...headers,
        //         ...options
        //     }
        // }

        return {
            ...headers,
            ...{
                options: {
                    ...headers.options,
                    ...options
                }
            }
        }
    }

    function removeFilter(filterKey, valueToRemove) {
        setHeaders(getNewHeadersOptions({ [filterKey]: getOptionsWithValues(headers[filterKey], [valueToRemove]) }))
        setOffset(0);
        setOrderBy({ sort: '', asc: true });
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
        const otherFilters = filters.filter(filter => { return filter.key !== newFilter.key });
        setHeaders(getNewHeadersOptions({ [newFilter.key]: getOptionsWithoutValues(headers[newFilter.key], newFilter.values) }))
        setOffset(0);
        setOrderBy({ sort: '', asc: true });
        setFilters(
            otherFilters.length > 0
                ? _.concat(otherFilters, newFilter)
                : [newFilter]
        )
    }

    function loadMoreGames(offset, limit, orderBy, filters) {
        // setLoading(true)
        Spreadsheets.LoadMore(offset, limit, orderBy, filters)
            .then(games => {
                console.log("Loading more games:", games.rows)
                setGames(games.rows)
                // setLoading(false)
            })
    }

    function getGames(offset, limit, orderBy, filters) {
        setLoading(true)
        Spreadsheets.GetFilteredData(offset, limit, orderBy, filters)
            .then(games => {
                console.log("Got filtered games:", games.rows)
                setGames(games.rows)
                setLoading(false)
            })
    }

    function order(order) {
        console.log(order)
        setOrderBy(order)
    }

    return (
        error
            ? <div>Error</div>
            : _.isEmpty(games)
                ? (
                    <Dimmer active>
                        <Loader />
                    </Dimmer>
                )
                : (
                    <Segment.Group raised>
                        <Segment size="mini">
                            <Button onClick={() => { setOffset(offset + limit) }}>load more</Button>
                            <Button onClick={() => { Spreadsheets.updateSingleCell() }}>write</Button>
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
                                        <Table.HeaderCell>
                                            <Button.Group className={'visibility-hidden'} basic size='mini'
                                                buttons={[
                                                    { key: 'refresh', icon: 'refresh', size: 'tiny' },
                                                    { key: 'save', icon: 'save', size: 'tiny' },
                                                    { key: 'edit', icon: 'pencil', size: 'tiny' },
                                                ]}
                                            />
                                        </Table.HeaderCell>
                                        {
                                            Object.keys(headers)
                                                .filter(headerKey => headerKey !== "ID")
                                                .map(headerKey => {
                                                    return <HeaderCell
                                                        header={headerKey}
                                                        headerOptions={headers[headerKey].options}
                                                        filterCallback={addFilter}
                                                        orderByCallback={order}
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
                                                false
                                                    ? <Table.Row verticalAlign="middle" textAlign="center">
                                                        {Object.keys(headers).map((header, index) => {
                                                            return (
                                                                <Table.Cell key={index}>
                                                                    <Placeholder fluid>
                                                                        <Placeholder.Line length='full' />
                                                                    </Placeholder>
                                                                </Table.Cell>
                                                            )
                                                        })}
                                                    </Table.Row>
                                                    : <Table.Row verticalAlign="middle" textAlign="center">
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