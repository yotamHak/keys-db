import { gapi } from 'gapi-script';
import axios from "axios";
import _ from "lodash";
import { isUrl, isSteamKey, genericSort, parseSpreadsheetDate } from '../utils';

class Spreashsheets {
    constructor() {
        this._spreadsheetId = '';
        this._token = '';
        this._columns = {};
        this._columnsWithOptions = {};
        this._rows = [];
        this._count = 0;
    }

    get token() {
        if (this._token === '') { this._token = localStorage.getItem('gTokenId') }

        return this._token
    }

    set spreadsheetId(id) { this._spreadsheetId = id; }

    get rows() { return this._rows }
    set rows(rows) { this._rows = rows; }

    get columns() { return this._columns }
    set columns(columns) {
        this._columns = columns
        // .filter(column => column.label)
        // .reduce((result, column) => {
        //     return {
        //         ...result,
        //         ...{ [column.label]: column }
        //     }
        // }, {})
    }

    _spreadsheetUrlPrefix = (spreadsheetId) => `https://docs.google.com/a/google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tq=`

    _handleError = (response) => {
        console.error(response.errors);
        return response
    }

    _get = async (url) => axios.get(url, { headers: { 'Content-Type': 'application/json; charset=UTF-8', Authorization: _.concat('Bearer ', this.token) } })
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
            const parsedResponse = JSON.parse(reason.data.slice(reason.data.indexOf("{"), reason.data.length - 2));

