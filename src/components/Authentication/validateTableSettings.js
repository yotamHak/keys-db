export default function validateTableSettings(values) {
    let errors = {};

    Object.keys(values).forEach((key, index) => {
        const targetedValues = values[key]

        // Dropdown errors
        if (targetedValues.type === 'dropdown') {
            if (!targetedValues.options || !targetedValues.options.values || targetedValues.options.values.length === 0) {
                errors[key] = { options: `Missing Options` }
            }
        }
    })
    
    return errors;
}