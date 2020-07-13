import React, { useEffect, } from "react"
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import { useSelector, useDispatch } from "react-redux"

import firebase, { FirebaseContext } from '../firebase';

import KeysDBWrapper from "./KeysDbApp/KeysDBWrapper"
import Settings from "./KeysDbApp/Settings/Settings"
import SetupPage from "./KeysDbApp/SetupPage/SetupPage";
import { steamApiKeySet, spreadsheetIdSet, steamLoggedIn } from "../actions"
import Header from "./Header/Header";
import Home from "../components/Home/Home";

function App() {
    const setupComplete = useSelector((state) => state.authentication.setupComplete)
    const spreadsheetId = useSelector((state) => state.spreadsheetId)

    const dispatch = useDispatch()

    useEffect(() => {
        if (localStorage.getItem('spreadsheetId') && localStorage.getItem('steamApiKey')) {
            // dispatch(steamApiKeySet(localStorage.getItem('steamApiKey')))
            // dispatch(spreadsheetIdSet(localStorage.getItem('spreadsheetId')))
        }
        if (localStorage.getItem('steamId')) {
            // dispatch(steamLoggedIn(true))
        }
    }, [setupComplete])

    return (
        <BrowserRouter>
            <FirebaseContext.Provider value={{ firebase }}>
                <Header />
                <div>
                    <Switch>
                        {/* <Route exact path="/" render={() => <Redirect to={`/id/${spreadsheetId.id}`} />} /> */}
                        <Route path="/login" component={SetupPage} />
                        <Route path="/settings" component={Settings} />
                        <Route path="/id/:spreadsheetId" component={KeysDBWrapper} />
                        <Route exact path="/" component={Home} />
                    </Switch>
                </div>
            </FirebaseContext.Provider>
        </BrowserRouter>
    )

}

export default App;