import { gapi } from 'gapi-script';
import axios from "axios";
import _ from "lodash";
import {
    SPREADSHEET_METADATA_HEADERS_ID,
    SPREADSHEET_METADATA_PERMISSIONS_ID,
    SPREADSHEET_METADATA_DEFAULT_SETTINGS,
    SPREADSHEET_METADATA_SHEET_ID,
    SPREADSHEET_IMPORT_TEMPLATE_SPREADSHEET_ID,
    getLabelByIndex,
    SPREADSHEET_TEMPLATE_SPREADSHEET_ID,
} from '../../utils';

// https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/request
const _requests = {
    DeleteRequest: (sheetId, range) => ({
        deleteDimension: {
            range: {
                sheetId: sheetId,
                dimension: "ROWS",
                startIndex: range - 1,
                endIndex: range
            }
        }
    }),
    UpdateSheetPropertiesRequest: (sheetId, props) => ({
        "updateSheetProperties": {
            "properties": {
                sheetId: sheetId,
                ...props
            },
            "fields": Object.keys(props).toString()
        }
    }),
    CreateDeveloperMetadataRequest: (id, key, value) => ({
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
    }),
    UpdateDeveloperMetadataRequest: (key = "headers", value) => ({
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
    }),
    DeleteDeveloperMetadataRequest: (key = "headers") => ({
        "deleteDeveloperMetadata": {
            "dataFilter": {
                "developerMetadataLookup": {
                    "metadataKey": key
                }
            }
        }
    }),
    DeleteSheetRequest: sheetId => ({
        "deleteSheet": {
            "sheetId": sheetId
        }
    }),
    DeleteDimensionRequest: (sheetId, dimension, startIndex, endIndex) => {
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
    },
    UpdateCellsRequest: (sheetId, rowsWithValues, startRowIndex, startColumnIndex, endColumnIndex) => {
        const rows = rowsWithValues.reduce((rowsResult, row) => {
            return _.concat(
                rowsResult,
                [
                    {
                        "values": row.reduce((valuesResult, value) => {
                            return _.concat(
                                valuesResult,
                                [
                                    {
                                        "userEnteredValue": {
                                            "stringValue": value
                                        }
                                    }
                                ]
                            )
                        }, [])
                    }
                ]
            )
        }, [])

        let request = {
            "updateCells": {
                "rows": rows,
                "fields": "userEnteredValue",
                "range": {
                    "sheetId": sheetId,
                    "startRowIndex": startRowIndex,
                    "endRowIndex": startRowIndex + rows.length,
                    "startColumnIndex": startColumnIndex,
                    // "endColumnIndex": rowsWithValues[0].length
                }
            }
        }

        return request
    },
    AppendDimensionRequest: (sheetId, dimension, length) => ({
        "appendDimension": {
            "sheetId": sheetId,
            "dimension": dimension,
            "length": length
        }
    }),
    InsertDimensionRequest: (sheetId, dimension, startRowIndex, endRowIndex) => ({
        "insertDimension": {
            "inheritFromBefore": true,
            "range": {
                "sheetId": sheetId,
                "dimension": dimension,
                "startIndex": startRowIndex,
                "endIndex": startRowIndex + endRowIndex,
            }
        }
    }),
    /**
     * Available props: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/sheets#DimensionProperties
     * hiddenByFilter: boolean
     * hiddenByUser: boolean
     * pixelSize: integer
     * developerMetadata[]: object
     */
    updateDimensionProperties: (sheetId, dimension, startRowIndex, endRowIndex, props) => ({
        "insertDimension": {
            "properties": {
                ...props
            },
            "range": {
                "sheetId": sheetId,
                "dimension": dimension,
                "startIndex": startRowIndex,
                "endIndex": startRowIndex + endRowIndex,
            },
            "fields": Object.keys(props).toString()
        }
    }),
}

