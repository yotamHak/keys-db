import React from "react";
import { Table } from "semantic-ui-react";
import { useSelector, } from "react-redux";
import { getLabelByType, getIndexByLabel } from "../../../../utils";
import GameInfoModal from "../../Modals/GameInfoModal/GameInfoModal";

function NameCell({ name, rowIndex }) {
    const headers = useSelector((state) => state.table.headers)
    const gameData = useSelector((state) => state.table.rows[rowIndex])

    const steamAppId = gameData[getIndexByLabel(getLabelByType(headers, "steam_appid"), headers)]
    const steamTitle = gameData[getIndexByLabel(getLabelByType(headers, "steam_title"), headers)]

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
