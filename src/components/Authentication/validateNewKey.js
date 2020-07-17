export default function validateNewKey(values) {
    let errors = {};

    // Title Errors
    if (!values['Title']) {
        errors['Title'] = "Title is required";
    } else if (values['Title'].length < 3) {
        errors.title = "Title must be at least 3 characters";
    }

    // Date Errors
    if (!values["Date Added"]) {
        errors["Date Added"] = "Date is required";
    }

    return errors;
}