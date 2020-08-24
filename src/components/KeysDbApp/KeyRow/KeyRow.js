import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Table, Button, } from 'semantic-ui-react';

import KeyCell from "../Cells/KeyCell/KeyCell";
import DateCell from "../Cells/DateCell/DateCell";
import NoteCell from "../Cells/NoteCell/NoteCell";
import UrlCell from "../Cells/UrlCell/UrlCell";
import AppIdCell from "../Cells/AppIdCell/AppIdCell";
import NameCell from "../Cells/NameCell/NameCell";
import OptionsCell from "../Cells/OptionsCell/OptionsCell";
import ActionsCell from "../Cells/ActionsCell/ActionsCell";
import { getUrlsLocationAndValue, isDropdownType, getIndexById, } from "../../../utils";
import SteamCardsCell from "../Cells/SteamCardsCell/SteamCardsCell";
import SteamAchievementsCell from "../Cells/SteamAchievementsCell/SteamAchievementsCell";
import SteamBundledCell from "../Cells/SteamBundledCell/SteamBundledCell";

import Spreadsheets from "../../../lib/google/Spreadsheets";

function KeyRow({ rowIndex }) {
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const spreadsheetId = useSelector((state) => state.authentication.currentSpreadsheetId)
    const sheetId = useSelector((state) => state.authentication.currentSheetId)
    const headers = useSelector((state) => state.table.headers)
    const gameData = useSelector((state) => state.table.rows[rowIndex])

    const urlsInGameData = getUrlsLocationAndValue(headers, gameData);

    function rowChangesCallback(changedRow) {
        Object.keys(changedRow).forEach(header => {
            changeCallback(changedRow[header], changedRow[header].value)
        })
    }

    function changeCallback(header, changedValue) {
        gameData[getIndexById(header.id, headers)] = changedValue;
        setHasChanges(true)
    }

    function selectCell(index, header, gameHeaderValue) {
        if (header.label === "ID") { return }

        const rKey = `${rowIndex}-${header.id}-${gameHeaderValue}`;

        if (urlsInGameData.length > 0 && index === urlsInGameData[urlsInGameData.length - 1].index) {
            return <UrlCell
                rowIndex={rowIndex}
                urls={urlsInGameData}
                key={rKey}
            />
        }

        if (urlsInGameData.find(item => item.index === index)) { return }

        if (header.type === 'steam_cards') {
            return <SteamCardsCell
                rowIndex={rowIndex}
                header={header}
                key={rKey}
                value={gameHeaderValue}
            />
        } else if (header.type === 'steam_achievements') {
            return <SteamAchievementsCell
                rowIndex={rowIndex}
                header={header}
                key={rKey}
                value={gameHeaderValue}
            />
        } else if (header.type === 'steam_bundled') {
            return <SteamBundledCell
                rowIndex={rowIndex}
                key={rKey}
                value={gameHeaderValue}
            />
        } else if (isDropdownType(header.type)) {
            return <OptionsCell
                rowIndex={rowIndex}
                onChange={changeCallback}
                header={header}
                title={gameHeaderValue}
                key={rKey}
            />
        } else if (header.type === 'steam_title') {
            return <NameCell
                rowIndex={rowIndex}
                onChange={changeCallback}
                header={header}
                name={gameHeaderValue}
                key={rKey}
            />
        } else if (header.type === 'steam_key') {
            return <KeyCell
                rowIndex={rowIndex}
                onChange={changeCallback}
                header={header}
                gameKey={gameHeaderValue}
                key={rKey}
            />
        } else if (header.type === 'steam_appid') {
            return <AppIdCell
                rowIndex={rowIndex}
                onChange={changeCallback}
                header={header}
                appId={gameHeaderValue}
                key={rKey}
            />
        } else if (header.type === 'key') {
            return <KeyCell
                rowIndex={rowIndex}
                onChange={changeCallback}
                header={header}
                gameKey={gameHeaderValue}
                key={rKey}
            />
        } else if (header.type === 'date') {
            return <DateCell
                rowIndex={rowIndex}
                onChange={changeCallback}
                header={header}
                dateAdded={gameHeaderValue}
                key={rKey}
            />
        } else if (header.type === 'text') {
            return <NoteCell
                rowIndex={rowIndex}
                onChange={changeCallback}
                header={header}
                note={gameHeaderValue}
                key={rKey}
            />
        } else {
            return <Table.Cell
                // rowIndex={rowIndex}
                // onChange={changeCallback}
                // header={header}
                key={rKey}>
                {gameHeaderValue}
            </Table.Cell>
        }
    }

    function saveChanges(gameData) {
        setIsSaving(true)

        Spreadsheets.Update(spreadsheetId, sheetId, gameData, gameData[0])
            .then(response => {
                console.log(response)
                setHasChanges(false)
            })
            .finally(response => {
                setIsSaving(false)
            })
    }

    return (
        <Table.Row warning={hasChanges}>
            {
                hasChanges
                    ? <Table.Cell singleLine>
                        <Button icon='save' onClick={() => { saveChanges(gameData) }} loading={isSaving} circular basic size='mini' />
                    </Table.Cell>
                    : <ActionsCell index={rowIndex} changesCallback={rowChangesCallback} />
            }

            {
                gameData && Object.keys(headers).map((key, index) => { return selectCell(index, headers[key], gameData[index]) })
            }
        </Table.Row>
    );
}

export default KeyRow;