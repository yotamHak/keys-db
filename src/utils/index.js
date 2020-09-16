import _ from 'lodash';
import moment from 'moment'

const _alphabet = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]
export const SPREADSHEET_METADATA_HEADERS_ID = 1986
export const SPREADSHEET_METADATA_PERMISSIONS_ID = 1988
export const SPREADSHEET_METADATA_SHEET_ID = 1910
export const SPREADSHEET_METADATA_DEFAULT_SETTINGS = { "ID": { "id": "A", "label": "ID", "type": "number", "pattern": "General", "display": false }, "Title": { "id": "B", "label": "Title", "type": "steam_title", "isPrivate": false, "display": true, "isFilter": false, "sortable": false }, "Status": { "id": "C", "label": "Status", "type": "dropdown", "isPrivate": false, "options": { "allowEdit": false, "values": [{ "value": "Used", "color": "red" }, { "value": "Unused", "color": "green" }, { "value": "Traded", "color": "yellow" }, { "value": "Gifted", "color": "orange" }] }, "display": true, "isFilter": true, "sortable": true }, "Key": { "id": "D", "label": "Key", "type": "key", "isPrivate": true, "display": true, "isFilter": false, "sortable": false }, "From": { "id": "E", "label": "From", "type": "dropdown", "isPrivate": false, "options": { "allowEdit": true, "values": [{ "value": "Fanatical", "color": "green" }, { "value": "Indiegala", "color": "red" }, { "value": "Other", "color": "grey" }, { "value": "Amazon", "color": "brown" }, { "value": "Alienware", "color": "blue" }, { "value": "AMD", "color": "orange" }, { "value": "Indiegamestand", "color": "pink" }, { "value": "Sega", "color": "blue" }, { "value": "DigitalHomicide", "color": "brown" }, { "value": "Humblebundle", "color": "blue" }] }, "display": true, "isFilter": true, "sortable": true }, "Own Status": { "id": "F", "label": "Own Status", "type": "steam_ownership", "isPrivate": false, "options": { "allowEdit": false, "values": [{ "value": "Own", "color": "green" }, { "value": "Missing", "color": "red" }] }, "display": true, "isFilter": true, "sortable": true }, "Date Added": { "id": "G", "label": "Date Added", "type": "date", "pattern": "dd-mm-yyyy", "isPrivate": true, "display": true, "isFilter": true, "sortable": true }, "Note": { "id": "H", "label": "Note", "type": "text", "isPrivate": true, "display": true, "isFilter": false, "sortable": false }, "isthereanydeal URL": { "id": "I", "label": "isthereanydeal URL", "type": "url", "isPrivate": false, "display": true, "isFilter": false, "sortable": false }, "Steam URL": { "id": "J", "label": "Steam URL", "type": "steam_url", "isPrivate": false, "display": true, "isFilter": false, "sortable": false }, "Cards": { "id": "K", "label": "Cards", "type": "steam_cards", "isPrivate": false, "options": { "allowEdit": false, "values": [{ "value": "Have", "color": "green" }, { "value": "Missing", "color": "red" }] }, "display": true, "isFilter": true, "sortable": true }, "AppId": { "id": "L", "label": "AppId", "type": "steam_appid", "pattern": "General", "isPrivate": false, "display": true, "isFilter": false, "sortable": false } }
export const SPREADSHEET_TEMPLATE_SPREADSHEET_ID = '13WFCn_RDuz9ZaCS4fj5VkpCUTz8HuIhSTYRjSXC-7bU'
export const SPREADSHEET_IMPORT_TEMPLATE_SPREADSHEET_ID = '1qlzwzis9pyxI_C2s534oOPDjCaMp8ou_nTQ_SClZTxg'
export const TABLE_DEFAULT_OFFSET = 0
export const TABLE_DEFAULT_LIMIT = 24
export const TABLE_DEFAULT_ACTIVEPAGE = 1
export const STEAM_CATEGORIES = {
  1: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_multiPlayer.png',
  2: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_singlePlayer.png',
  6: 'https://steamstore-a.akamaihd.net/public/images/ico/ico_mod_hl2.gif',
  7: 'https://steamstore-a.akamaihd.net/public/images/ico/ico_mod_hl.gif',
  8: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_vac.png',
  9: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_coop.png',
  13: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_cc.png',
  14: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_commentary.png',
  15: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_stats.png',
  16: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_sdk.png',
  17: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_editor.png',
  18: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_partial_controller.png',
  19: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_sdk.png',
  20: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_multiPlayer.png',
  21: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_dlc.png',
  22: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_achievements.png',
  23: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_cloud.png',
  24: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_coop.png',
  25: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_leaderboards.png',
  27: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_multiPlayer.png',
  28: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_controller.png',
  29: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_cards.png',
  30: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_workshop.png',
  32: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_turn_notifications.png',
  35: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_cart.png',
  36: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_multiPlayer.png',
  37: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_multiPlayer.png',
  38: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_coop.png',
  39: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_coop.png',
  40: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_collectibles.png',
  41: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_remote_play.png',
  42: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_remote_play.png',
  43: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_remote_play.png',
  44: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_remote_play_together.png',
  47: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_multiPlayer.png',
  48: 'https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_coop.png',
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

export const genericSort = (a, b) => a < b ? -1 : a > b ? 1 : 0

// Field Types related

export const fieldTypes = [
  { key: 'date', text: 'Date', value: 'date', description: 'Date field' },
  { key: 'string', text: 'String', value: 'string', description: 'Plain text field' },
  { key: 'number', text: 'Number', value: 'number', description: 'Number field' },
  { key: 'text', text: 'Text', value: 'text', description: 'Long text field' },
  { key: 'key', text: 'Key', value: 'key', description: 'Key field' },
  { key: 'dropdown', text: 'Dropdown', value: 'dropdown', description: 'Multi-Option field' },
  { key: 'url', text: 'URL', value: 'url', description: 'Url field' },
].sort((a, b) => genericSort(`${a.icon}${a.text}`, `${b.icon}${b.text}`))

export const uniqueSteamFieldTypes = [
  { key: 'steam_title', text: 'Title', value: 'steam_title', icon: 'steam', description: 'This will be used to gather Steam information' },
  { key: 'steam_url', text: 'URL', value: 'steam_url', icon: 'steam', description: 'Store URL, Auto-filled' },
  { key: 'steam_appid', text: 'App Id', value: 'steam_appid', icon: 'steam', description: 'AppID, Auto-filled' },
  { key: 'steam_key', text: 'Key', value: 'steam_key', icon: 'steam', description: 'Key' },
  { key: 'steam_cards', text: 'Cards', value: 'steam_cards', icon: 'steam', description: 'Cards, Auto-filled' },
  { key: 'steam_achievements', text: 'Achievements', icon: 'steam', value: 'steam_achievements', description: 'Achievements, Auto-filled' },
  // { key: 'steam_dlc', text: 'DLC', value: 'steam_dlc', icon: 'steam', description: 'Is this a Steam DLC, Exclusive for Steam' },
  { key: 'steam_bundled', text: 'Bundled', value: 'steam_bundled', icon: 'steam', description: 'Times this game was bundled, Auto-filled' },
  { key: 'steam_ownership', text: 'Owned', value: 'steam_ownership', icon: 'steam', description: 'Ownership, Auto-filled' },
]

export const uniqueFieldTypes = [
  { key: 'created_on', text: 'Created On', value: 'created_on', description: 'Created on' },
  { key: 'modified_on', text: 'Modified On', value: 'modified_on', description: 'Last modified on' },
]

export const getAllFieldTypes = () => [
  ...uniqueFieldTypes,
  ...uniqueSteamFieldTypes,
  ...fieldTypes,
].sort((a, b) => genericSort(`${a.icon}${a.text}`, `${b.icon}${b.text}`))

const _dropdownTypes = ['dropdown', 'steam_ownership', 'steam_cards', 'steam_achievements']

export const isDropdownType = type => _dropdownTypes.find(item => type === item) ? true : false

const _dateTypes = ['date', 'created_on', 'modified_on']

export const isDateType = type => _dateTypes.find(item => type === item) ? true : false

//---------------------------------------------------------------------------------------------------

export const getDomain = (url) => url.replace(/^https?:\/\//i, "");

export const isUrl = (url) => /^(ftp|http|https):\/\/[^ "]+$/.test(url)

export const isSteamKey = (key) => /(\w{5}-){2}\w{5}/.test(key)

export const alphabetSort = (a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : 0

const _isDateInputSupportDate = date => /\d{4}-\d{2}-\d{2}/.test(date)

export const parseSpreadsheetDate = (date, isForDisplay) => {
  if (date) {
    let parsedDate

    if (!moment.isDate(date)) {
      parsedDate = _isDateInputSupportDate(date)
        ? moment(date, 'YYYY-MM-DD')
        : moment(date, 'DD/MM/YYYY')
    }

    return isForDisplay
      ? moment(parsedDate).format('DD/MM/YYYY')
      : moment(parsedDate).format('YYYY-MM-DD')
  }
  else {
    return isForDisplay
      ? moment(new Date()).format('DD/MM/YYYY')
      : moment(new Date()).format('YYYY-MM-DD')
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

export const cleanRedundentOptions = headers => Object.keys(headers).reduce((result, key) => {
  if (!isDropdownType(headers[key].type) && headers[key].options) {
    let newHeader = { ...headers[key] }

    _.unset(newHeader, 'options')

    return {
      ...result,
      [key]: newHeader
    }
  } else {
    return {
      ...result,
      [key]: headers[key]
    }
  }
}, {})

export function fillValueIfFieldExist(label, values, onExist) {
  if (label) {
    values[label].value = onExist()
  }

  return values
}

export const getIndexByLabel = (label, headers) => {
  return _alphabet.indexOf(headers[label].id)
}

export const getIndexById = (id,) => _alphabet.indexOf(id)


export function getValueByType(dataObject, headers, type) {
  try {
    return dataObject[getIndexByType(headers, type)]
  } catch (error) {
    return null
  }
}

export function getValueById(dataObject, id) {
  try {
    return dataObject[getIndexById(id)]
  } catch (error) {
    return null
  }
}

// export const getValueByLabel = (label, headers, gameData) => gameData[getIndexByLabel(label, headers)]

export const getLabelByIndex = index => _alphabet[index]

export const getLabelByType = (headers, type) => Object.keys(headers).find(key => headers[key].type === type)

export const getIndexByType = (headers, type) => _alphabet.indexOf(headers[Object.keys(headers).find(key => headers[key].type === type)].id)

export const nextChar = c => c === 'Z' ? 'A' : String.fromCharCode(c.charCodeAt(0) + 1)

export const getPrivateColumns = headers => Object.keys(headers)
  .filter(key => headers[key].isPrivate)
  .reduce((result, key) => (_.concat(result, [getIndexById(headers[key].id)])), [])

export function getUrlsLocationAndValue(headers, gameData) {
  return Object.keys(headers)
    .filter(key => headers[key].type === 'url' || headers[key].type === 'steam_url')
    .reduce((result, key) => {
      const urlIndex = getIndexById(headers[key].id)

      return _.concat(
        ...result,
        [gameData
          ? {
            index: urlIndex,
            label: "URLs",
            website: gameData[urlIndex]
              ? _.lowerCase(gameData[urlIndex]).indexOf("isthereanydeal") > -1
                ? "itad"
                : "steam"
              : "",
            url: gameData[urlIndex],
          }
          : {
            index: urlIndex,
            label: "URLs",
          }]
      )
    }, [])
}

export const hasWritePermission = permission => permission === "owner"

/* EMAIL REGEX: !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email) */
/* URL REGEX: !/^(ftp|http|https):\/\/[^ "]+$/.test(values.url) */