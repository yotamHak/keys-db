import React, { useEffect, useState } from 'react'
import { Button, Form, Grid, Header, Message, Segment, Label } from 'semantic-ui-react'

import validateSettings from '../../Authentication/validateSettings';
import useFormValidation from '../../Authentication/useFormValidation';
import ErrorBox from '../../Authentication/ErrorBox/ErrorBox';
import { useSelector, useDispatch } from 'react-redux';
import { setupComplete, spreadsheetSetId, steamSetApiKey, steamSetProfile, steamLogged } from '../../../actions';
import { usePrevious, useInterval } from '../../../utils';
import { GetUserInfo } from '../../../steam/steamApi';
import Spreadsheets from '../../../google/Spreadsheets';

function Settings() {

    // const [haveValues, setHaveValues] = React.useState(localStorage.getItem('spreadsheetId') && (localStorage.getItem('steam') && localStorage.getItem('steam').apiKey) ? true : false);

    const steam = useSelector((state) => state.authentication.steam)
    const spreadsheetId = useSelector((state) => state.authentication.spreadsheetId)

    const dispatch = useDispatch()

    const prevSteamProfile = usePrevious(steam.profile);

    const [isFinishedAlertTimerRunning, setIsFinishedAlertTimerRunning] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [creatingSpreadsheet, setCreatingSpreadsheet] = useState(false);

    const INITIAL_STATE = steam.loggedIn
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
                {/* {
                    haveValues && (
                        <Message positive>
                            <Message.Header>All done!</Message.Header>
                            <p>
                                <Button size='small' onClick={goToSpreadsheet} positive>
                                    Take me to my spreadsheet!
                                    </Button>
                            </p>
                        </Message>
                    )
                } */}
                <Message style={{ textAlign: 'left' }}>
                    <Message.Header>Info</Message.Header>
                    <Message.List>
                        {/* <Message.Item>
                            Make a copy of <a target='_blank' rel='noopener noreferrer' href='https://docs.google.com/spreadsheets/d/1Xu-kbGGwi40FKgrf5NJMAjGQgHlR3qYmk-w6dUs74Fo/edit#gid=0'>this</a> and get the Id of your copy from the url,
                            <br />
                            the Id looks like: <Label>1Xu-kbGGwi40FKgrf5NJMAjGQgHlR3qYmk-w6dUs74Fo</Label>
                        </Message.Item> */}
                        {
                            steam.loggedIn !== false && <Message.Item>Get your Steam Web API Key <a target='_blank' rel='noopener noreferrer' href='https://steamcommunity.com/dev/apikey'>Here</a></Message.Item>
                        }
                        {/* <Message.Item>Get your IsThereAnyDeal API Key <a target='_blank' href='https://isthereanydeal.com/dev/app/'>Here</a></Message.Item> */}
                    </Message.List>
                </Message>
            </Grid.Column>
        </Grid>
    )
}

export default Settings