import React, { useState, useEffect } from "react";
import { useDispatch, useSelector, } from "react-redux";
import { useHistory, Redirect } from "react-router-dom";
import { Dimmer, Loader } from "semantic-ui-react";
import dateFns from 'date-fns'

import KeysTable from "../../components/KeysDbApp/KeysTable/KeysTable";
import Spreadsheets from "../../google/Spreadsheets";
import { addHeaders, spreadsheetSetPermission, setCurrentSpreadsheetId, steamSetOwnedGames, setCurrentSheetId, itadSetMap, } from "../../actions";
import { usePrevious } from "../../utils";
import { GetOwnedGames } from "../../steam/steamApi";
import { GetMap } from "../../itad/itad";

function KeysDBPage(props) {
    const spreadsheetId = props.match.params.spreadsheetId || useSelector((state) => state.authentication.spreadsheetId)
    const google = useSelector((state) => state.authentication.google)
    const steam = useSelector((state) => state.authentication.steam)
    const itad = useSelector((state) => state.authentication.itad)

    const [initSpreadsheet, setInitSpreadsheet] = useState(true)
    const [spreadsheetReady, setSpreadsheetReady] = useState(false)
    const [error, setError] = useState({ hasError: false })
    const prevSpreadsheetId = usePrevious(spreadsheetId)

    const [loadingOwnedGames, setLoadingOwnedGames] = useState(false)
    const [loadingItadMap, setLoadingItadMap] = useState(false)

    const dispatch = useDispatch()
    const history = useHistory()

    useEffect(() => {
        if (google.googleClientReady && (google.loggedIn === null || google.loggedIn === false)) {
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
                    if (!response.success) {
                        console.error(response.data)
                    }

                    dispatch(steamSetOwnedGames(response.data.games))
                    setLoadingOwnedGames(false)
                })
        }

        if (!loadingItadMap && itad.map === null) {
            const itadJson = JSON.parse(localStorage.getItem('itad'))

            if (itadJson && itadJson.map && dateFns.differenceInWeeks(new Date(), itadJson.map.timestamp) === 0) {
                dispatch(itadSetMap(itadJson.map))
            } else {
                setLoadingItadMap(true)

                GetMap()
                    .then(response => {
                        if (!response.success) {
                            console.error(response.data)
                            return
                        }

                        dispatch(itadSetMap(response.data.itadMap))
                        setLoadingItadMap(false)
                    })
            }
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

export default KeysDBPage;