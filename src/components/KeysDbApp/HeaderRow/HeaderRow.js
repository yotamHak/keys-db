import React from "react";
import _ from 'lodash'
import { Table, } from 'semantic-ui-react';
import { useSelector } from "react-redux";
import { getUrlsLocationAndValue, } from "../../../utils";
import HeaderCell from "../Cells/HeaderCell/HeaderCell";

function HeaderRow() {
    const headers = useSelector((state) => state.table.headers)
    const urlsInGameData = getUrlsLocationAndValue(headers);

    const headersToDisplay = Object.keys(headers).reduce((result, headerKey, index) => {
        if (headerKey === "ID") {
            return result
        }

        if (index === urlsInGameData[urlsInGameData.length - 1].index) {
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
