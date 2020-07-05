import React, { useEffect } from 'react'
import { Button, Form, Grid, Header, Message, Segment, Label } from 'semantic-ui-react'

import _ from 'lodash';

import validateSettings from '../../Authentication/validateSettings';
import useFormValidation from '../../Authentication/useFormValidation';
import { useHistory } from 'react-router-dom';

const INITIAL_STATE = {
    spreadsheetId: localStorage.getItem('spreadsheetId') || '',
    steamApiKey: localStorage.getItem('steamApiKey') || '',
}

function Settings() {
    const { handleSubmit, handleChange, values, errors } = useFormValidation(INITIAL_STATE, validateSettings, handleUpdate);
    const [haveValues, setHaveValues] = React.useState(localStorage.getItem('spreadsheetId') && localStorage.getItem('steamApiKey') ? true : false);
    const history = useHistory();

    useEffect(() => {
        if (history.location.state && history.location.state.edit) { history.location.state = null; return; }

        if (haveValues) {
            goToSpreadsheet()
        }
    }, [])

    function goToSpreadsheet() {
        history.push(`/id/${localStorage.getItem('spreadsheetId')}`)
    }

    function handleUpdate() {
        localStorage.setItem('spreadsheetId', values.spreadsheetId)
        localStorage.setItem('steamApiKey', values.steamApiKey)

        setHaveValues(true)
    }

    return (
        <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
            <Grid.Column style={{ maxWidth: 600 }}>
                <Header as='h2' color='black' textAlign='center'>Settings</Header>
                <Form onSubmit={handleSubmit} size='large'>
                    <Segment stacked>
                        <Form.Input
                            fluid
                            icon='file excel'
                            iconPosition='left'
                            name='spreadsheetId'
                            placeholder='Spreadsheet ID'
                            onChange={handleChange}
                            value={values['spreadsheetId']}
                            key='spreadsheetId'
                        />
                        <Form.Input
                            fluid
                            icon='steam'
                            iconPosition='left'
                            name='steamApiKey'
                            placeholder='Steam Web API Key'
                            onChange={handleChange}
                            value={values['steamApiKey']}
                            key='steamApiKey'
                        />
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
                {
                    !_.isEmpty(errors) && (
                        <Message style={{ textAlign: 'left' }} error>
                            <Message.Header>Errors</Message.Header>
                            <Message.List>
                                {
                                    Object.keys(errors).map((errorKey, index) => (
                                        <Message.Item key={errorKey}>
                                            {errors[errorKey]}
                                        </Message.Item>
                                    ))
                                }
                            </Message.List>
                        </Message>
                    )
                }
                {
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
                }
                <Message style={{ textAlign: 'left' }}>
                    <Message.Header>Where do I get them from?</Message.Header>
                    <Message.List>
                        <Message.Item>
                            Make a copy of <a target='_blank' rel='noopener noreferrer' href='https://docs.google.com/spreadsheets/d/1Xu-kbGGwi40FKgrf5NJMAjGQgHlR3qYmk-w6dUs74Fo/edit#gid=0'>this</a> and get the Id of your copy from the url,
                            <br />
                            the Id looks like: <Label>1Xu-kbGGwi40FKgrf5NJMAjGQgHlR3qYmk-w6dUs74Fo</Label>
                        </Message.Item>
                        <Message.Item>Get your Steam Web API Key <a target='_blank' rel='noopener noreferrer' href='https://steamcommunity.com/dev/apikey'>Here</a></Message.Item>
                        {/* <Message.Item>Get your IsThereAnyDeal API Key <a target='_blank' href='https://isthereanydeal.com/dev/app/'>Here</a></Message.Item> */}
                    </Message.List>
                </Message>
            </Grid.Column>
        </Grid>
    )
}

export default Settings