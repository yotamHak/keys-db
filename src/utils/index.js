import { useEffect, useRef, useState } from "react";
import _ from 'lodash';
import moment from 'moment'

const _alphabet = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]

export const SPREADSHEET_METADATA_HEADERS_ID = 1986
export const SPREADSHEET_METADATA_PERMISSIONS_ID = 1988
export const SPREADSHEET_METADATA_DEFAULT_SETTINGS = { "ID": { "id": "A", "label": "ID", "type": "number", "pattern": "General", "display": false }, "Title": { "id": "B", "label": "Title", "type": "steam_title", "isPrivate": false, "display": true, "isFilter": false, "sortable": false }, "Status": { "id": "C", "label": "Status", "type": "dropdown", "isPrivate": false, "options": { "allowEdit": false, "values": [{ "value": "Used", "color": "red" }, { "value": "Unused", "color": "green" }, { "value": "Traded", "color": "yellow" }, { "value": "Gifted", "color": "orange" }] }, "display": true, "isFilter": true, "sortable": true }, "Key": { "id": "D", "label": "Key", "type": "key", "isPrivate": true, "display": true, "isFilter": false, "sortable": false }, "From": { "id": "E", "label": "From", "type": "dropdown", "isPrivate": false, "options": { "allowEdit": true, "values": [{ "value": "Fanatical", "color": "green" }, { "value": "Indiegala", "color": "red" }, { "value": "Other", "color": "grey" }, { "value": "Amazon", "color": "brown" }, { "value": "Alienware", "color": "blue" }, { "value": "AMD", "color": "orange" }, { "value": "Indiegamestand", "color": "pink" }, { "value": "Sega", "color": "blue" }, { "value": "DigitalHomicide", "color": "brown" }, { "value": "Humblebundle", "color": "blue" }] }, "display": true, "isFilter": true, "sortable": true }, "Own Status": { "id": "F", "label": "Own Status", "type": "steam_ownership", "isPrivate": false, "options": { "allowEdit": false, "values": [{ "value": "Own", "color": "green" }, { "value": "Missing", "color": "red" }] }, "display": true, "isFilter": true, "sortable": true }, "Date Added": { "id": "G", "label": "Date Added", "type": "date", "pattern": "dd-mm-yyyy", "isPrivate": true, "display": true, "isFilter": true, "sortable": true }, "Note": { "id": "H", "label": "Note", "type": "text", "isPrivate": true, "display": true, "isFilter": false, "sortable": false }, "isthereanydeal URL": { "id": "I", "label": "isthereanydeal URL", "type": "url", "isPrivate": false, "display": true, "isFilter": false, "sortable": false }, "Steam URL": { "id": "J", "label": "Steam URL", "type": "steam_url", "isPrivate": false, "display": true, "isFilter": false, "sortable": false }, "Cards": { "id": "K", "label": "Cards", "type": "steam_cards", "isPrivate": false, "options": { "allowEdit": false, "values": [{ "value": "Have", "color": "green" }, { "value": "Missing", "color": "red" }] }, "display": true, "isFilter": true, "sortable": true }, "AppId": { "id": "L", "label": "AppId", "type": "steam_appid", "pattern": "General", "isPrivate": false, "display": true, "isFilter": false, "sortable": false } }

export const TABLE_DEFAULT_OFFSET = 0
export const TABLE_DEFAULT_LIMIT = 24
export const TABLE_DEFAULT_ACTIVEPAGE = 1

export const STEAM_CATEGORIES = {
  "Single-player": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_singlePlayer.png",
  "Multi-player": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_multiPlayer.png",
  "Co-op": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_coop.png",
  "PvP": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_multiPlayer.png",
  "Additional High-Quality Audio": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_hdaudio.png",
  "Shared/Split Screen": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_coop.png",
  "Shared/Split Screen Co-op": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_coop.png",
  "Shared/Split Screen PvP": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_multiPlayer.png",
  "Steam Achievements": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_achievements.png",
  "Full controller support": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_controller.png",
  "Partial Controller Support": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_partial_controller.png",
  "Steam Trading Cards": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_cards.png",
  "Captions available": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_cc.png",
  "Steam Workshop": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_workshop.png",
  "Steam Cloud": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_cloud.png",
  "Steam Leaderboards": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_leaderboards.png",
  "Includes level editor": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_editor.png",
  "Remote Play on Phone": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_remote_play.png",
  "Remote Play on Tablet": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_remote_play.png",
  "Remote Play on TV": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_remote_play.png",
  "Remote Play Together": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_remote_play_together.png",
  "SteamVR Collectibles": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_collectibles.png",
  "In-App Purchases": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_cart.png",
  "Valve Anti-Cheat enabled": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_vac.png",
  "Stats": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_stats.png",
  "Includes Source SDK": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_sdk.png",
  "Commentary available": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_commentary.png",
  "Cross-Platform Multiplayer": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_multiPlayer.png",
  "Online PvP": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_multiPlayer.png",
  "Online Co-op": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_coop.png",
  "Downloadable Content": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_dlc.png",
}

