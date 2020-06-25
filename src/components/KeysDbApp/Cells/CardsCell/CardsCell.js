import React from "react";
import { Table, Icon } from "semantic-ui-react";

function CardsCell({ cards }) {
    return (
        <Table.Cell verticalAlign='middle' textAlign='center'>
            {
                cards === 'Have'
                    ? <Icon name='check' color='green'></Icon>
                    : <Icon name='x' color='red'></Icon>
            }
        </Table.Cell>
    );
}

export default CardsCell;
