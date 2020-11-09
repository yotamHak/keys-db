import React from "react";
import { Table, Icon } from "semantic-ui-react";
import { useSelector } from "react-redux";

import { getLabelByType, getValueById } from "../../../../utils"

function SteamAchievementsCell({ value, rowIndex }) {
    const headers = useSelector((state) => state.table.headers)
    const gameData = useSelector((state) => state.table.rows[rowIndex])

    const steamAppIdLabel = getLabelByType(headers, "steam_appid")

    return (
        <Table.Cell verticalAlign='middle' textAlign='center'>
            {
                value === 'Have'
                    ? <a target='_blank' rel='noopener noreferrer' href={`https://steamcommunity.com/stats/${getValueById(gameData, headers[steamAppIdLabel].id)}/achievements`}><Icon name='check' color='green' link={true} /></a>
                    : <Icon name='x' color='red' />
            }
        </Table.Cell>
    );
}

export default SteamAchievementsCell;


