import React from "react";
import { useSelector } from "react-redux";
import { Table, } from 'semantic-ui-react';
import _ from 'lodash';

import HeaderCell from "../Cells/HeaderCell";

import { getUrlsLocationAndValue, } from "../../../utils";

function HeaderRow() {
    const headers = useSelector((state) => state.table.headers)
    const urlsInGameData = getUrlsLocationAndValue(headers);

    const headersToDisplay = Object.keys(headers).reduce((result, headerKey, index) => {
        if (headerKey === "ID") {
            return result
        }

        if (headers[headerKey].type === 'key_platform') {
            return result
        }

        if (urlsInGameData.length > 0 && index === urlsInGameData[urlsInGameData.length - 1].index) {
            return _.concat(result, ["URLs"])
        }

        if (urlsInGameData.find(item => item.index === index)) {
            return result
        }

        return _.concat(result, [headerKey])
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
