// https://github.com/vtex/react-csv-parse

import React, { useState, useEffect } from "react";
import { Modal, Header, Button, Segment, Grid, Form, List, Message, Table, Icon, } from "semantic-ui-react";
import { useSelector, useDispatch } from "react-redux";
import _ from "lodash";

import ErrorBox from "../../../ErrorBox";
import { getLabelByIndex } from "../../../../utils";
import { addHeaders, setNewRowChange, } from "../../../../store/actions/TableActions";
import SetColumnSettingsModal from "../SetColumnSettingsModal"

import useFormValidation from '../../../../hooks/useFormValidation';
import validateImport from '../../../../hooks/formValidations/validateImport';
import Spreadsheets from "../../../../lib/google/Spreadsheets";

const SPREADSHEET_INITIAL_STATE = {
    spreadsheetId: '',
}

function ImportModal({ responseCallback, trigger }) {
    const [open, setOpen] = useState(false)
    const [loadingSpreadsheet, setLoadingSpreadsheet] = useState(false)
    const [importingSpreadsheet, setImportingSpreadsheet] = useState(false)
    const [allowImport, setAllowImport] = useState(false)

    const [spreadsheetData, setSpreadsheetData] = useState(null)
    const [selectedSheet, setSelectedSheet] = useState(null)

    const [importedHeaders, setImportedHeaders] = useState(null)
    const [importedRows, setImportedRows] = useState(null)
    const [previewRows, setPreviewRows] = useState(null)

    const [importingError, setImportingError] = useState(null)

    const mappedHeaders = useSelector((state) => state.table.changes)

    const { handleSubmit, handleChange, values, errors, reset, } = useFormValidation(SPREADSHEET_INITIAL_STATE, validateImport, loadSpreadsheet);

    const dispatch = useDispatch()

    useEffect(() => {
        if (selectedSheet && importedHeaders === null && previewRows === null) {
            const tempHeaders = selectedSheet.data[0].rowData[0].values.filter(value => value.formattedValue).reduce((result, item) => (_.concat(result, [item.formattedValue])), [])
            const tempRows = _.drop(selectedSheet.data[0].rowData)
                .reduce((result, item) => (_.concat(result, [_.take(item.values, tempHeaders.length)])), [])
                .reduce((result, item) => (_.concat(result, [item.reduce((result, item) => (_.concat(result, [item.formattedValue])), [])])), [])
            const tempPreviewRows = _.take(tempRows, 5)

            setImportedHeaders(tempHeaders)
            setImportedRows(tempRows)
            setPreviewRows(tempPreviewRows)

            const initialHeaders = tempHeaders.reduce((result, header, index) => ({
                ...result,
                [header]: {
                    id: getLabelByIndex(index + 1),
                    label: header,
                    type: null,
                    isPrivate: false,
                    display: true,
                    isFilter: false,
                    sortable: false,
                }
            }), {
                "ID": {
                    id: "A",
                    label: "ID",
                    type: "number",
                    pattern: "General",
                    display: false,
                }
            })

            dispatch(addHeaders(initialHeaders))
            dispatch(setNewRowChange('headers', initialHeaders))
        }

        if (mappedHeaders.headers && Object.keys(mappedHeaders.headers).every(headerKey => mappedHeaders.headers[headerKey].type)) {
            setAllowImport(true)
        }

    }, [selectedSheet, mappedHeaders])

    function loadSpreadsheet() {
        setLoadingSpreadsheet(true)

        Spreadsheets.GetSpreadsheet(values.spreadsheetId, true)
            .then(response => {
                if (!response.success) {
                    setImportingError(response)
                    return
                }

                if (response.data.sheets.length === 1) {
                    setSelectedSheet(response.data.sheets[0])
                }

                setSpreadsheetData(response.data)
            })
            .finally(response => {
                setLoadingSpreadsheet(false)
            })
    }

    function handleImport(event) {
        setImportingSpreadsheet(true)

        Spreadsheets.ImportSpreadsheet(importedHeaders, importedRows, mappedHeaders.headers)
            .then(response => {
                if (response.success) {
                    responseCallback(event, { imported: true, success: true, spreadsheetId: response.data.spreadsheetId })
                    setOpen(false)
                } else {
                    setImportingError(response)
                    // responseCallback(event, { imported: true, success: false, error: response })
                }
            })
            .finally(response => {
                setImportingSpreadsheet(false)
            })
    }

    function renderLoadContent() {
        return (
            <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle'>
                <Grid.Column style={{ maxWidth: 500 }}>
                    <Form onSubmit={handleSubmit} size={'large'}>
                        <Segment>
                            <Header>Start importing by entering your Spreadsheet ID</Header>
                            <Form.Input
                                fluid
                                icon='file excel'
                                iconPosition='left'
                                name='spreadsheetId'
                                placeholder='Spreadsheet ID'
                                onChange={handleChange}
                                value={values.spreadsheetId}
                                key='spreadsheetId'
                            />

                            <Button content='Load' loading={loadingSpreadsheet} primary />
                        </Segment>
                    </Form>
                    <ErrorBox errors={errors} />
                </Grid.Column>
            </Grid>
        )
    }

    function renderSelectSheet() {
        return (
            <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle'>
                <Grid.Column style={{ maxWidth: 500 }}>
                    <Segment>
                        <Message style={{ textAlign: 'left' }} info>
                            <Message.Header>Found several sheets</Message.Header>
                            <p>
                                Please select the sheet you want to import from
                                                    </p>
                        </Message>

                        <List verticalAlign='middle' selection>
                            {
                                spreadsheetData.sheets.map((sheet, index) => (
                                    <List.Item onClick={() => { setSelectedSheet(spreadsheetData.sheets[index]) }} key={index}>
                                        <List.Content>
                                            <List.Header as='a'>{sheet.properties.title}</List.Header>
                                        </List.Content>
                                    </List.Item>
                                ))
                            }
                        </List>
                    </Segment>
                </Grid.Column>
            </Grid>
        )
    }

    function renderTable() {
        return (
            <React.Fragment>
                <Message style={{ textAlign: 'left' }} info>
                    <Message.Header>Set your column types</Message.Header>
                    <p>
                        Click on the Header to set the column type
                    </p>
                </Message>
                <Table celled compact fixed>
                    <Table.Header>
                        <Table.Row>
                            {
                                importedHeaders && importedHeaders.map((value, index) => (
                                    <SetColumnSettingsModal
                                        key={index}
                                        headerLabel={value}
                                        triggerElement={
                                            <Table.HeaderCell style={{ cursor: 'pointer' }}>
                                                {
                                                    mappedHeaders.headers && mappedHeaders.headers[value].type === null
                                                        ? <Icon color='red' name='x' />
                                                        : <Icon color='green' name='check' />
                                                }
                                                {value}
                                            </Table.HeaderCell>
                                        }
                                    />
                                ))
                            }
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {
                            previewRows && previewRows.map((item, index) => (
                                <Table.Row key={index}>
                                    {
                                        item.map((cell, index) => (
                                            <Table.Cell key={index}>
                                                {cell}
                                            </Table.Cell>
                                        ))
                                    }
                                </Table.Row>
                            ))
                        }
                    </Table.Body>
                </Table>
            </React.Fragment>
        )
    }

    function handleCancel() {
        reset()
        setPreviewRows(null)
        setImportedHeaders(null)
        setSelectedSheet(null)
        setSpreadsheetData(null)
        setOpen(false)
    }

    return (
        <Modal
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            trigger={trigger}
            size={spreadsheetData && selectedSheet ? 'fullscreen' : 'small'}
        >
            <Modal.Header>Import</Modal.Header>
            <Modal.Content>
                <Modal.Description>
                    {
                        spreadsheetData === null
                            ? renderLoadContent()
                            : !selectedSheet
                                ? renderSelectSheet()
                                : renderTable()
                    }
                </Modal.Description>
                {
                    importingError && (
                        <Message error>
                            <Message.Header>Error while trying to Import...</Message.Header>
                        </Message>
                    )
                }
            </Modal.Content>
            <Modal.Actions>
                <Button color='black' onClick={handleCancel} content='Cancel' />
                <Button
                    disabled={!allowImport || importingSpreadsheet}
                    content="Import"
                    labelPosition='right'
                    icon='checkmark'
                    onClick={handleImport}
                    loading={importingSpreadsheet}
                    positive
                />
            </Modal.Actions>
        </Modal >
    );
}

export default ImportModal;