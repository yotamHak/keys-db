import axios from 'axios';
import itadConfig from './config';

class ItadApi {
    constructor() {
        this.clientId = itadConfig.clientId;
        this.clientSecret = itadConfig.clientSecret;
        this.apiKey = itadConfig.apiKey;
    }

    // https://api.isthereanydeal.com/v01/game/bundles/
    async GetInfoAboutBundles(title) {
        return axios.get(`https://api.isthereanydeal.com/v01/game/bundles/?key=${this.apiKey}&plains=${_encodeName(title)}`)
            .then(response => (
                {
                    success: response.status === 200 ? true : false,
                    times_bundled: response.status === 200
                        ? response.data.data[_encodeName(title)].total
                        : null,
                    bundle_url: response.status === 200
                        ? response.data.data[_encodeName(title)].urls.bundles
                        : null,
                }))
            .catch(reason => (
                {
                    success: false,
                    times_bundled: null,
                    bundle_url: null,
                }))
    }

    //  https://itad.docs.apiary.io/#reference/game/info/get-info-about-game?console=1
    // data = {
    //     "data": {
    //         "legomovievideogame": {
    //             "title": "The LEGO Movie: Videogame",
    //             "image": "https:\/\/steamcdn-a.akamaihd.net\/steam\/apps\/267530\/header.jpg",
    //             "greenlight": null,
    //             "is_package": false,
    //             "is_dlc": false,
    //             "achievements": true,
    //             "trading_cards": false,
    //             "early_access": false,
    //             "reviews": {
    //                 "steam": {
    //                     "perc_positive": 82,
    //                     "total": 1576,
    //                     "text": "Very Positive",
    //                     "timestamp": 1587406437
    //                 }
    //             },
    //             "urls": {
    //                 "game": "https:\/\/isthereanydeal.com\/game\/legomovievideogame\/info\/",
    //                 "history": "https:\/\/isthereanydeal.com\/game\/legomovievideogame\/history\/",
    //                 "package": "https:\/\/isthereanydeal.com\/game\/legomovievideogame\/info\/",
    //                 "dlc": "https:\/\/isthereanydeal.com\/game\/legomovievideogame\/info\/"
    //             }
    //         }
    //     }
    // }
    async GetOverview(name, appid, type) {
        const plainName = _encodeName(name);
        return axios.get(`https://api.isthereanydeal.com/v01/game/overview/?key=${this.apiKey}&allowed=steam&plains=${plainName}${appid ? `&ids=${type}/${appid}` : ''}`)
            .then(response => {
                if (response.status === 200) {
                    return {
                        success: true,
                        data: response.data.data[plainName]
                    }
                } else {
                    return {
                        success: false,
                        data: ""
                    }
                }
            })
            .catch(response => {
                return {
                    success: false,
                    data: response
                }
            })
    }

    async GetInfoAboutGame(gameName) {
        const plainName = _encodeName(gameName);
        return axios.get(`https://api.isthereanydeal.com/v01/game/info/?key=${this.apiKey}&plains=${plainName}`)
            .then(response => {
                return response.data.data[plainName]
            })
    }

    // https://itad.docs.apiary.io/#reference/game/identifier/get-plain?console=1
    // data = {
    //     ".meta": {
    //         "match": "title",
    //         "active": true
    //     },
    //     "data": {
    //         "plain": "legomovievideogame"
    //     }
    // }
    async GetPlain(gameName) { return await axios.get(`https://api.isthereanydeal.com/v02/game/plain/?key=${this.apiKey}&title=${gameName}`); }

    async FindGame(query) { return await axios.get(`https://api.isthereanydeal.com/v01/search/search/?key=${this.apiKey}&q=${query}&shops=steam`); }

    GetEncodedName(gameName) {
        return _encodeName(gameName);
    }
}

function _romanize(num) {
    var key = ["", "i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix"];
    return key[Number(num)];
}

function _encodeName(str) {
    if (str === undefined || str === null) { return "" }

    str = str.toLowerCase(); //lowercase
    str = str.replace(/[1-9]/g, _romanize);//_romanize digits
    str = str.replace(/(^the[^a-z])|([^a-z]the[^a-z])|([^a-z]the$)/g, ""); //remove "the", but not e.g. "other" or "them"
    str = str.replace(/([^a-z]the[^a-z])|([^a-z]the$)/g, ""); //remove "the", but not e.g. "other" or "them"
    str = str.replace(/\+/g, "plus");    //spell out "plus"
    str = str.replace(/&/g, "and");    //spell out "and"
    // str = str.replace(/\&/g, "and");    //spell out "and"
    str = str.replace(/[^a-z0]/g, '');    //remove remaining invalid characters, like spaces, braces, hyphens etc
    return str;
}

const itadApi = new ItadApi();
export default itadApi;