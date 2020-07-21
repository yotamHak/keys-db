import { gapi } from 'gapi-script';
import axios from "axios";
import _ from "lodash";
import { isUrl, isSteamKey, genericSort, parseSpreadsheetDate } from '../utils';

class Spreashsheets {
    _queryUrl = (spreadsheetId, queryString) => `https://docs.google.com/a/google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tq=${queryString}`

    _handleError = response => {
        console.error(response.errors);
        return response
    }

    _get = async url => axios.get(url, { headers: { 'Content-Type': 'application/json; charset=UTF-8', Authorization: _.concat('Bearer ', localStorage.getItem('gTokenId')) } })
        .then(response => {
            const parsedResponse = JSON.parse(response.data.slice(response.data.indexOf("{"), response.data.length - 2));

            return parsedResponse.status === 'ok'
                ? {
                    success: true,
                    data: parsedResponse
                }
                : {
                    success: false,
                    errors: parsedResponse.errors
                }
        })
        .catch(reason => {
            debugger
            return {
                success: false,
                errors: reason.errors
            }
        })

    _parseFilters(filters = []) {
        if (_.isEmpty(filters)) { return "" }

        const filtersArray = filters.reduce((result, filter) => _.concat(
            result,
            [filter.values.map(value => ({ [filter.id]: `'${value}'` }))]
        ), [])

        return _.join(filtersArray.map(group => `(${_.join(group.map(item => `${Object.keys(item)[0]} = ${item[Object.keys(item)[0]]}`), ' or ')})`), ' and ')
    }

    _createQueryString(textQuery = "", offset = 0, limit = 24, orderBy = { sort: "A", asc: false }, filters = [], range = "*", countOnly = false) {
        const select = `select ${range}`
        const where = _.isEmpty(filters)
            ? `${textQuery !== "" ? `where lower(B) contains lower('${textQuery}')` : ``}`
            : `where ${textQuery !== "" ? `lower(B) contains lower('${textQuery}') and` : ``} ${this._parseFilters(filters)}`
        const order = orderBy
            ? `order by ${orderBy.sort} ${orderBy.asc ? "asc" : "desc"}`
            : ``
        const offsetAndLimit = `limit ${limit} offset ${offset}`

        return countOnly
            ? encodeURIComponent(`select count(A) ${where}`)
            : encodeURIComponent(`${select} ${where} ${order} ${offsetAndLimit}`)
    }

    _parseTable(response) {
        const table = response.table;
        // console.log("Parsing Table:", table);

        return {
            ...table,
            rows: table.rows.reduce((result, row) => {
                return _.concat(
                    result,
                    [row["c"].map((values, index) => {
                        return values
                            ? values.f
                                ? values.f
                                : values.v
                            : ''
                    })]
                )
            }, [])
        }
    }

    _initOptions(headers, rows) {
        const allOptions = { ...headers }

        _.forEach(rows, row => {
            let optionIndex = 0

            _.forEach(allOptions, allOptionValue => {
                let rowValue = row[optionIndex++]

                if (rowValue) {
                    if (allOptionValue.type === 'date') {
                        rowValue = parseSpreadsheetDate(rowValue);
                    }

                    _.isObject(allOptionValue.options)
                        ? allOptionValue.options = {
                            ...allOptionValue.options,
                            [rowValue]: 0
                        }
                        : allOptionValue.options = { [rowValue]: 0 }
                }
            })
        })

        Object.keys(allOptions)
            .map(headerKey => allOptions[headerKey].options = _.isObject(allOptions[headerKey].options) ? Object.keys(allOptions[headerKey].options) : []
                .filter(value => {
                    return value !== ""
                        && !_.toNumber(value)
                        && !isUrl(value)
                        && !isSteamKey(value)
                        && value !== 'Invalid Date'
                })
                .sort(genericSort))

        return allOptions
    }

    // https://developers.google.com/chart/interactive/docs/querylanguage
    _query = async (spreadsheetId, titleQuery, offset, limit, orderBy, filters) => this._get(this._queryUrl(spreadsheetId, this._createQueryString(titleQuery, offset, limit, orderBy, filters)))

