import React from "react";
import { Table, Icon } from "semantic-ui-react";
import { useSelector } from "react-redux";
import { getValueByLabel } from "../../../../utils"

function CardsCell({ cards, rowIndex }) {
    const headers = useSelector((state) => state.table.headers)
    const gameData = useSelector((state) => state.table.rows[rowIndex])

    return (
        <Table.Cell verticalAlign='middle' textAlign='center'>
            {
                cards === 'Have'
                    ? <a target='_blank' rel='noopener noreferrer' href={`https://steamcommunity.com/my/gamecards/${getValueByLabel('AppId', headers, gameData)}`}><Icon name='check' color='green' link={true} /></a>
                    : <Icon name='x' color='red' />
            }
        </Table.Cell>
    );
}

export default CardsCell;


