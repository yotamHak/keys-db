export default function validateNewKey(values) {
    let errors = {};

    // Title Errors
    if (!values['Title']) {
        errors['Title'] = "Title is required";
    } else if (values['Title'].length === 0) {
        errors.title = "Title must have at least 1 character";
    }

    // Date Errors
    if (!values["Date Added"]) {
        errors["Date Added"] = "Date is required";
    }

    return errors;
}