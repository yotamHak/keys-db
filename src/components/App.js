import React, { useEffect, } from "react"
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import { useSelector, useDispatch } from "react-redux"

import firebase, { FirebaseContext } from '../firebase';

import MainApp from "./KeysDbApp/Main"
import Settings from "./KeysDbApp/Settings/Settings"
import SetupPage from "./KeysDbApp/SetupPage/SetupPage";
import { steamApiKeySet, spreadsheetIdSet, steamLoggedIn } from "../actions"

function App() {
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

    return setupComplete
        ? (
            <BrowserRouter>
                <FirebaseContext.Provider value={{ firebase }}>
                    <Switch>
                        <Route exact path="/" render={() => <Redirect to={`/id/${spreadsheetId.id}`} />} />
                        <Route path="/settings" component={Settings} />
                        <Route path="/id/:spreadsheetId" component={MainApp} />
                    </Switch>
                </FirebaseContext.Provider>
            </BrowserRouter>
        )
        : <SetupPage />

}

export default App;