// https://github.com/vtex/react-csv-parse

import React, { useState, useEffect } from "react";
import { Modal, Header, Button, Segment, Grid, Form, List, Message, Table, Icon, } from "semantic-ui-react";
import _ from "lodash";


import useFormValidation from "../../../Authentication/useFormValidation";
import validateImport from "../../../Authentication/validateImport"
import ErrorBox from "../../../Authentication/ErrorBox/ErrorBox";
import Spreadsheets from "../../../../google/Spreadsheets";
import { getLabelByIndex } from "../../../../utils"
import { useSelector, useDispatch } from "react-redux";
import { addHeaders, setNewRowChange } from "../../../../actions";
import SetColumnSettingsModal from "../SetColumnSettingsModal"
import { functions } from "lodash";


const INITIAL_STATE = {
    spreadsheetId: '',
}

function ImportModal({ trigger }) {
    const [open, setOpen] = useState(false)
    const [loadingSpreadsheet, setLoadingSpreadsheet] = useState(false)
    const [allowImport, setAllowImport] = useState(false)

    const [spreadsheetData, setSpreadsheetData] = useState(null)
    const [selectedSheet, setSelectedSheet] = useState(null)

    const [importedHeaders, setImportedHeaders] = useState(null)

    const mappedHeaders = useSelector((state) => state.table.changes)
    const [previewRows, setPreviewRows] = useState(null)

    function loadSpreadsheet() {
        setLoadingSpreadsheet(true)

        Spreadsheets.GetSpreadsheet(values.spreadsheetId, true)
            .then(response => {
                if (!response.success) { return }

                if (response.data.sheets.length === 1) {
                    setSelectedSheet(response.data.sheets[0])
                }

                console.log("Spreadsheet data", response.data)
                setSpreadsheetData(response.data)
            })
            .finally(response => {
                setLoadingSpreadsheet(false)
            })
    }

    const { handleSubmit, handleChange, values, errors, } = useFormValidation(INITIAL_STATE, validateImport, loadSpreadsheet);

    const dispatch = useDispatch()

    useEffect(() => {
        if (selectedSheet && importedHeaders === null && previewRows === null) {
            const tempHeaders = selectedSheet.data[0].rowData[0].values.filter(value => value.formattedValue)
            const tempPreviewRows = _.take(_.drop(selectedSheet.data[0].rowData), 5).reduce((result, item) => (
                _.concat(result, [_.take(item.values, tempHeaders.length)])
            ), [])

            setImportedHeaders(tempHeaders)
            setPreviewRows(tempPreviewRows)

            console.log("tempHeaders", tempHeaders)
            console.log("tempPreviewRows", tempPreviewRows)

            const initialHeaders = tempHeaders.reduce((result, header, index) => ({
                ...result,
                [header.formattedValue]: {
                    id: getLabelByIndex(index + 1),
                    label: header.formattedValue,
                    type: null,
                    isPrivate: false,
                    display: true,
                    isFilter: false,
                    sortable: false,
                }
            }), {})

            dispatch(addHeaders(initialHeaders))
            dispatch(setNewRowChange('headers', initialHeaders))
        }

        if (mappedHeaders.headers && Object.keys(mappedHeaders.headers).every(headerKey => mappedHeaders.headers[headerKey].type)) {
            setAllowImport(true)
        }

    }, [selectedSheet, mappedHeaders])

    function handleImport() {
        setOpen(false)
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
                                        headerLabel={value.formattedValue}
                                        triggerElement={
                                            <Table.HeaderCell style={{ cursor: 'pointer' }}>
                                                {
                                                    mappedHeaders.headers && mappedHeaders.headers[value.formattedValue].type === null
                                                        ? <Icon color='red' name='x' />
                                                        : <Icon color='green' name='check' />
                                                }
                                                {value.formattedValue}
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
                                                {cell.formattedValue}
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

    return (
        <Modal
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            trigger={trigger}
            size={'fullscreen'}
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
            </Modal.Content >
            <Modal.Actions>
                <Button color='black' onClick={() => setOpen(false)} content='Cancel' />
                <Button
                    disabled={!allowImport}
                    content="Import"
                    labelPosition='right'
                    icon='checkmark'
                    onClick={handleImport}
                    positive
                />
            </Modal.Actions>
        </Modal >
    );
}

export default ImportModal;