    _queryCount = async (spreadsheetId, titleQuery, offset, limit, orderBy, filters) => this._get(this._queryUrl(spreadsheetId, this._createQueryString(titleQuery, offset, limit, orderBy, filters, '*', true)))
        .then(response => {
            return response.success
                ? {
                    success: true,
                    data: {
                        count: response.data.table.rows.length === 0 ? 0 : response.data.table.rows[0]['c'][0]['v']
                    }
                }
                : {
                    success: false,
                    errors: response.errors
                }
        })

    async _getHeadersAndSettings(spreadsheetId) {
        return gapi.client.sheets.spreadsheets.values.get({
            "spreadsheetId": spreadsheetId,
            "range": "A1:Z1",
            "majorDimension": "COLUMNS",
            "valueRenderOption": "FORMULA"
        })
            .then(response => {
                if (response.status === 200) {
                    return {
                        success: true,
                        data: response.result
                    }
                } else {
                    return {
                        success: false,
                        errors: response.errors
                    }
                }
            })
            .catch(response => {
                return {
                    success: false,
                    errors: response.errors
                }
            })
    }

    _combineHeadersAndSettings = (headersArray, settings) => Object.keys(settings).reduce((result, key) => ({
        ...result,
        [key]: {
            ...headersArray.find(item => item.label === key),
            ...settings[key],
        }
    }), {})

    _getSettings(headersArray, settingsValuesArray) {
        return headersArray.reduce((result, key, index) => {
            if (key === "ID") {
                return {
                    ...result,
                    [key]: {
                        id: "A",
                        label: "ID",
                        type: "number",
                        pattern: "General",
                        display: false,
                    }
                }
            }

            return {
                ...result, [key]: JSON.parse(settingsValuesArray[index])
            }
        }, {})
    }

    async _createNewSpreadsheet(title) {
        return gapi.client.sheets.spreadsheets.create({
            "resource": {
                "properties": {
                    "title": title
                }
            }
        })
            .then(response => {
                return response.status === 200
                    ? {
                        success: true,
                        data: response.result
                    }
                    : {
                        success: false,
                        errors: response.errors
                    }
            })
            .catch(response => ({
                success: false,
                errors: response.errors
            }))
    }

    async _deleteColumns(spreadsheetId, sheetId, rangeArray) {
        const requests = rangeArray.reduce((result, id) => (_.concat(result, [{
            deleteDimension: {
                range: {
                    sheetId: sheetId,
                    dimension: "COLUMNS",
                    startIndex: id,
                    endIndex: id + 1
                }
            }
        }])), [])

        return this._batchUpdate(spreadsheetId, requests)
    }

    async _copyCleanSheet(spreadsheetId) {
        return gapi.client.sheets.spreadsheets.sheets.copyTo({
            "spreadsheetId": spreadsheetId,
            "sheetId": 0,
            "resource": {
                "destinationSpreadsheetId": spreadsheetId
            }
        })
            .then(response => {
                return response.status === 200
                    ? {
                        success: true,
                        data: response.result
                    }
                    : {
                        success: false,
                        errors: response.errors
                    }
            })
            .catch(response => ({
                success: false,
                errors: response.errors
            }))
    }

    async _copySheetToSpreadsheet(fromSpreadsheet, fromSheetId, toSpreadsheet) {
        return gapi.client.sheets.spreadsheets.sheets.copyTo({
            "spreadsheetId": fromSpreadsheet,
            "sheetId": fromSheetId,
            "resource": {
                "destinationSpreadsheetId": toSpreadsheet
            }
        })
            .then(response => {
                return response.status === 200
                    ? {
                        success: true,
                        data: response.result
                    }
                    : {
                        success: false,
                        errors: response.errors
                    }
            })
            .catch(response => ({
                success: false,
                errors: response.errors
            }))
    }

    async _deleteSheet(spreadsheetId, sheetId) {
        return gapi.client.sheets.spreadsheets.batchUpdate({
            "spreadsheetId": spreadsheetId,
            "resource": {
                "requests": [
                    {
                        "deleteSheet": {
                            "sheetId": sheetId
                        }
                    }
                ]
            }
        })
            .then(response => {
                return response.status === 200
                    ? {
                        success: true,
                        data: response.result
                    }
                    : {
                        success: false,
                        errors: response.errors
                    }
            })
            .catch(response => ({
                success: false,
                errors: response.errors
            }))
    }

