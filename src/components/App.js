import React, { } from "react"
import { BrowserRouter, Switch, Route, } from 'react-router-dom'
import firebase, { FirebaseContext } from '../firebase';

import KeysDBWrapper from "./KeysDbApp/KeysDBWrapper"
import Settings from "./KeysDbApp/Settings/Settings"
import SetupPage from "./KeysDbApp/SetupPage/SetupPage";
import Header from "./Header/Header";
import Home from "../components/Home/Home";

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
                        <Route path="/id/:spreadsheetId" component={KeysDBWrapper} />
                        <Route exact path="/" component={Home} />
                    </Switch>
                </div>
            </FirebaseContext.Provider>
        </BrowserRouter>
    )
}

export default App;