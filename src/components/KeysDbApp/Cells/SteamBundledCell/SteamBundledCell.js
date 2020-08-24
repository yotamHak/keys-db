import React, { useEffect, useState } from "react";
import { Table, Statistic, } from "semantic-ui-react";
import { useSelector } from "react-redux";
import _ from 'lodash';

import { getValueByType } from "../../../../utils";

import ItadApi from "../../../../lib/itad/ItadApi";

function SteamBundledCell({ value, rowIndex, }) {
    const headers = useSelector((state) => state.table.headers)
    const gameData = useSelector((state) => state.table.rows[rowIndex])
    const itadMap = useSelector((state) => state.authentication.itad.map)

    const [steamTitle, setSteamTitle] = useState(null)
    const [steamAppId, setSteamAppId] = useState(null)

    const [itadPlainTitle, setItadPlainTitle] = useState(null)

    useEffect(() => {
        setSteamAppId(getValueByType(gameData, headers, "steam_appid"))
        setSteamTitle(getValueByType(gameData, headers, "steam_title"))

        steamTitle && steamAppId && itadMap && setItadPlainTitle(ItadApi.GetPlainName(itadMap, steamAppId))
    }, [headers, steamTitle,])

    return (
        <Table.Cell verticalAlign='middle' textAlign='center'>
            {
                value !== null && _.parseInt(value) >= 0
                    ? itadPlainTitle
                        ? (
                            <a target='_blank' rel='noopener noreferrer' href={`https://isthereanydeal.com/specials/#/filter:search/${itadPlainTitle},&bundle`}>
                                <Statistic
                                    size='mini'
                                    color={_.parseInt(value) === 0 ? 'green' : _.parseInt(value) <= 3 ? 'yellow' : 'red'}
                                    horizontal>
                                    <Statistic.Value>{value}</Statistic.Value>
                                    <Statistic.Label>Times</Statistic.Label>
                                </Statistic>
                            </a>
                        )
                        : <Statistic
                            size='mini'
                            color={_.parseInt(value) === 0 ? 'green' : _.parseInt(value) <= 3 ? 'yellow' : 'red'}
                            horizontal>
                            <Statistic.Value>{value}</Statistic.Value>
                            <Statistic.Label>Times</Statistic.Label>
                        </Statistic>
                    : <Statistic size='mini' horizontal>
                        <Statistic.Label>N\A</Statistic.Label>
                    </Statistic>
            }
        </Table.Cell>
    );
}

export default SteamBundledCell;
