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

    _get = async (url) => axios.get(url, { headers: { 'Content-Type': 'application/json; charset=UTF-8', Authorization: _.concat('Bearer ', this.token) } })

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

    _createQueryString(offset = 0, limit = 24, orderBy = { sort: "Date Added", asc: false }, filters = [], range = "*", countOnly = false) {
        const select = `select ${range}`
        const where = _.isEmpty(filters)
            ? ``
            : `where ${this._parseFilters(filters)}`
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
    _query = async (offset, limit, orderBy, filters) => {
        return this._get(`https://docs.google.com/a/google.com/spreadsheets/d/${this._spreadsheetId}/gviz/tq?tq=${this._createQueryString(offset, limit, orderBy, filters)}`)
            .then(response => {
                const parsedQuery = JSON.parse(response.data.slice(response.data.indexOf("{"), response.data.length - 2));

                if (parsedQuery.status === 'error') {
                    return Promise.reject(parsedQuery.errors);
                }
                else {
                    return parsedQuery
                }
            })
    }

    _queryCount = async (offset, limit, orderBy, filters) => {
        return this._get(`https://docs.google.com/a/google.com/spreadsheets/d/${this._spreadsheetId}/gviz/tq?tq=${this._createQueryString(offset, limit, orderBy, filters, '*', true)}`)
            .then(response => {
                const parsedQuery = JSON.parse(response.data.slice(response.data.indexOf("{"), response.data.length - 2));

                if (parsedQuery.status === 'error') {
                    return Promise.reject(parsedQuery.errors);
                }
                else {
                    return parsedQuery.table.rows.length === 0 ? 0 : parsedQuery.table.rows[0]['c'][0]['v']
                }
            })
    }

    _combineHeadersAndSettings(headersArray, settings) {
        return Object.keys(settings).reduce((result, key) => ({
            ...result,
            [key]: {
                ...headersArray.find(item => item.label === key),
                ...settings[key],
            }
        }), {})
    }

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
    async Insert(value) {
        const params = {
            spreadsheetId: this._spreadsheetId,
            range: "Keys!B2",
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
    async Update(value, range) {
        const params = {
            spreadsheetId: this._spreadsheetId,
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

    async _getHeadersAndSettings(spreadsheetId) {
        return gapi.client.sheets.spreadsheets.values.get({
            "spreadsheetId": spreadsheetId,
            "range": "A1:Z2",
            "majorDimension": "ROWS"
        })
            .then(response => response)
            .catch(reason => console.log(reason))
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
                    return response.result
                } else {

                }
            })
            .catch(reason => console.log(reason))
    }

    async ImportAllOptions(spreadsheetId) {
        return this._query(0, 10000).then(response => {
            if (response.errors) {
                console.error(response);
                return response
            }

            const table = this._parseTable(response);
            const options = this._initOptions(this._columns, table.rows);


            return {
                headers: options
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
                            if (!response.errors) {
                                const combinedHeadersAndSettings = this._combineHeadersAndSettings(response.table.cols, headersWithSettings)
                                this.columns = combinedHeadersAndSettings

                                this.SaveSettings(spreadsheetId, combinedHeadersAndSettings)

                                return {
                                    headers: combinedHeadersAndSettings
                                }
                            } else {
                                console.error(response);
                                return response
                            }
                        })
                    }
                } else { console.error('GetHeadersAndSettings Error', response) }
            })
    }

    async GetFilteredData(offset, limit, orderBy, filters) {
        return offset > 0
            ? this._query(offset, limit, orderBy, filters)
                .then(response => {
                    this.rows = this._parseTable(response).rows
                    return { headers: this._columns, rows: this.rows }
                })
            : this._queryCount(offset, limit, orderBy, filters)
                .then(count => {
                    return this._query(offset, limit, orderBy, filters)
                        .then(response => {
                            this.rows = this._parseTable(response).rows
                            return { headers: this._columns, rows: this.rows, count: count - 1 }
                        })
                })


    }

    async LoadMore(offset, limit, orderBy, filters) {
        return this._query(offset, limit, orderBy, filters)
            .then(response => {
                this.rows = _.concat(this.rows, this._parseTable(response).rows)
                return { headers: this._columns, rows: this.rows }
            })
    }
}

const spreadsheets = new Spreashsheets();
export default spreadsheets;