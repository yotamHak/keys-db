export default function validateSteamgiftsGiveaway(values) {
    let errors = {};

    // AppId Errors
    if (!values['appid']) {
        errors['appid'] = "App ID is required";
    }

    // Title Errors
    if (!values['title']) {
        errors['title'] = "Title is required";
    }

    // Key Errors
    if (!values["key"]) {
        errors["key"] = "Steam Key is required.";
    }

    // Starting Offset Errors
    if (!values["startingTimeOffset"]) {
        errors["startingTimeOffset"] = "Starting offset is required.";
    }

    // Giveaway Time Errors
    if (!values["timeActive"]) {
        errors["timeActive"] = "Giveaway time is required.";
    } else if (values["timeActive"] < 60) {
        errors["timeActive"] = "Must be at least 60 minutes.";
    }

    return errors;
}