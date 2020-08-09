import React, { useState, useEffect, } from "react";
import { Modal, Icon, Menu, Form, Segment, Button, } from "semantic-ui-react";
import { useSelector, useDispatch } from "react-redux";
import _ from 'lodash';

import useFormValidation from "../../../Authentication/useFormValidation";
import validateTableSettings from "../../../Authentication/validateTableSettings";
import { setNewRowChange, reloadTable, addHeaders, } from "../../../../actions";
import Spreadsheets from "../../../../google/Spreadsheets";
import { cleanRedundentOptions, } from "../../../../utils";
import FieldSettings from "../../FieldSettings/FieldSettings";

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
                                    <FieldSettings
                                        headerKey={headerKey}
                                        values={values[headerKey]}
                                        errors={errors[headerKey]}
                                        handleChange={handleChange}
                                    />
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