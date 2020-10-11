import _ from 'lodash';
import moment from 'moment';

const _alphabet = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]

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