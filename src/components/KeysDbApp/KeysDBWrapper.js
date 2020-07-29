import React, { useState, useEffect } from "react";
import KeysTable from "./KeysTable/KeysTable";
import Spreadsheets from "../../google/Spreadsheets";
import { useDispatch, useSelector, } from "react-redux";
import { addHeaders, spreadsheetSetPermission, setCurrentSpreadsheetId, steamSetOwnedGames, setCurrentSheetId, } from "../../actions";
import { useHistory, Redirect } from "react-router-dom";
import { Dimmer, Loader } from "semantic-ui-react";
import dateFns from 'date-fns'
import { usePrevious } from "../../utils";
import { GetOwnedGames } from "../../steam/steamApi";

function KeysDBWrapper(props) {
    const spreadsheetId = props.match.params.spreadsheetId || useSelector((state) => state.authentication.spreadsheetId)
    const google = useSelector((state) => state.authentication.google)
    const steam = useSelector((state) => state.authentication.steam)

    const [initSpreadsheet, setInitSpreadsheet] = useState(true)
    const [spreadsheetReady, setSpreadsheetReady] = useState(false)
    const [error, setError] = useState({ hasError: false })
    const prevSpreadsheetId = usePrevious(spreadsheetId)
    const [loadingOwnedGames, setLoadingOwnedGames] = useState(false)

    const dispatch = useDispatch()
    const history = useHistory()

    useEffect(() => {
        if (google.googleClientReady && (!google.loggedIn)) {
            history.push(`/login`)
        }

        if (prevSpreadsheetId && spreadsheetId) {
            if (prevSpreadsheetId !== spreadsheetId) {
                setSpreadsheetReady(false)
                setInitSpreadsheet(true)
            }
        }

        if (error.hasError) {
            return
        }

        if (steam.loggedIn === true && !loadingOwnedGames && (steam.ownedGames === null || dateFns.differenceInMinutes(new Date(), steam.ownedGames.timestamp) > 10)) {
            setLoadingOwnedGames(true)

            GetOwnedGames(steam.id, steam.apiKey)
                .then(response => {
                    if (response.success) {
                        dispatch(steamSetOwnedGames(response.data.games))
                    }
                })
        }

        if (google.googleClientReady && initSpreadsheet) {
            Spreadsheets.Initialize(spreadsheetId)
                .then(response => {
                    if (response.success) {
                        dispatch(spreadsheetSetPermission(response.permissions))
                        dispatch(addHeaders(response.headers))
                        dispatch(setCurrentSheetId(response.sheetId))
                        dispatch(setCurrentSpreadsheetId(spreadsheetId))

                        setSpreadsheetReady(true)
                        setInitSpreadsheet(false)
                    } else {
                        if (response.error === "PERMISSION_DENIED") {
                            dispatch(spreadsheetSetPermission("unauthorized"))
                            setError({ hasError: true, code: "unauthorized" })
                        } else {
                            dispatch(spreadsheetSetPermission("RESOURCE_EXHAUSTED"))
                            setError({ hasError: true, code: "RESOURCE_EXHAUSTED" })
                        }
                    }
                })
        }
    }, [google, steam, spreadsheetId, initSpreadsheet, error])

    return (
        error.hasError
            ? (<Redirect to={`/error/${error.code}`} />)
            : !google.googleClientReady || !spreadsheetId || !spreadsheetReady
                ? (
                    <Dimmer inverted active>
                        <Loader indeterminate />
                    </Dimmer>
                )
                : (
                    <KeysTable />
                )
    )
}

export default KeysDBWrapper;