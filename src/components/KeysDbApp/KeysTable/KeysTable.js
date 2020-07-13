import React, { useEffect, useState, } from "react";
import { Table, Dimmer, Icon, Segment, Loader, Placeholder, Menu, Pagination, Dropdown, Header } from 'semantic-ui-react';
import _ from 'lodash';
import { usePrevious } from "../../../utils";
import KeyRow from "../KeyRow/KeyRow";
import Spreadsheets from '../../../google/Spreadsheets';
import NewModal from "../Modals/NewModal/NewModal";
import SortDropdown from "../SortDropdown/SortDropdown";
import { useSelector, useDispatch } from "react-redux";
import DataFilters from "./DataFilters/DataFilters";
import { reloadTable, setCurrentRows } from "../../../actions";
import HeaderRow from "../HeaderRow/HeaderRow";

const INITIAL_OFFSET = 0
const INITIAL_LIMIT = 24
const INITIAL_ACTIVEPAGE = 1

function KeysTable({ spreadsheetId }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [offset, setOffset] = useState(INITIAL_OFFSET);
    const [limit, setLimit] = useState(INITIAL_LIMIT);

    const [newModalKey, setNewModalKey] = useState(0);
    const [activePage, setActivePage] = useState(INITIAL_ACTIVEPAGE);
    const [pages, setPages] = useState(0);

    const dispatch = useDispatch()
    const headers = useSelector((state) => state.table.headers)
    const games = useSelector((state) => state.table.rows)
    const orderBy = useSelector((state) => state.table.orderBy)
    const reload = useSelector((state) => state.table.reload)
    const filters = useSelector((state) => state.filters)

    const prevOffset = usePrevious(offset);
    const prevOrderBy = usePrevious(orderBy);
    const prevLimit = usePrevious(limit);
    const prevFilters = usePrevious(filters);
    const prevReload = usePrevious(reload);

    useEffect(() => {
        if (prevReload === true && reload === false) { return }

        if (prevOffset && (prevOffset !== offset)) { }
        if ((prevLimit && (prevLimit !== limit)) || (prevOrderBy && (prevOrderBy !== orderBy)) || (prevFilters && (prevFilters !== filters))) {
            if (offset !== INITIAL_OFFSET) {
                setOffset(INITIAL_OFFSET)
                setActivePage(INITIAL_ACTIVEPAGE)
                return
            }
        }

        // console.log("Offset:", offset);
        // console.log("Limit:", limit);
        // console.log("OrderBy:", orderBy);
        // console.log("Filters:", filters);
        // console.log("-------------------------")

        loadGames(offset, limit, orderBy, filters)
        dispatch(reloadTable(false))

    }, [filters, offset, limit, orderBy, reload, newModalKey]);

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
                dispatch(setCurrentRows(games.rows))
                setLoading(false);
            })
    }

    function addGame(value) {
        // console.log("Finished adding...", value)
        setNewModalKey(newModalKey + 1)
        dispatch(reloadTable(true))
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

    return (
        error
            ? <div>Error</div>
            : _.isEmpty(games)
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
                                    <Header as='h4'>
                                        <Header.Content>
                                            <Dropdown
                                                floating
                                                text={`Limit: ${limit}`}
                                                defaultValue={limit}
                                                onChange={handleLimitChange}
                                                options={_.times(3, number => ({
                                                    key: INITIAL_LIMIT * Math.pow(2, number),
                                                    text: INITIAL_LIMIT * Math.pow(2, number),
                                                    value: INITIAL_LIMIT * Math.pow(2, number),
                                                }))}
                                            />
                                        </Header.Content>
                                    </Header>
                                </Menu.Item>

                                <Menu.Menu position='right'>
                                    <React.Fragment key={newModalKey}>
                                        <NewModal
                                            onComplete={addGame}
                                            initialValue={Object.keys(headers).reduce((acc, header) => ({ ...acc, [header]: '' }), {})}
                                            isEdit={false}
                                        >
                                            <Menu.Item name='add-new'>
                                                <Icon name='plus' />
                                            </Menu.Item>
                                        </NewModal>
                                    </React.Fragment>
                                </Menu.Menu>

                            </Menu>
                        </Segment>
                        <Segment size="mini" key={`filters-segment`}>
                            <DataFilters />
                        </Segment>
                        <Segment size="mini" key={`table-segment`}>
                            <Table celled striped compact>
                                <Table.Header>
                                    <HeaderRow />
                                </Table.Header>
                                <Table.Body>
                                    {
                                        loading
                                            ? _.times(limit).map((item, index) => (
                                                <Table.Row key={index}>
                                                    {
                                                        _.times(Object.keys(headers).length - 1)
                                                            .map((key, index) => (
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
                                                rowIndex={index}
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