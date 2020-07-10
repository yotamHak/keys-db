import React, { useEffect, useState } from "react"
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import { useSelector, useDispatch } from "react-redux"
import { Container, Step, Grid, Dimmer, Loader } from "semantic-ui-react"

import Settings from "../Settings/Settings"
import SteamLogin from "../../auth/SteamLogin/SteamLogin"

import GoogleAuthentication from "../../../google/GoogleAuthentication"
import { googleLoggedIn, steamApiKeySet, spreadsheetIdSet, steamLoggedIn } from "../../../actions"

function SetupPage() {
    const googleClientReady = useSelector((state) => state.authentication.googleClientReady)
    const isSteamLogged = useSelector((state) => state.authentication.steam)
    const isGoogleLogged = useSelector((state) => state.authentication.google)
    const setupComplete = useSelector((state) => state.authentication.setupComplete)
    const spreadsheetId = useSelector((state) => state.authentication.spreadsheetId)

    const dispatch = useDispatch()

    useEffect(() => {
        if (localStorage.getItem('spreadsheetId') && localStorage.getItem('steamApiKey')) {
            dispatch(steamApiKeySet(localStorage.getItem('steamApiKey')))
            dispatch(spreadsheetIdSet(localStorage.getItem('spreadsheetId')))
        }
        if (localStorage.getItem('steamId')) {
            dispatch(steamLoggedIn(true))
        }
    }, [setupComplete])

    return (
        <Grid>
            {
                googleClientReady
                    ? (
                        <Grid.Row style={{ height: '10vh' }}>
                            <Grid.Column>
                                <Container textAlign='center'>
                                    <Step.Group ordered>
                                        <Step completed={isGoogleLogged} active={!isGoogleLogged}>
                                            <Step.Content>
                                                <Step.Title>Google</Step.Title>
                                                <Step.Description>Login with google</Step.Description>
                                            </Step.Content>
                                        </Step>
                                        <Step completed={isSteamLogged} active={!isSteamLogged}>
                                            <Step.Content>
                                                <Step.Title>Steam</Step.Title>
                                                <Step.Description>Login with steam</Step.Description>
                                            </Step.Content>
                                        </Step>
                                        <Step completed={setupComplete} active={!setupComplete}>
                                            <Step.Content>
                                                <Step.Title>Set Up</Step.Title>
                                            </Step.Content>
                                        </Step>
                                    </Step.Group>
                                </Container>
                            </Grid.Column>
                        </Grid.Row>
                    )
                    : (
                        <Dimmer active inverted>
                            <Loader content='Loading' />
                        </Dimmer>
                    )
            }
            <Grid.Row style={{ height: '90vh' }}>
                <Grid.Column>
                    {
                        !isGoogleLogged && <GoogleAuthentication callbackOnSignIn={() => dispatch(googleLoggedIn(true))} />
                    }
                    {
                        isGoogleLogged && !isSteamLogged && <SteamLogin />
                    }
                    {
                        isGoogleLogged && isSteamLogged && !setupComplete && <Settings />
                    }
                    {
                        isGoogleLogged && isSteamLogged && setupComplete && (
                            <Dimmer active inverted>
                                <Loader content='Loading' />
                            </Dimmer>
                        )
                    }
                </Grid.Column>
            </Grid.Row>
        </Grid>
    )
}

export default SetupPage;