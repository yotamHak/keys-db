import { gapi } from 'gapi-script';
import axios from "axios";
import _ from "lodash";
import { isUrl, isSteamKey, genericSort, getFormattedDate } from '../utils';

class Spreashsheets {
    constructor() {
        this._spreadsheetId = '';
        this._token = '';
        this._columns = {};
        this._columnsWithOptions = {};
        this._rows = [];
        this._newRowRange = '';
    }

    get token() {
        if (this._token === '') { this._token = localStorage.getItem('gTokenId') }

        return this._token
    }

    set spreadsheetId(id) { this._spreadsheetId = id; }

    get newRowRange() { return this._newRowRange }
    set newRowRange(range) { this._newRowRange = range }

    get rows() { return this._rows }
    set rows(rows) { this._rows = rows; }

    get columns() { return this._columns }
    set columns(columns) {
        this._columns = columns
            .filter(column => column.label)
            .reduce((result, column) => {
                return {
                    ...result,
                    ...{ [column.label]: column }
                }
            }, {})
    }

    _get = async (url) => axios.get(url, { headers: { 'Content-Type': 'application/json; charset=UTF-8', Authorization: _.concat('Bearer ', this.token) } })

    _getColumn = key => this.columns[key].id

    _setNewRowRange(range) {
        this.newRowRange = range
    }

    // { key: 'From', values: ['Humblebundle'] }, { key: 'Status', values: ['Unused', 'Given'] }
    _parseFilters(filters = []) {
        if (_.isEmpty(filters)) { return "" }
        const filtersArray = filters.reduce((result, filter) => _.concat(
            result,
            [filter.values.map(value => ({ [this._getColumn(filter.key)]: `'${value}'` }))]
        ), [])
        return _.join(filtersArray.map(group => `(${_.join(group.map(item => `${Object.keys(item)[0]} = ${item[Object.keys(item)[0]]}`), ' or ')})`), ' and ')
    }

    _createQueryString(offset = 0, limit = 50, orderBy = { sort: "Date Added", asc: false }, filters = [], range = "*", countOnly = false) {
        const select = `select ${range}`
        const where = _.isEmpty(filters)
            ? ``
            : `where ${this._parseFilters(filters)}`
        const order = orderBy
            ? `order by ${orderBy.sort && !_.isEmpty(this.columns) ? this._getColumn(orderBy.sort) : "F"} ${orderBy.asc ? "asc" : "desc"}`
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
                            ? values.v
                            : ''
                    })]
                )
            }, [])
        }
    }

    _parseOptions(headers, rows) {
        const allOptions = { ...headers }

        _.forEach(rows, row => {
            let optionIndex = 0;

            _.forEach(allOptions, allOptionValue => {
                let rowValue = row[optionIndex++]

                if (allOptionValue.type === 'date') {
                    const capturedValue = RegExp("([0-9]{1,},[0-9]{1,},[0-9]{1,})").exec(rowValue);
                    rowValue = capturedValue ? getFormattedDate(capturedValue[0]) : ''
                }

                _.isObject(allOptionValue.options)
                    ? allOptionValue.options = {
                        ...allOptionValue.options,
                        [rowValue]: 0
                    }
                    : allOptionValue.options = { [rowValue]: 0 }
            })
        })

        Object.keys(allOptions)
            .map(headerKey => allOptions[headerKey].options = Object.keys(allOptions[headerKey].options)
                .filter(value => { return value !== "" && !_.toNumber(value) && !isUrl(value) && !isSteamKey(value) && value !== 'Invalid Date' })
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
                    return parsedQuery.table.rows[0]['c'][0]['v']
                }
            })
    }

    // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/update
    async InsertNewRow(value, range = `Keys!A${this.newRowRange}`) {
        const oldRange = this.newRowRange;

        const params = {
            // The ID of the spreadsheet to update.
            spreadsheetId: this._spreadsheetId,  // TODO: Update placeholder value.

            // The A1 notation of the values to update.
            range: range,  // TODO: Update placeholder value.

            // How the input data should be interpreted.
            valueInputOption: 'USER_ENTERED',  // TODO: Update placeholder value.
        };

        const valueRangeBody = {
            // TODO: Add desired properties to the request body. All existing properties
            // will be replaced.
            "values": [value]
        };

        return gapi.client.sheets.spreadsheets.values.update(params, valueRangeBody)
            .then(response => {
                // TODO: Change code below to process the `response` object:
                console.log(response.result);
                this._setNewRowRange(oldRange + 1);
                return response.result
            }, reason => {
                console.error('error: ' + reason.result.error.message);
                return reason.result.error.message
            });
    }

    async GetInitialTable(spreadsheetId, offset, limit, orderBy, filters) {
        this.spreadsheetId = spreadsheetId

        return this._query(0, 10000).then(response => {
            if (response.errors) {
                console.error(response);
                return response
            }

            const table = this._parseTable(response);
            this.columns = table.cols;
            const options = this._parseOptions(this._columns, table.rows);

            this._columns = Object.keys(options).reduce((result, key) => {
                return {
                    ...result,
                    ...{
                        [key]: {
                            ...this._columns[key],
                            ...options[key]
                        }
                    }
                }
            }, {})

            this.newRowRange = table.rows.length + 2

            return this.GetFilteredData(offset, limit, orderBy, filters);
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