import axios from 'axios';
import itadConfig from './config';

class ItadApi {
    constructor() {
        this.clientId = itadConfig.clientId;
        this.clientSecret = itadConfig.clientSecret;
        this.apiKey = itadConfig.apiKey;
    }

    getCORSLink(url) {
        return `${url}`;
        // return `https://cors-anywhere.herokuapp.com/${url}`;
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
    async GetInfoAboutGame(gameName) {
        const plainName = _encodeName(gameName);
        return await axios.get(this.getCORSLink(`https://api.isthereanydeal.com/v01/game/info/?key=${this.apiKey}&plains=${plainName}`));
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
    async GetPlain(gameName) {
        return await axios.get(this.getCORSLink(`https://api.isthereanydeal.com/v02/game/plain/?key=${this.apiKey}&title=${gameName}`));
    }

    async FindGame(query) {
        return await axios.get(this.getCORSLink(`https://api.isthereanydeal.com/v01/search/search/?key=${this.apiKey}&q=${query}&shops=steam`));
    }

    GetEncodedName(gameName) {
        return _encodeName(gameName);
    }
}

function _romanize(num) {
    var key = ["", "i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix"];
    return key[Number(num)];
}

function _encodeName(str) {
    str = str.toLowerCase(); //lowercase
    str = str.replace(/[1-9]/g, _romanize);//_romanize digits
    str = str.replace(/(^the[^a-z])|([^a-z]the[^a-z])|([^a-z]the$)/g, ""); //remove "the", but not e.g. "other" or "them"
    str = str.replace(/([^a-z]the[^a-z])|([^a-z]the$)/g, ""); //remove "the", but not e.g. "other" or "them"
    str = str.replace(/\+/g, "plus");    //spell out "plus"
    str = str.replace(/\&/g, "and");    //spell out "and"
    str = str.replace(/[^a-z0]/g, '');    //remove remaining invalid characters, like spaces, braces, hyphens etc
    return str;
}

const itadApi = new ItadApi();
export default itadApi;