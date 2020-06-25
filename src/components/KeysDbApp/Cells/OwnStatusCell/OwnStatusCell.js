import React from "react";
import { Table } from "semantic-ui-react";

function OwnStatusCell({ status }) {
    return (
        <Table.Cell>{status}</Table.Cell>
    );
}

export default OwnStatusCell;
