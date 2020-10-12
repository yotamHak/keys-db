import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Button, } from 'semantic-ui-react';
import _ from 'lodash';

import KeyCell from "../Cells/KeyCell";
import DateCell from "../Cells/DateCell";
import NoteCell from "../Cells/NoteCell";
import UrlCell from "../Cells/UrlCell";
import AppIdCell from "../Cells/AppIdCell";
import NameCell from "../Cells/NameCell";
import OptionsCell from "../Cells/OptionsCell";
import ActionsCell from "../Cells/ActionsCell";
import SteamCardsCell from "../Cells/SteamCardsCell";
import SteamAchievementsCell from "../Cells/SteamAchievementsCell";
import SteamBundledCell from "../Cells/SteamBundledCell";

import { getUrlsLocationAndValue, isDropdownType, getIndexById, isDateType, shouldAddField, isUrlType } from "../../../utils";
import Spreadsheets from "../../../lib/google/Spreadsheets";
import { removeNewRowChange } from "../../../actions/TableActions";

function KeyRow({ rowIndex }) {
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const spreadsheetId = useSelector((state) => state.authentication.currentSpreadsheetId)
    const sheetId = useSelector((state) => state.authentication.currentSheetId)
    const headers = useSelector((state) => state.table.headers)
    const gameData = useSelector((state) => state.table.rows[rowIndex])
    const rowChanges = useSelector((state) => state.table.changes[rowIndex])

    const urlsInGameData = getUrlsLocationAndValue(headers, gameData);
    const dispatch = useDispatch();

    useEffect(() => {
        rowChanges && setHasChanges(true)
    }, [rowChanges])

    function changeCallback(header, changedValue) {
        gameData[getIndexById(header.id, headers)] = changedValue;
        setHasChanges(true)
    }

    function selectCell(index, header, gameHeaderValue) {
        if (!shouldAddField(headers, gameData, header.id)) return

        const rKey = `${rowIndex}-${header.id}-${gameHeaderValue}`;

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
        } else if (header.type === 'text') {
            return <NoteCell
                rowIndex={rowIndex}
                onChange={changeCallback}
                header={header}
                note={gameHeaderValue}
                key={rKey}
            />
        } else if (isDropdownType(header.type)) {
            return <OptionsCell
                rowIndex={rowIndex}
                onChange={changeCallback}
                header={header}
                title={gameHeaderValue}
                key={rKey}
            />
        } else if (isDateType(header.type)) {
            return <DateCell
                rowIndex={rowIndex}
                onChange={changeCallback}
                header={header}
                dateAdded={gameHeaderValue}
                key={rKey}
            />
        } else if (isUrlType(header.type)) {
            return <UrlCell
                rowIndex={rowIndex}
                urls={urlsInGameData}
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

    function saveChanges(rowIndex, rowChanges) {
        setIsSaving(true)

        Spreadsheets.Update(spreadsheetId, sheetId, rowChanges, rowChanges[0])
            .then(response => {
                dispatch(removeNewRowChange(rowIndex))
                setHasChanges(false)
            })
            .finally(() => {
                setIsSaving(false)
            })
    }

    return (
        <Table.Row warning={hasChanges}>
            {
                hasChanges
                    ? <Table.Cell singleLine>
                        <Button icon='save' onClick={() => { saveChanges(rowIndex, _.toArray(rowChanges)) }} loading={isSaving} circular basic size='mini' />
                    </Table.Cell>
                    : <ActionsCell index={rowIndex} />
            }

            {
                gameData && Object.keys(headers).map((key, index) => { return selectCell(index, headers[key], (rowChanges && rowChanges[index]) || gameData[index]) })
            }
        </Table.Row>
    );
}

export default KeyRow;