async function _batchUpdate(spreadsheetId, requests) {
    const params = {
        spreadsheetId: spreadsheetId,
        requests: requests,
        includeSpreadsheetInResponse: true,
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

const _queryUrl = (spreadsheetId, queryString) => `https://docs.google.com/a/google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tq=${queryString}`

const _handleError = async response => {
    console.error(response.errors);
    return response
}

const _get = async url => axios
    .get(url, { headers: { 'Content-Type': 'application/json; charset=UTF-8', Authorization: _.concat('Bearer ', localStorage.getItem('gTokenId')) } })
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

function _parseFilters(filters = []) {
    if (_.isEmpty(filters)) { return "" }

    const filtersArray = filters.reduce((result, filter) => _.concat(
        result,
        [filter.values.map(value => ({ [filter.id]: `'${value}'` }))]
    ), [])

    return _.join(filtersArray.map(group => `(${_.join(group.map(item => `${Object.keys(item)[0]} = ${item[Object.keys(item)[0]]}`), ' or ')})`), ' and ')
}

function _createQueryString(textQuery = "", offset = 0, limit = 24, orderBy = { sort: "A", asc: false }, filters = [], range = "*", countOnly = false) {
    const select = `select ${range}`
    const where = _.isEmpty(filters)
        ? `${textQuery !== "" ? `where lower(B) contains lower('${textQuery}')` : ``}`
        : `where ${textQuery !== "" ? `lower(B) contains lower('${textQuery}') and` : ``} ${_parseFilters(filters)}`
    const order = orderBy
        ? `order by ${orderBy.sort} ${orderBy.asc ? "asc" : "desc"}`
        : ``
    const offsetAndLimit = `limit ${limit} offset ${offset}`

    return countOnly
        ? encodeURIComponent(`select count(A) ${where}`)
        : encodeURIComponent(`${select} ${where} ${order} ${offsetAndLimit}`)
}

function _parseTable(response) {
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

// https://developers.google.com/chart/interactive/docs/querylanguage
async function _query(spreadsheetId, titleQuery, offset, limit, orderBy, filters) { return _get(_queryUrl(spreadsheetId, _createQueryString(titleQuery, offset, limit, orderBy, filters))) }

async function _queryCount(spreadsheetId, titleQuery, offset, limit, orderBy, filters) {
    return _get(_queryUrl(spreadsheetId, _createQueryString(titleQuery, offset, limit, orderBy, filters, '*', true)))
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

async function _getSpreadsheet(spreadsheetId, includeGridData = false) {
    return gapi.client.sheets.spreadsheets.get({
        "spreadsheetId": spreadsheetId,
        "includeGridData": includeGridData
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
                    data: response
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

async function _createNewSpreadsheet(title) {
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

async function _copySheetToSpreadsheet(fromSpreadsheet, fromSheetId, toSpreadsheet) {
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

async function _searchDeveloperMetadataByIds(spreadsheetId, ids) {
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
                            "missing": ids,
                        }
                    }
                } else if (response.result.matchedDeveloperMetadata.length !== ids.length) {
                    const missingIds = _.without(ids, ...response.result.matchedDeveloperMetadata.reduce((result, metadata) => _.concat(result, [metadata.developerMetadata.metadataId]), []))

                    return {
                        "success": false,
                        "data": {
                            "status": "Missing Metadata",
                            "missing": missingIds,
                            "matched": response.result.matchedDeveloperMetadata
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

// https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/update
// https://any-api.com/googleapis_com/sheets/docs/spreadsheets/sheets_spreadsheets_values_append
async function Insert(spreadsheetId, sheetId, values, range = "B:Z") {
    const params = {
        spreadsheetId: spreadsheetId,
        sheetId: sheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: "INSERT_ROWS"
    };

    const valueToAppend = values.reduce((result, row) => _.concat(result, [_.drop(row)]), [])
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
        })
        .catch(reason => ({
            "success": false,
            "errors": reason.result.error
        }))
}

async function Update(spreadsheetId, sheetId, values, range) {
    const params = {
        spreadsheetId: spreadsheetId,
        sheetId: sheetId,
        range: `B${range}`,
        valueInputOption: 'USER_ENTERED',
    };

    const valueRangeBody = { "values": [_.drop(values, 1)] };

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
        })
        .catch(reason => {
            return {
                success: false,
                data: reason.result.error.message
            }
        })
}

async function Delete(spreadsheetId, sheetId, range) {
    return _batchUpdate(spreadsheetId, [_requests.DeleteRequest(sheetId, range)])
}

async function SaveSettings(spreadsheetId, sheetId, settings) {
    const updatedSettings = Object.keys(settings).reduce((result, settingKey, index) => ({
        ...result,
        [settingKey]: {
            ...settings[settingKey],
            id: String.fromCharCode((index + 1 % 24) + 64)
        }
    }), {})

    const requestsArray = [
        _requests.UpdateDeveloperMetadataRequest("headers", JSON.stringify(updatedSettings)),
        _requests.UpdateCellsRequest(sheetId, [Object.keys(updatedSettings).reduce((result, key) => (_.concat(result, [updatedSettings[key].label])), [])], 0, 0),
    ]

    const batchUpdateResponse = await _batchUpdate(spreadsheetId, requestsArray)

    return batchUpdateResponse.success
        ? {
            success: true,
            data: {
                updatedSettings: updatedSettings
            }
        }
        : batchUpdateResponse
}

async function Initialize(spreadsheetId) {
    const _handleBatchUpdateResponse = (response, matchedMetadata,) => {
        if (response.success) {
            const createdMetadata = response.data.replies.reduce((result, metadata) => {
                let value;

                try {
                    value = JSON.parse(metadata.createDeveloperMetadata.developerMetadata.metadataValue)
                } catch (error) {
                    value = metadata.createDeveloperMetadata.developerMetadata.metadataValue
                }

                return {
                    ...result,
                    [metadata.createDeveloperMetadata.developerMetadata.metadataKey]: value
                }
            }, {})

            return {
                "success": true,
                ...matchedMetadata,
                ...createdMetadata,
            }
        }
    }

    const _handleDeveloperMetadata = (data,) => {
        return data.reduce((result, metadata) => {
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
        }, {})
    }

    const searchDeveloperMetadataByIdsResponse = await _searchDeveloperMetadataByIds(spreadsheetId, [SPREADSHEET_METADATA_HEADERS_ID, SPREADSHEET_METADATA_PERMISSIONS_ID, SPREADSHEET_METADATA_SHEET_ID])

    if (searchDeveloperMetadataByIdsResponse.success) {
        return {
            "success": true,
            ..._handleDeveloperMetadata(searchDeveloperMetadataByIdsResponse.data)
        }
    }

    if (searchDeveloperMetadataByIdsResponse.data.missing.find(missingId => missingId === SPREADSHEET_METADATA_SHEET_ID)) {

    }
    if (searchDeveloperMetadataByIdsResponse.data.missing.find(missingId => missingId === SPREADSHEET_METADATA_PERMISSIONS_ID)) {

    }
    if (searchDeveloperMetadataByIdsResponse.data.missing.find(missingId => missingId === SPREADSHEET_METADATA_HEADERS_ID)) {
        return {
            "success": false,
            "error": "MISSING_SETTINGS"
        }
    }

    let missingSheetId = false

    const matchedMetadata = _handleDeveloperMetadata(searchDeveloperMetadataByIdsResponse.data.matched)
    const requests = searchDeveloperMetadataByIdsResponse.data.missing.reduce((result, id) => {
        switch (id) {
            // case SPREADSHEET_METADATA_HEADERS_ID:
            // Missing settings metadata
            // return _.concat(result, [_requests.CreateDeveloperMetadataRequest(SPREADSHEET_METADATA_HEADERS_ID, "headers", JSON.stringify(SPREADSHEET_METADATA_DEFAULT_SETTINGS))])
            case SPREADSHEET_METADATA_PERMISSIONS_ID:
                return _.concat(result, [_requests.CreateDeveloperMetadataRequest(SPREADSHEET_METADATA_PERMISSIONS_ID, "permissions", "owner")])
            case SPREADSHEET_METADATA_SHEET_ID:
                missingSheetId = true
                return result
            default:
                return result
        }
    }, [])

    if (missingSheetId) {
        const getSpreadsheetResponse = await _getSpreadsheet(spreadsheetId)
        const sheetId = getSpreadsheetResponse.data.sheets[0].properties.sheetId
        const batchUpdateResponse = await _batchUpdate(spreadsheetId, _.concat(requests, [_requests.CreateDeveloperMetadataRequest(SPREADSHEET_METADATA_SHEET_ID, "sheetId", sheetId.toString())]))

        return _handleBatchUpdateResponse(batchUpdateResponse, matchedMetadata)
    }

    const batchUpdateResponse = await _batchUpdate(spreadsheetId, requests)

    return _handleBatchUpdateResponse(batchUpdateResponse, matchedMetadata)
}

async function GetSpreadsheet(spreadsheetId, includeData) {
    return _getSpreadsheet(spreadsheetId, includeData)
}

async function GetFilteredData(spreadsheetId, titleQuery, offset, limit, orderBy, filters) {
    if (offset > 0) {
        const queryResponse = await _query(spreadsheetId, titleQuery, offset, limit, orderBy, filters)

        if (queryResponse.success) {
            return {
                ...queryResponse,
                data: { rows: _parseTable(queryResponse.data).rows }
            }
        } else {
            return _handleError(queryResponse)
        }
    } else {
        const queryCountResponse = await _queryCount(spreadsheetId, titleQuery, offset, limit, orderBy, filters)

        if (!queryCountResponse.success) { return queryCountResponse }

        const count = queryCountResponse.data.count
        const queryResponse = await _query(spreadsheetId, titleQuery, offset, limit, orderBy, filters)

        if (!queryResponse.success) { return _handleError(queryResponse) }

        return count === 1 && queryResponse.data.table.parsedNumHeaders === 0
            ? {
                ...queryResponse,
                data: { rows: [], count: 0 }
            }
            : {
                ...queryResponse,
                data: { rows: _parseTable(queryResponse.data).rows, count: count }
            }
    }
}

async function ExportSpreadsheet(fromSpreadsheet, privateColumnsRange, filters, username, currentSettings) {
    function handleError(functionName) {
        return {
            "success": false,
            "errors": `Failed exporting: ${functionName}`
        }
    }

    const getFilteredDataResponse = await GetFilteredData(fromSpreadsheet, "", 0, 99999, null, filters)

    if (!getFilteredDataResponse.success) { return handleError("GetFilteredData") }

    const title = `${username}'s Collection`;
    const newRows = getFilteredDataResponse.data.rows.reduce((result, row) => {
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

    const createNewSpreadsheetResponse = await _createNewSpreadsheet(title)

    if (!createNewSpreadsheetResponse.success) { return handleError("_createNewSpreadsheet") }

    const newSpreadsheetId = createNewSpreadsheetResponse.data.spreadsheetId
    const newSpreadsheetUrl = createNewSpreadsheetResponse.data.spreadsheetUrl

    const copySheetToSpreadsheetResponse = await _copySheetToSpreadsheet(fromSpreadsheet, 0, newSpreadsheetId)

    if (!copySheetToSpreadsheetResponse.success) { return handleError("_copySheetToSpreadsheet") }

    const newSheetId = copySheetToSpreadsheetResponse.data.sheetId
    const requestsArray = [
        _requests.DeleteDimensionRequest(newSheetId, "ROWS", 3),
        _requests.DeleteSheetRequest(0),
    ]

    const batchUpdateResponse = await _batchUpdate(newSpreadsheetId, requestsArray)

    if (!batchUpdateResponse.success) { return handleError("_batchUpdate") }

    const insertResponse = await Insert(newSpreadsheetId, newSheetId, newRows)

    if (!insertResponse.success) { return handleError("Insert") }

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

    const developerMetaDatarequestsArray = [
        _requests.CreateDeveloperMetadataRequest(SPREADSHEET_METADATA_HEADERS_ID, "headers", JSON.stringify(cleanSettings)),
        _requests.CreateDeveloperMetadataRequest(SPREADSHEET_METADATA_PERMISSIONS_ID, "permissions", "viewer"),
        privateColumnsRange.reduce((result, id) => (_.concat(result, [_requests.DeleteDimensionRequest(newSheetId, "COLUMNS", id, id + 1)])), []).reverse(),
    ]

    const developerMetaDataBatchUpdateResponse = await _batchUpdate(newSpreadsheetId, developerMetaDatarequestsArray)

    return developerMetaDataBatchUpdateResponse.success
        ? {
            "success": true,
            "data": {
                "spreadsheetId": newSpreadsheetId,
                "spreadsheetUrl": newSpreadsheetUrl
            }
        }
        : handleError("_batchUpdate")
}

async function CreateStartingSpreadsheet(title = "My Keys Collection", settings = SPREADSHEET_METADATA_DEFAULT_SETTINGS) {
    const createNewSpreadsheetResponse = await _createNewSpreadsheet(title)

    if (!createNewSpreadsheetResponse.success) {
        return {
            success: false,
            data: createNewSpreadsheetResponse
        }
    }

    const newSpreadsheetId = createNewSpreadsheetResponse.data.spreadsheetId
    const newSpreadsheetUrl = createNewSpreadsheetResponse.data.spreadsheetUrl

    const copySheetToSpreadsheetResponse = await _copySheetToSpreadsheet(SPREADSHEET_TEMPLATE_SPREADSHEET_ID, 0, newSpreadsheetId)

    if (!copySheetToSpreadsheetResponse.success) {
        return {
            success: false,
            data: copySheetToSpreadsheetResponse
        }
    }

    const newSheetId = copySheetToSpreadsheetResponse.data.sheetId
    const requestsArray = [
        _requests.DeleteSheetRequest(0),
        _requests.CreateDeveloperMetadataRequest(SPREADSHEET_METADATA_HEADERS_ID, "headers", JSON.stringify(settings)),
        _requests.CreateDeveloperMetadataRequest(SPREADSHEET_METADATA_PERMISSIONS_ID, "permissions", "owner"),
        _requests.CreateDeveloperMetadataRequest(SPREADSHEET_METADATA_SHEET_ID, "sheetId", newSheetId.toString()),
        _requests.UpdateSheetPropertiesRequest(copySheetToSpreadsheetResponse.data.sheetId, { title: "Keys" }),
    ]

    const batchUpdateResponse = await _batchUpdate(newSpreadsheetId, requestsArray)

    return batchUpdateResponse.success
        ? {
            "success": true,
            "data": {
                "spreadsheetUrl": newSpreadsheetUrl,
                "spreadsheetId": newSpreadsheetId,
                "sheetId": newSheetId,
            }
        }
        : {
            success: false,
            data: batchUpdateResponse
        }
}

async function InsertNewColumn(spreadsheetId, sheetId,) {
    const appendDimensionRequest = _requests.AppendDimensionRequest(sheetId, "COLUMNS", 1)
    const batchUpdateResponse = await _batchUpdate(spreadsheetId, appendDimensionRequest)

    return batchUpdateResponse.success
        ? {
            "success": true,
            "data": {
                columnId: getLabelByIndex(batchUpdateResponse.data.updatedSpreadsheet.sheets.find(sheet => sheet.properties.sheetId === sheetId).properties.gridProperties.columnCount - 1)
            }
        }
        : {
            success: false,
            data: batchUpdateResponse
        }
}

async function DeleteDimension(spreadsheetId, sheetId, dimension, startIndex, length) {
    const deleteDimensionRequest = _requests.DeleteDimensionRequest(sheetId, dimension, startIndex, length)
    const batchUpdateResponse = await _batchUpdate(spreadsheetId, deleteDimensionRequest)

    return batchUpdateResponse.success
        ? {
            "success": true,
            "data": batchUpdateResponse.data
        }
        : {
            success: false,
            data: batchUpdateResponse
        }
}

async function ImportSpreadsheet(headers, rows, settings) {
    const createNewSpreadsheetResponse = await _createNewSpreadsheet("My Keys Collection")

    if (!createNewSpreadsheetResponse.success) {
        return {
            success: false,
            data: createNewSpreadsheetResponse
        }
    }

    const newSpreadsheetId = createNewSpreadsheetResponse.data.spreadsheetId
    const newSpreadsheetUrl = createNewSpreadsheetResponse.data.spreadsheetUrl

    const copySheetToSpreadsheetResponse = await _copySheetToSpreadsheet(SPREADSHEET_IMPORT_TEMPLATE_SPREADSHEET_ID, 0, newSpreadsheetId)

    if (!copySheetToSpreadsheetResponse.success) {
        return {
            success: false,
            data: copySheetToSpreadsheetResponse
        }
    }

    const newSheetId = copySheetToSpreadsheetResponse.data.sheetId
    const requestsArray = [
        _requests.CreateDeveloperMetadataRequest(SPREADSHEET_METADATA_HEADERS_ID, "headers", JSON.stringify(settings)),
        _requests.CreateDeveloperMetadataRequest(SPREADSHEET_METADATA_PERMISSIONS_ID, "permissions", "owner"),
        _requests.DeleteSheetRequest(0),
        _requests.CreateDeveloperMetadataRequest(SPREADSHEET_METADATA_SHEET_ID, "sheetId", newSheetId.toString()),
        _requests.UpdateSheetPropertiesRequest(newSheetId, { title: "Keys" }),
        _requests.InsertDimensionRequest(newSheetId, "COLUMNS", 2, headers.length - 1),
        _requests.InsertDimensionRequest(newSheetId, "ROWS", 3, rows.length - 1),
        _requests.UpdateCellsRequest(newSheetId, [headers], 0, 1),
        _requests.UpdateCellsRequest(newSheetId, rows, 2, 1),
    ]

    const batchUpdateResponse = await _batchUpdate(newSpreadsheetId, requestsArray)

    return batchUpdateResponse.success
        ? {
            "success": true,
            "data": {
                "spreadsheetUrl": newSpreadsheetUrl,
                "spreadsheetId": newSpreadsheetId,
                "sheetId": newSheetId,
            }
        }
        : {
            "success": false,
            "data": batchUpdateResponse
        }
}

export default {
    Initialize,
    Insert,
    InsertNewColumn,
    Update,
    Delete,
    DeleteDimension,
    CreateStartingSpreadsheet,
    SaveSettings,
    ExportSpreadsheet,
    ImportSpreadsheet,
    GetSpreadsheet,
    GetFilteredData,
};