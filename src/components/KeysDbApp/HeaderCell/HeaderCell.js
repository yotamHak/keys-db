import React from "react";
import { Table, } from "semantic-ui-react";

function HeaderCell({ filters, header, values }) {
    function filter() {
        console.log('filtering')
        filters = [...filters, { key: 'Status', values: ['Unused'] }]
    }
    
    return (
        <Table.HeaderCell onClick={filter} filterd={filters}>{header}</Table.HeaderCell>
    );
}

export default HeaderCell;
