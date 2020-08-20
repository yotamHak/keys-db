import React, { useEffect, useState } from "react";
import { Table, } from "semantic-ui-react";
import { useSelector } from "react-redux";
import _ from 'lodash';

import itadApi from "../../../../itad";
import { getValueByType } from "../../../../utils";

function SteamBundledCell({ value, rowIndex, }) {
    const headers = useSelector((state) => state.table.headers)
    const gameData = useSelector((state) => state.table.rows[rowIndex])

    const [steamTitle, setSteamTitle] = useState(null)
    const [itadPlainTitle, setItadPlainTitle] = useState(null)

    useEffect(() => {
        setSteamTitle(getValueByType(gameData, headers, "steam_title"))
        steamTitle && setItadPlainTitle(itadApi.GetEncodedName(steamTitle))
    }, [headers, steamTitle])

    return (
        <Table.Cell verticalAlign='middle' textAlign='center'>
            {
                value && _.parseInt(value) > 0
                    ? itadPlainTitle
                        ? (
                            <a target='_blank' rel='noopener noreferrer' href={`https://isthereanydeal.com/specials/#/filter:search/${itadPlainTitle},&bundle`}>
                                {value}
                            </a>
                        )
                        : value
                    : 0
            }
        </Table.Cell>
    );
}

export default SteamBundledCell;
