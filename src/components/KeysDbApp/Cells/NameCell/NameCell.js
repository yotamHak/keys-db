import React, { useEffect, useState } from "react";
import { Table } from "semantic-ui-react";
import { useSelector, } from "react-redux";

import { getValueByType, } from "../../../../utils";
import GameInfoModal from "../../Modals/GameInfoModal/GameInfoModal";

function NameCell({ name, rowIndex }) {
    const headers = useSelector((state) => state.table.headers)
    const gameData = useSelector((state) => state.table.rows[rowIndex])

    const [steamAppId, setSteamAppId] = useState(null)
    const [steamTitle, setSteamTitle] = useState(null)

    useEffect(() => {
        debugger
        console.log('steam_appid', getValueByType(gameData, headers, "steam_appid"))
        console.log('steam_title', getValueByType(gameData, headers, "steam_title"))
        setSteamAppId(getValueByType(gameData, headers, "steam_appid"))
        setSteamTitle(getValueByType(gameData, headers, "steam_title"))
    }, [headers])

    return (
        <React.Fragment>
            {
                steamAppId && steamTitle
                    ? (
                        <GameInfoModal
                            appId={steamAppId}
                            title={steamTitle}
                            trigger={<Table.Cell className={'pointer'}>{name}</Table.Cell>}
                        />
                    )
                    : (
                        <Table.Cell>{name}</Table.Cell>
                    )

            }
        </React.Fragment>
    );
}

export default NameCell;
