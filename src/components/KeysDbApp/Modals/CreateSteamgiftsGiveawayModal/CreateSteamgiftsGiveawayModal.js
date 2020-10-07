import React, { useState, } from "react";
import { useSelector } from "react-redux";
import { Modal, Icon, Dropdown, Button, Form, Segment, Input, } from "semantic-ui-react";

import validateSteamgiftsGiveaway from "../../../../hooks/formValidations/validateSteamgiftsGiveaway";
import useFormValidation from "../../../../hooks/useFormValidation";
import { getValueByType } from "../../../../utils";
import ErrorBox from "../../../ErrorBox";


function CreateSteamgiftsGiveawayModal({ appId, rowIndex, trigger = <Dropdown.Item text="Create Steamgifts Giveaway" /> }) {
    const headers = useSelector((state) => state.table.headers)
    const gameData = useSelector((state) => state.table.rows[rowIndex])
    const [modalOpen, setModalOpen] = useState(false)

    const handleOpen = () => setModalOpen(true)
    const handleClose = () => setModalOpen(false)

    const Child = React.Children.only(trigger);
    const newChildren = React.cloneElement(Child, { onClick: handleOpen });

    const INITIAL_STATE = {
        appid: appId,
        key: getValueByType(gameData, headers, "key") || null,
        startingTimeOffset: 15,
        timeActive: 75,
    }

    const { handleSubmit, handleChange, values, errors, } = useFormValidation(INITIAL_STATE, validateSteamgiftsGiveaway, handleRedirect);

    function handleRedirect() {
        let formElement = document.createElement('a');
        formElement.setAttribute('id', 'go-to-steamgifts')
        formElement.setAttribute('href', `https://www.steamgifts.com/giveaways/new?appid=${values.appid}&key=${values.key}&starting-time-offset=${values.startingTimeOffset}&time-active=${values.timeActive}`)
        formElement.setAttribute('target', '_blank')
        formElement.setAttribute('rel', 'noopener noreferrer')

        document.getElementById('create-steamgift-giveaway-modal').append(formElement)

        formElement.click()
        formElement.remove()
        handleClose()
    }

    return (
        <Modal
            id={'create-steamgift-giveaway-modal'}
            trigger={newChildren}
            centered={false}
            size={'tiny'}
            open={modalOpen}
            onClose={handleClose}
            closeIcon={<Icon name="close" onClick={handleClose} />}
        >
            <Modal.Header>Create Giveaway</Modal.Header>
            <Modal.Content >
                <Modal.Description>
                    <Form autoComplete="off">
                        <Segment basic>
                            <Form.Input
                                fluid
                                name='appid'
                                placeholder='AppId'
                                onChange={handleChange}
                                value={values['appid']}
                                key='appid'
                            />
                            <Form.Input
                                fluid
                                name='key'
                                placeholder='Key'
                                onChange={handleChange}
                                value={values['key']}
                                key='key'
                            />

                            <Input
                                fluid
                                label={{ basic: true, content: 'Minutes' }}
                                labelPosition='right'
                                name='startingTimeOffset'
                                placeholder='Starting Time Offset'
                                onChange={handleChange}
                                value={values['startingTimeOffset']}
                                key='startingTimeOffset'
                            />

                            <Input
                                fluid
                                label={{ basic: true, content: 'Minutes' }}
                                labelPosition='right'
                                name='timeActive'
                                placeholder='Open for...'
                                onChange={handleChange}
                                value={values['timeActive']}
                                key='timeActive'
                            />
                        </Segment>
                    </Form>
                    <ErrorBox errors={errors} />
                </Modal.Description>
            </Modal.Content>

            <Modal.Actions>
                <Button onClick={handleClose} negative>Cancel</Button>
                <Button type="submit" onClick={handleSubmit} positive>Create Giveaway</Button>
            </Modal.Actions>
        </Modal >
    );
}

// as='a'
// target='_blank'
// rel='noopener noreferrer'
// onClick={(e) => {
//     handleSubmit(e);
//     if (!isValid) {
//         return
//     }
// }}
// href={`https://www.steamgifts.com/giveaways/new?appid=${values.appid}&key=${values.key}&starting-time-offset=${values.startingTimeOffset}&time-active=${values.timeActive}`}

export default CreateSteamgiftsGiveawayModal;