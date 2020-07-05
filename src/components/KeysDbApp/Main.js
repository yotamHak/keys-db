import React, { useState } from "react";
import KeysTable from "./KeysTable/KeysTable";
import GoogleAuthentication from "../../google/GoogleAuthentication";
// import { GoogleLogin, GoogleLogout, useGoogleLogin } from 'react-google-login';
// import googleConfig from "../../google/config";
// import { gapi } from "gapi-script";
// import { GoogleLoginComponent } from "../auth/GoogleLoginComponent/GoogleLoginComponent";
import Spreadsheets from "../../google/Spreadsheets";
// import Login from "./auth/Login";

const themes = {
    light: {
        name: "light",
        foreground: "#000000",
        background: "#eeeeee"
    },
    dark: {
        name: "dark",
        foreground: "#ffffff",
        background: "#222222"
    }
};
export const Context = React.createContext(null);

function MainApp(props) {
    const [signedIn, setSignedIn] = React.useState(false);
    const [spreadsheetReady, setSpreadsheetReady] = React.useState(false);
    const spreadsheetId = props.match.params.spreadsheetId;

    const [headers, setHeaders] = useState(null);
    const [theme, setTheme] = useState(themes.light);

    function toggleTheme() {
        setTheme(theme => (theme.name === "light" ? theme.dark : theme.light));
    }

    const load = () => setSignedIn(true)

    // const handleLoggedSuccess = (response) => console.log(response)
    // const handleLoggedError = (response) => console.log(response)

    React.useEffect(() => {
        Spreadsheets.Initialize(spreadsheetId).then(response => {
            setHeaders(response.headers)
            setSpreadsheetReady(true);
        })
    }, [])

    return (
        <Context.Provider value={{ headers, theme, toggleTheme }}>
            {
                signedIn && spreadsheetReady
                    ? <KeysTable
                        spreadsheetId={spreadsheetId}
                        key={spreadsheetId}
                    />
                    : <GoogleAuthentication callbackOnSignIn={load} />
                // <GoogleLoginComponent
                //     onLogin={() => { setSignedIn(true) }}
                //     onLogout={() => { setSignedIn(false) }}
                // />
            }
        </Context.Provider>
    )
}

export default MainApp;

// {/* <button id="authorize_button" style="display: none;">Authorize</button>
//             <button id="signout_button" style="display: none;">Sign Out</button> */}
//             {/* <form action="https://steamcommunity.com/openid/login" method="post">
//                 <input type="hidden" name="openid.identity"
//                     value="http://specs.openid.net/auth/2.0/identifier_select" />
//                 <input type="hidden" name="openid.claimed_id"
//                     value="http://specs.openid.net/auth/2.0/identifier_select" />
//                 <input type="hidden" name="openid.ns" value="http://specs.openid.net/auth/2.0" />
//                 <input type="hidden" name="openid.mode" value="checkid_setup" />
//                 <input type="hidden" name="openid.realm" value="http://localhost:3000" />
//                 <input type="hidden" name="openid.return_to" value="http://localhost:3000" />
//                 <Button type="submit">Log in through Steam</Button>
//             </form> */}
//             {/* {<Login></Login>} */}