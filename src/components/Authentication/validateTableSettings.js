import { isDropdownType } from "../../utils";

export default function validateTableSettings(values) {
    let errors = {};

    const types = {
        steam_title: { selected: false, text: '(Steam) Title' },
        steam_url: { selected: false, text: '(Steam) URL' },
        steam_appid: { selected: false, text: '(Steam) App Id' },
        steam_key: { selected: false, text: '(Steam) Key' },
        steam_cards: { selected: false, text: '(Steam) Cards' },
        steam_achievements: { selected: false, text: '(Steam) Achievements' },
        steam_dlc: { selected: false, text: '(Steam) DLC' },
        steam_bundled: { selected: false, text: '(Steam) Bundled' },
        steam_ownership: { selected: false, text: '(Steam) Owned' },
    }

    Object.keys(values).forEach((key, index) => {
        const targetedValues = values[key]

        // Type errors
        if (types[targetedValues.type] && types[targetedValues.type].selected === false) {
            types[targetedValues.type].selected = true
        } else if (types[targetedValues.type] && types[targetedValues.type].selected === true) {
            errors[key] = {
                ...errors[key],
                type: `${types[targetedValues.type].text} type can only be selected once`
            }
        }

        // Dropdown errors
        if (isDropdownType(targetedValues.type)) {
            if (!targetedValues.options || !targetedValues.options.values || targetedValues.options.values.length === 0) {
                errors[key] = {
                    ...errors[key],
                    options: `Missing Options`
                }
            }
        }
    })

    return errors;
}