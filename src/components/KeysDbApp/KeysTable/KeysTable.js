import React, { useEffect, useState, useRef } from "react";
import { useHistory } from 'react-router-dom';
import { Context } from "../Main";
import { Table, Dimmer, List, Label, Icon, Segment, Loader, Placeholder, Menu, Pagination, Dropdown, Header } from 'semantic-ui-react';
import _ from 'lodash';
import { usePrevious } from "../../../utils";
import KeyRow from "../KeyRow/KeyRow";
import HeaderCell from "../Cells/HeaderCell/HeaderCell";
import Spreadsheets from '../../../google/Spreadsheets';
import NewModal from "../Modals/NewModal/NewModal";
import SortDropdown from "../SortDropdown/SortDropdown";

const INITIAL_ORDERBY = { sort: 'Date Added', asc: false }
const INITIAL_OFFSET = 0
const INITIAL_LIMIT = 24
const INITIAL_ACTIVEPAGE = 1

function KeysTable({ spreadsheetId }) {
    const context = React.useContext(Context);

    const [headers, setHeaders] = useState(context.headers);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [offset, setOffset] = useState(INITIAL_OFFSET);
    const [limit, setLimit] = useState(INITIAL_LIMIT);
    const [orderBy, setOrderBy] = useState(INITIAL_ORDERBY);
    const [filters, setFilters] = useState([]);

    const [newModalKey, setNewModalKey] = useState(0);

    const [activePage, setActivePage] = useState(INITIAL_ACTIVEPAGE);
    const [pages, setPages] = useState(0);

    const [reload, setReload] = useState(false);
    const history = useHistory();

    const prevOffset = usePrevious(offset);
    const prevLimit = usePrevious(limit);
    const prevReload = usePrevious(reload);

    const headerCellRefs = Object.keys(headers).reduce((acc, item) => {
        return {
            ...acc,
            [item]: useRef()
        }
    }, {})

    useEffect(() => {
        if (prevReload === true && reload === false) { return }
        if (!spreadsheetId) { history.push(`settings`); return }

        console.log("Loading Table");
        console.log("Offset:", offset);
        console.log("Limit:", limit);
        console.log("Order:", orderBy);
        console.log("Filters:", filters);
        console.log("-------------------------")

        if (!reload && (prevOffset !== offset && offset !== 0)) {                           // Fetching more
            console.log("Loading more...");
            // loadMoreGames(offset, limit, orderBy, filters);
        } else if (prevLimit !== limit) {                                                   // Resetting because of Limit
            console.log("Resetting Limit...");

            loadGames(INITIAL_OFFSET, limit, orderBy, filters);
        }
        else {                                                                              // Resetting and ReFetching
            console.log("Resetting...");
            loadGames(offset, limit, orderBy, filters);
        }

        setReload(false)

    }, [filters, offset, limit, orderBy, reload]);

    function removeFilter(filterKey, valueToRemove) {
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

        headerCellRefs[filterKey].current.handleFilterRemoval(valueToRemove);
    }

    function addFilter(newFilter) {
        const otherFilters = filters.filter(filter => { return filter.key !== newFilter.key });
        setOffset(INITIAL_OFFSET);
        setOrderBy(INITIAL_ORDERBY);
        setFilters(
            otherFilters.length > 0
                ? _.concat(otherFilters, newFilter)
                : [newFilter]
        )
    }

    function handleOrderByChange(order) {
        console.log("Changing orderBy: ", order)
        setOffset(INITIAL_OFFSET);
        setOrderBy(order)
    }

    function handleLimitChange(e, { value }) {
        console.log("Changing limit: ", value)
        setOffset(INITIAL_OFFSET);
        setActivePage(INITIAL_ACTIVEPAGE)
        setLimit(value)
    }

    function loadGames(offset, limit, orderBy, filters) {
        setLoading(true)
        Spreadsheets.GetFilteredData(offset, limit, orderBy, filters)
            .then(games => {
                console.log("Got filtered games:", games)
                games.count && setPages(Math.floor(games.count / limit));
                setGames(games.rows);
                setLoading(false);
            })
    }

    function addGame(value) {
        console.log("Finished adding...", value);
        setNewModalKey(newModalKey + 1);
        setReload(true)
    }

    function handlePaginationChange(e, { activePage }) {
        setActivePage(activePage);
        setOffset((activePage - 1) * limit);
        setReload(true);
        window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
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
                                <Menu.Item>
                                    <SortDropdown headers={headers} value={orderBy} onSort={handleOrderByChange} />
                                </Menu.Item>

                                <Menu.Item>
                                    <Header as='h4'>
                                        <Header.Content>
                                            {` Limit: `}
                                            <Dropdown
                                                floating
                                                defaultValue={limit}
                                                onChange={handleLimitChange}
                                                options={_.times(3, number => ({ key: INITIAL_LIMIT * (number + 1), text: INITIAL_LIMIT * (number + 1), value: INITIAL_LIMIT * (number + 1) }))}
                                            />
                                        </Header.Content>
                                    </Header>
                                </Menu.Item>

                                <Menu.Menu position='right'>
                                    <React.Fragment>
                                        <NewModal onSelect={addGame} initialValue={{ headers: headers }} key={newModalKey}>
                                            <Menu.Item name='add-new'>
                                                <Icon name='plus' />
                                            </Menu.Item>
                                        </NewModal>
                                    </React.Fragment>

                                    <Menu.Item name='settings' onClick={() => history.push('/settings', { edit: true })}>
                                        <Icon name='cog' />
                                    </Menu.Item>

                                    {/* <React.Fragment>
                                        <Settings key={"settings-modal"}>
                                            <Menu.Item name='add-new'>
                                                <Icon name='settings' />
                                            </Menu.Item>
                                        </Settings>
                                    </React.Fragment> */}
                                </Menu.Menu>

                            </Menu>
                        </Segment>
                        <Segment size="mini" key={`filters-segment`}>
                            <List verticalAlign="middle" size="small" divided horizontal>
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
                        <Segment size="mini" key={`table-segment`} style={{ overflow: 'auto' }}>
                            <Table celled striped compact>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell style={{ minWidth: '40px' }} />
                                        {
                                            Object.keys(headers)
                                                .map((headerKey, index) => {
                                                    return <HeaderCell
                                                        ref={headerCellRefs[headerKey]}
                                                        title={headerKey}
                                                        filterCallback={addFilter}
                                                        key={index}
                                                    />
                                                })
                                        }
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {
                                        loading
                                            ? _.times(limit).map((item, index) => (
                                                <Table.Row key={index}>
                                                    {
                                                        _.times(Object.keys(headers).length + 1).map((key, index) => (
                                                            <Table.Cell key={index}>
                                                                <Placeholder>
                                                                    <Placeholder.Line />
                                                                </Placeholder>
                                                            </Table.Cell>
                                                        ))
                                                    }
                                                </Table.Row>)
                                            )
                                            : games.map((game, index) => <KeyRow
                                                gameData={game}
                                                key={index}
                                            />)
                                    }
                                </Table.Body>
                            </Table>
                        </Segment>

                        {
                            pages > 0 && (
                                <Segment size="mini" key={`pagination-segment`} textAlign='center'>
                                    <Pagination
                                        onPageChange={handlePaginationChange}
                                        activePage={activePage}
                                        boundaryRange={1}
                                        siblingRange={Math.floor(((window.innerWidth / 42) / 2) - 4 - 2 - 1)}
                                        totalPages={pages}
                                        ellipsisItem={{ content: <Icon name='ellipsis horizontal' />, icon: true }}
                                        firstItem={{ content: <Icon name='angle double left' />, icon: true }}
                                        lastItem={{ content: <Icon name='angle double right' />, icon: true }}
                                        prevItem={{ content: <Icon name='angle left' />, icon: true }}
                                        nextItem={{ content: <Icon name='angle right' />, icon: true }}
                                    />
                                </Segment>
                            )
                        }

                    </Segment.Group>
                )
    );
}

export default KeysTable;