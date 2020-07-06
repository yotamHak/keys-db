import React, { useState, useEffect } from "react";
import KeysTable from "./KeysTable/KeysTable";
import GoogleAuthentication from "../../google/GoogleAuthentication";
// import { GoogleLogin, GoogleLogout, useGoogleLogin } from 'react-google-login';
// import googleConfig from "../../google/config";
// import { gapi } from "gapi-script";
// import { GoogleLoginComponent } from "../auth/GoogleLoginComponent/GoogleLoginComponent";
import Spreadsheets from "../../google/Spreadsheets";
import { useDispatch } from "react-redux";
import { addHeaders } from "../../actions";
// import Login from "./auth/Login";

function MainApp(props) {
    const [signedIn, setSignedIn] = useState(false);
    const [spreadsheetReady, setSpreadsheetReady] = useState(false);
    const spreadsheetId = props.match.params.spreadsheetId;

    const dispatch = useDispatch()
    const load = () => setSignedIn(true)

    // const handleLoggedSuccess = (response) => console.log(response)
    // const handleLoggedError = (response) => console.log(response)

    useEffect(() => {
        Spreadsheets.Initialize(spreadsheetId).then(response => {
            dispatch(addHeaders(response.headers));
            setSpreadsheetReady(true);
        })
    }, [])

    return signedIn && spreadsheetReady
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