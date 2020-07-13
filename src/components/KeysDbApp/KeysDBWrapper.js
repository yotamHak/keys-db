import React, { useState, useEffect } from "react";
import KeysTable from "./KeysTable/KeysTable";
import Spreadsheets from "../../google/Spreadsheets";
import { useDispatch, useSelector, } from "react-redux";
import { addHeaders, setCurrentRows, } from "../../actions";
import { useHistory } from "react-router-dom";
import { Dimmer, Loader } from "semantic-ui-react";
import { usePrevious } from "../../utils";

import _ from 'lodash'

function KeysDBWrapper(props) {
    const spreadsheetId = props.match.params.spreadsheetId || useSelector((state) => state.authentication.spreadsheetId)
    const google = useSelector((state) => state.authentication.google)
    const steam = useSelector((state) => state.authentication.steam)
    const headers = useSelector((state) => state.table.headers)

    const [initSpreadsheet, setInitSpreadsheet] = useState(true)
    const [spreadsheetReady, setSpreadsheetReady] = useState(false)
    const prevSpreadsheetId = usePrevious(spreadsheetId)

    const dispatch = useDispatch()
    const history = useHistory()

    useEffect(() => {
        if (google.googleClientReady && (!google.loggedIn || !steam.loggedIn)) {
            history.push(`/`)
            return
        }

        if (prevSpreadsheetId && spreadsheetId) {
            if (prevSpreadsheetId !== spreadsheetId) {
                setSpreadsheetReady(false)
                setInitSpreadsheet(true)
            }
        }

        if (google.googleClientReady && initSpreadsheet) {
            Spreadsheets.Initialize(spreadsheetId)
                .then(response => {
                    dispatch(addHeaders(response.headers))
                    setSpreadsheetReady(true)
                    setInitSpreadsheet(false)
                })
                .catch(reason => {
                    console.error(reason)
                    history.push(`/`)
                })
        }
    }, [google, steam, spreadsheetId, initSpreadsheet])

    return (
        !google.googleClientReady || !spreadsheetId || !spreadsheetReady
            ? (
                <Dimmer inverted active>
                    <Loader indeterminate />
                </Dimmer>
            )
            : (
                <KeysTable
                    spreadsheetId={spreadsheetId}
                />
            )
    )
}

export default KeysDBWrapper;

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