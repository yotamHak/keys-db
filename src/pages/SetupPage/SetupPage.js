import React, { useEffect, } from "react"
import { useHistory } from 'react-router-dom'
import { useSelector, } from "react-redux"
import { Container, Step, Grid, } from "semantic-ui-react"

import GoogleAuthentication from "../../google/GoogleAuthentication"
import Settings from "../../components/KeysDbApp/Settings"
import SteamLogin from "../../components/auth/SteamLogin"

function SetupPage() {
    // const googleClientReady = useSelector((state) => state.authentication.googleClientReady)
    const isSteamLogged = useSelector((state) => state.authentication.steam.loggedIn)
    const isGoogleLogged = useSelector((state) => state.authentication.google.loggedIn)
    const setupComplete = useSelector((state) => state.authentication.setupComplete)
    const spreadsheetId = useSelector((state) => state.authentication.spreadsheetId)

    // const google = useSelector((state) => state.authentication.google)
    const steam = useSelector((state) => state.authentication.steam)

    // const dispatch = useDispatch()
    const history = useHistory()

    useEffect(() => {
        // console.log("isGoogleLogged", isGoogleLogged)
        // console.log("isSteamLogged", isSteamLogged)
        // console.log("steam.id", steam.id)
        // console.log("setupComplete", setupComplete)

        if (setupComplete) {
            history.push(`/id/${spreadsheetId}`)
        }
    }, [steam, setupComplete, isGoogleLogged, isSteamLogged])

    return (
        <Grid>
            <Grid.Row>
                <Grid.Column>
                    <Container textAlign='center'>
                        <Step.Group ordered>
                            <Step completed={isGoogleLogged} active={isGoogleLogged === null}>
                                <Step.Content>
                                    <Step.Title>Google</Step.Title>
                                    <Step.Description>Login with google</Step.Description>
                                </Step.Content>
                            </Step>
                            <Step completed={steam.id !== null || isSteamLogged !== null} active={isGoogleLogged === true && steam.id === null && isSteamLogged === null}>
                                <Step.Content>
                                    <Step.Title>Steam</Step.Title>
                                    <Step.Description>Login with steam</Step.Description>
                                </Step.Content>
                            </Step>
                            <Step completed={setupComplete} active={isGoogleLogged === true && steam.id !== null && !setupComplete}>
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
                        !isGoogleLogged && <GoogleAuthentication />
                    }
                    {
                        isGoogleLogged && (!steam.id && isSteamLogged === null) && <SteamLogin />
                    }
                    {
                        isGoogleLogged && (steam.id || isSteamLogged !== null) && !setupComplete && <Settings />
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