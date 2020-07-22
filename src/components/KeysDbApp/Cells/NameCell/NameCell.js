import React from "react";
import { Table } from "semantic-ui-react";
import { useSelector, } from "react-redux";
import { getValueByLabel } from "../../../../utils";
import GameInfoModal from "../../Modals/GameInfoModal/GameInfoModal";

function NameCell({ name, rowIndex }) {
    const headers = useSelector((state) => state.table.headers)
    const gameData = useSelector((state) => state.table.rows[rowIndex])

    return (
        <React.Fragment>
            {
                getValueByLabel("AppId", headers, gameData)
                    ? (
                        <GameInfoModal
                            appId={getValueByLabel("AppId", headers, gameData)}
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
