export default function validateImport(values) {
    let errors = {};

    // Spreadsheet Errors
    if (!values.spreadsheetId) {
        errors.spreadsheetId = "Spreadsheet ID is required";
    }

    return errors;
}