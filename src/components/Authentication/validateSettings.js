export default function validateSettings(values) {
    let errors = {};

    // Spreadsheet Errors
    if (!values.spreadsheetId) {
        errors.spreadsheetId = "Spreadsheet ID is required";
    }

    // Steam Web Api Key Errors
    if (!values.steamApiKey) {
        errors.steamApiKey = "Steam Web Api is required"
    }

    return errors;
}