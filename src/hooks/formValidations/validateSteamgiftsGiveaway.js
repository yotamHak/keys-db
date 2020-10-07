export default function validateSteamgiftsGiveaway(values) {
    let errors = {};

    // AppId Errors
    if (!values['appid']) {
        errors['appid'] = "Title is required";
    } else if (values['appid'].length === 0) {
        errors.appid = "Must have an AppId.";
    }

    // Key Errors
    if (!values["key"]) {
        errors["key"] = "Must have a Key to giveaway.";
    }

    // Starting Offset Errors
    if (!values["startingTimeOffset"]) {
        errors["startingTimeOffset"] = "Must have an offset.";
    }

    // Giveaway Time Errors
    if (!values["timeActive"]) {
        errors["timeActive"] = "Must have an active time.";
    } else if (values["timeActive"] < 60) {
        errors["timeActive"] = "Must be at least 60 minutes.";
    }

    return errors;
}