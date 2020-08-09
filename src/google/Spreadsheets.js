import { gapi } from 'gapi-script';
import axios from "axios";
import _ from "lodash";
import { SPREADSHEET_METADATA_HEADERS_ID, SPREADSHEET_METADATA_PERMISSIONS_ID, SPREADSHEET_METADATA_DEFAULT_SETTINGS, SPREADSHEET_METADATA_SHEET_ID, SPREADSHEET_IMPORT_TEMPLATE_SPREADSHEET_ID, getLabelByIndex, SPREADSHEET_TEMPLATE_SPREADSHEET_ID } from '../utils';


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
    })
}
async function _batchUpdate(spreadsheetId, requests) {
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

const _queryUrl = (spreadsheetId, queryString) => `https://docs.google.com/a/google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tq=${queryString}`

const _handleError = async response => {
    console.error(response.errors);
    return response
}

const _get = async url => axios.get(url, { headers: { 'Content-Type': 'application/json; charset=UTF-8', Authorization: _.concat('Bearer ', localStorage.getItem('gTokenId')) } })
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

// DeveloperMetadata Related
// async function GetDeveloperMetadata(spreadsheetId, id = SPREADSHEET_METADATA_HEADERS_ID) {
//     return gapi.client.sheets.spreadsheets.developerMetadata.get({
//         "spreadsheetId": spreadsheetId,
//         "metadataId": id
//     })
//         .then(response => {
//             if (response.status === 200) {
//                 return {
//                     success: true,
//                     data: response.result
//                 }
//             } else {
//                 return {
//                     success: false,
//                     data: response.errors
//                 }
//             }
//         })
//         .catch(response => {
//             return {
//                 success: false,
//                 errors: response.result.error
//             }
//         })
// }

async function SaveSettings(spreadsheetId, settings) {
    return _batchUpdate(spreadsheetId, [_requests.UpdateDeveloperMetadataRequest("headers", JSON.stringify(settings))])
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

    return _searchDeveloperMetadataByIds(spreadsheetId, [SPREADSHEET_METADATA_HEADERS_ID, SPREADSHEET_METADATA_PERMISSIONS_ID, SPREADSHEET_METADATA_SHEET_ID])
        .then(response => {
            if (response.success) {
                return {
                    "success": true,
                    ..._handleDeveloperMetadata(response.data)
                }
            } else {
                let missingSheetId = false

                const matchedMetadata = _handleDeveloperMetadata(response.data.matched)
                const requests = response.data.missing.reduce((result, id) => {
                    switch (id) {
                        case SPREADSHEET_METADATA_HEADERS_ID:
                            return _.concat(result, [_requests.CreateDeveloperMetadataRequest(SPREADSHEET_METADATA_HEADERS_ID, "headers", JSON.stringify(SPREADSHEET_METADATA_DEFAULT_SETTINGS))])
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
                    return _getSpreadsheet(spreadsheetId)
                        .then(response => {
                            const sheetId = response.data.sheets[0].properties.sheetId

                            return _batchUpdate(spreadsheetId, _.concat(requests, [_requests.CreateDeveloperMetadataRequest(SPREADSHEET_METADATA_SHEET_ID, "sheetId", sheetId.toString())]))
                                .then(response => {
                                    return _handleBatchUpdateResponse(response, matchedMetadata)
                                })
                        })
                } else {
                    return _batchUpdate(spreadsheetId, requests)
                        .then(response => {
                            return _handleBatchUpdateResponse(response, matchedMetadata)
                        })
                }
            }
        })
        .catch(response => ({ success: false, error: response.result.error.status }))
}

async function GetSpreadsheet(spreadsheetId, includeData) {
    return _getSpreadsheet(spreadsheetId, includeData)
}

async function GetFilteredData(spreadsheetId, titleQuery, offset, limit, orderBy, filters) {
    return offset > 0
        ? _query(spreadsheetId, titleQuery, offset, limit, orderBy, filters)
            .then(response => {
                if (response.success) {
                    return {
                        ...response,
                        data: { rows: _parseTable(response.data).rows }
                    }
                } else {
                    return _handleError(response)
                }
            })
        : _queryCount(spreadsheetId, titleQuery, offset, limit, orderBy, filters)
            .then(response => {
                if (response.success) {
                    const count = response.data.count

                    return _query(spreadsheetId, titleQuery, offset, limit, orderBy, filters)
                        .then(response => {
                            if (response.success) {
                                if (count === 1 && response.data.table.parsedNumHeaders === 0) {
                                    return {
                                        ...response,
                                        data: { rows: [], count: 0 }
                                    }
                                }

                                return {
                                    ...response,
                                    data: { rows: _parseTable(response.data).rows, count: count }
                                }
                            }
                            else {
                                return _handleError(response)
                            }
                        })
                } else {
                    return response
                }
            })
}

async function ExportSpreadsheet(fromSpreadsheet, privateColumnsRange, filters, username, currentSettings) {
    function handleError(functionName) {
        return {
            "success": false,
            "errors": `Failed exporting: ${functionName}`
        }
    }

    return GetFilteredData(fromSpreadsheet, "", 0, 99999, null, filters).then(response => {
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

        return _createNewSpreadsheet(title).then(response => {
            if (!response.success) { return handleError("_createNewSpreadsheet") }

            const newSpreadsheetId = response.data.spreadsheetId
            const newSpreadsheetUrl = response.data.spreadsheetUrl

            return _copySheetToSpreadsheet(fromSpreadsheet, 0, newSpreadsheetId).then(response => {
                if (!response.success) { return handleError("_copySheetToSpreadsheet") }

                const newSheetId = response.data.sheetId

                const deleteRowsRequest = _requests.DeleteDimensionRequest(newSheetId, "ROWS", 3)
                const deleteSheetRequest = _requests.DeleteSheetRequest(0)

                return _batchUpdate(newSpreadsheetId, _.concat([deleteRowsRequest], [deleteSheetRequest])).then(response => {
                    if (!response.success) { return handleError("_batchUpdate") }

                    return Insert(newSpreadsheetId, newSheetId, newRows).then(response => {
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

                        const headersRequest = _requests.CreateDeveloperMetadataRequest(SPREADSHEET_METADATA_HEADERS_ID, "headers", JSON.stringify(cleanSettings))
                        const permissionRequest = _requests.CreateDeveloperMetadataRequest(SPREADSHEET_METADATA_PERMISSIONS_ID, "permissions", "viewer")
                        const deleteRequests = privateColumnsRange.reduce((result, id) => (_.concat(result, [_requests.DeleteDimensionRequest(newSheetId, "COLUMNS", id, id + 1)])), []).reverse()

                        return _batchUpdate(newSpreadsheetId, _.concat([headersRequest], [permissionRequest], deleteRequests)).then(response => {
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

async function CreateStartingSpreadsheet(title = "My Keys Collection", settings = SPREADSHEET_METADATA_DEFAULT_SETTINGS) {
    return _createNewSpreadsheet(title)
        .then(response => {
            if (response.success) {
                const newSpreadsheetId = response.data.spreadsheetId
                const newSpreadsheetUrl = response.data.spreadsheetUrl

                return _copySheetToSpreadsheet(SPREADSHEET_TEMPLATE_SPREADSHEET_ID, 0, newSpreadsheetId)
                    .then(response => {
                        if (response.success) {
                            const newSheetId = response.data.sheetId
                            const deleteSheetRequest = _requests.DeleteSheetRequest(0)
                            const headersRequest = _requests.CreateDeveloperMetadataRequest(SPREADSHEET_METADATA_HEADERS_ID, "headers", JSON.stringify(settings))
                            const permissionRequest = _requests.CreateDeveloperMetadataRequest(SPREADSHEET_METADATA_PERMISSIONS_ID, "permissions", "owner")
                            const sheetIdRequest = _requests.CreateDeveloperMetadataRequest(SPREADSHEET_METADATA_SHEET_ID, "sheetId", newSheetId.toString())
                            const sheetPropsUpdateRequest = _requests.UpdateSheetPropertiesRequest(response.data.sheetId, { title: "Keys" })

                            return _batchUpdate(newSpreadsheetId, _.concat([headersRequest], [permissionRequest], [deleteSheetRequest], [sheetIdRequest], [sheetPropsUpdateRequest])).then(response => {
                                return response.success
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
                                        data: response
                                    }
                            })
                        } else {
                            return {
                                success: false,
                                data: response
                            }
                        }
                    })
            } else {
                return {
                    success: false,
                    data: response
                }
            }
        })
}



async function ImportSpreadsheet(headers, rows, settings) {
    return _createNewSpreadsheet("TESTTESTTEST")
        .then(response => {
            if (!response.success) {
                return {
                    success: false,
                    data: response
                }
            }

            const newSpreadsheetId = response.data.spreadsheetId
            const newSpreadsheetUrl = response.data.spreadsheetUrl

            return _copySheetToSpreadsheet(SPREADSHEET_IMPORT_TEMPLATE_SPREADSHEET_ID, 0, newSpreadsheetId)
                .then(response => {
                    if (!response.success) {
                        return {
                            success: false,
                            data: response
                        }
                    }

                    const newSheetId = response.data.sheetId

                    const headersRequest = _requests.CreateDeveloperMetadataRequest(SPREADSHEET_METADATA_HEADERS_ID, "headers", JSON.stringify(settings))
                    const permissionRequest = _requests.CreateDeveloperMetadataRequest(SPREADSHEET_METADATA_PERMISSIONS_ID, "permissions", "owner")
                    const deleteSheetRequest = _requests.DeleteSheetRequest(0)
                    const sheetIdRequest = _requests.CreateDeveloperMetadataRequest(SPREADSHEET_METADATA_SHEET_ID, "sheetId", newSheetId.toString())
                    const sheetPropsUpdateRequest = _requests.UpdateSheetPropertiesRequest(response.data.sheetId, { title: "Keys" })

                    const insertColumnsRequest = _requests.InsertDimensionRequest(newSheetId, "COLUMNS", 2, headers.length - 1)

                    const insertRowsRequest = _requests.InsertDimensionRequest(newSheetId, "ROWS", 3, rows.length - 1)
                    const updateHeaderRequest = _requests.UpdateCellsRequest(newSheetId, [headers], 0, 1)
                    const updateRowsRequest = _requests.UpdateCellsRequest(newSheetId, rows, 2, 1)

                    const requestsArray = [
                        headersRequest,
                        permissionRequest,
                        deleteSheetRequest,
                        sheetIdRequest,
                        sheetPropsUpdateRequest,
                        insertColumnsRequest,
                        insertRowsRequest,
                        updateHeaderRequest,
                        updateRowsRequest,
                    ]

                    console.log("requests", requestsArray)

                    return _batchUpdate(newSpreadsheetId, requestsArray).then(response => {
                        return response.success
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
                                data: response
                            }
                    })
                })
        })
}

export default { Initialize, Insert, Update, Delete, CreateStartingSpreadsheet, SaveSettings, ExportSpreadsheet, ImportSpreadsheet, GetSpreadsheet, GetFilteredData, };