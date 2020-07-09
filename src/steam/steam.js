import axios from 'axios';
import dateFns from 'date-fns';
import _ from 'lodash';
import steamConfig from './config';
import { corsAnywhereLink, corsAllOriginsLink } from '../utils';

// https://developer.valvesoftware.com/wiki/Steam_Web_API

const apiKey = '00D5B3E37E04C5E734BF1B98A3CA9ADE'
const urlVanityNameSearch = 'https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/'
const urlSearchUserGameList = 'https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/'
const urlGameAchivements = 'http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/'
const urlUserInfo = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/'
const urlGetGameInfo = 'https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/'
const urlGetFriendList = 'http://api.steampowered.com/ISteamUser/GetFriendList/v0001/'
const urlGetPlayerBans = 'http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/'

class SteamApi {
    constructor() {
        this.steamApiKey = steamConfig.steamApiKey;
        this.steamId = steamConfig.steamId;
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

    // http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=00D5B3E37E04C5E734BF1B98A3CA9ADE&steamid=76561197967370369&format=json
    async _getOwnedGames() {
        return await axios.get(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${this.steamApiKey}&steamid=${this.steamId}&format=json`, { withCredentials: true, })
            .then(response => {
                if (response.status === 200) {
                    response.data.response.games = response.data.response.games.reduce((acc, game) => (_.concat(acc, [game.appid])), [])
                    // localStorage.setItem("ownedGames", response.data.response)
                    return response.data.response
                }
            });
    }

    async AppDetails(appid = 440) {
        return await axios.get(`http://store.steampowered.com/api/appdetails/?appids=${appid}`)
            .then(response => {
                return JSON.parse(response.data.contents)
            });
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