    async _batchUpdate(spreadsheetId, requests) {
        const params = {
            spreadsheetId: spreadsheetId,
            requests: requests,
        }

        return gapi.client.sheets.spreadsheets.batchUpdate(params)
            .then(response => {
                return response.status === 200
                    ? {
                        success: true,
                        data: response.result
                    }
                    : {
                        success: false,
                        errors: response.errors
                    }
            })
            .catch(response => {
                debugger

                return {
                    success: false,
                    errors: response.errors
                }
            })
    }

    // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/update
    // https://any-api.com/googleapis_com/sheets/docs/spreadsheets/sheets_spreadsheets_values_append
    async Insert(spreadsheetId, value) {
        const params = {
            spreadsheetId: spreadsheetId,
            range: "Keys!B:Z",
            valueInputOption: 'USER_ENTERED',
            insertDataOption: "INSERT_ROWS"
        };

        const valueRangeBody = { "values": [_.drop(value, 1)] };

        return gapi.client.sheets.spreadsheets.values.append(params, valueRangeBody)
            .then(response => {
                console.log(response.result);
                return response.result
            }, reason => {
                console.error('error: ' + reason.result.error.message);
                return reason.result.error.message
            });
    }

    // https://any-api.com/googleapis_com/sheets/docs/spreadsheets/sheets_spreadsheets_values_batchUpdate
    async Update(spreadsheetId, value, range) {
        const params = {
            spreadsheetId: spreadsheetId,
            range: `Keys!B${range}`,
            valueInputOption: 'USER_ENTERED',
        };

        const valueRangeBody = { "values": [_.drop(value, 1)] };

        return gapi.client.sheets.spreadsheets.values.update(params, valueRangeBody)
            .then(response => {
                if (response.status === 200) {
                    return {
                        success: true,
                        data: response.result
                    }
                } else {
                    return {
                        success: false,
                        data: response.result
                    }
                }
            }, reason => {
                return {
                    success: false,
                    data: reason.result.error.message
                }
            });
    }

    async Delete(spreadsheetId, range) {
        const requests = {
            deleteDimension: {
                range: {
                    dimension: "ROWS",
                    startIndex: range - 1,
                    endIndex: range
                }
            }
        }

        return this._batchUpdate(spreadsheetId, [requests])
    }

    // DeveloperMetadata Related
    async CreateDeveloperMetadata(spreadsheetId, key, value) {
        const requests = {
            "createDeveloperMetadata": {
                "developerMetadata": {
                    "metadataId": 1986,
                    "metadataKey": key,
                    "metadataValue": value,
                    "visibility": "DOCUMENT",
                    "location": {
                        "spreadsheet": true,
                    }
                }
            }
        }

        return this._batchUpdate(spreadsheetId, [requests])
    }

    async UpdateDeveloperMetadata(spreadsheetId, key = "headers", value) {
        const requests = {
            "updateDeveloperMetadata": {
                "dataFilters": [
                    {
                        "developerMetadataLookup": {
                            "metadataKey": key
                        }
                    }
                ],
                "developerMetadata": {
                    "metadataKey": key,
                    "metadataValue": value,
                    "visibility": "DOCUMENT",
                    "location": {
                        "spreadsheet": true,
                    }
                },
                "fields": "*"
            }
        }

        return this._batchUpdate(spreadsheetId, [requests])
    }

    async DeleteDeveloperMetadata(spreadsheetId, key = "headers") {
        const requests = {
            "deleteDeveloperMetadata": {
                "dataFilter": {
                    "developerMetadataLookup": {
                        "metadataKey": key
                    }
                }
            }
        }

        return this._batchUpdate(spreadsheetId, [requests])
    }

    async SearchDeveloperMetadata(spreadsheetId, searchKey) {
        gapi.client.sheets.spreadsheets.batchUpdate({
            "spreadsheetId": spreadsheetId,
            "resource": {
                "dataFilters": [
                    {
                        "developerMetadataLookup": {
                            "metadataKey": searchKey
                        }
                    }
                ]
            },
        }).then(response => {
            console.log(response)
            debugger
        })
    }

    async GetDeveloperMetadata(spreadsheetId, id = 1986) {
        return gapi.client.sheets.spreadsheets.developerMetadata.get({
            "spreadsheetId": spreadsheetId,
            "metadataId": id
        })
            .then(response => {
                if (response.status === 200) {
                    return {
                        success: true,
                        data: response.result
                    }
                } else {
                    return {
                        success: false,
                        data: response.errors
                    }
                }
            })
            .catch(response => {
                return {
                    success: false,
                    errors: response.result.error
                }
            })
    }

