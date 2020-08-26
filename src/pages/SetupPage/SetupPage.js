import React, { useEffect, useCallback, } from "react"
import { useHistory } from 'react-router-dom'
import { useSelector, } from "react-redux"
import { Container, Step, Grid, } from "semantic-ui-react"

import Settings from "../../components/KeysDbApp/Settings"
import SteamLogin from "../../components/auth/SteamLogin"
import useGapi from '../../hooks/useGapi'
import googleConfig from "../../lib/google/config"
import { GoogleLoginComponent } from "../../components/auth/GoogleLoginComponent/GoogleLoginComponent"

function SetupPage() {
    // const googleClientReady = useSelector((state) => state.authentication.googleClientReady)
    const isSteamLogged = useSelector((state) => state.authentication.steam.loggedIn)
    const isGoogleLogged = useSelector((state) => state.authentication.google.loggedIn)
    const setupComplete = useSelector((state) => state.authentication.setupComplete)
    const spreadsheetId = useSelector((state) => state.authentication.spreadsheetId)
    const steam = useSelector((state) => state.authentication.steam)

    const history = useHistory()

    const googleApi = useGapi({
        ...googleConfig,
        onLoaded: useCallback(gapi => { }, [])
    });

    const { isAuthenticated, handleSignIn, currentUser, isLoading } = googleApi;

    useEffect(() => {
        // console.log("isGoogleLogged", isGoogleLogged)
        // console.log("isSteamLogged", isSteamLogged)
        // console.log("steam.id", steam.id)
        // console.log("setupComplete", setupComplete)

        if (setupComplete) {
            history.push(`/id/${spreadsheetId}`)
        }

        // if (isAuthenticated && currentUser && isGoogleLogged === null) {
        //     dispatch(googleLoggedIn(currentUser))
        // }
    }, [setupComplete, isAuthenticated, currentUser, isGoogleLogged])

    return (
        <Grid>
            <Grid.Row>
                <Grid.Column>
                    <Container textAlign='center'>
                        <Step.Group ordered>
                            <Step completed={isAuthenticated} active={!isAuthenticated}>
                                <Step.Content>
                                    <Step.Title>Google</Step.Title>
                                    <Step.Description>Login with google</Step.Description>
                                </Step.Content>
                            </Step>
                            <Step completed={steam.id !== null || isSteamLogged !== null} active={isAuthenticated && steam.id === null && isSteamLogged === null}>
                                <Step.Content>
                                    <Step.Title>Steam</Step.Title>
                                    <Step.Description>Login with steam</Step.Description>
                                </Step.Content>
                            </Step>
                            <Step completed={setupComplete} active={isAuthenticated && steam.id !== null && !setupComplete}>
                                <Step.Content>
                                    <Step.Title>Set Up</Step.Title>
                                </Step.Content>
                            </Step>
                        </Step.Group>
                    </Container>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column>
                    {
                        !isAuthenticated && !isLoading && (
                            <Container textAlign='center'>
                                <GoogleLoginComponent
                                    isAuthenticated={isAuthenticated}
                                    handleSignIn={handleSignIn}
                                />
                            </Container>
                        )
                    }
                    {
                        isAuthenticated && (!steam.id && isSteamLogged === null) && <SteamLogin />
                    }
                    {
                        isAuthenticated && (steam.id || isSteamLogged !== null) && !setupComplete && <Settings />
                    }
                    {/* {
                        isGoogleLogged && isSteamLogged && setupComplete && (
                            <Dimmer active inverted>
                                <Loader content='Loading' />
                            </Dimmer>
                        )
                    } */}
                </Grid.Column>
            </Grid.Row>
        </Grid>
    )
}

export default SetupPage;