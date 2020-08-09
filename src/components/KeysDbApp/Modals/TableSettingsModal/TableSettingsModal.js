import React, { useState, useEffect, } from "react";
import { Modal, Icon, Menu, Form, Segment, Input, Grid, Checkbox, Button, } from "semantic-ui-react";
import _ from 'lodash';

import useFormValidation from "../../../Authentication/useFormValidation";
import validateTableSettings from "../../../Authentication/validateTableSettings"; import { useSelector, useDispatch } from "react-redux";
import { setNewRowChange, reloadTable, addHeaders, } from "../../../../actions";
import ErrorBox from "../../../Authentication/ErrorBox/ErrorBox";
import OptionsEditor from "../../OptionsEditor/OptionsEditor";
import Spreadsheets from "../../../../google/Spreadsheets";
import { fieldTypes, cleanRedundentOptions, isDropdownType } from "../../../../utils";

function TableSettingsModal() {
    const [modalOpen, setModalOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const spreadsheetId = useSelector((state) => state.authentication.currentSpreadsheetId)
    const headers = useSelector((state) => state.table.headers)
    const tableHeaders = useSelector((state) => state.table.headers)
    const tableHeadersChanges = useSelector((state) => state.table.changes.headers)
    const dispatch = useDispatch()

    const handleOpen = () => setModalOpen(true)
    const handleClose = () => setModalOpen(false)

    useEffect(() => {
        if (isSaving) {
            Spreadsheets.SaveSettings(spreadsheetId, tableHeadersChanges)
                .then(response => {
                    if (response.success) {
                        dispatch(addHeaders(tableHeadersChanges))
                        dispatch(reloadTable(true))
                        setIsSaving(false)
                        handleClose()
                    }
                })
        }
    }, [tableHeadersChanges,])

    const onSubmit = () => {
        dispatch(setNewRowChange('headers', cleanRedundentOptions(values)))
        setIsSaving(true)
    }

    function handleInitOptions(headerKey) {
        handleChange(null, {
            name: 'options',
            value: {
                allowEdit: true,
                values: [],
            }
        },
            headerKey)
    }

    function handleOptionsChange(newValues, headerKey) {
        handleChange(null, {
            name: 'options',
            value: newValues
        },
            headerKey)
    }

    const INITIAL_STATE = tableHeaders;

    const { handleSubmit, handleChange, reset, values, errors } = useFormValidation(INITIAL_STATE, validateTableSettings, onSubmit);

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
                        _.drop(Object.keys(headers)).map((headerKey,) => {
                            return (
                                <Segment key={headerKey} className="show-messages">
                                    <Grid columns={2}>
                                        <Grid.Row>
                                            <Grid.Column>
                                                <Form.Field inline>
                                                    <label>Field Name</label>
                                                    <Input
                                                        fluid
                                                        name={"label"}
                                                        value={values[headerKey]["label"]}
                                                        onChange={(event, data) => handleChange(event, data, headerKey)}
                                                    />
                                                </Form.Field>
                                                <Form.Field>
                                                    <Form.Checkbox
                                                        label='Private'
                                                        checked={values[headerKey]['isPrivate']}
                                                        name={'isPrivate'}
                                                        onChange={(event, data) => handleChange(event, data, headerKey)}
                                                    />
                                                </Form.Field>
                                                <Form.Field>
                                                    <Form.Checkbox
                                                        label='Display'
                                                        checked={values[headerKey]['display']}
                                                        name={'display'}
                                                        onChange={(event, data) => handleChange(event, data, headerKey)}
                                                    />
                                                </Form.Field>
                                                <Form.Field>
                                                    <Checkbox
                                                        label='Filterable'
                                                        checked={values[headerKey]['isFilter']}
                                                        name={'isFilter'}
                                                        onChange={(event, data) => handleChange(event, data, headerKey)}
                                                    />
                                                </Form.Field>
                                                <Form.Field>
                                                    <Form.Checkbox
                                                        label='Sortable'
                                                        checked={values['sortable']}
                                                        name={'sortable'}
                                                        onChange={(event, data) => handleChange(event, data, headerKey)}
                                                    />
                                                </Form.Field>
                                            </Grid.Column>
                                            <Grid.Column>
                                                <Form.Field inline>
                                                    <label>Type</label>
                                                    <Form.Select
                                                        options={fieldTypes}
                                                        name={"type"}
                                                        value={values[headerKey]["type"]}
                                                        onChange={(event, data) => handleChange(event, data, headerKey)}
                                                    />
                                                </Form.Field>
                                                {
                                                    isDropdownType(values[headerKey]["type"]) && <OptionsEditor
                                                        headerKey={headerKey}
                                                        options={values[headerKey].options}
                                                        onInitOptions={handleInitOptions}
                                                        onOptionsChange={handleOptionsChange}
                                                    />
                                                }
                                            </Grid.Column>
                                        </Grid.Row>
                                    </Grid>
                                    <ErrorBox errors={errors[headerKey]} />
                                </Segment>
                            )
                        })
                    }
                </Form>
            </Modal.Content>

            <Modal.Actions>
                <Button onClick={() => { setNewRowChange('headers', tableHeaders); reset(); }}>Reset</Button>
                <Button onClick={handleClose} negative>Cancel</Button>
                <Button type="submit" loading={isSaving} onClick={handleSubmit} positive>Save</Button>
            </Modal.Actions>

        </Modal >
    );
}

export default TableSettingsModal;