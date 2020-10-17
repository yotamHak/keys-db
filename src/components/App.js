import React, { } from "react"
import { BrowserRouter, Switch, Route, } from 'react-router-dom'
import firebase, { FirebaseContext } from '../firebase';

import Settings from "./KeysDbApp/Settings/Settings"
import Header from "./Header/Header";
import ErrorPage from "../pages/ErrorPage/ErrorPage";
import Home from "../pages/Home/Home";
import KeysDBPage from "../pages/KeysDBPage/KeysDBPage";
import SetupPage from "../pages/SetupPage/SetupPage";
import PrivacyNoticePage from "../pages/PrivacyNoticePage/PrivacyNoticePage";
import TermsAndContitionsPage from "../pages/TermsAndContitionsPage/TermsAndContitionsPage";
import StatisticsPage from "../pages/StatisticsPage/StatisticsPage";

function App() {
    return (
        <BrowserRouter>
            <FirebaseContext.Provider value={{ firebase }}>
                <Header />
                <div>
                    <Switch>
                        <Route path="/get-started" component={SetupPage} />
                        <Route path="/privacy-notice" component={PrivacyNoticePage} />
                        <Route path="/terms-and-conditions" component={TermsAndContitionsPage} />
                        <Route path="/settings" component={Settings} />
                        <Route path="/error/:error" component={ErrorPage} />
                        <Route path="/id/:spreadsheetId/statistics" component={StatisticsPage} />
                        <Route path="/id/:spreadsheetId" component={KeysDBPage} />
                        {/* <Route path="/id/:spreadsheetId/statistics" component={KeysDBPage} /> */}
                        <Route exact path="/" component={Home} />
                    </Switch>
                </div>
            </FirebaseContext.Provider>
        </BrowserRouter>
    )
}

export default App;