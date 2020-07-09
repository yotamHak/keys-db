import React, { useEffect } from "react"
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import { useSelector, useDispatch } from "react-redux"

import MainApp from "./KeysDbApp/Main"
import Settings from "./KeysDbApp/Settings/Settings"
import SteamLogin from "./auth/SteamLogin/SteamLogin"
import { Container } from "semantic-ui-react"
import GoogleAuthentication from "../google/GoogleAuthentication"
import { googleLoggedIn } from "../actions"

function App() {
    const isSteamLogged = useSelector((state) => state.authentication.steam)
    const isGoogleLogged = useSelector((state) => state.authentication.google)

    useEffect(() => { }, [])

    const dispatch = useDispatch();
    const load = () => dispatch(googleLoggedIn(true))

    return (
        isSteamLogged && isGoogleLogged
            ? (
                <BrowserRouter>
                    <Switch>
                        <Route exact path="/" render={() => <Redirect to="/settings" />} />
                        <Route path="/settings" component={Settings} />
                        <Route path="/id/:spreadsheetId" component={MainApp} />
                    </Switch>
                </BrowserRouter>
            )
            : (
                <Container>
                    <SteamLogin />
                    <GoogleAuthentication callbackOnSignIn={load} />
                </Container>
            )
    )
}

export default App;