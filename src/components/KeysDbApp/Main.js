import React, { useState, useEffect } from "react";
import KeysTable from "./KeysTable/KeysTable";
import Spreadsheets from "../../google/Spreadsheets";
import { useDispatch, } from "react-redux";
import { addHeaders, } from "../../actions";
import { useHistory } from "react-router-dom";

function MainApp(props) {
    const [spreadsheetReady, setSpreadsheetReady] = useState(false);
    const spreadsheetId = localStorage.getItem('spreadsheetId') || props.match.params.spreadsheetId;

    const dispatch = useDispatch();
    const history = useHistory();

    useEffect(() => {
        spreadsheetId && Spreadsheets.Initialize(spreadsheetId)
            .then(response => {
                dispatch(addHeaders(response.headers));
                setSpreadsheetReady(true);
            })
            .catch(reason => {
                console.error(reason);
                history.push(`/`)
            })
    }, [])

    return (
        spreadsheetReady && (
            <KeysTable
                spreadsheetId={spreadsheetId}
                key={spreadsheetId}
            />
        )
    )
}

export default MainApp;

{/* <div>
    <button id="authorize_button" style="display: none;">Authorize</button>
    <button id="signout_button" style="display: none;">Sign Out</button>
    <form action="https://steamcommunity.com/openid/login" method="post">
        <input type="hidden" name="openid.identity"
            value="http://specs.openid.net/auth/2.0/identifier_select" />
        <input type="hidden" name="openid.claimed_id"
            value="http://specs.openid.net/auth/2.0/identifier_select" />
        <input type="hidden" name="openid.ns" value="http://specs.openid.net/auth/2.0" />
        <input type="hidden" name="openid.mode" value="checkid_setup" />
        <input type="hidden" name="openid.realm" value="http://localhost:3000" />
        <input type="hidden" name="openid.return_to" value="http://localhost:3000" />
        <Button type="submit">Log in through Steam</Button>
    </form>
</div>  */}