import React, { useState, useEffect, } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, Dropdown, Confirm, Icon, } from "semantic-ui-react";

import { parseSpreadsheetDate, hasWritePermission, getValueByType, getValueById, getLabelByType, fillValueIfFieldExist, } from "../../../../utils";
import { reloadTable } from "../../../../actions";
import GameInfoModal from "../../Modals/GameInfoModal";
import NewModal from "../../Modals/NewModal";

import Spreadsheets from "../../../../lib/google/Spreadsheets";
import ItadApi from "../../../../lib/itad/ItadApi";
import SteamApi from "../../../../lib/steam/SteamApi";
import CreateSteamgiftsGiveawayModal from "../../Modals/CreateSteamgiftsGiveawayModal";

function ActionsCell({ index, changesCallback }) {
    const [prompt, setPrompt] = useState(false)
    const [steamAppId, setSteamAppId] = useState(null)
    const [steamTitle, setSteamTitle] = useState(null)
    const [refreshingItadData, setRefreshingItadData] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    const spreadsheetId = useSelector((state) => state.authentication.currentSpreadsheetId)
    const sheetId = useSelector((state) => state.authentication.currentSheetId)
    const permission = useSelector((state) => state.authentication.permission)
    const headers = useSelector((state) => state.table.headers)
    const gameData = useSelector((state) => state.table.rows[index])
    const steam = useSelector((state) => state.authentication.steam)
    const itadMap = useSelector((state) => state.authentication.itad.map)

    const dispatch = useDispatch()

    const initialValues = Object.keys(headers).reduce((acc, header) => ({
        ...acc,
        [header]: headers[header].type === "date"
            ? parseSpreadsheetDate(getValueById(gameData, headers[header].id))
            : getValueById(gameData, headers[header].id)
    }), {})

    useEffect(() => {
        setSteamAppId(getValueByType(gameData, headers, "steam_appid"))
        setSteamTitle(getValueByType(gameData, headers, "steam_title"))

        if (refreshingItadData) {
            handleRefreshItadData()
        }

        if (hasChanges) {
            changesCallback(hasChanges)
            setHasChanges(false)
        }
    }, [headers, refreshingItadData,])

    function handleDelete(e, data) {
        setPrompt(false)
        Spreadsheets.Delete(spreadsheetId, sheetId, getValueById(gameData, headers["ID"].id))
            .then(response => {
                if (response.success) {
                    dispatch(reloadTable(true))
                }
            })
            .catch(reason => console.error(reason))
    }

    async function handleRefreshItadData() {
        const itadPlain = ItadApi.GetPlainName(itadMap, steamAppId)

        if (itadPlain === undefined) {
            console.error("Can't find data, please check your app id or update Itad data")
            setRefreshingItadData(false)
            return
        }

        const steamUrlLabel = getLabelByType(headers, "steam_url")
        const steamCardsLabel = getLabelByType(headers, "steam_cards")
        const steamBundledLabel = getLabelByType(headers, "steam_bundled")
        const steamOwnershipLabel = getLabelByType(headers, "steam_ownership")
        const steamAchievementsLabel = getLabelByType(headers, "steam_achievements")

        const values = initialValues

        let newRowValues = Object.keys(headers).reduce((result, header) => ({
            ...result,
            [header]: {
                id: headers[header].id,
                header: header,
                value: values[header]
            }
        }), [])

        if (steam.loggedIn === true) {
            newRowValues = fillValueIfFieldExist(steamOwnershipLabel, newRowValues, () => SteamApi.DoesUserOwnGame(steam.ownedGames.games, steamAppId) ? 'Own' : 'Missing')
        }

        await ItadApi.GetOverview(itadPlain[0])
            .then(response => {
                // console.log("ITAD data:", response.data)

                if (!response.success) {
                    console.error("Error getting overview from ITAD", response)
                    return
                }

                newRowValues = fillValueIfFieldExist(steamUrlLabel, newRowValues, () => response.data.price.url)
                newRowValues = fillValueIfFieldExist('isthereanydeal URL', newRowValues, () => response.data.urls.info)
                newRowValues = fillValueIfFieldExist(steamBundledLabel, newRowValues, () => response.data.bundles && response.data.bundles.count ? response.data.bundles.count : 0)
            })

        await ItadApi.GetInfoAboutGame(itadPlain[0])
            .then(response => {
                // console.log("More Info from ITAD:", response)

                if (!response.success) {
                    console.error("Error getting info about game from ITAD", response)
                    return
                }

                newRowValues = fillValueIfFieldExist(steamCardsLabel, newRowValues, () => response.data.trading_cards ? 'Have' : 'Missing')
                newRowValues = fillValueIfFieldExist(steamAchievementsLabel, newRowValues, () => response.data.achievements ? 'Have' : 'Missing')
            })

        if (Object.keys(newRowValues).reduce((result, key) => `${newRowValues[key].value}` !== `${values[key]}` ? [...result, key] : result, []).length > 0) {
            setHasChanges(newRowValues)
        }

        setRefreshingItadData(false)
    }

    return (
        <Table.Cell singleLine textAlign='center' verticalAlign='middle'>
            {
                !refreshingItadData
                    ? (
                        <Dropdown icon='ellipsis vertical' compact simple>
                            <Dropdown.Menu className={hasWritePermission(permission) ? "actions-menu" : ""}>
                                {
                                    steamAppId && steamTitle && (
                                        <>
                                            <GameInfoModal
                                                appId={steamAppId}
                                                title={steamTitle}
                                            />
                                            <CreateSteamgiftsGiveawayModal
                                                rowIndex={index}
                                            />
                                        </>

                                    )
                                }
                                {
                                    hasWritePermission(permission) && (
                                        <React.Fragment>
                                            <NewModal
                                                onComplete={() => dispatch(reloadTable(true))}
                                                isEdit={true}
                                                initialValue={initialValues}
                                            >
                                                <Dropdown.Item text="Edit" />
                                            </NewModal>

                                            <Confirm
                                                open={prompt}
                                                header={"Delete Key"}
                                                content={"Are you sure you want to delete this key?"}
                                                onCancel={() => { setPrompt(false) }}
                                                onConfirm={handleDelete}
                                                confirmButton="Delete"
                                                trigger={<Dropdown.Item onClick={() => { setPrompt(true) }}>Delete</Dropdown.Item>}
                                            />

                                            {
                                                steamAppId && itadMap && (
                                                    <Dropdown.Item onClick={() => setRefreshingItadData(true)}>Refresh ITAD data</Dropdown.Item>
                                                )
                                            }
                                        </React.Fragment>
                                    )
                                }
                            </Dropdown.Menu>
                        </Dropdown>

                    )
                    : <Icon loading={refreshingItadData} name='spinner' />
            }
        </Table.Cell>
    )
}

export default ActionsCell;