import React, { useState, useEffect } from "react";
import KeysTable from "./KeysTable/KeysTable";
import Spreadsheets from "../../google/Spreadsheets";
import { useDispatch, useSelector, } from "react-redux";
import { addHeaders, } from "../../actions";
import { useHistory } from "react-router-dom";
import { Dimmer, Loader } from "semantic-ui-react";
import { usePrevious } from "../../utils";

function KeysDBWrapper(props) {
    const spreadsheetId = props.match.params.spreadsheetId || useSelector((state) => state.authentication.spreadsheetId)
    const google = useSelector((state) => state.authentication.google)
    const steam = useSelector((state) => state.authentication.steam)

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