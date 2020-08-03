import React, { useEffect, useState } from 'react'
import { Button, Form, Grid, Header, Message, Segment, } from 'semantic-ui-react'

import validateSettings from '../../Authentication/validateSettings';
import useFormValidation from '../../Authentication/useFormValidation';
import ErrorBox from '../../Authentication/ErrorBox/ErrorBox';
import { useSelector, useDispatch } from 'react-redux';
import { setupComplete, spreadsheetSetId, steamSetApiKey, steamSetProfile, steamLogged } from '../../../actions';
import { usePrevious, useInterval } from '../../../utils';
import { GetUserInfo } from '../../../steam/steamApi';
import Spreadsheets from '../../../google/Spreadsheets';
import ImportModal from '../Modals/ImportModal/ImportModal';

function Settings() {
    // const [haveValues, setHaveValues] = React.useState(localStorage.getItem('spreadsheetId') && (localStorage.getItem('steam') && localStorage.getItem('steam').apiKey) ? true : false);

    const steam = useSelector((state) => state.authentication.steam)
    const spreadsheetId = useSelector((state) => state.authentication.spreadsheetId)

    const dispatch = useDispatch()

    const prevSteamProfile = usePrevious(steam.profile);

    const [isFinishedAlertTimerRunning, setIsFinishedAlertTimerRunning] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [creatingSpreadsheet, setCreatingSpreadsheet] = useState(false);

    const INITIAL_STATE = steam.loggedIn || JSON.parse(localStorage.getItem('steam')).loggedIn
        ? {
            spreadsheetId: localStorage.getItem('spreadsheetId') || '',
            steamApiKey: (JSON.parse(localStorage.getItem('steam')) && JSON.parse(localStorage.getItem('steam')).apiKey) || '',
        }
        : {
            spreadsheetId: localStorage.getItem('spreadsheetId') || '',
        }

    const { handleSubmit, handleChange, values, errors, } = useFormValidation(INITIAL_STATE, validateSettings, handleUpdate);

    useInterval(() => {
        setIsSuccess(false)
    }, isFinishedAlertTimerRunning ? 3000 : null);

    useEffect(() => {
        if (steam.loggedIn !== null && spreadsheetId) {
            dispatch(setupComplete(true))
            return
        }

        if (steam.id && steam.apiKey) {
            if (!steam.profile) {
                GetUserInfo(steam.id, steam.apiKey)
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

        setIsSuccess(true)
        setIsFinishedAlertTimerRunning(true)

        // setHaveValues(true)
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

    return (
        <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle'>
            <Grid.Column style={{ maxWidth: 600 }}>
                <Header as='h2' color='black' textAlign='center'>Settings</Header>

                <Message style={{ textAlign: 'left' }} info>
                    <Message.Header>Already have a spreadsheet?</Message.Header>
                    <Message.List>
                        <Message.Item>Click <ImportModal trigger={<span style={{ cursor: 'pointer' }}>Here</span>} />  to import</Message.Item>
                    </Message.List>
                </Message>

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
                    isSuccess && (
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