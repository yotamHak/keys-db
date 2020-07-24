import { gapi } from 'gapi-script';
import axios from "axios";
import _ from "lodash";
import { isUrl, isSteamKey, genericSort, parseSpreadsheetDate, SPREADSHEET_METADATA_HEADERS_ID, SPREADSHEET_METADATA_PERMISSIONS_ID, SPREADSHEET_METADATA_DEFAULT_SETTINGS, getLabelByIndex } from '../utils';

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

    _getDeleteRequest(range) {
        return {
            deleteDimension: {
                range: {
                    dimension: "ROWS",
                    startIndex: range - 1,
                    endIndex: range
                }
            }
        }
    }

    _getCreateDeveloperMetadataRequest(id, key, value) {
        return {
            "createDeveloperMetadata": {
                "developerMetadata": {
                    "metadataId": id,
                    "metadataKey": key,
                    "metadataValue": value,
                    "visibility": "DOCUMENT",
                    "location": {
                        "spreadsheet": true,
                    }
                }
            }
        }
    }

    _getUpdateDeveloperMetadataRequest(key = "headers", value) {
        return {
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
    }

    _getDeleteDeveloperMetadataRequest(key = "headers") {
        return {
            "deleteDeveloperMetadata": {
                "dataFilter": {
                    "developerMetadataLookup": {
                        "metadataKey": key
                    }
                }
            }
        }
    }

    _getDeleteSheetRequest(sheetId) {
        return {
            "deleteSheet": {
                "sheetId": sheetId
            }
        }
    }

    _getDeleteDimensionRequest(sheetId, dimension, startIndex, endIndex) {
        let request = {
            "deleteDimension": {
                "range": {
                    "sheetId": sheetId,
                    "dimension": dimension,
                    "startIndex": startIndex,
                }
            }
        }

        if (endIndex) {
            request.deleteDimension.range.endIndex = endIndex
        }

        return request
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
                return {
                    success: false,
                    errors: response.result.error
                }
            })
    }

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
        const requests = rangeArray.reduce((result, id) => (_.concat(result, [this._getDeleteDimensionRequest(sheetId, "COLUMNS", id, id + 1)])), [])

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

    // async _deleteSheet(spreadsheetId, sheetId) {
    //     return gapi.client.sheets.spreadsheets.batchUpdate({
    //         "spreadsheetId": spreadsheetId,
    //         "resource": {
    //             "requests": [
    //                 {
    //                     "deleteSheet": {
    //                         "sheetId": sheetId
    //                     }
    //                 }
    //             ]
    //         }
    //     })
    //         .then(response => {
    //             return response.status === 200
    //                 ? {
    //                     success: true,
    //                     data: response.result
    //                 }
    //                 : {
    //                     success: false,
    //                     errors: response.errors
    //                 }
    //         })
    //         .catch(response => ({
    //             success: false,
    //             errors: response.errors
    //         }))
    // }



    // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/update
    // https://any-api.com/googleapis_com/sheets/docs/spreadsheets/sheets_spreadsheets_values_append
    async Insert(spreadsheetId, value) {
        const params = {
            spreadsheetId: spreadsheetId,
            range: "B:Z",
            valueInputOption: 'USER_ENTERED',
            insertDataOption: "INSERT_ROWS"
        };

        const valueToAppend = _.isArray(value) && value.length === 1 ? [_.drop(value, 1)] : value.reduce((result, row) => _.concat(result, [_.drop(row)]), [])
        const valueRangeBody = { "values": valueToAppend };

        return gapi.client.sheets.spreadsheets.values.append(params, valueRangeBody)
            .then(response => {
                if (response.status === 200) {
                    return {
                        "success": true,
                        data: response.result
                    }
                }

                console.log(response.result);
                return response.result
            }, reason => {
                return {
                    "success": false,
                    "errors": reason.result.error
                }
            });
    }

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
        return this._batchUpdate(spreadsheetId, [this._getDeleteRequest(range)])
    }

    // DeveloperMetadata Related
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

    async GetDeveloperMetadata(spreadsheetId, id = SPREADSHEET_METADATA_HEADERS_ID) {
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

    async _searchDeveloperMetadataByIds(spreadsheetId, ids) {
        if (!_.isArray(ids)) { return { success: false, error: "ids input isn't an array" } }

        return gapi.client.sheets.spreadsheets.developerMetadata.search({
            "spreadsheetId": spreadsheetId,
            "resource": {
                "dataFilters": ids.reduce((result, id) => (_.concat(result, [{ "developerMetadataLookup": { "metadataId": id } }])), [])
            }
        })
            .then(function (response) {
                if (response.status === 200) {
                    if (_.isEmpty(response.result)) {
                        return {
                            "success": false,
                            "data": {
                                "status": "Missing Metadata",
                                "Missing": ids
                            }
                        }
                    } else if (response.result.matchedDeveloperMetadata.length !== ids.length) {
                        const missingIds = _.without(ids, ...response.result.matchedDeveloperMetadata.reduce((result, metadata) => _.concat(result, [metadata.developerMetadata.metadataId]), []))

                        return {
                            "success": false,
                            "data": {
                                "status": "Missing Metadata",
                                "Missing": missingIds
                            }
                        }
                    } else {
                        return {
                            "success": true,
                            "data": response.result.matchedDeveloperMetadata
                        }
                    }
                }
            })
    }

    async SaveSettings(spreadsheetId, settings) {
        return this._batchUpdate(spreadsheetId, [this._getUpdateDeveloperMetadataRequest("headers", JSON.stringify(settings))])
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
        const headersRequest = this._getCreateDeveloperMetadataRequest(SPREADSHEET_METADATA_HEADERS_ID, "headers", JSON.stringify(SPREADSHEET_METADATA_DEFAULT_SETTINGS))
        const permissionsRequest = this._getCreateDeveloperMetadataRequest(SPREADSHEET_METADATA_PERMISSIONS_ID, "permissions", "owner")

        return this._batchUpdate(spreadsheetId, _.concat([headersRequest], [permissionsRequest]))
            .then(response => {
                if (response.success) {
                    return {
                        headers: SPREADSHEET_METADATA_DEFAULT_SETTINGS
                    }
                }
            })

        // return this._query(spreadsheetId, "", 0, 1)
        //     .then(response => {
        //         if (response.success) {
        //             return this._getHeadersAndSettings(spreadsheetId)
        //                 .then(response => {
        //                     if (response.success) {

        //                     }
        //                 })
        //         }
        //     })
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
                }
            })
            .catch(response => this._createDefaultDeveloperMetadata(spreadsheetId))
    }

    async Initialize(spreadsheetId) {
        return this._searchDeveloperMetadataByIds(spreadsheetId, [SPREADSHEET_METADATA_HEADERS_ID, SPREADSHEET_METADATA_PERMISSIONS_ID])
            .then(response => {
                if (response.success) {
                    return response.data.reduce((result, metadata) => {
                        let value;

                        try {
                            value = JSON.parse(metadata.developerMetadata.metadataValue)
                        } catch (error) {
                            value = metadata.developerMetadata.metadataValue
                        }

                        return {
                            ...result,
                            [metadata.developerMetadata.metadataKey]: value
                        }
                    }, { "success": true })
                } else {
                    const requests = response.data.Missing.reduce((result, id) => {
                        if (id === SPREADSHEET_METADATA_HEADERS_ID) {
                            return _.concat(result, [this._getCreateDeveloperMetadataRequest(SPREADSHEET_METADATA_HEADERS_ID, "headers", JSON.stringify(SPREADSHEET_METADATA_DEFAULT_SETTINGS))])
                        } else if (id === SPREADSHEET_METADATA_PERMISSIONS_ID) {
                            return _.concat(result, [this._getCreateDeveloperMetadataRequest(SPREADSHEET_METADATA_PERMISSIONS_ID, "permissions", "owner")])
                        } else {
                            return result
                        }
                    }, [])

                    return this._batchUpdate(spreadsheetId, requests)
                        .then(response => {
                            if (response.success) {
                                return {
                                    "success": true,
                                    "headers": SPREADSHEET_METADATA_DEFAULT_SETTINGS,
                                    "permissions": "owner",
                                }
                            }
                        })
                }
            })
            .catch(response => ({ success: false, error: response.result.error.status }))

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

    async ExportSpreadsheet(fromSpreadsheet, privateColumnsRange, filters, username, currentSettings) {
        function handleError(functionName) {
            return {
                "success": false,
                "errors": `Failed exporting: ${functionName}`
            }
        }

        return this.GetFilteredData(fromSpreadsheet, "", 0, 99999, null, filters).then(response => {
            if (!response.success) { return handleError("GetFilteredData") }

            const title = `${username}'s Collection`

            const newRows = response.data.rows.reduce((result, row) => {
                return _.concat(
                    result,
                    [row.reduce((result, col, index) => {
                        return _.concat(
                            result,
                            privateColumnsRange.indexOf(index) > -1 ? [""] : [col]
                        )
                    }, [])]
                )
            }, [])

            return this._createNewSpreadsheet(title).then(response => {
                if (!response.success) { return handleError("_createNewSpreadsheet") }

                const newSpreadsheetId = response.data.spreadsheetId
                const newSpreadsheetUrl = response.data.spreadsheetUrl

                return this._copySheetToSpreadsheet(fromSpreadsheet, 0, newSpreadsheetId).then(response => {
                    if (!response.success) { return handleError("_copySheetToSpreadsheet") }

                    const newSheetId = response.data.sheetId

                    const deleteRowsRequest = this._getDeleteDimensionRequest(response.data.sheetId, "ROWS", 3)
                    const deleteSheetRequest = this._getDeleteSheetRequest(0)

                    return this._batchUpdate(newSpreadsheetId, _.concat([deleteRowsRequest], [deleteSheetRequest])).then(response => {
                        if (!response.success) { return handleError("_batchUpdate") }

                        return this.Insert(newSpreadsheetId, newRows).then(response => {
                            if (!response.success) { return handleError("Insert") }

                            let newId = 0

                            const cleanSettings = Object.keys(currentSettings).reduce((result, headerKey) => {
                                if (currentSettings[headerKey].isPrivate) {
                                    return result
                                } else {
                                    return {
                                        ...result,
                                        [headerKey]: {
                                            ...currentSettings[headerKey],
                                            id: getLabelByIndex(newId++)
                                        }
                                    }
                                }
                            }, {})

                            const headersRequest = this._getCreateDeveloperMetadataRequest(SPREADSHEET_METADATA_HEADERS_ID, "headers", JSON.stringify(cleanSettings))
                            const permissionRequest = this._getCreateDeveloperMetadataRequest(SPREADSHEET_METADATA_PERMISSIONS_ID, "permission", "viewer")
                            const deleteRequests = privateColumnsRange.reduce((result, id) => (_.concat(result, [this._getDeleteDimensionRequest(newSheetId, "COLUMNS", id, id + 1)])), []).reverse()

                            return this._batchUpdate(newSpreadsheetId, _.concat([headersRequest], [permissionRequest], deleteRequests)).then(response => {
                                return response.success
                                    ? {
                                        "success": true,
                                        "data": {
                                            "spreadsheetId": newSpreadsheetId,
                                            "spreadsheetUrl": newSpreadsheetUrl
                                        }
                                    }
                                    : handleError("_batchUpdate")
                            })
                        })
                    })
                })
            })
        })
    }
}

const Spreadsheets = new Spreashsheets();
export default Spreadsheets;