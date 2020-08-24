import { isDropdownType } from "../../utils";

export default function validateHeaderSetting(values) {
    let errors = {};

    if (!values.label) {
        errors.label = "Label cannot be empty"
    }

    // Type Errors
    if (!values.type) {
        errors.type = "Type must be selected";
    }

    if (isDropdownType(values.type) && (!values.options || (values.options && values.options.values.length === 0))) {
        errors.type = "Needs at least one option";
    }

    return errors;
}