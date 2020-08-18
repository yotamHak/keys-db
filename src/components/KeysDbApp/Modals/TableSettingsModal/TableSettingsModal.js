import React, { useState, useEffect, } from "react";
import { Modal, Icon, Menu, Form, Segment, Button, Confirm, Divider, Grid, } from "semantic-ui-react";
import { useSelector, useDispatch } from "react-redux";
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import useFormValidation from "../../../Authentication/useFormValidation";
import validateTableSettings from "../../../Authentication/validateTableSettings";
import { setNewRowChange, reloadTable, addHeaders, } from "../../../../actions";
import Spreadsheets from "../../../../google/Spreadsheets";
import { cleanRedundentOptions, nextChar, getIndexById, hasWritePermission, } from "../../../../utils";
import FieldSettings from "../../FieldSettings/FieldSettings";

function TableSettingsModal() {
    const [modalOpen, setModalOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isCreatingNewField, setIsCreatingNewField] = useState(false)
    const [deleteFieldPrompt, setDeleteFieldPrompt] = useState(false)

    const spreadsheetId = useSelector((state) => state.authentication.currentSpreadsheetId)
    const sheetId = useSelector((state) => state.authentication.currentSheetId)
    const headers = useSelector((state) => state.table.headers)
    const tableHeadersChanges = useSelector((state) => state.table.changes.headers)
    const permission = useSelector((state) => state.authentication.permission)

    const dispatch = useDispatch()

    const INITIAL_STATE = headers;

    const { handleSubmit, handleChange, handleSetNewValue, reset, values, errors } = useFormValidation(INITIAL_STATE, validateTableSettings, onSubmit);

    useEffect(() => {
        if (!tableHeadersChanges) {
            dispatch(setNewRowChange('headers', headers))
        }

        if (isSaving) {
            Spreadsheets.SaveSettings(spreadsheetId, sheetId, tableHeadersChanges)
                .then(response => {
                    if (response.success) {
                        dispatch(addHeaders(response.data.updatedSettings))
                        dispatch(reloadTable(true))
                        setIsSaving(false)
                        handleClose()
                    }
                })
        }
    }, [tableHeadersChanges,])

    function handleOpen() {
        setModalOpen(true)
    }

    function handleClose() {
        setModalOpen(false)
    }

    function handleReset() {
        setNewRowChange('headers', headers)
        reset()
    }

    function onSubmit() {
        dispatch(setNewRowChange('headers', cleanRedundentOptions(values)))
        setIsSaving(true)
    }

    function dropSpecificHeader(headers, id) {
        return Object.keys(headers).reduce((result, headerKey, index) => (
            id !== headers[headerKey].id
                ? {
                    ...result,
                    [headerKey]: {
                        ...headers[headerKey],
                        id: [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"][index] || uuidv4(),
                    }
                }
                : result
        ), {})
    }

    function handleAddNewField() {
        const getNewId = nextChar(tableHeadersChanges[Object.keys(tableHeadersChanges)[Object.keys(tableHeadersChanges).length - 1]].id)

        if (getNewId === false) {
            console.error("Reached maximum columns")
            return
        }

        setIsCreatingNewField(true)

        Spreadsheets.InsertNewColumn(spreadsheetId, sheetId,)
            .then(response => {
                if (!response.success) {
                    console.error(response.data.errors.message)
                    setIsCreatingNewField(false)
                    return
                }

                const numberOfNewFields = Object.keys(tableHeadersChanges).filter(headerKey => headerKey.toLowerCase().indexOf('new field') > -1)

                const initialNewColumn = {
                    id: response.data.columnId,
                    label: `New Field${numberOfNewFields.length === 0 ? '' : " " + (numberOfNewFields.length + 1)}`,
                    type: "string",
                    isPrivate: false,
                    display: true,
                    isFilter: false,
                    sortable: false,
                }

                const newHeaders = {
                    ...headers,
                    [initialNewColumn.label]: initialNewColumn
                }

                Spreadsheets.SaveSettings(spreadsheetId, sheetId, newHeaders)
                    .then(response => {
                        if (response.success) {
                            handleSetNewValue(response.data.updatedSettings)
                            dispatch(addHeaders(response.data.updatedSettings))
                            dispatch(setNewRowChange('headers', response.data.updatedSettings))
                        }
                    })
                    .finally(response => {
                        setIsCreatingNewField(false)
                    })
            })
    }

    function handleDeleteField(e, data,) {
        const headerToDelete = deleteFieldPrompt
        setDeleteFieldPrompt(false)

        const fieldIndex = getIndexById(headerToDelete.id)

        Spreadsheets.DeleteDimension(spreadsheetId, sheetId, "COLUMNS", fieldIndex, fieldIndex + 1)
            .then(response => {
                if (!response.success) {
                    console.error(response.data.errors.message)
                    return
                }

                const cleanedHeaders = dropSpecificHeader(headers, headerToDelete.id)
                const cleanedHeadersChanges = dropSpecificHeader(tableHeadersChanges, headerToDelete.id)

                Spreadsheets.SaveSettings(spreadsheetId, sheetId, cleanedHeaders)
                    .then(response => {
                        if (!response.success) {
                            console.error(response.data.errors.message)
                            return
                        }

                        handleSetNewValue(cleanedHeadersChanges)
                        dispatch(addHeaders(response.data.updatedSettings))
                        dispatch(setNewRowChange('headers', cleanedHeadersChanges))
                    })
            })
            .catch(reason => console.error(reason))
    }

    return (
        <Modal
            closeIcon={<Icon name="close" />}
            trigger={<Menu.Item name='settings' onClick={handleOpen}><Icon name='cog' className={"no-margin"} /></Menu.Item>}
            open={modalOpen}
            onClose={handleClose}
            centered={false}
            size={'large'}
        >
            <Modal.Header>Table Settings</Modal.Header>
            <Modal.Content scrolling>
                <Form autoComplete="off">
                    {
                        tableHeadersChanges && _.drop(Object.keys(tableHeadersChanges)).map((headerKey,) => {
                            return (
                                <Segment key={headerKey} className="show-messages">
                                    {
                                        values[headerKey] && <FieldSettings
                                            headerKey={headerKey}
                                            values={values[headerKey]}
                                            errors={errors[headerKey]}
                                            handleChange={handleChange}
                                        />
                                    }

                                    <Divider hidden />

                                    <Confirm
                                        open={deleteFieldPrompt ? true : false}
                                        header={"Delete Field"}
                                        content={"Are you sure you want to delete this field (this action is irreversible)?"}
                                        onCancel={() => { setDeleteFieldPrompt(false) }}
                                        onConfirm={handleDeleteField}
                                        confirmButton="Delete"
                                        size='tiny'
                                        trigger={
                                            <Grid>
                                                <Grid.Column textAlign='left'>
                                                    <Button size='small' onClick={() => { setDeleteFieldPrompt(tableHeadersChanges[headerKey]) }} negative>Delete Field</Button>
                                                </Grid.Column>
                                            </Grid>
                                        }
                                    />
                                </Segment>
                            )
                        })
                    }
                </Form>

                <Segment vertical basic style={{ paddingTop: '1.5em' }}>
                    {
                        hasWritePermission(permission) && <Button onClick={handleAddNewField} loading={isCreatingNewField} positive>Add New Field</Button>
                    }
                </Segment>
            </Modal.Content>

            <Modal.Actions>
                <Button onClick={handleReset}>Reset</Button>
                <Button onClick={handleClose} negative>Cancel</Button>
                <Button type="submit" loading={isSaving} onClick={handleSubmit} positive>Save</Button>
            </Modal.Actions>

        </Modal >
    );
}

export default TableSettingsModal;