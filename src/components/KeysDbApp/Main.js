import React from "react";
import { gapi } from 'gapi-script';
import KeysTable from "./KeysTable/KeysTable";
import GoogleAuthentication from "../../google/GoogleAuthentication";
import _ from "lodash";
import spreadsheets from "../../google/spreadsheet";
// import Login from "./auth/Login";

function MainApp(props) {
    const [games, setGames] = React.useState({});
    const [headers, setHeaders] = React.useState([]);
    const [options, setOptions] = React.useState({});
    const [inverted, setInverted] = React.useState(false);
    const [logged, setLogged] = React.useState(false);

    const spreadsheetId = props.match.params.spreadsheetId;

    const SHEET_ROWS = {
        NAME: 0,
        STATUS: 1,
        GAME_KEY: 2,
        FROM: 3,
        OWN_STATUS: 4,
        DATE_ADDED: 5,
        NOTE: 6,
        ISTHEREANYDEAL_URL: 7,
        STEAM_URL: 8,
        HAS_CARDS: 9,
        APP_ID: 10
    }

    function extractOptions(data, headersToExtract) {
        const filteredData = data.reduce((result, game) => {
            const newGame = headersToExtract.reduce((selectedHeaders, header) => {
                return {
                    ...selectedHeaders,
                    [header]: game[header]
                }
            }, {})

            return result.concat([newGame])
        }, [])

        const newOptionsDictionary = headersToExtract.reduce((headersOptionsArray, header) => { return { ...headersOptionsArray, ...{ [header]: {} } } }, {})

        filteredData.map(game => {
            headersToExtract.map(header => {
                newOptionsDictionary[header] = {
                    ...newOptionsDictionary[header],
                    ...{ [game[header]]: 0 }
                }
            })
        })

        const allOptions = Object.keys(newOptionsDictionary).reduce((result, header) => {
            return {
                ...result,
                [header]: Object.keys(newOptionsDictionary[header])
            }
        }, {})

        setOptions(allOptions)
    }

    function serializeGames(data) {
        setHeaders(data[0]);
        console.log("Headers", data[0]);
        const games = data.slice(1, data.length)
            .map((key, index) => ({
                [data[0][SHEET_ROWS.NAME]]: key[SHEET_ROWS.NAME],
                [data[0][SHEET_ROWS.STATUS]]: key[SHEET_ROWS.STATUS],
                [data[0][SHEET_ROWS.GAME_KEY]]: key[SHEET_ROWS.GAME_KEY],
                [data[0][SHEET_ROWS.FROM]]: key[SHEET_ROWS.FROM],
                [data[0][SHEET_ROWS.OWN_STATUS]]: key[SHEET_ROWS.OWN_STATUS],
                [data[0][SHEET_ROWS.DATE_ADDED]]: key[SHEET_ROWS.DATE_ADDED],
                [data[0][SHEET_ROWS.NOTE]]: key[SHEET_ROWS.NOTE],
                [data[0][SHEET_ROWS.ISTHEREANYDEAL_URL]]: key[SHEET_ROWS.ISTHEREANYDEAL_URL],
                [data[0][SHEET_ROWS.STEAM_URL]]: key[SHEET_ROWS.STEAM_URL],
                [data[0][SHEET_ROWS.HAS_CARDS]]: key[SHEET_ROWS.HAS_CARDS],
                [data[0][SHEET_ROWS.APP_ID]]: key[SHEET_ROWS.APP_ID],
                ssLocation: { row: index + 1 },
            })) || [];

        extractOptions(games, [data[0][SHEET_ROWS.STATUS], data[0][SHEET_ROWS.FROM], data[0][SHEET_ROWS.OWN_STATUS]]);
        setGames(games);
    }

    function load() {

        setLogged(true)

        return

        spreadsheets.GetInitialTable(spreadsheetId)
            .then(response => {
                console.log("Table recieved:", response)
            })

        gapi.client.load("sheets", "v4", () => {
            gapi.client.sheets.spreadsheets.values
                .get({
                    spreadsheetId: spreadsheetId,
                    range: "Keys",
                })
                .then(response => {
                    console.log("Got Spreadsheet from Google:", response);
                    serializeGames(response.result.values);
                }, response => {
                    console.error(response);
                    props.history.push(`/error/${response.result.error.code}`);
                })
        })
    }

    // old design
    function onLoad(games) {
        const mergedGames = games.reduce((newGames, game) => {
            return {
                ...newGames,
                ...newGames[game['Name']]
                    ? { [game['Name']]: newGames[game['Name']].concat(game) } && delete newGames[game['Name']]
                    : { [game['Name']]: new Array(game) },
            }
        }, {})

        console.log("Finshed parsing games:", mergedGames)
        setGames(mergedGames)
    }

    return (
        <div style={{ overflow: 'auto' }}>
            <GoogleAuthentication callbackOnSignIn={load} />
            {
                logged && <KeysTable spreadsheetId={spreadsheetId} inverted={inverted} headers={headers} games={games} allOptions={options} />
            }

            {/* {
                Object.keys(games).length > 0
                    ? <KeysTable spreadsheetId={spreadsheetId} inverted={inverted} headers={headers} games={games} allOptions={options} />
                    : (<Dimmer active>
                        <Loader />
                    </Dimmer>)
            } */}
        </div>
    );
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