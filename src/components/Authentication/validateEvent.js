import dateFns from "date-fns";

export default function validateEvent(values) {
    let errors = {};

    // Title Errors
    if (!values.title) {
        errors.title = "Title required";
    } else if (values.title.length < 3) {
        errors.title = "Title must be at least 3 characters";
    }

    // Description Errors
    if (!values.description) {
        errors.description = "Description required"
    }

    // Date Errors
    if (!values.allDay) {

    } else {
        if (!values.startingDate) {
            errors.startingDate = "Starting date required"
        }
        if (!values.endingDate) {
            errors.endingDate = "Ending date required"
        } else if (dateFns.isAfter(values.startingDate, values.endingDate)) {
            errors.startingDate = "Ending date must be after starting date"
        }
    }

    return errors;
}