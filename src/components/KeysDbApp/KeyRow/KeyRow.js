import React, {  } from "react";
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
import OptionsCell from "../Cells/OptionsCell/OptionsCell";
import ActionsCell from "../Cells/ActionsCell/ActionsCell";
import { useSelector } from "react-redux";
import { getUrlsLocationAndValue } from "../../../utils";

function KeyRow({ rowIndex }) {
    const headers = useSelector((state) => state.table.headers)
    const gameData = useSelector((state) => state.table.rows[rowIndex])

    const urlsInGameData = getUrlsLocationAndValue(headers, gameData);

    function changeCallback(header, changedValue) {
        console.log("Changed Value", `${header}: ${changedValue}`)
        gameData[header] = changedValue;
    }

    function selectCell(index, header, gameHeaderValue) {
        if (header.label === "ID") { return }

        const rKey = `${rowIndex}-${header.id}-${gameHeaderValue}`;

        if (index === urlsInGameData[urlsInGameData.length - 1].index) {
            return <UrlCell
                rowIndex={rowIndex}
                urls={urlsInGameData}
                key={rKey}
            />
        }
        if (urlsInGameData.find(item => item.index === index)) { return }

        switch (header.label) {
            case "Name":
                return <NameCell
                    rowIndex={rowIndex}
                    onChange={changeCallback}
                    header={header}
                    name={gameHeaderValue}
                    key={rKey}
                />
            case "Status":
                return <StatusCell
                    rowIndex={rowIndex}
                    onChange={changeCallback}
                    header={header}
                    status={gameHeaderValue}
                    key={rKey}
                />
            case "Key":
                return <KeyCell
                    rowIndex={rowIndex}
                    onChange={changeCallback}
                    header={header}
                    gameKey={gameHeaderValue}
                    key={rKey}
                />
            case "From":
                return <OptionsCell
                    rowIndex={rowIndex}
                    onChange={changeCallback}
                    header={header}
                    title={gameHeaderValue}
                    key={rKey}
                />
            case "Own Status":
                return <OwnStatusCell
                    rowIndex={rowIndex}
                    onChange={changeCallback}
                    header={header}
                    status={gameHeaderValue}
                    key={rKey}
                />
            case "Date Added":
                return <DateCell
                    rowIndex={rowIndex}
                    onChange={changeCallback}
                    header={header}
                    dateAdded={gameHeaderValue}
                    key={rKey}
                />
            case "Note":
                return <NoteCell
                    rowIndex={rowIndex}
                    onChange={changeCallback}
                    header={header}
                    note={gameHeaderValue}
                    key={rKey}
                />
            case "Cards":
                return <CardsCell
                    rowIndex={rowIndex}
                    onChange={changeCallback}
                    header={header}
                    cards={gameHeaderValue}
                    key={rKey} />
            case "AppId":
                return <AppIdCell
                    rowIndex={rowIndex}
                    onChange={changeCallback}
                    header={header}
                    appId={gameHeaderValue}
                    key={rKey}
                />
            default:
                return <Table.Cell
                    rowIndex={rowIndex}
                    onChange={changeCallback}
                    header={header}
                    key={rKey}>
                    {gameHeaderValue}
                </Table.Cell>
        }
    }

    return (
        <Table.Row>
            <ActionsCell index={rowIndex} />
            {
                gameData && Object.keys(headers).map((key, index) => { return selectCell(index, headers[key], gameData[index]) })
            }
        </Table.Row>
    );
}

export default KeyRow;