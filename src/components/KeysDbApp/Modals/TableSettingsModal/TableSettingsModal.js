import React, { useState, useEffect, } from "react";
import { Modal, Icon, Menu, Form, Segment, Input, Grid, Checkbox, Button, } from "semantic-ui-react";
import _ from 'lodash';

import useFormValidation from "../../../Authentication/useFormValidation";
import validateTableSettings from "../../../Authentication/validateTableSettings"; import { useSelector, useDispatch } from "react-redux";
import { setNewRowChange, reloadTable, addHeaders, } from "../../../../actions";
import ErrorBox from "../../../Authentication/ErrorBox/ErrorBox";
import OptionsEditor from "../../OptionsEditor/OptionsEditor";
import Spreadsheets from "../../../../google/Spreadsheets";
import { genericSort } from "../../../../utils";

const typeOptions = [
    { key: 'steam_title', text: '(Steam) Title', value: 'steam_title' },
    { key: 'steam_url', text: '(Steam) URL', value: 'steam_url' },
    { key: 'steam_appid', text: '(Steam) App Id', value: 'steam_appid' },
    { key: 'steam_key', text: '(Steam) Key', value: 'steam_key' },
    { key: 'steam_cards', text: '(Steam) Cards', value: 'steam_cards' },
    { key: 'steam_achievements', text: '(Steam) Achievements', value: 'steam_achievements' },
    { key: 'steam_dlc', text: '(Steam) DLC', value: 'steam_dlc' },
    { key: 'steam_bundled', text: '(Steam) Bundled', value: 'steam_bundled' },
    { key: 'steam_ownership', text: '(Steam) Owned', value: 'steam_ownership' },

    { key: 'string', text: 'String', value: 'string' },
    { key: 'number', text: 'Number', value: 'number' },
    { key: 'date', text: 'Date', value: 'date' },
    { key: 'text', text: 'Text', value: 'text' },
    { key: 'key', text: 'Key', value: 'key' },
    { key: 'dropdown', text: 'Dropdown', value: 'dropdown' },
    { key: 'url', text: 'URL', value: 'url' },
].sort((a, b) => genericSort(a.text, b.text))

function TableSettingsModal({ headers }) {
    const [modalOpen, setModalOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const spreadsheetId = useSelector((state) => state.authentication.currentSpreadsheetId)
    const tableHeaders = useSelector((state) => state.table.headers)
    const tableHeadersChanges = useSelector((state) => state.table.changes.headers)
    const dispatch = useDispatch()

    useEffect(() => {
        if (!tableHeadersChanges) {
            dispatch(setNewRowChange('headers', tableHeaders))
        } else {
            Object.keys(values).forEach(key => {
                if ((values[key].type === 'dropdown' || values[key].type === 'steam_ownership' || values[key].type === 'steam_cards') && values[key].options !== tableHeadersChanges[key].options) {
                    updateOptions(key, tableHeadersChanges[key].options)
                }
            })
        }

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
    }, [tableHeadersChanges])

    const handleOpen = () => setModalOpen(true)

    const handleClose = () => setModalOpen(false)

    const cleanRedundentOptions = (headers) => Object.keys(headers).reduce((result, key) => {
        if ((headers[key].type !== 'dropdown' && headers[key].type !== 'steam_ownership' && headers[key].type !== 'steam_cards') && headers[key].options) {
            let newHeader = { ...headers[key] }

            _.unset(newHeader, 'options')

            return {
                ...result,
                [key]: newHeader
            }
        } else {
            return {
                ...result,
                [key]: headers[key]
            }
        }
    }, {})

    const onSubmit = () => {
        dispatch(setNewRowChange('headers', cleanRedundentOptions(values)))
        setIsSaving(true)
    }

    const INITIAL_STATE = tableHeaders;

    const { handleSubmit, handleChange, updateOptions, reset, values, errors } = useFormValidation(INITIAL_STATE, validateTableSettings, onSubmit);

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
                                                        options={typeOptions}
                                                        name={"type"}
                                                        value={values[headerKey]["type"]}
                                                        onChange={(event, data) => handleChange(event, data, headerKey)}
                                                    />
                                                </Form.Field>
                                                {
                                                    (values[headerKey]["type"] === 'steam_ownership' || values[headerKey]["type"] === 'steam_cards' || values[headerKey]["type"] === 'dropdown') && <OptionsEditor headerKey={headerKey} />
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