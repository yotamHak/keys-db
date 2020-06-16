import React from "react";
import { Table } from "semantic-ui-react";

function AddedCell({ dateAdded }) {
    return (
        <Table.Cell>{dateAdded}</Table.Cell>
    );
}

export default AddedCell;
