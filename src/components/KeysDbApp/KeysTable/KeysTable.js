import React, { useEffect, useState } from "react";
import { Table, Button, Dimmer, List, Label, Icon, Segment, Loader, Placeholder, Menu } from 'semantic-ui-react';
import KeyRow from "../KeyRow/KeyRow";
import HeaderCell from "../Cells/HeaderCell/HeaderCell";
import Spreadsheets from '../../../google/Spreadsheets';
import _ from 'lodash';
import useBottomPage, { usePrevious, genericSort } from "../../../utils";
import NewModal from "../Modals/NewModal/NewModal";
import steamApi from "../../../steam/steam";

const INITIAL_ORDERBY = { sort: '', asc: false }
const INITIAL_OFFSET = 0
const INITIAL_LIMIT = 24

// { key: 'From', values: ['Humblebundle'] }, { key: 'Status', values: ['Unused', 'Given'] }
function KeysTable({ inverted, spreadsheetId }) {
    const [headers, setHeaders] = useState({});
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [offset, setOffset] = useState(INITIAL_OFFSET);
    const [limit, setLimit] = useState(INITIAL_LIMIT);
    const [orderBy, setOrderBy] = useState(INITIAL_ORDERBY);
    const [filters, setFilters] = useState([]);

    const [newModalKey, setNewModalKey] = useState(0);
    const [reload, setReload] = useState(false);

    const prevOffset = usePrevious(offset);

    // const isBottom = useBottomPage(500);    
    // const prevBottom = usePrevious(isBottom);

    // useEffect(() => {
    //     if (isBottom && prevBottom !== isBottom) {
    //         setOffset(offset + limit);
    //     }
    // }, [isBottom])

    useEffect(() => {
        if (_.isEmpty(headers)) {                                           // Initializing
            // console.log("First time loading Table");
            Spreadsheets.GetInitialTable(spreadsheetId, offset, limit, orderBy, filters)
                .then(response => {
                    setHeaders(response.headers)
                    setGames(response.rows)
                }, response => {
                    console.error('error in keytable', response)
                    setError(true)
                })
        } else {
            if ((prevOffset !== offset && offset !== 0)) {                    // Fetching more
                console.log("Loading more...");
                console.log("Offset:", offset);
                loadMoreGames(offset, limit, orderBy, filters);
            } else {                                                        // Resetting and ReFetching
                console.log("Loading Table");
                console.log("Offset:", offset);
                console.log("Limit:", limit);
                console.log("Order:", orderBy);
                console.log("Filters:", filters);
                getGames(offset, limit, orderBy, filters);
            }

            // setReload(true)
        }
    }, [filters, offset, orderBy, reload])

    const getOptionsWithoutValues = (options, values) => _.without(options, ...values)

    const getOptionsWithValues = (options, values) => _.concat(options, values).sort(genericSort)

    function getNewHeadersOptions(options) {
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
        setOffset(INITIAL_OFFSET);
        setOrderBy(INITIAL_ORDERBY);
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
        setOffset(INITIAL_OFFSET);
        setOrderBy(INITIAL_ORDERBY);
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

    function add(value) {
        console.log("Finished adding...", value);
        setNewModalKey(newModalKey + 1);
        setReload(true)
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
                        <Segment size="mini" key={`action-menu-segment`}>
                            <Menu>
                                <React.Fragment key={newModalKey}>
                                    <NewModal onSelect={add} initialValue={{ headers: headers }}>
                                        <Menu.Item name='add-new'>
                                            <Icon name='plus' />
                                        </Menu.Item>
                                    </NewModal>
                                </React.Fragment>

                                <Menu.Item
                                    name='load-more'
                                    onClick={() => { setOffset(offset + limit) }}
                                >
                                    Load More
                                </Menu.Item>

                            </Menu>
                        </Segment>
                        <Segment size="mini" key={`filters-segment`}>
                            <List verticalAlign="middle" size="small" divided horizontal >
                                {
                                    filters.map((filter, filterIndex) => {
                                        return (
                                            <List.Item key={filterIndex}>
                                                <List.Content>
                                                    <List.Header>{filter.key}</List.Header>
                                                    {
                                                        filter.values.map((filterValue, valueIndex) => (
                                                            <Label basic key={valueIndex}>
                                                                {filterValue}
                                                                <Icon name='close' onClick={() => { removeFilter(filter.key, filterValue) }} />
                                                            </Label>
                                                        ))
                                                    }
                                                </List.Content>
                                            </List.Item>
                                        )
                                    })
                                }
                            </List>
                        </Segment>
                        <Segment size="mini" key={`table-segment`}>
                            <Table celled striped inverted={inverted}>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>
                                            <Button.Group basic
                                                className={'visibility-hidden'}
                                                size='mini'
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
                                                .map((headerKey, index) => {
                                                    return <HeaderCell
                                                        header={headerKey}
                                                        headerOptions={headers[headerKey].options}
                                                        filterCallback={addFilter}
                                                        orderByCallback={order}
                                                        key={index}
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
                                            : games.map((game, index) => <KeyRow
                                                gameData={game}
                                                headers={headers}
                                                key={index}
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