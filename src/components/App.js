import React from "react";
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import MainApp from "./KeysDbApp/Main";
import Settings from "./KeysDbApp/Settings/Settings"

function App() {
    React.useEffect(() => { }, [])

    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/" render={() => <Redirect to="/settings" />} />
                <Route path="/settings" component={Settings} />
                <Route path="/id/:spreadsheetId" component={MainApp} />

                {/* <Route path="/create" component={CreateLink} />
                <Route path="/login" component={Login} />
                <Route path="/forgot" component={ForgotPassword} />
                <Route path="/search" component={SearchLinks} />
                <Route path="/top" component={LinkList} />
                <Route path="/new/:page" component={LinkList} /> */}
            </Switch>
        </BrowserRouter>
    );
}

export default App;