            return {
                success: false,
                errors: parsedResponse.errors
            }
        })

    _getColumn = key => this.columns[key].id

    // { key: 'From', values: ['Humblebundle'] }, { key: 'Status', values: ['Unused', 'Given'] }
    _parseFilters(filters = []) {
        if (_.isEmpty(filters)) { return "" }

        const filtersArray = filters.reduce((result, filter) => _.concat(
            result,
            [filter.values.map(value => ({ [this._getColumn(filter.key)]: `'${value}'` }))]
        ), [])
        return _.join(filtersArray.map(group => `(${_.join(group.map(item => `${Object.keys(item)[0]} = ${item[Object.keys(item)[0]]}`), ' or ')})`), ' and ')
    }

    _createQueryString(textQuery = "", offset = 0, limit = 24, orderBy = { sort: "Date Added", asc: false }, filters = [], range = "*", countOnly = false) {
        const select = `select ${range}`
        const where = _.isEmpty(filters)
            ? `${textQuery !== "" ? `where lower(B) contains lower('${textQuery}')` : ``}`
            : `where ${textQuery !== "" ? `lower(B) contains lower('${textQuery}') and` : ``} ${this._parseFilters(filters)}`
        const order = orderBy
            ? `order by ${orderBy.sort && !_.isEmpty(this.columns) ? this._getColumn(orderBy.sort) : "G"} ${orderBy.asc ? "asc" : "desc"}`
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
    _query = async (titleQuery, offset, limit, orderBy, filters) => this._get(`${this._spreadsheetUrlPrefix(this._spreadsheetId)}${this._createQueryString(titleQuery, offset, limit, orderBy, filters)}`)

    _queryCount = async (titleQuery, offset, limit, orderBy, filters) => {
        return this._get(`${this._spreadsheetUrlPrefix(this._spreadsheetId)}${this._createQueryString(titleQuery, offset, limit, orderBy, filters, '*', true)}`)
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
    }

    async _getHeadersAndSettings(spreadsheetId) {
        return gapi.client.sheets.spreadsheets.values.get({
            "spreadsheetId": spreadsheetId,
            "range": "A1:Z2",
            "majorDimension": "ROWS"
        })
            .then(response => response)
            .catch(reason => console.log(reason))
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
                // console.log(response.result);
                return response.result
            }, reason => {
                // console.error('error: ' + reason.result.error.message);
                return reason.result.error.message
            });
    }

    // DeveloperMetadata Related
    async CreateDeveloperMetadata(spreadsheetId, key, value) {
        gapi.client.sheets.spreadsheets.batchUpdate({
            "spreadsheetId": spreadsheetId,
            "requests": [
                {
                    "createDeveloperMetadata": {
                        "developerMetadata": {
                            "metadataId": 0,
                            "metadataKey": key,
                            "metadataValue": value,
                            "visibility": "DOCUMENT",
                            "location": {
                                "spreadsheet": true,
                            }
                        }
                    }
                }
            ],
        }).then(response => {
            console.log(response)
            debugger
        })
    }

    async UpdateDeveloperMetadata(spreadsheetId, key = "headers", value) {
        gapi.client.sheets.spreadsheets.batchUpdate({
            "spreadsheetId": spreadsheetId,
            "requests": [
                {
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
            ],
        }).then(response => {
            console.log(response)
            debugger
        })
    }

    async DeleteDeveloperMetadata(spreadsheetId, key = "headers") {
        gapi.client.sheets.spreadsheets.batchUpdate({
            "spreadsheetId": spreadsheetId,
            "requests": [
                {
                    "deleteDeveloperMetadata": {
                        "dataFilter": {
                            "developerMetadataLookup": {
                                "metadataKey": key
                            }
                        }
                    }
                }
            ],
        }).then(response => {
            console.log(response)
            debugger
        })
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
        gapi.client.sheets.spreadsheets.developerMetadata.get({
            "spreadsheetId": spreadsheetId,
            "metadataId": id
        }).then(response => {
            debugger
            if (response.status === 200) {
                return {
                    success: true,
                    result: response.result
                }
            } else {
                return {
                    success: false,
                    result: response.errors
                }
            }
        })
    }

    async Delete(range) {
        const params = {
            spreadsheetId: this._spreadsheetId,
            requests: [
                {
                    deleteDimension: {
                        range: {
                            dimension: "ROWS",
                            startIndex: range - 1,
                            endIndex: range
                        }
                    }
                }
            ],
        }

        return gapi.client.sheets.spreadsheets.batchUpdate(params)
            .then(response => {
                // console.log(response.result);
                return response.result
            }, reason => {
                // console.error('error: ' + reason.result.error.message);
                return reason.result.error.message
            });
    }

    async SaveSettings(spreadsheetId, settings) {
        const newValues = Object.keys(settings)
            .filter(header => header !== "ID")
            .sort((a, b) => a.id > b.id)
            .reduce((result, key) => {
                return _.concat(
                    result,
                    ...[JSON.stringify(settings[key])]
                )
            }, [])

        return gapi.client.sheets.spreadsheets.values.update({
            "spreadsheetId": spreadsheetId,
            "range": "Keys!A2:Z2",
            "valueInputOption": "USER_ENTERED",
            "resource": {
                "values": [
                    [
                        "=ArrayFormula(ROW(A2:A))",
                        ...newValues
                    ]
                ]
            }
        })
            .then(response => {
                if (response.status === 200) {
                    return {
                        success: true,
                        result: response.result
                    }
                } else {
                    return {
                        success: false,
                        result: response.errors
                    }
                }
            })
            .catch(reason => {
                console.error(reason)
                return {
                    success: false,
                    result: reason.errors
                }
            })
    }

    async ImportAllOptions(spreadsheetId) {
        return this._query(0, 10000).then(response => {
            if (response.success) {
                const table = this._parseTable(response.data);
                const options = this._initOptions(this._columns, table.rows);

                return {
                    headers: options
                }
            } else {
                this._handleError(response)
            }
        })
    }

    async Initialize(spreadsheetId) {
        this.spreadsheetId = spreadsheetId

        return this._getHeadersAndSettings(spreadsheetId)
            .then(response => {
                if (response.status === 200) {
                    const headersWithSettings = this._getSettings(response.result.values[0], response.result.values[1])

                    if (headersWithSettings[Object.keys(headersWithSettings)[1]].id) {
                        this.columns = headersWithSettings;

                        return {
                            headers: headersWithSettings
                        }
                    } else {
                        return this._query(0, 1).then(response => {
                            if (response.success) {
                                const data = response.data
                                const combinedHeadersAndSettings = this._combineHeadersAndSettings(data.table.cols, headersWithSettings)
                                this.columns = combinedHeadersAndSettings

                                this.SaveSettings(spreadsheetId, combinedHeadersAndSettings)

                                return {
                                    headers: combinedHeadersAndSettings
                                }
                            } else {
                                this._handleError(response)
                            }
                        })
                    }
                } else { console.error('GetHeadersAndSettings Error', response) }
            })
    }

    async GetFilteredData(titleQuery, offset, limit, orderBy, filters) {
        return offset > 0
            ? this._query(titleQuery, offset, limit, orderBy, filters)
                .then(response => {
                    if (response.success) {
                        return {
                            ...response,
                            data: { headers: this._columns, rows: this._parseTable(response.data).rows }
                        }
                    } else {
                        this._handleError(response)
                    }
                })
            : this._queryCount(titleQuery, offset, limit, orderBy, filters)
                .then(response => {
                    if (response.success) {
                        const count = response.data.count

                        return this._query(titleQuery, offset, limit, orderBy, filters)
                            .then(response => {
                                if (response.success) {
                                    if (response.data.table.cols.every(item => item.label === '')) {
                                        return {
                                            ...response,
                                            data: { headers: this._columns, rows: [], count: 0 }
                                        }
                                    } else {
                                        this.rows = this._parseTable(response.data).rows

                                        return {
                                            ...response,
                                            data: { headers: this._columns, rows: this.rows, count: count - 1 }
                                        }
                                    }
                                }
                                else {
                                    this._handleError(response)
                                }
                            })
                    } else {
                        return response
                    }
                })
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
        const params = {
            spreadsheetId: spreadsheetId,
            requests: rangeArray.reduce((result, id) => (_.concat(result, [{
                deleteDimension: {
                    range: {
                        sheetId: sheetId,
                        dimension: "COLUMNS",
                        startIndex: id,
                        endIndex: id + 1
                    }
                }
            }])), []),
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
            .catch(response => ({
                success: false,
                errors: response.errors
            }))
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
            .catch(response => ({
                success: false,
                errors: response.errors
            }))
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


        return this._copyCleanSheet(fromSpreadsheet)
            .then(response => {
                if (response.success) {
                    const newSheetId = response.data.sheetId

                    this._deleteColumns(fromSpreadsheet, newSheetId, privateColumnsRange.reverse())
                        .then(response => {
                            if (response.success) {
                                this._deleteSheet(fromSpreadsheet, newSheetId)

                                const title = `${username}'s Collection`

                                this._createNewSpreadsheet(title)
                                    .then(response => {
                                        if (response.success) {
                                            const newSpreadsheetId = response.data.spreadsheetId
                                            const newSpreadsheetUrl = response.data.spreadsheetUrl

                                            this._copySheetToSpreadsheet(fromSpreadsheet, newSheetId, newSpreadsheetId)
                                                .then(response => {
                                                    if (response.success) {
                                                        console.log(newSpreadsheetUrl)
                                                    }
                                                })
                                        }
                                    })
                            }
                        })
                }
            })

        return
        this._createNewSpreadsheet()
            .then(response => {
                if (response.status === 200) {
                    const newSpreadsheetId = response.result.spreadsheetId
                    const newSpreadsheetUrl = response.result.spreadsheetUrl

                    gapi.client.sheets.spreadsheets.sheets.copyTo({
                        "spreadsheetId": fromSpreadsheet,
                        "sheetId": 0,
                        "resource": {
                            "destinationSpreadsheetId": newSpreadsheetId
                        }
                    })
                        .then(response => {
                            debugger

                            if (response.status === 200) {

                            }
                        })

                } else {

                }
            })
    }
}
const Spreadsheets = new Spreashsheets();
export default Spreadsheets;