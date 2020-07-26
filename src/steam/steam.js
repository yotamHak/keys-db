import axios from 'axios';
import dateFns from 'date-fns';
import _ from 'lodash';
import { corsLink } from '../utils';

// https://developer.valvesoftware.com/wiki/Steam_Web_API

// const urlVanityNameSearch = 'https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/'
// const urlSearchUserGameList = 'https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/'
// const urlGameAchivements = 'http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/'
// const urlUserInfo = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/'
// const urlGetGameInfo = 'https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/'
// const urlGetFriendList = 'http://api.steampowered.com/ISteamUser/GetFriendList/v0001/'
// const urlGetPlayerBans = 'http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/'

class SteamApi {
    constructor() {
        const steam = JSON.parse(localStorage.getItem("steam")) || {}
        this.steamApiKey = steam.apiKey || '';
        this.steamId = steam.id || '';
        this.ownedGames = localStorage.getItem('ownedGames');
    }

    set ownedGames(ownedGames = localStorage.getItem('ownedGames')) {
        if (!ownedGames || (ownedGames && dateFns.differenceInMinutes(new Date(), dateFns.parse(JSON.parse(ownedGames).timestamp)) > 5)) {
            this._getOwnedGames()
                .then(games => {
                    localStorage.setItem("ownedGames", JSON.stringify({ ...games, timestamp: new Date() }))
                    this._ownedGames = JSON.parse(localStorage.getItem('ownedGames'));
                })
                .catch(reason => {
                    this._ownedGames = ownedGames
                })
        } else {
            this._ownedGames = JSON.parse(localStorage.getItem('ownedGames'));
        }
    }
    get ownedGames() { return this._ownedGames }

    async GetUserInfo(steamId, steamApiKey) {
        return await axios.get(corsLink(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`), { headers: { 'Access-Control-Allow-Origin': '*', } })
            .then(response => {
                if (response.status === 200) {
                    return {
                        success: true,
                        error: null,
                        user: response.data.response.players[0]
                    }
                } else {
                    return {
                        success: false,
                        error: null,
                        user: null
                    }
                }
            })
            .catch(reason => ({ success: false, error: reason, user: null }));
    }

    // http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=00D5B3E37E04C5E734BF1B98A3CA9ADE&steamid=76561197967370369&format=json
    async _getOwnedGames() {
        return await axios.get(corsLink(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${this.steamApiKey}&steamid=${this.steamId}&format=json`), { headers: { 'Access-Control-Allow-Origin': '*', } })
            .then(response => {
                if (response.status === 200) {
                    response.data.response.games = response.data.response.games.reduce((acc, game) => (_.concat(acc, [game.appid])), [])
                    // localStorage.setItem("ownedGames", response.data.response)
                    return response.data.response
                }
            });
    }

    async ActivateKey(key) {
        return axios.post("https://store.steampowered.com/account/ajaxregisterkey/", {
            withCredentials: true,
            headers: {
                'Accept': 'application/json',
                'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: {
                sessionid: '4364b932ee560b091ea2644c',
                product_key: key
            }
        })
    }

    async AppDetails(appid = 440) {
        return axios.get(corsLink(`http://store.steampowered.com/api/appdetails/?appids=${appid}`))
            .then(response => {
                if (response.status === 200) {
                    if (response.data[appid]) {
                        return response.data[appid].data
                    }
                }
            })
            .catch(reason => console.error(reason));
    }

    async SteamUserStats(appid = 440) {
        return await axios.get(`http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=${appid}&key=${this.steamApiKey}&steamid=${this.steamId}`);
    }

    // http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=00D5B3E37E04C5E734BF1B98A3CA9ADE&steamid=76561197967370369&format=json
    async GetRecentlyPlayedGames() {
        return await axios.get(`http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${this.steamApiKey}&steamid=${this.steamId}&format=json`);
    }

    // http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=00D5B3E37E04C5E734BF1B98A3CA9ADE&appid=1174180
    async GetSchemaForGame(appid = 440) {
        return await axios.get(`http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${this.steamApiKey}&appid=${appid}`);
    }

    // http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=1174180&key=00D5B3E37E04C5E734BF1B98A3CA9ADE&steamid=76561197967370369
    async GetUserStatsForGame(appid = 440) {
        return await axios.get(`http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=${appid}&key=${this.steamApiKey}&steamid=${this.steamId}`);
    }

    isOwning(appid) {
        let result = false;

        try {
            result = _.indexOf(this._ownedGames.games, parseInt(appid)) > -1
        } catch (error) {

        }

        return result
    }
}

const steamApi = new SteamApi();
export default steamApi;