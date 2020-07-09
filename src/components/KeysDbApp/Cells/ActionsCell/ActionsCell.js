import React, { useState } from "react";
import { Table, Dropdown, Confirm, } from "semantic-ui-react";
import NewModal from "../../Modals/NewModal/NewModal";
import { useSelector, useDispatch } from "react-redux";
import { parseSpreadsheetDate, getValueByLabel } from "../../../../utils";
import { reloadTable } from "../../../../actions";
import Spreadsheets from "../../../../google/Spreadsheets";
import GameInfoModal from "../../Modals/GameInfoModal/GameInfoModal";

function ActionsCell({ index }) {
    const headers = useSelector((state) => state.table.headers)
    const gameData = useSelector((state) => state.table.rows[index])
    const dispatch = useDispatch()

    const [prompt, setPrompt] = useState(false)

    function handleDelete(e, data) {
        setPrompt(false)
        Spreadsheets.Delete(getValueByLabel("ID", headers, gameData))
            .then(response => {
                if (response.replies && response.replies.length > 0) {
                    dispatch(reloadTable(true))
                }
            })
            .catch(reason => console.error(reason))
    }

    return (
        <Table.Cell singleLine>
            <Dropdown
                icon='ellipsis vertical'
                compact
            >
                <Dropdown.Menu>
                    <GameInfoModal appId={getValueByLabel("AppId", headers, gameData)}>
                        <Dropdown.Item text="Info" />
                    </GameInfoModal>

                    <NewModal
                        onComplete={() => dispatch(reloadTable(true))}
                        isEdit={true}
                        initialValue={Object.keys(headers).reduce((acc, header) => ({
                            ...acc,
                            [header]: headers[header].type === "date"
                                ? parseSpreadsheetDate(getValueByLabel(header, headers, gameData))
                                : getValueByLabel(header, headers, gameData)
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

                </Dropdown.Menu>
            </Dropdown>
        </Table.Cell>
    )
}

export default ActionsCell;
