import React from "react";
import { Table, } from 'semantic-ui-react';
import StatusCell from "../Cells/StatusCell/StatusCell";
import OwnStatusCell from "../Cells/OwnStatusCell/OwnStatusCell";
import KeyCell from "../Cells/KeyCell/KeyCell";
import DateCell from "../Cells/DateCell/DateCell";
import NoteCell from "../Cells/NoteCell/NoteCell";
import UrlCell from "../Cells/UrlCell/UrlCell";
import CardsCell from "../Cells/CardsCell/CardsCell";
import AppIdCell from "../Cells/AppIdCell/AppIdCell";
import NameCell from "../Cells/NameCell/NameCell";
import itadApi from "../../../itad";
import OptionsCell from "../Cells/OptionsCell/OptionsCell";
import ActionsCell from "../Cells/ActionsCell/ActionsCell";
import { useSelector } from "react-redux";

function KeyRow({ gameData }) {
    const headers = useSelector((state) => state.table.headers)

    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);

    const [game, setGame] = React.useState({ ...gameData });
    const [originalGameData, setOriginalGameData] = React.useState({ ...gameData });

    React.useEffect(() => { }, []);

    function changeCallback(header, changedValue) {
        console.log("Changed Value", `${header}: ${changedValue}`)
        gameData[header] = changedValue;
    }

    function selectCell(header, index) {
        if (header.label === "ID") { return }

        const gameHeaderValue = game[index];
        const rKey = `${index}-${header.id}-${gameHeaderValue}`;

        switch (header.label) {
            case "Name":
                return <NameCell
                    onChange={changeCallback}
                    header={header}
                    name={gameHeaderValue}
                    key={rKey}
                />
            case "Status":
                return <StatusCell
                    onChange={changeCallback}
                    header={header}
                    status={gameHeaderValue}
                    key={rKey}
                />
            case "Key":
                return <KeyCell
                    onChange={changeCallback}
                    header={header}
                    gameKey={gameHeaderValue}
                    key={rKey}
                />
            case "From":
                // return <FromCell
                //     onChange={changeCallback}
                //     header={header}
                //     from={gameHeaderValue}
                //     key={rKey}
                // />
                return <OptionsCell
                    onChange={changeCallback}
                    header={header}
                    title={gameHeaderValue}
                    key={rKey}
                />
            case "Own Status":
                return <OwnStatusCell
                    onChange={changeCallback}
                    header={header}
                    status={gameHeaderValue}
                    key={rKey}
                />
            case "Date Added":
                return <DateCell
                    onChange={changeCallback}
                    header={header}
                    dateAdded={gameHeaderValue}
                    key={rKey}
                />
            case "Note":
                return <NoteCell
                    onChange={changeCallback}
                    header={header}
                    note={gameHeaderValue}
                    key={rKey}
                />
            case "isthereanydeal URL":
            case "Steam URL":
                return <UrlCell
                    onChange={changeCallback}
                    header={header}
                    website={header === "Steam URL" ? "steam" : "itad"}
                    url={gameHeaderValue}
                    key={rKey}
                />
            case "Cards":
                return <CardsCell
                    onChange={changeCallback}
                    header={header}
                    cards={gameHeaderValue}
                    key={rKey} />
            case "AppId":
                return <AppIdCell
                    onChange={changeCallback}
                    header={header}
                    appId={gameHeaderValue}
                    key={rKey}
                />
            default:
                return <Table.Cell
                    onChange={changeCallback}
                    header={header}
                    key={rKey}>
                    {gameHeaderValue}
                </Table.Cell>
        }
    }

    function refresh() {
        setIsRefreshing(true);

        // itadApi.FindGame(game['Name']).then(response => {
        //     console.log(response)
        // })

        itadApi.GetInfoAboutGame(game['Name']).then(response => {
            console.log(`GetInfoAboutGame: ${game['Name']}...`, response);
            const gameData = response.data.data[itadApi.GetEncodedName(game['Name'])];

            if (gameData) {
                const gameAppId = gameData.image && gameData.image.split('/')[5]

                setGame({
                    ...game,
                    'Cards': gameData['trading_cards'] ? "https://steamcommunity.com/id/justLynx/gamecards/236850" : 'No',
                    'AppId': gameAppId,
                })
            }

            setIsRefreshing(false);
        })
    }

    function save() {
        if (isSaving) { return };

        setIsSaving(true);
        console.log("game", gameData);
        console.log("originalGameData", originalGameData)

        setGame(gameData)
    }

    function edit() { }

    return (
        <Table.Row>
            <ActionsCell gameData={game} />
            {
                game && Object.keys(headers).map((key, index) => { return selectCell(headers[key], index) })
            }
        </Table.Row>
    );
}

export default KeyRow;
