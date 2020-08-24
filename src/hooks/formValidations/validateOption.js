export default function validateOption(values) {
    let errors = {};

    // Value Errors
    if (values.value === "") {
        errors.value = "Option must be filled";
    }

    return errors;
}