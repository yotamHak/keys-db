import React from "react";
import { useSelector } from "react-redux";
import { Table, } from 'semantic-ui-react';
import _ from 'lodash';

import HeaderCell from "../Cells/HeaderCell";

import { isUrlType, shouldAddField, } from "../../../utils";

function HeaderRow() {
    const headers = useSelector((state) => state.table.headers)

    const headersToDisplay = Object.keys(headers).reduce((result, headerKey, index) => {
        if (shouldAddField(headers, null, headers[headerKey].id)) {
            return _.concat(result, [isUrlType(headers[headerKey].type) ? "URLs" : headerKey])
        } else {
            return result
        }
    }, [])

    return (
        <Table.Row>
            <Table.HeaderCell style={{ width: '40px', minWidth: '40px', maxWidth: '40px' }} />
            {
                headersToDisplay.map((headerKey, index) => {
                    return <HeaderCell
                        title={headerKey}
                        key={index}
                    />
                })
            }
        </Table.Row>
    );
}

export default HeaderRow;
