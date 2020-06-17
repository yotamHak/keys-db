import { gapi } from 'gapi-script';
import googleConfig from './config'

class Spreashsheets {
    constructor() { }

    getRange(row, column) {
        return `Keys!${row}`
    }

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

    // async writeToSingleRange(range, values) {
    //     // var values = [
    //     //     [
    //     //         // Cell values ...
    //     //     ],
    //     //     // Additional rows ...
    //     // ];
    //     var data = [];
    //     data.push({
    //         range: range,
    //         values: values
    //     });
    //     // Additional ranges to update.

    //     var body = {
    //         data: data
    //         // , valueInputOption: valueInputOption
    //     };
    //     gapi.client.sheets.spreadsheets.values.batchUpdate({
    //         spreadsheetId: spreadsheetId,
    //         resource: body
    //     }).then((response) => {
    //         debugger
    //         var result = response.result;
    //         console.log(`${result.totalUpdatedCells} cells updated.`);
    //     });



    //     const newUser = await this.auth.createUserWithEmailAndPassword(
    //         email,
    //         password
    //     )
    //     return await newUser.user.updateProfile({
    //         displayName: name
    //     })
    // }
}

const spreadsheets = new Spreashsheets();
export default spreadsheets;