    async SaveSettings(spreadsheetId, settings) {
        return this.UpdateDeveloperMetadata(spreadsheetId, "headers", JSON.stringify(settings))
    }

    async ImportAllOptions(spreadsheetId) {
        return this._query(spreadsheetId, 0, 10000).then(response => {
            if (response.success) {
                const table = this._parseTable(response.data);
                const options = this._initOptions(this._columns, table.rows);

                return {
                    headers: options
                }
            } else {
                return this._handleError(response)
            }
        })
    }

    async _createDefaultDeveloperMetadata(spreadsheetId) {
        const defaultSettings = { "ID": { "id": "A", "label": "ID", "type": "number", "pattern": "General", "display": false }, "Title": { "id": "B", "label": "Title", "type": "steam_title", "isPrivate": false, "display": true, "isFilter": false, "sortable": false }, "Status": { "id": "C", "label": "Status", "type": "dropdown", "isPrivate": false, "options": { "allowEdit": false, "values": [{ "value": "Used", "color": "red" }, { "value": "Unused", "color": "green" }, { "value": "Traded", "color": "yellow" }, { "value": "Gifted", "color": "orange" }] }, "display": true, "isFilter": true, "sortable": true }, "Key": { "id": "D", "label": "Key", "type": "key", "isPrivate": true, "display": true, "isFilter": false, "sortable": false }, "From": { "id": "E", "label": "From", "type": "dropdown", "isPrivate": false, "options": { "allowEdit": true, "values": [{ "value": "Fanatical", "color": "green" }, { "value": "Indiegala", "color": "red" }, { "value": "Other", "color": "grey" }, { "value": "Amazon", "color": "brown" }, { "value": "Alienware", "color": "blue" }, { "value": "AMD", "color": "orange" }, { "value": "Indiegamestand", "color": "pink" }, { "value": "Sega", "color": "blue" }, { "value": "DigitalHomicide", "color": "brown" }, { "value": "Humblebundle", "color": "blue" }] }, "display": true, "isFilter": true, "sortable": true }, "Own Status": { "id": "F", "label": "Own Status", "type": "steam_ownership", "isPrivate": false, "options": { "allowEdit": false, "values": [{ "value": "Own", "color": "green" }, { "value": "Missing", "color": "red" }] }, "display": true, "isFilter": true, "sortable": true }, "Date Added": { "id": "G", "label": "Date Added", "type": "date", "pattern": "dd-mm-yyyy", "isPrivate": true, "display": true, "isFilter": true, "sortable": true }, "Note": { "id": "H", "label": "Note", "type": "text", "isPrivate": true, "display": true, "isFilter": false, "sortable": false }, "isthereanydeal URL": { "id": "I", "label": "isthereanydeal URL", "type": "url", "isPrivate": false, "display": true, "isFilter": false, "sortable": false }, "Steam URL": { "id": "J", "label": "Steam URL", "type": "steam_url", "isPrivate": false, "display": true, "isFilter": false, "sortable": false }, "Cards": { "id": "K", "label": "Cards", "type": "steam_cards", "isPrivate": false, "options": { "allowEdit": false, "values": [{ "value": "Have", "color": "green" }, { "value": "Missing", "color": "red" }] }, "display": true, "isFilter": true, "sortable": true }, "AppId": { "id": "L", "label": "AppId", "type": "steam_appid", "pattern": "General", "isPrivate": false, "display": true, "isFilter": false, "sortable": false } }

        return this._query(spreadsheetId, "", 0, 1)
            .then(response => {
                if (response.success) {
                    const columnSettings = response.data.table.cols

                    return this._getHeadersAndSettings(spreadsheetId)
                        .then(response => {
                            if (response.success) {
                                const newSettings = response.data.values.reduce((result, label, index) => {
                                    const parsedLabel = index === 0 ? 'ID' : label[0]
                                    return {
                                        ...result,
                                        [parsedLabel]: {
                                            ...columnSettings[index],
                                            label: parsedLabel
                                        }
                                    }
                                }, {})

                                return this.CreateDeveloperMetadata(spreadsheetId, "headers", JSON.stringify(defaultSettings))
                                    .then(response => {
                                        if (response.success) {
                                            return {
                                                headers: defaultSettings
                                            }
                                        }
                                    })
                            }
                        })
                }
            })
    }

