import { gapi } from 'gapi-script';
import googleConfig from './config';
import axios from "axios";
import _ from "lodash";

class Spreashsheets {
    constructor() {
        this._token = '';
        this._columns = {}
    }

    get token() {
        if (this._token === '') { this._token = gapi.client.getToken().access_token }

        return this._token
    }

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

    _createQueryString(filters = [], range = "*") { return encodeURIComponent(`Select ${range} ${_.isEmpty(filters) ? "" : ` where ${this._parseFilters(filters)}`}`) }

    _get = async (url) => axios.get(url, { headers: { 'Content-Type': 'application/json; charset=UTF-8', Authorization: _.concat('Bearer ', this.token) } })

    // https://developers.google.com/chart/interactive/docs/querylanguage
    Query = async (spreadsheetId, filters = []) => this._get(`https://docs.google.com/a/google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tq=${this._createQueryString(filters)}`)

    // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/update
    async updateSingleCell(range = "Keys!A921", value = ["1", "2", "3"]) {
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

    _parseTable(rows) {
        const result = rows.reduce()
    }

    async GetInitialTable(spreadsheetId) {
        return this.Query(spreadsheetId).then(response => {
            const table = JSON.parse(response.data.slice(response.data.indexOf("{"), response.data.length - 2)).table;
            console.log("Table", table);

            this._setColumns(table.cols)

            return { headers: this._columns, rows: this._parseTable(table.rows) }
        })
    }
}

const spreadsheets = new Spreashsheets();
export default spreadsheets;