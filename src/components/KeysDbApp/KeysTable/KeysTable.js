import React, { useEffect, useState, } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, Dimmer, Icon, Segment, Loader, Placeholder, Menu, Pagination, Dropdown, Header, Input, Grid, } from 'semantic-ui-react';
import _ from 'lodash';

import { getIndexByLabel, getKeyById, hasWritePermission, shouldAddField, } from "../../../utils";
import KeyRow from "../KeyRow";
import NewModal from "../Modals/NewModal";
import SortDropdown from "../SortDropdown";
import DataFilters from "../DataFilters";
import HeaderRow from "../HeaderRow";
import TableSettingsModal from "../Modals/TableSettingsModal";
import ShareModal from "../Modals/ShareModal";

import usePrevious from '../../../hooks/usePrevious'
import Spreadsheets from "../../../lib/google/Spreadsheets";
import FilterDropdown from "../FilterDropdown";
import { reloadTable, setCurrentRows, setIsTableEmpty, showShareModal } from "../../../actions/TableActions";
import { TABLE_DEFAULT_ACTIVEPAGE, TABLE_DEFAULT_LIMIT, TABLE_DEFAULT_OFFSET } from "../../../constants/tableConstants";

function KeysTable() {
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [offset, setOffset] = useState(TABLE_DEFAULT_OFFSET);
    const [limit, setLimit] = useState(TABLE_DEFAULT_LIMIT);
    const [titleQuery, setTitleQuery] = useState("");
    const [activePage, setActivePage] = useState(TABLE_DEFAULT_ACTIVEPAGE);
    const [pages, setPages] = useState(0);

    const dispatch = useDispatch()
    const spreadsheetId = useSelector((state) => state.authentication.currentSpreadsheetId)
    const permission = useSelector((state) => state.authentication.permission)
    const headers = useSelector((state) => state.table.headers)
    const games = useSelector((state) => state.table.rows)
    const orderBy = useSelector((state) => state.table.orderBy)
    const reload = useSelector((state) => state.table.reload)
    const filters = useSelector((state) => state.filters)

    const prevTitleQuery = usePrevious(titleQuery);
    const prevOffset = usePrevious(offset);
    const prevOrderBy = usePrevious(orderBy);
    const prevLimit = usePrevious(limit);
    const prevFilters = usePrevious(filters);
    const prevReload = usePrevious(reload);

    useEffect(() => {
        if (prevReload === true && reload === false) { return }

        if (prevOffset && (prevOffset !== offset)) { }
        if ((prevLimit && (prevLimit !== limit)) || (prevOrderBy && (prevOrderBy !== orderBy)) || (prevFilters && (prevFilters !== filters)) || (prevTitleQuery !== titleQuery)) {
            if (offset !== TABLE_DEFAULT_OFFSET) {
                setOffset(TABLE_DEFAULT_OFFSET)
                setActivePage(TABLE_DEFAULT_ACTIVEPAGE)
                return
            }
        }

        loadGames(spreadsheetId, titleQuery, offset, limit, orderBy, filters)
        dispatch(reloadTable(false))
    }, [titleQuery, filters, offset, limit, orderBy, reload]);

    function handleLimitChange(e, { value }) {
        console.log("Changing limit: ", value)
        setOffset(TABLE_DEFAULT_OFFSET);
        setActivePage(TABLE_DEFAULT_ACTIVEPAGE)
        setLimit(value)
    }

    function loadGames(spreadsheetId, titleQuery, offset, limit, orderBy, filters) {
        const convertedOrderBy = {
            sort: headers[orderBy.sort].id,
            asc: orderBy.asc
        }

        setLoading(true)

        Spreadsheets.GetFilteredData(spreadsheetId, titleQuery, offset, limit, convertedOrderBy, filters)
            .then(response => {
                if (response.success) {
                    // console.log("Got filtered games:", games)

                    response.data.count && setPages(Math.floor(response.data.count / limit));
                    dispatch(setCurrentRows(response.data.rows))

                    if (response.data.count === 0) {
                        dispatch(setIsTableEmpty(true))
                    } else {
                        dispatch(setIsTableEmpty(false))
                    }
                }
                else {
                    console.log(response.errors)
                }
            })
            .finally(() => {
                setLoading(false)
                if (isSearching) setIsSearching(false)
            })
    }

    function handlePaginationChange(e, { activePage }) {
        setActivePage(activePage);
        setOffset((activePage - 1) * limit);
        dispatch(reloadTable(true))
        window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }

    function searchByTitle(e, { value }) {
        if (value.length >= 3 || (titleQuery.length > 0 && value.length === 0)) {
            setTitleQuery(value)
            setIsSearching(true)
            dispatch(reloadTable(true))
        }
    }

    const style = {
        filtersSegment: {
            segment: { minHeight: '5.5em', alignItems: 'center', display: 'flex' },
            row: { height: '100%', alignItems: 'center', display: 'flex' }
        }
    }

    return (
        _.isEmpty(headers)
            ? (
                <Dimmer active inverted>
                    <Loader />
                </Dimmer>
            )
            : (
                <Segment.Group raised>
                    <Segment size="mini" key={`action-menu-segment`}>
                        <Menu>
                            <Menu.Item>
                                <SortDropdown />
                            </Menu.Item>

                            <Menu.Item>
                                <FilterDropdown />
                            </Menu.Item>

                            <Menu.Item>
                                <Header as='h4'>
                                    <Header.Content>
                                        <Dropdown
                                            floating
                                            text={`Limit: ${limit}`}
                                            defaultValue={limit}
                                            onChange={handleLimitChange}
                                            options={_.times(3, number => ({
                                                key: TABLE_DEFAULT_LIMIT * Math.pow(2, number),
                                                text: TABLE_DEFAULT_LIMIT * Math.pow(2, number),
                                                value: TABLE_DEFAULT_LIMIT * Math.pow(2, number),
                                            }))}
                                        />
                                    </Header.Content>
                                </Header>
                            </Menu.Item>

                            {
                                hasWritePermission(permission) && (
                                    <Menu.Menu position='right'>
                                        <NewModal
                                            initialValue={Object.keys(headers).reduce((acc, header) => ({ ...acc, [header]: '' }), {})}
                                            isEdit={false}
                                        >
                                            <Menu.Item name='add-new'>
                                                <Icon name='plus' className={"no-margin"} />
                                            </Menu.Item>
                                        </NewModal>

                                        <ShareModal
                                            triggerElement={
                                                <Menu.Item
                                                    name='share'
                                                    onClick={() => { dispatch(showShareModal(true)) }}
                                                >
                                                    <Icon name={'share'} className={"no-margin"} />
                                                </Menu.Item>
                                            }
                                        />

                                        <TableSettingsModal />
                                    </Menu.Menu>
                                )
                            }
                        </Menu>
                    </Segment>

                    <Segment size="mini" key={`filters-segment`} style={style.filtersSegment.segment}>
                        <Grid celled='internally'>
                            <Grid.Row columns={2}>
                                <div style={style.filtersSegment.row}>
                                    <Input size={'small'} loading={isSearching} icon='search' placeholder='Search...' onChange={searchByTitle} />
                                </div>
                                &nbsp;&nbsp;&nbsp;
                                <div style={style.filtersSegment.row}>
                                    <DataFilters />
                                </div>
                            </Grid.Row>
                        </Grid>
                    </Segment>

                    <Segment size="mini" key={`table-segment`}>
                        <Table selectable celled striped compact>
                            <Table.Header>
                                <HeaderRow />
                            </Table.Header>
                            <Table.Body>
                                {
                                    loading
                                        ? _.times(limit).map((item, index) => (
                                            <Table.Row key={index}>
                                                {
                                                    _.times(Object.keys(headers).filter(headerKey => shouldAddField(headers, null, headers[headerKey].id)).length + 1)
                                                        .map((key, index) => (
                                                            <Table.Cell key={index}>
                                                                <Placeholder>
                                                                    <Placeholder.Line />
                                                                </Placeholder>
                                                            </Table.Cell>
                                                        ))
                                                }
                                            </Table.Row>
                                        ))
                                        : games.map((game, index) => <KeyRow
                                            rowIndex={index}
                                            gameData={game}
                                            key={index}
                                        />)
                                }
                            </Table.Body>

                            {
                                _.isEmpty(games) && !loading && (
                                    <Table.Footer fullWidth>
                                        <Table.Row>
                                            <Table.HeaderCell colSpan={Object.keys(headers).length}>
                                                <Segment placeholder as='span'>
                                                    <Header icon>
                                                        <Icon name='frown outline' />
                                                        Aww... Nothing found
                                                </Header>
                                                </Segment>
                                            </Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Footer>
                                )
                            }
                        </Table>
                    </Segment>

                    {
                        pages > 1 && (
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
    )
}

export default KeysTable;