import axios from 'axios';
import steamConfig from './config';

// https://developer.valvesoftware.com/wiki/Steam_Web_API

class SteamApi {
    constructor() {
        this.steamApiKey = steamConfig.steamApiKey;
        this.steamId = steamConfig.steamId;
    }

    getCORSLink(url) {
        // return `${url}`;
        return `https://cors-anywhere.herokuapp.com/${url}`;
    }

    // async register(name, email, password) {
    //     const newUser = await this.auth.createUserWithEmailAndPassword(
    //         email,
    //         password
    //     )
    //     return await newUser.user.updateProfile({
    //         displayName: name
    //     })
    // }

    async AppDetails(appid = 440) {
        return await axios.get(this.getCORSLink(`http://store.steampowered.com/api/appdetails/?appids=${appid}`));
    }

    async SteamUserStats(appid = 440) {
        return await axios.get(this.getCORSLink(`http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=${appid}&key=${this.steamApiKey}&steamid=${this.steamId}`));
    }

    // http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=00D5B3E37E04C5E734BF1B98A3CA9ADE&steamid=76561197967370369&format=json
    async GetOwnedGames() {
        // return await axios.get(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${this.steamApiKey}&steamid=${this.steamId}&format=json`, {
        //     headers: {
        //         'Access-Control-Allow-Origin': '*',
        //         'crossdomain': true,
        //     }
        // })

        return await axios.get(this.getCORSLink(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${this.steamApiKey}&steamid=${this.steamId}&format=json`));
    }

    // http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=00D5B3E37E04C5E734BF1B98A3CA9ADE&steamid=76561197967370369&format=json
    async GetRecentlyPlayedGames() {
        return await axios.get(this.getCORSLink(`http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${this.steamApiKey}&steamid=${this.steamId}&format=json`));
    }

    // http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=00D5B3E37E04C5E734BF1B98A3CA9ADE&appid=1174180
    async GetSchemaForGame(appid = 440) {
        return await axios.get(this.getCORSLink(`http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${this.steamApiKey}&appid=${appid}`));
    }

    // http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=1174180&key=00D5B3E37E04C5E734BF1B98A3CA9ADE&steamid=76561197967370369
    async GetUserStatsForGame(appid = 440) {
        return await axios.get(this.getCORSLink(`http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=${appid}&key=${this.steamApiKey}&steamid=${this.steamId}`));
    }
}

const steamApi = new SteamApi();
export default steamApi;