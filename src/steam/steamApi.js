import axios from 'axios'
import _ from 'lodash'
import { corsLink } from '../utils'

async function _get(url, params = {}) {
    return axios.get(url, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Origin': 'https://keys-db.web.app/',
        },
        ...params
    })
        .then(response => {
            if (response.status === 200) {
                return {
                    success: true,
                    data: response.data
                }
            } else {
                return {
                    success: false,
                    error: response
                }
            }
        })
        .catch(reason => ({
            success: false,
            error: reason
        }));
}

async function GetAppDetails(appid) {
    return _get(`${corsLink('http://store.steampowered.com/api/appdetails/')}`, {
        params: {
            appids: appid,
        }
    })
}

async function GetOwnedGames(steamId, steamApiKey) {
    return _get(corsLink(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/`), {
        params: {
            steamid: steamId,
            key: steamApiKey,
            format: 'json'
        }
    })
        .then(response => {
            if (response.success === true) {
                const data = {
                    count: response.data.response.game_count,
                    games: response.data.response.games.reduce((acc, game) => (_.concat(acc, [game.appid])), [])
                }

                return {
                    success: true,
                    data: {
                        games: {
                            ...data,
                            timestamp: new Date()
                        }
                    }
                }
            }
            else return response
        })
}

async function GetUserInfo(steamId, steamApiKey) {
    return _get(corsLink(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/`), {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        params: {
            steamids: steamId,
            key: steamApiKey,
            format: 'json'
        }
    })
        .then(response => {
            if (response.success === true) {
                return {
                    success: true,
                    data: {
                        user: response.data.response.players[0]
                    }
                }
            } else {
                return response
            }
        })
        .catch(reason => ({ success: false, error: reason }));
}

function DoesUserOwnGame(ownedGames, appid) {
    let result = false;

    try {
        result = ownedGames.find(app => app === parseInt(appid)) != null
    } catch (error) {

    }

    return result
}

export { GetAppDetails, GetOwnedGames, GetUserInfo, DoesUserOwnGame, }
