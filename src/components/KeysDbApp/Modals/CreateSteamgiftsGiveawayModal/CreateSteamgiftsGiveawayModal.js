import React, { useState, } from "react";
import { useSelector } from "react-redux";
import { Modal, Icon, Dropdown, Button, Form, Segment, Input, Message } from "semantic-ui-react";

import validateSteamgiftsGiveaway from "../../../../hooks/formValidations/validateSteamgiftsGiveaway";
import useFormValidation from "../../../../hooks/useFormValidation";
import { getValueByType } from "../../../../utils";
import ErrorBox from "../../../ErrorBox";

const DEFAULT_STARTING_TIME_OFFSET = 15;
const DEFAULT_GIVEAWAY_TIME_ACTIVE = 75

function CreateSteamgiftsGiveawayModal({ rowIndex, trigger = <Dropdown.Item text="Create Steamgifts Giveaway" /> }) {
    const headers = useSelector((state) => state.table.headers)
    const gameData = useSelector((state) => state.table.rows[rowIndex])
    const [modalOpen, setModalOpen] = useState(false)

    const handleOpen = () => setModalOpen(true)
    const handleClose = () => setModalOpen(false)

    const Child = React.Children.only(trigger);
    const newChildren = React.cloneElement(Child, { onClick: handleOpen });

    const INITIAL_STATE = {
        appid: getValueByType(gameData, headers, "steam_appid"),
        title: getValueByType(gameData, headers, "steam_title"),
        key: getValueByType(gameData, headers, "key"),
        startingTimeOffset: DEFAULT_STARTING_TIME_OFFSET,
        timeActive: DEFAULT_GIVEAWAY_TIME_ACTIVE,
    }

    const { handleSubmit, handleChange, values, errors, } = useFormValidation(INITIAL_STATE, validateSteamgiftsGiveaway, handleRedirect);

    function handleRedirect() {
        let formElement = document.createElement('a');
        formElement.setAttribute('id', 'go-to-steamgifts')
        formElement.setAttribute('href', `https://www.steamgifts.com/giveaways/new?appid=${values.appid}&title=${values.title}&key=${values.key}&starting-time-offset=${values.startingTimeOffset}&time-active=${values.timeActive}`)
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
                    <Message info>
                        <Message.Header>Info</Message.Header>
                        <Message.List>
                            <Message.Item>To use this feature, you need to install <a href={`https://tampermonkey.net/`} target='_blank' rel='noopener noreferrer'>Tampermonkey</a>, <a href={`https://violentmonkey.github.io/`} target='_blank' rel='noopener noreferrer'>Violentmonkey</a>, <a href={`http://www.greasespot.net/`} target='_blank' rel='noopener noreferrer'>Greasemonkey</a> or some other userscript manager first.</Message.Item>
                            <Message.Item>After installing a userscript manager, <a href={`https://github.com/yotamHak/keys-db/raw/master/src/assets/userscripts/keys-db-create-giveaway.user.js`} target='_blank' rel='noopener noreferrer'>click here</a> and you should be prompted to install the SteamGifts userscript.</Message.Item>
                        </Message.List>
                    </Message>
                    <Form autoComplete="off">
                        <Segment basic>
                            <Form.Field>
                                <label>App ID</label>
                                <Form.Input
                                    fluid
                                    name='appid'
                                    placeholder='AppId'
                                    onChange={handleChange}
                                    value={values['appid']}
                                    key='appid'
                                />
                            </Form.Field>

                            <Form.Field>
                                <label>Title</label>
                                <Form.Input
                                    fluid
                                    name='title'
                                    placeholder='Title'
                                    onChange={handleChange}
                                    value={values['title']}
                                    key='title'
                                />
                            </Form.Field>

                            <Form.Field>
                                <label>Steam Key</label>
                                <Form.Input
                                    fluid
                                    name='key'
                                    placeholder='Key'
                                    onChange={handleChange}
                                    value={values['key']}
                                    key='key'
                                />
                            </Form.Field>

                            <Form.Field>
                                <label>Starting Offset (in minutes)</label>
                                <Input
                                    fluid
                                    type='number'
                                    min="0"
                                    max="43830"
                                    label={{ basic: true, content: 'Minutes' }}
                                    labelPosition='right'
                                    name='startingTimeOffset'
                                    placeholder='Starting Time Offset'
                                    onChange={handleChange}
                                    value={values['startingTimeOffset']}
                                    key='startingTimeOffset'
                                />
                            </Form.Field>

                            <Form.Field>
                                <label>Time Active (in minutes)</label>
                                <Input
                                    fluid
                                    type='number'
                                    min="60"
                                    max="43770"
                                    label={{ basic: true, content: 'Minutes' }}
                                    labelPosition='right'
                                    name='timeActive'
                                    placeholder='Open for...'
                                    onChange={handleChange}
                                    value={values['timeActive']}
                                    key='timeActive'
                                />
                            </Form.Field>

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
};

export default CreateSteamgiftsGiveawayModal;