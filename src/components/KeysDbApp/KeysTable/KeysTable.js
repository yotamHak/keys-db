import React, { useEffect, useState, } from "react";
import { Table, Dimmer, Icon, Segment, Loader, Placeholder, Menu, Pagination, Dropdown, Header, Input, Grid, Button, Confirm, Modal, Message, Container, } from 'semantic-ui-react';
import _ from 'lodash';
import { usePrevious, getIndexByLabel, TABLE_DEFAULT_OFFSET, TABLE_DEFAULT_LIMIT, TABLE_DEFAULT_ACTIVEPAGE, hasWritePermission } from "../../../utils";
import KeyRow from "../KeyRow/KeyRow";
import Spreadsheets from '../../../google/Spreadsheets';
import NewModal from "../Modals/NewModal/NewModal";
import SortDropdown from "../SortDropdown/SortDropdown";
import { useSelector, useDispatch } from "react-redux";
import DataFilters from "./DataFilters/DataFilters";
import { reloadTable, setCurrentRows } from "../../../actions";
import HeaderRow from "../HeaderRow/HeaderRow";
import TableSettingsModal from "../Modals/TableSettingsModal/TableSettingsModal";

function KeysTable({ spreadsheetId }) {
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(false);
    const [offset, setOffset] = useState(TABLE_DEFAULT_OFFSET);
    const [limit, setLimit] = useState(TABLE_DEFAULT_LIMIT);

    const [exportingPrompt, setExportingPrompt] = useState(false);
    const [isExportingSpreadsheet, setIsExportingSpreadsheet] = useState(false);
    const [exportedSheetUrl, setExportedSheetUrl] = useState(null);

    const [titleQuery, setTitleQuery] = useState("");

    const [activePage, setActivePage] = useState(TABLE_DEFAULT_ACTIVEPAGE);
    const [pages, setPages] = useState(0);

    const dispatch = useDispatch()
    const steamProfile = useSelector((state) => state.authentication.steam.profile)
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

        // console.log("Offset:", offset);
        // console.log("Limit:", limit);
        // console.log("OrderBy:", orderBy);
        // console.log("Filters:", filters);
        // console.log("-------------------------")

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

                    if (response.data.rows.length === 0) {

                    } else {
                        response.data.count && setPages(Math.floor(response.data.count / limit));
                        dispatch(setCurrentRows(response.data.rows))
                    }
                }
                else {
                    console.log(response.errors)
                }
            })
            .finally(response => {
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

    const getPrivateColumns = headers => Object.keys(headers)
        .filter(key => headers[key].isPrivate)
        .reduce((result, key) => (_.concat(result, [getIndexByLabel(key, headers)])), [])

    function exportSpreadsheet() {
        setIsExportingSpreadsheet(true)

        Spreadsheets.ExportSpreadsheet(spreadsheetId, getPrivateColumns(headers), filters, steamProfile.personaname, headers)
            .then(response => {
                if (response.success) {
                    console.log(response.data)
                    setIsExportingSpreadsheet(false)

                    setExportedSheetUrl(response.data)
                } else {
                    setIsExportingSpreadsheet(false)
                    console.log(response)
                }
            })
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

                                        <Confirm
                                            size={'large'}
                                            open={exportingPrompt}
                                            header={"Export"}
                                            content={
                                                <Modal.Content>
                                                    <Modal.Description>
                                                        {/* <Header>Modal Header</Header> */}
                                                        <Container>
                                                            <div>Exporting will create a new spreadsheet without Private Columns*,</div>
                                                            <div>After exporting you will get a link to your new spreadsheet so you can share with whomever you want</div>
                                                        </Container>
                                                        <Message info>
                                                            <Message.Header>Info</Message.Header>
                                                            <Message.List>
                                                                <Message.Item>Private Columns: You can set private columns in Settings (Keys are private by default)</Message.Item>
                                                            </Message.List>
                                                        </Message>
                                                        {
                                                            exportedSheetUrl && (
                                                                <Message attached positive>
                                                                    <Message.Header>Exported</Message.Header>
                                                                    {
                                                                        <div>
                                                                            <div>
                                                                                Spreadsheet created: <a target='_blank' rel='noopener noreferrer' href={exportedSheetUrl.spreadsheetUrl}>Spreadsheet URL</a>
                                                                            </div>
                                                                            <div>
                                                                                Keys-DB Url: <a target='_blank' rel='noopener noreferrer' href={`https://keys-db.web.app/id/${exportedSheetUrl.spreadsheetId}`}>Keys-DB URL</a>
                                                                            </div>
                                                                        </div>
                                                                    }
                                                                </Message>
                                                            )
                                                        }
                                                    </Modal.Description>
                                                </Modal.Content>
                                            }
                                            onCancel={() => { setExportingPrompt(false) }}
                                            onConfirm={exportSpreadsheet}
                                            confirmButton={<Button positive loading={isExportingSpreadsheet}>Export</Button>}
                                            trigger={
                                                <Menu.Item
                                                    name='share'
                                                    onClick={() => { setExportingPrompt(true) }}>{
                                                        isExportingSpreadsheet
                                                            ? <Icon className={"no-margin"}><Loader size='mini' active /></Icon>
                                                            : <Icon name={'share'} className={"no-margin"} />
                                                    }
                                                </Menu.Item>
                                            }
                                        />

                                        <TableSettingsModal
                                            headers={headers}
                                        />
                                    </Menu.Menu>
                                )
                            }
                        </Menu>
                    </Segment>
                    <Segment size="mini" key={`filters-segment`} style={{ minHeight: '5.5em', alignItems: 'center', display: 'flex' }}>
                        <Grid celled='internally'>
                            <Grid.Row columns={2}>
                                <div style={{ height: '100%', alignItems: 'center', display: 'flex' }}>
                                    <Input size={'small'} loading={isSearching} icon='search' placeholder='Search...' onChange={searchByTitle} />
                                </div>
                                &nbsp;&nbsp;&nbsp;
                                <div style={{ height: '100%', alignItems: 'center', display: 'flex' }}>
                                        <DataFilters />
                                </div>
                            </Grid.Row>
                        </Grid>
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