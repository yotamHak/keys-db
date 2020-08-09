import React, { useState, } from "react";
import { Modal, Button, Confirm, Container, Segment, Grid, Form, Checkbox, Input, } from "semantic-ui-react";
import { useSelector, useDispatch } from "react-redux";

import useFormValidation from "../../../Authentication/useFormValidation";
import OptionsEditor from "../../OptionsEditor/OptionsEditor";
import ErrorBox from "../../../Authentication/ErrorBox/ErrorBox";
import { fieldTypes, useInterval, isDropdownType, } from "../../../../utils";
import validateHeaderSetting from "../../../Authentication/validateHeaderSetting";
import { setNewRowChange } from "../../../../actions";

function SetColumnSettingsModal({ triggerElement, headerLabel, }) {
    const dispatch = useDispatch()
    const headers = useSelector((state) => state.table.changes.headers)

    const handleOpen = () => setModalOpen(true)
    const handleClose = () => setModalOpen(false)

    const Child = React.Children.only(triggerElement);
    const newChildren = React.cloneElement(Child, { onClick: handleOpen });

    const [modalOpen, setModalOpen] = useState(false)

    const INITIAL_STATE = headers[headerLabel];

    const { handleSubmit, handleChange, values, errors } = useFormValidation(INITIAL_STATE, validateHeaderSetting, saveHeaderSettings);

    const [isFinishedAlertTimerRunning, setIsFinishedAlertTimerRunning] = useState(false);
    const [handleSubmitEvent, setHandleSubmitEvent] = useState(null);

    useInterval(() => {
        setIsFinishedAlertTimerRunning(false)
        handleSubmit(handleSubmitEvent)
    }, isFinishedAlertTimerRunning ? 1 : null);

    function handleInitOptions() {
        handleChange(null, {
            name: 'options',
            value: {
                allowEdit: true,
                values: [],
            }
        })
    }

    function handleOptionsChange(newValues) {
        handleChange(null, {
            name: 'options',
            value: newValues
        })
    }

    function onSubmit(event) {
        if (values.options !== headers[headerLabel].options) {
            setHandleSubmitEvent(event)
            setIsFinishedAlertTimerRunning(true)
        }

        handleSubmit(event)
    }

    function saveHeaderSettings() {
        const newValues = {
            ...headers[headerLabel],
            ...values
        }
        dispatch(setNewRowChange('headers', {
            ...headers,
            [headerLabel]: newValues
        }))
        handleClose()
    }

    const modalContent = (
        <Modal.Content>
            <Form autoComplete="off">
                <Modal.Description>
                    <Container>
                        <Segment className="show-messages">
                            <Grid columns={2}>
                                <Grid.Row>
                                    <Grid.Column>
                                        <Form.Field inline>
                                            <label>Field Name</label>
                                            <Input
                                                fluid
                                                name={"label"}
                                                value={values["label"]}
                                                onChange={handleChange}
                                            />
                                        </Form.Field>
                                        <Form.Field>
                                            <Form.Checkbox
                                                label='Private'
                                                checked={values['isPrivate']}
                                                name={'isPrivate'}
                                                onChange={handleChange}
                                            />
                                        </Form.Field>
                                        <Form.Field>
                                            <Form.Checkbox
                                                label='Display'
                                                checked={values['display']}
                                                name={'display'}
                                                onChange={handleChange}
                                            />
                                        </Form.Field>
                                        <Form.Field>
                                            <Checkbox
                                                label='Filterable'
                                                checked={values['isFilter']}
                                                name={'isFilter'}
                                                onChange={handleChange}
                                            />
                                        </Form.Field>
                                        <Form.Field>
                                            <Form.Checkbox
                                                label='Sortable'
                                                checked={values['sortable']}
                                                name={'sortable'}
                                                onChange={handleChange}
                                            />
                                        </Form.Field>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Form.Field inline>
                                            <label>Type</label>
                                            <Form.Select
                                                options={fieldTypes}
                                                name={"type"}
                                                value={values["type"]}
                                                onChange={handleChange}
                                            />
                                        </Form.Field>
                                        {

                                            isDropdownType(values["type"]) && <OptionsEditor
                                                headerKey={headerLabel}
                                                options={values.options}
                                                onInitOptions={handleInitOptions}
                                                onOptionsChange={handleOptionsChange}
                                            />
                                        }
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                            <ErrorBox errors={errors} />
                        </Segment>
                    </Container>
                </Modal.Description>
            </Form>
        </Modal.Content>
    )

    return (
        <Confirm
            size={'large'}
            open={modalOpen}
            header={`${headerLabel} Settings`}
            content={modalContent}
            onCancel={handleClose}
            onConfirm={onSubmit}
            confirmButton={<Button positive>Save</Button>}
            trigger={newChildren}
        />
    )
}

export default SetColumnSettingsModal;