import React from "react";
import googleConfig from "../../google/config";
import { gapi } from 'gapi-script';
import KeysTable from "./KeysTable/KeysTable";
import { Loader, Dimmer } from "semantic-ui-react";
import GoogleAuthentication from "../../google/GoogleAuthentication";
import Login from "./auth/Login";

function MainApp() {
    const [games, setGames] = React.useState({});
    const [headers, setHeaders] = React.useState([]);
    const [inverted, setInverted] = React.useState(false);

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

    React.useEffect(() => { }, []);

    function load(callback) {
        gapi.client.load("sheets", "v4", () => {
            gapi.client.sheets.spreadsheets.values
                .get({
                    spreadsheetId: googleConfig.spreadsheetId,
                    range: "Keys"
                })
                .then(response => {
                    const data = response.result.values;
                    console.log("Got Spreadsheet from Google:", response)
                    setHeaders(data[0]);
                    console.log("Set Headers", data[0]);
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

                    setGames(games);
                    // callback(games);
                },
                    response => {
                        callback(false, response.result.error);
                    })
        })
    }

    function onLoad(games) {
        const mergedGames = games.reduce((newGames, game) => {
            const gameName = game['Name'];
            let object = {}

            if (newGames[gameName]) {
                object = {
                    [gameName]: newGames[gameName].concat(game)
                }

                delete newGames[gameName]
            } else {
                object = { [gameName]: new Array(game) }
            }

            return {
                ...newGames,
                ...object,
            }
        }, {})

        console.log("Finshed parsing games:", mergedGames)
        setGames(mergedGames)
    }

    function steam() { }

    return (
        <div style={{ overflow: 'auto' }}>
            <GoogleAuthentication callbackOnSignIn={() => { load(onLoad) }}></GoogleAuthentication>
            {/* <button id="authorize_button" style="display: none;">Authorize</button>
            <button id="signout_button" style="display: none;">Sign Out</button> */}
            {/* <form action="https://steamcommunity.com/openid/login" method="post">
                <input type="hidden" name="openid.identity"
                    value="http://specs.openid.net/auth/2.0/identifier_select" />
                <input type="hidden" name="openid.claimed_id"
                    value="http://specs.openid.net/auth/2.0/identifier_select" />
                <input type="hidden" name="openid.ns" value="http://specs.openid.net/auth/2.0" />
                <input type="hidden" name="openid.mode" value="checkid_setup" />
                <input type="hidden" name="openid.realm" value="http://localhost:3000" />
                <input type="hidden" name="openid.return_to" value="http://localhost:3000" />
                <Button type="submit">Log in through Steam</Button>
            </form> */}
            {/* {<Login></Login>} */}
            {
                Object.keys(games).length > 0
                    ? <KeysTable inverted={inverted} headers={headers} games={games}></KeysTable>
                    : (<Dimmer active>
                        <Loader />
                    </Dimmer>)
            }
        </div>
    );
}


export default MainApp;