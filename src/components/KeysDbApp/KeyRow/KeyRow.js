import React from "react";
import { Table, Button } from 'semantic-ui-react';
import StatusCell from "../StatusCell/StatusCell";
import OwnStatusCell from "../OwnStatusCell/OwnStatusCell";
import FromCell from "../FromCell/FromRow";
import KeyCell from "../KeyCell/KeyCell";
import AddedCell from "../AddedCell/AddedCell";
import NoteCell from "../NoteCell/NoteCell";
import UrlCell from "../UrlCell/UrlCell";
import CardsCell from "../CardsCell/CardsCell";
import AppIdCell from "../AppIdCell/AppIdCell";
import NameCell from "../NameCell/NameCell";
import itadApi from "../../../itad";

function KeyRow({ isFirst, headers, numberOfDuplicates, gameData }) {
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [originalGameData, setOriginalGameData] = React.useState(gameData);

    function selectCell(header) {
        const rKey = `${gameData.ssLocation.row}-${header}`;
        if (header === "Name") {
            return <NameCell name={gameData[header]} key={rKey}></NameCell>
            // return <Table.Cell key={header} rowSpan={numberOfDuplicates}>{gameData[header]}</Table.Cell>
        } else if (header === "Status") {
            return <StatusCell status={gameData[header]} key={rKey}></StatusCell>
        } else if (header === "Key") {
            return <KeyCell gameKey={gameData[header]} key={rKey}></KeyCell>
        } else if (header === "From") {
            return <FromCell from={gameData[header]} key={rKey}></FromCell>
        } else if (header === "Own Status") {
            return <OwnStatusCell ownStatus={gameData[header]} key={rKey}></OwnStatusCell>
        } else if (header === "Added") {
            return <AddedCell dateAdded={gameData[header]} key={rKey}></AddedCell>
        } else if (header === "Note") {
            return <NoteCell note={gameData[header]} key={rKey}></NoteCell>
        } else if (header === "isthereanydeal URL") {
            return <UrlCell website="itad" url={gameData[header]} key={rKey}></UrlCell>
        } else if (header === "Steam URL") {
            return <UrlCell website="steam" url={gameData[header]} key={rKey}></UrlCell>
        } else if (header === "Cards") {
            return <CardsCell cards={gameData[header]} key={rKey}></CardsCell>
        } else if (header === "AppId") {
            return <AppIdCell appId={gameData[header]} key={rKey}></AppIdCell>
        } else {
            return <Table.Cell key={header} key={rKey}>{gameData[header]}</Table.Cell>
        }
    }

    function refresh() {
        setIsRefreshing(true);

        itadApi.GetInfoAboutGame(gameData['Name']).then(response => {
            console.log(response);
            setIsRefreshing(false);
        })
    }

    function save() {
        if (isSaving) { return };

        setIsSaving(true);
        console.log("gameData", gameData);
        console.log("originalGameData", originalGameData)
    }

    return (
        <Table.Row>
            <Table.Cell singleLine>

                <Button.Group basic size="tiny"
                    buttons={[
                        { key: 'refresh', icon: 'refresh', onClick: refresh, loading: isRefreshing, size: 'tiny' },
                        { key: 'save', icon: 'save', onClick: save, loading: isSaving, size: 'tiny' },
                    ]}
                />

                {/* <Button onClick={refresh} circular basic icon='refresh' size="tiny" loading={isRefreshing} />
                <Button onClick={save} circular basic icon='save' size="tiny" loading={isSaving} /> */}
            </Table.Cell>

            {
                headers.map(header => {
                    return selectCell(header)
                })
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
