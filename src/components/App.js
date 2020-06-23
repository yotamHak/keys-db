import React from "react";
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
// import firebase from "firebase";

import MainApp from "./KeysDbApp/Main";

function App() {
    return (
        <BrowserRouter>
            <Switch>
                {/* <Route exact path="/" render={() => <Redirect to="/new/1" />} />
            <Route path="/create" component={CreateLink} />
            <Route path="/login" component={Login} />
            <Route path="/forgot" component={ForgotPassword} />
            <Route path="/search" component={SearchLinks} />
            <Route path="/top" component={LinkList} />
            <Route path="/new/:page" component={LinkList} /> */}
                <Route path="/id/:spreadsheetId" component={MainApp} />
            </Switch>
        </BrowserRouter>
        // <BrowserRouter>
        //     <MainApp />
        // </BrowserRouter>
    );
}

export default App;