import React, { useEffect } from "react";
import KeysTable from "./KeysTable/KeysTable";
import GoogleAuthentication from "../../google/GoogleAuthentication";
import { GoogleLogin, GoogleLogout, useGoogleLogin } from 'react-google-login';
import googleConfig from "../../google/config";
import { gapi } from "gapi-script";
import Spreadsheets from "../../../google/Spreadsheets";
import steamApi from "../../../steam/steam";

function Initialization() {
    useEffect(() => {
        steamApi.ownedGames

        Spreadsheets.Initialize(localStorage.getItem('spreadsheetId'))
            .then(response => {
                console.log('Finished initializing table')
            }, response => {
                console.error('Error initializing table', response)
                localStorage.removeItem('spreadsheetId')
            })

    }, [])
}

export default Initialization;