    async _getMetadata(spreadsheetId) {
        return this.GetDeveloperMetadata(spreadsheetId)
            .then(response => {
                if (response.success) {
                    // console.log(response.data.metadataValue)
                    return {
                        success: true,
                        headers: JSON.parse(response.data.metadataValue)
                    }
                } else {
                    return this._createDefaultDeveloperMetadata(spreadsheetId)
                }
            })
            .catch(response => {
                return this._createDefaultDeveloperMetadata(spreadsheetId)
            })
    }

    async Initialize(spreadsheetId) {
        return this._getMetadata(spreadsheetId)

        // return this._getHeadersAndSettings(spreadsheetId)
        //     .then(response => {
        //         if (response.status === 200) {
        //             const headersWithSettings = this._getSettings(response.result.values[0], response.result.values[1])

        //             if (headersWithSettings[Object.keys(headersWithSettings)[1]].id) {
        //                 this.columns = headersWithSettings;

        //                 return {
        //                     headers: headersWithSettings
        //                 }
        //             } else {
        //                 return this._query(spreadsheetId, 0, 1).then(response => {
        //                     if (response.success) {
        //                         const data = response.data
        //                         const combinedHeadersAndSettings = this._combineHeadersAndSettings(data.table.cols, headersWithSettings)
        //                         this.columns = combinedHeadersAndSettings

        //                         this.SaveSettings(spreadsheetId, combinedHeadersAndSettings)

        //                         return {
        //                             headers: combinedHeadersAndSettings
        //                         }
        //                     } else {
        //                         this._handleError(response)
        //                     }
        //                 })
        //             }
        //         } else { console.error('GetHeadersAndSettings Error', response) }
        //     })
    }

    async GetFilteredData(spreadsheetId, titleQuery, offset, limit, orderBy, filters) {
        return offset > 0
            ? this._query(spreadsheetId, titleQuery, offset, limit, orderBy, filters)
                .then(response => {
                    if (response.success) {
                        return {
                            ...response,
                            data: { rows: this._parseTable(response.data).rows }
                        }
                    } else {
                        return this._handleError(response)
                    }
                })
            : this._queryCount(spreadsheetId, titleQuery, offset, limit, orderBy, filters)
                .then(response => {
                    if (response.success) {
                        const count = response.data.count

                        return this._query(spreadsheetId, titleQuery, offset, limit, orderBy, filters)
                            .then(response => {
                                if (response.success) {
                                    return {
                                        ...response,
                                        data: { rows: this._parseTable(response.data).rows, count: count - 1 }
                                    }
                                }
                                else {
                                    return this._handleError(response)
                                }
                            })
                    } else {
                        return response
                    }
                })
    }

    async ExportSpreadsheet(fromSpreadsheet, privateColumnsRange, username) {
        const title = `${username}'s Collection`

        return this._createNewSpreadsheet(title)
            .then(response => {
                if (response.success) {
                    const newSpreadsheetId = response.data.spreadsheetId
                    const newSpreadsheetUrl = response.data.spreadsheetUrl

                    return this._copySheetToSpreadsheet(fromSpreadsheet, 0, newSpreadsheetId)
                        .then(response => {
                            if (response.success) {
                                const deleteRequests = privateColumnsRange.reduce((result, id) => (_.concat(result, [{
                                    deleteDimension: {
                                        range: {
                                            sheetId: response.data.sheetId,
                                            dimension: "COLUMNS",
                                            startIndex: id,
                                            endIndex: id + 1
                                        }
                                    }
                                }])), [])
                                const deleteSheetRequest = {
                                    "deleteSheet": {
                                        "sheetId": 0,
                                    }
                                }

                                return this._batchUpdate(newSpreadsheetId, _.concat(deleteRequests, [deleteSheetRequest]))
                                    .then(response => {
                                        return response.success
                                            ? {
                                                success: true,
                                                data: {
                                                    spreadsheetId: newSpreadsheetId,
                                                    spreadsheetUrl: newSpreadsheetUrl
                                                }
                                            }
                                            : {
                                                success: false,
                                                errors: "Failed exporting"
                                            }
                                    })
                            } else {
                                return response
                            }
                        })
                }
            })
    }
}

const Spreadsheets = new Spreashsheets();
export default Spreadsheets;