import React, { } from "react"
import { BrowserRouter, Switch, Route, } from 'react-router-dom'
import firebase, { FirebaseContext } from '../firebase';

import Settings from "./KeysDbApp/Settings/Settings"
import Header from "./Header/Header";
import ErrorPage from "../pages/ErrorPage/ErrorPage";
import Home from "../pages/Home/Home";
import KeysDBPage from "../pages/KeysDBPage/KeysDBPage";
import SetupPage from "../pages/SetupPage/SetupPage";

function App() {
    return (
        <BrowserRouter>
            <FirebaseContext.Provider value={{ firebase }}>
                <Header />
                <div>
                    <Switch>
                        {/* <Route exact path="/" render={() => <Redirect to={`/id/${spreadsheetId.id}`} />} /> */}
                        <Route path="/login" component={SetupPage} />
                        <Route path="/settings" component={Settings} />
                        <Route path="/error/:error" component={ErrorPage} />
                        <Route path="/id/:spreadsheetId" component={KeysDBPage} />
                        <Route exact path="/" component={Home} />
                    </Switch>
                </div>
            </FirebaseContext.Provider>
        </BrowserRouter>
    )
}

export default App;