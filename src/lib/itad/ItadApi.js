import axios from 'axios';
import _ from 'lodash';
import itadConfig from './config';

const apiKey = itadConfig.apiKey;

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
    str = str.replace(/&/g, "and");    //spell out "and"
    str = str.replace(/[^a-z0]/g, '');    //remove remaining invalid characters, like spaces, braces, hyphens etc
    return str;
}

async function GetInfoAboutBundles(title) {
    return axios.get(`https://api.isthereanydeal.com/v01/game/bundles/?key=${apiKey}&plains=${_encodeName(title)}`)
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

async function GetOverview(name, appid, type) {
    const plainName = _encodeName(name);
    return axios.get(`https://api.isthereanydeal.com/v01/game/overview/?key=${apiKey}&allowed=steam&plains=${plainName}${appid ? `&ids=${type}/${appid}` : ''}`)
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

async function GetInfoAboutGame(gameName) {
    const plainName = _encodeName(gameName);
    return axios.get(`https://api.isthereanydeal.com/v01/game/info/?key=${apiKey}&plains=${plainName}`)
        .then(response => {
            return {
                success: response.status === 200 ? true : false,
                data: response.data.data[plainName]
            }
        })
}

async function GetPlain(gameName) { return axios.get(`https://api.isthereanydeal.com/v02/game/plain/?key=${apiKey}&title=${gameName}`); }

async function FindGame(query) { return axios.get(`https://api.isthereanydeal.com/v01/search/search/?key=${apiKey}&q=${query}&shops=steam`); }

function GetPlainName(map, appid) {
    return map.data[`app/${appid}`] || map.data[`sub/${appid}`] || map.data[`bundle/${appid}`]
}

async function GetMap(shop = 'steam') {
    return axios.get(`https://api.isthereanydeal.com/v01/game/map/?key=${apiKey}&shop=${shop}&type=id:plain`)
        .then(response => {
            if (response.status === 200 && !_.isEmpty(response.data.data)) {
                return {
                    success: true,
                    data: {
                        itadMap: {
                            data: response.data.data,
                            timestamp: new Date()
                        }
                    }
                }
            }

            return response
        })
}

export default {
    GetInfoAboutBundles,
    GetOverview,
    GetInfoAboutGame,
    GetPlain,
    FindGame,
    GetPlainName,
    GetMap,
}