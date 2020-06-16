import React from "react";
import { Table } from "semantic-ui-react";

function NameCell({ name }) {
    return (
        <Table.Cell>{name}</Table.Cell>
    );
}

export default NameCell;
