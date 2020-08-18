import React, { useState } from "react";
import { Table, Dropdown, Confirm, } from "semantic-ui-react";
import NewModal from "../../Modals/NewModal/NewModal";
import { useSelector, useDispatch } from "react-redux";
import { parseSpreadsheetDate, hasWritePermission, getValueByType, getValueById } from "../../../../utils";
import { reloadTable } from "../../../../actions";
import Spreadsheets from "../../../../google/Spreadsheets";
import GameInfoModal from "../../Modals/GameInfoModal/GameInfoModal";
import { useEffect } from "react";

function ActionsCell({ index }) {
    const [prompt, setPrompt] = useState(false)
    const [steamAppId, setSteamAppId] = useState(null)
    const [steamTitle, setSteamTitle] = useState(null)

    const spreadsheetId = useSelector((state) => state.authentication.currentSpreadsheetId)
    const sheetId = useSelector((state) => state.authentication.currentSheetId)
    const permission = useSelector((state) => state.authentication.permission)
    const headers = useSelector((state) => state.table.headers)
    const gameData = useSelector((state) => state.table.rows[index])

    const dispatch = useDispatch()

    useEffect(() => {
        setSteamAppId(getValueByType(gameData, headers, "steam_appid"))
        setSteamTitle(getValueByType(gameData, headers, "steam_title"))
    }, [headers])

    function handleDelete(e, data) {
        setPrompt(false)
        Spreadsheets.Delete(spreadsheetId, sheetId, getValueById(gameData, headers["ID"].id))
            .then(response => {
                if (response.success) {
                    dispatch(reloadTable(true))
                }
            })
            .catch(reason => console.error(reason))
    }

    return (
        <Table.Cell singleLine textAlign='center' verticalAlign='middle'>
            <Dropdown
                icon='ellipsis vertical'
                compact
                simple
            >
                <Dropdown.Menu className={hasWritePermission(permission) ? "actions-menu" : ""}>
                    {
                        steamAppId && steamTitle && (
                            <GameInfoModal
                                appId={steamAppId}
                                title={steamTitle}
                            />
                        )
                    }
                    {
                        hasWritePermission(permission) && (
                            <React.Fragment>
                                <NewModal
                                    onComplete={() => dispatch(reloadTable(true))}
                                    isEdit={true}
                                    initialValue={Object.keys(headers).reduce((acc, header) => ({
                                        ...acc,
                                        [header]: headers[header].type === "date"
                                            ? parseSpreadsheetDate(getValueById(gameData, headers[header].id))
                                            : getValueById(gameData, headers[header].id)
                                    }), {})}
                                >
                                    <Dropdown.Item text="Edit" />
                                </NewModal>

                                <Confirm
                                    open={prompt}
                                    header={"Delete Key"}
                                    content={"Are you sure you want to delete this key?"}
                                    onCancel={() => { setPrompt(false) }}
                                    onConfirm={handleDelete}
                                    confirmButton="Delete"
                                    trigger={<Dropdown.Item onClick={() => { setPrompt(true) }}>Delete</Dropdown.Item>}
                                />
                            </React.Fragment>
                        )
                    }
                </Dropdown.Menu>
            </Dropdown>
        </Table.Cell>
    )
}

export default ActionsCell;
