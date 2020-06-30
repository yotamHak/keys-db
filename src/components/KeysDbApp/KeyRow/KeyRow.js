import React from "react";
import { Table, Button } from 'semantic-ui-react';
import StatusCell from "../Cells/StatusCell/StatusCell";
import OwnStatusCell from "../Cells/OwnStatusCell/OwnStatusCell";
import FromCell from "../Cells/FromCell/FromRow";
import KeyCell from "../Cells/KeyCell/KeyCell";
import DateCell from "../Cells/DateCell/DateCell";
import NoteCell from "../Cells/NoteCell/NoteCell";
import UrlCell from "../Cells/UrlCell/UrlCell";
import CardsCell from "../Cells/CardsCell/CardsCell";
import AppIdCell from "../Cells/AppIdCell/AppIdCell";
import NameCell from "../Cells/NameCell/NameCell";
import itadApi from "../../../itad";

function KeyRow({ headers, gameData }) {
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);

    const [game, setGame] = React.useState(null);
    const [originalGameData, setOriginalGameData] = React.useState(null);

    React.useEffect(() => {
        setOriginalGameData({ ...gameData });
        setGame({ ...gameData });
    }, []);

    function changeCallback(header, changedValue) {
        console.log("Changed Value", `${header}: ${changedValue}`)
        gameData[header] = changedValue;
    }

    function selectCell(header, index) {
        const rKey = `${game[0]}-${header}-${index}`;
        const gameHeaderValue = game[index];

        switch (header) {
            case "ID":
                return <React.Fragment key={rKey}></React.Fragment>
            // return <Table.Cell key={rKey}></Table.Cell>
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
                return <FromCell
                    onChange={changeCallback}
                    header={header}
                    from={gameHeaderValue}
                    key={rKey}
                />
            case "Own Status":
                return <OwnStatusCell
                    onChange={changeCallback}
                    header={header}
                    ownStatus={gameHeaderValue}
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
            <Table.Cell singleLine>

                <Button.Group basic size='mini'
                    buttons={[
                        { key: 'refresh', icon: 'refresh', onClick: refresh, loading: isRefreshing, size: 'tiny' },
                        { key: 'save', icon: 'save', onClick: save, loading: isSaving, size: 'tiny' },
                        { key: 'edit', icon: 'pencil', onClick: edit, size: 'tiny' },
                    ]}
                />

                {/* <Button onClick={refresh} circular basic icon='refresh' size="tiny" loading={isRefreshing} />
                <Button onClick={save} circular basic icon='save' size="tiny" loading={isSaving} /> */}
            </Table.Cell>
            {
                game && headers.map((header, index) => { return selectCell(header, index) })
            }
        </Table.Row>
    );

    // return (
    //     isFirst
    //         ? (
    //             <Table.Row>
    //                 {
    //                     headers.map(header => {
    //                         return selectCell(header)
    //                     })
    //                 }
    //             </Table.Row>
    //         )
    //         : (
    //             <Table.Row>
    //                 {
    //                     headers.map(header => {
    //                         if (header === "Name") {
    //                             return
    //                         } else {
    //                             return selectCell(header)
    //                         }
    //                     })
    //                 }
    //             </Table.Row>
    //         )
    // );
}

export default KeyRow;
