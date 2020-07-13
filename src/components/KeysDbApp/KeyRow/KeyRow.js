import React, { useState } from "react";
import { Table, Button, } from 'semantic-ui-react';
import _ from 'lodash';

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
import { getUrlsLocationAndValue, getIndexByLabel } from "../../../utils";
import Spreadsheets from "../../../google/Spreadsheets";

function KeyRow({ rowIndex }) {
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const headers = useSelector((state) => state.table.headers)
    const gameData = useSelector((state) => state.table.rows[rowIndex])

    const urlsInGameData = getUrlsLocationAndValue(headers, gameData);

    function changeCallback(header, changedValue) {
        gameData[getIndexByLabel(header.label, headers)] = changedValue;
        setHasChanges(true)
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
            case "Own Status":
            case "From":
            case "Cards":
                return <OptionsCell
                    rowIndex={rowIndex}
                    onChange={changeCallback}
                    header={header}
                    title={gameHeaderValue}
                    key={rKey}
                />
            // return <StatusCell
            //     rowIndex={rowIndex}
            //     onChange={changeCallback}
            //     header={header}
            //     status={gameHeaderValue}
            //     key={rKey}
            // />
            // return <CardsCell
            //     rowIndex={rowIndex}
            //     onChange={changeCallback}
            //     header={header}
            //     cards={gameHeaderValue}
            //     key={rKey} />
            // return <OwnStatusCell
            //     rowIndex={rowIndex}
            //     onChange={changeCallback}
            //     header={header}
            //     status={gameHeaderValue}
            //     key={rKey}
            // />
            case "Key":
                return <KeyCell
                    rowIndex={rowIndex}
                    onChange={changeCallback}
                    header={header}
                    gameKey={gameHeaderValue}
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

    function saveChanges(gameData) {
        setIsSaving(true)

        Spreadsheets.Update(gameData, gameData[0])
            .then(response => {
                console.log(response)
                setHasChanges(false)
            })
            .catch(reason => {
                console.error(reason)
            })
            .finally(response => {
                setIsSaving(false)
            })
    }

    return (
        <Table.Row style={hasChanges ? { backgroundColor: '#B5B4D9' } : {}}>
            {
                hasChanges
                    ? <Table.Cell singleLine>
                        <Button icon='save' onClick={() => { saveChanges(gameData) }} loading={isSaving} circular basic size='mini' />
                    </Table.Cell>
                    : <ActionsCell index={rowIndex} />
            }

            {
                gameData && Object.keys(headers).map((key, index) => { return selectCell(index, headers[key], gameData[index]) })
            }
        </Table.Row>
    );
}

export default KeyRow;