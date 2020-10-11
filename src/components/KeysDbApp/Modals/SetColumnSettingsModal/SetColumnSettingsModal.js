import React, { useState, } from "react";
import { Modal, Button, Confirm, Container, Segment, Form, } from "semantic-ui-react";
import { useSelector, useDispatch } from "react-redux";

import { setNewRowChange } from "../../../../actions/TableActions";
import FieldSettings from "../../FieldSettings";

import useFormValidation from '../../../../hooks/useFormValidation'
import validateHeaderSetting from '../../../../hooks/formValidations/validateHeaderSetting'
import useInterval from '../../../../hooks/useInterval'

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
                            <FieldSettings
                                values={values}
                                errors={errors}
                                handleChange={handleChange}
                            />
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