export default function validateHeaderSetting(values) {
    let errors = {};

    if (!values.label) {
        errors.label = "Label cannot be empty"
    }

    // Type Errors
    if (!values.type) {
        errors.type = "Type must be selected";
    }

    return errors;
}