import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { Button, Form, Grid, Header, Message, Segment, } from 'semantic-ui-react'

import ErrorBox from '../../ErrorBox';
import { setupComplete, spreadsheetSetId, steamSetApiKey, steamSetProfile, steamLogged } from '../../../store/actions/AuthenticationActions';
import ImportModal from '../Modals/ImportModal';

import useFormValidation from '../../../hooks/useFormValidation'
import validateSettings from '../../../hooks/formValidations/validateSettings'
import usePrevious from '../../../hooks/usePrevious'
import useInterval from '../../../hooks/useInterval'
import useLocalStorage from '../../../hooks/useLocalStorage';

import SteamApi from '../../../lib/steam/SteamApi';
import Spreadsheets from '../../../lib/google/Spreadsheets';

function Settings() {
    const steam = useSelector((state) => state.authentication.steam)
    const spreadsheetId = useSelector((state) => state.authentication.spreadsheetId)

    const dispatch = useDispatch()

    const prevSteamProfile = usePrevious(steam.profile);

    const [isSaveSuccess, setIsSaveSuccess] = useState(false);
    const [isImportSuccess, setIsImportSuccess] = useState(false);
    const [isFinishedAlertTimerRunning, setIsFinishedAlertTimerRunning] = useState(false);
    const [creatingSpreadsheet, setCreatingSpreadsheet] = useState(false);

    const [steamStorage,] = useLocalStorage("steam", null)
    const [spreadsheetIdStorage,] = useLocalStorage("spreadsheetId", null)

    const INITIAL_STATE = steam.loggedIn || (JSON.parse(steamStorage) && JSON.parse(steamStorage).loggedIn)
        ? {
            spreadsheetId: spreadsheetIdStorage || '',
            steamApiKey: (JSON.parse(steamStorage) && JSON.parse(steamStorage).apiKey) || '',
        }
        : {
            spreadsheetId: spreadsheetIdStorage || '',
        }

    const { handleSubmit, handleChange, values, errors, } = useFormValidation(INITIAL_STATE, validateSettings, handleUpdate);

    useInterval(() => {
        setIsSaveSuccess(false)
        setIsImportSuccess(false)
        setIsFinishedAlertTimerRunning(false)
    }, isFinishedAlertTimerRunning ? 5000 : null);

    useEffect(() => {
        if (steam.loggedIn !== null && spreadsheetId) {
            dispatch(setupComplete(true))
            return
        }

        if (steam.id && steam.apiKey) {
            if (!steam.profile) {
                SteamApi.GetUserInfo(steam.id, steam.apiKey)
                    .then(response => {
                        if (response.success) {
                            dispatch(steamSetProfile(response.data.user))
                        }
                    })
            }

            if (prevSteamProfile === null && steam.profile) {
                dispatch(steamLogged(true))
            }
        }
    }, [steam, spreadsheetId])

    function handleUpdate() {
        dispatch(steamSetApiKey(values.steamApiKey))
        dispatch(spreadsheetSetId(values.spreadsheetId))

        setIsSaveSuccess(true)
        setIsFinishedAlertTimerRunning(true)
    }

    function createSpreadsheet(event) {
        event.preventDefault();
        setCreatingSpreadsheet(true)
        Spreadsheets.CreateStartingSpreadsheet("My Collection")
            .then(response => {
                if (response.success) {
                    handleChange(event, { name: "spreadsheetId", value: response.data.spreadsheetId })
                }
            })
            .finally(response => {
                setCreatingSpreadsheet(false)
            })
    }

    function handleImport(event, response) {
        setIsImportSuccess(true)
        setIsFinishedAlertTimerRunning(true)
        handleChange(event, { name: 'spreadsheetId', value: response.spreadsheetId })
    }

    return (
        <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle'>
            <Grid.Column style={{ maxWidth: 600 }}>
                <Header as='h2' color='black' textAlign='center'>Settings</Header>

                {
                    !isImportSuccess
                        ? <Message style={{ textAlign: 'left' }} info>
                            <Message.Header>Already have a spreadsheet?</Message.Header>
                            <Message.List>
                                <Message.Item>Click <ImportModal responseCallback={handleImport} trigger={<span style={{ cursor: 'pointer' }}>Here</span>} /> to import</Message.Item>
                            </Message.List>
                        </Message>
                        : <Message style={{ textAlign: 'left' }} positive>
                            <Message.Header>Success!</Message.Header>
                            <Message.List>
                                <Message.Item>Import successful!</Message.Item>
                            </Message.List>
                        </Message>
                }

                <Form onSubmit={handleSubmit} size='large'>
                    <Segment>
                        <Form.Input
                            action={{
                                color: 'teal',
                                labelPosition: 'left',
                                icon: 'file excel',
                                content: 'Create',
                                onClick: createSpreadsheet,
                                loading: creatingSpreadsheet
                            }}
                            actionPosition='left'
                            fluid
                            name='spreadsheetId'
                            placeholder='Spreadsheet ID'
                            onChange={handleChange}
                            value={values['spreadsheetId']}
                            key='spreadsheetId'
                        />
                        {
                            steam.id !== null && <Form.Input
                                fluid
                                icon='steam'
                                iconPosition='left'
                                name='steamApiKey'
                                placeholder='Steam Web API Key'
                                onChange={handleChange}
                                value={values['steamApiKey']}
                                key='steamApiKey'
                            />
                        }
                        {
                            /* <Form.Input
                                fluid
                                icon='rocket'
                                iconPosition='left'
                                placeholder='IsThereAnyDeal API Key'
                            /> */
                        }

                        <Button color='black' fluid size='large'>Save</Button>
                    </Segment>
                </Form>
                <ErrorBox errors={errors} />
                {
                    isSaveSuccess && (
                        <Message positive>
                            <Message.Header>Saved!</Message.Header>
                        </Message>
                    )
                }
                {
                    steam.loggedIn !== false && (
                        <Message style={{ textAlign: 'left' }}>
                            <Message.Header>Info</Message.Header>
                            <Message.List>
                                <Message.Item>Get your Steam Web API Key <a target='_blank' rel='noopener noreferrer' href='https://steamcommunity.com/dev/apikey'>Here</a></Message.Item>
                            </Message.List>
                        </Message>
                    )
                }
            </Grid.Column>
        </Grid>
    )
}

export default Settings