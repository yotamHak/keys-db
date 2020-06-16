import React from "react";
import { Table } from "semantic-ui-react";

function CardsCell({ cards }) {
    return (
        <Table.Cell>{cards}</Table.Cell>
    );
}

export default CardsCell;