export const colorOptions = [
  { key: 'red', text: 'Red', value: 'red', label: { color: 'red', circular: true, empty: true }, },
  { key: 'orange', text: 'Orange', value: 'orange', label: { color: 'orange', circular: true, empty: true }, },
  { key: 'yellow', text: 'Yellow', value: 'yellow', label: { color: 'yellow', circular: true, empty: true }, },
  { key: 'olive', text: 'Olive', value: 'olive', label: { color: 'olive', circular: true, empty: true }, },
  { key: 'green', text: 'Green', value: 'green', label: { color: 'green', circular: true, empty: true }, },
  { key: 'teal', text: 'Teal', value: 'teal', label: { color: 'teal', circular: true, empty: true }, },
  { key: 'blue', text: 'Blue', value: 'blue', label: { color: 'blue', circular: true, empty: true }, },
  { key: 'violet', text: 'Violet', value: 'violet', label: { color: 'violet', circular: true, empty: true }, },
  { key: 'purple', text: 'Purple', value: 'purple', label: { color: 'purple', circular: true, empty: true }, },
  { key: 'pink', text: 'Pink', value: 'pink', label: { color: 'pink', circular: true, empty: true }, },
  { key: 'brown', text: 'Brown', value: 'brown', label: { color: 'brown', circular: true, empty: true }, },
  { key: 'grey', text: 'Grey', value: 'grey', label: { color: 'grey', circular: true, empty: true }, },
  { key: 'black', text: 'Black', value: 'black', label: { color: 'black', circular: true, empty: true }, },
]

export const getDomain = (url) => url.replace(/^https?:\/\//i, "");

export const isUrl = (url) => /^(ftp|http|https):\/\/[^ "]+$/.test(url)

export const isSteamKey = (key) => /(\w{5}-){2}\w{5}/.test(key)

export const genericSort = (a, b) => a < b ? -1 : a > b ? 1 : 0

export const alphabetSort = (a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : 0

export const parseSpreadsheetDate = date => {
  if (date) {
    let parsedDate = new Date(date);

    if (!moment.isDate(date)) {
      parsedDate = moment(date, 'DD/MM/YYYY')
    }

    return moment(parsedDate).format('DD/MM/YYYY')
  }
  else {
    return ""
  }
}

export const corsLink = url => `https://cors-anywhere.herokuapp.com/${url}`;

export const parseOptions = options => options.values
  .reduce((acc, option) => (_.concat(acc, [{
    key: acc.length,
    value: option.value,
    text: option.value,
    color: option.color
  }])), [])
  .sort((a, b) => { return alphabetSort(a.text, b.text) })

export const getIndexByLabel = (label, headers) => _alphabet.indexOf(headers[label].id)

export const getLabelByIndex = index => _alphabet[index]

export const getValueByLabel = (label, headers, gameData) => gameData[getIndexByLabel(label, headers)]

export const getLabelByType = (headers, type, gameData) => Object.keys(headers).find(key => headers[key].type === type)

export const getUrlsLocationAndValue = (headers, gameData) => Object.keys(headers)
  .filter(key => headers[key].type === 'url' || headers[key].type === 'steam_url')
  .reduce((result, key) => (_.concat(
    ...result,
    [gameData
      ? {
        index: getIndexByLabel(key, headers),
        label: "URLs",
        website: gameData[getIndexByLabel(key, headers)]
          ? _.lowerCase(gameData[getIndexByLabel(key, headers)]).indexOf("isthereanydeal") > -1
            ? "itad"
            : "steam"
          : "",
        url: gameData[getIndexByLabel(key, headers)],
      }
      : {
        index: getIndexByLabel(key, headers),
        label: "URLs",
      }]
  )), [])

export const hasWritePermission = permission => permission === "owner"

// Custom hook for saving previous value
export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

// Custom hook that will alert once reaching the bottom of the page
export function useBottomPage(offset = 100) {
  const [bottom, setBottom] = useState(false);

  useEffect(() => {
    function handleScroll() {
      // const isBottom = Math.ceil(window.innerHeight + document.documentElement.scrollTop) === document.documentElement.scrollHeight;
      const isBottom = document.documentElement.scrollTop !== 0 && window.innerHeight + document.documentElement.scrollTop > document.documentElement.scrollHeight - offset
      setBottom(isBottom);
    }
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return bottom;
}

// Custom hook for an setTimeout
export function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

/* EMAIL REGEX: !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email) */
/* URL REGEX: !/^(ftp|http|https):\/\/[^ "]+$/.test(values.url) */
