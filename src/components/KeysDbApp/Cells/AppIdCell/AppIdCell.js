import React from "react";
import { Table } from "semantic-ui-react";

function AppIdCell({ appId }) {
    return (
        <Table.Cell>{appId}</Table.Cell>
    );
}

export default AppIdCell;
