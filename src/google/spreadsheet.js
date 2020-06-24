import { gapi } from 'gapi-script';
import googleConfig from './config';
import axios from "axios";
import _ from "lodash";
import { isUrl, isSteamKey } from '../utils';

class Spreashsheets {
    constructor() {
        this.spreadsheetId = ''
        this._token = '';
        this._columns = {}
        this._columnsWithOptions = {}
    }

    get token() {
        if (this._token === '') { this._token = gapi.client.getToken().access_token }

        return this._token
    }

    _get = async (url) => axios.get(url, { headers: { 'Content-Type': 'application/json; charset=UTF-8', Authorization: _.concat('Bearer ', this.token) } })

    _getColumn = key => this._columns[key]

    _setColumns(columns) {
        this._columns = columns
            .filter(column => column.label)
            .reduce((result, column) => {
                return {
                    ...result,
                    [column.label]: column.id
                }
            }, {})
    }

    // { key: 'From', values: ['Humblebundle'] }, { key: 'Status', values: ['Unused', 'Given'] }
    _parseFilters(filters = []) {
        if (_.isEmpty(filters)) { return "" }

        // console.log("filters:", filters)

        const filtersArray = filters.reduce((result, filter) => _.concat(result, [filter.values.map(value => { return { [this._getColumn(filter.key)]: `'${value}'` } })]), [])
        // console.log("after reduce:", filtersArray);

        return _.join(filtersArray.map(group => `(${_.join(group.map(item => `${Object.keys(item)[0]} = ${item[Object.keys(item)[0]]}`), ' or ')})`), ' and ')
        // console.log("Filter string:", allFilters)
    }

    _createQueryString(offset = 0, limit = 50, orderBy = "A", asc = false, filters = [], range = "*") {
        const select = `select ${range}`
        const where = _.isEmpty(filters)
            ? ``
            : ` where ${this._parseFilters(filters)}`
        const offsetAndLimit = `limit ${limit} offset ${offset}`
        const order = orderBy
            ? `order by ${orderBy} ${asc ? "asc" : "desc"}`
            : ``

        return encodeURIComponent(`${select} ${where} ${offsetAndLimit}`)
    }

    _parseTable(response) {
        const table = JSON.parse(response.data.slice(response.data.indexOf("{"), response.data.length - 2)).table;
        console.log("Table:", table);

        return {
            ...table,
            rows: table.rows.reduce((result, row) => {
                return _.concat(
                    result,
                    [row["c"].map((values, index) => {
                        return values
                            ? values.v
                            : ''
                    })]
                )
            }, [])
        }
    }

    _parseOptions(headers, rows) {
        this._columnsWithOptions = { ...headers }
        const allOptions = { ...headers }

        rows.map(row => Object.keys(allOptions).map((headerKey, index) => _.isObject(allOptions[headerKey])
            ? allOptions[headerKey] = {
                ...allOptions[headerKey],
                [row[index]]: 0
            }
            : allOptions[headerKey] = { [row[index]]: 0 }))

        Object.keys(allOptions).map(headerKey => allOptions[headerKey] = Object.keys(allOptions[headerKey])
            .filter(value => { return value !== "" && !_.toNumber(value) && !isUrl(value) && !isSteamKey(value) }))

        // console.log("allOptions", allOptions)

        this._columnsWithOptions = allOptions
    }

    // https://developers.google.com/chart/interactive/docs/querylanguage
    _query = async (offset, limit, orderBy, asc, filters) => this._get(`https://docs.google.com/a/google.com/spreadsheets/d/${this.spreadsheetId}/gviz/tq?tq=${this._createQueryString(offset, limit, orderBy, asc, filters)}`)

    // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/update
    async UpdateSingleCell(range = "Keys!A930", value = ["1", "2", "3"]) {
        var params = {
            // The ID of the spreadsheet to update.
            spreadsheetId: googleConfig.spreadsheetId,  // TODO: Update placeholder value.

            // The A1 notation of the values to update.
            range: range,  // TODO: Update placeholder value.

            // How the input data should be interpreted.
            valueInputOption: 'RAW',  // TODO: Update placeholder value.
        };

        var valueRangeBody = {
            // TODO: Add desired properties to the request body. All existing properties
            // will be replaced.
            "values": [value]
        };

        var request = gapi.client.sheets.spreadsheets.values.update(params, valueRangeBody);

        request.then(function (response) {
            // TODO: Change code below to process the `response` object:
            console.log(response.result);
        }, function (reason) {
            console.error('error: ' + reason.result.error.message);
        });
    }

    async GetInitialTable(spreadsheetId) {
        this.spreadsheetId = spreadsheetId;

        await this._query(0, 10000).then(response => {
            const table = this._parseTable(response);
            this._setColumns(table.cols);
            this._parseOptions(this._columns, table.rows);
            // console.log("this._columnsWithOptions", this._columnsWithOptions);
        })

        return this._query().then(response => { return { headers: this._columnsWithOptions, rows: this._parseTable(response).rows } })
    }

    async GetFilteredData(offset, limit, orderBy, asc, filters) {
        return this._query(offset, limit, orderBy, asc, filters)
            .then(response => {
                const rows = this._parseTable(response).rows
                return { headers: this._columnsWithOptions, rows: rows }
            })
    }
}

const spreadsheets = new Spreashsheets();
export default spreadsheets;