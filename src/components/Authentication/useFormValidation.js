import { useState, useEffect } from "react";

function useFormValidation(initialState, validate, authenticate) {
    const [values, setValues] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isSubmitting) {
            const noErrors = Object.keys(errors).length === 0;

            if (noErrors) {
                authenticate();
                setSubmitting(false);
            } else {
                setSubmitting(false);
            }
        }
    }, [errors])

    function reset() {
        setValues(initialState)
    }

    function updateValues(event, values) {
        event.persist();
        setValues(previousValues => ({
            ...previousValues,
            ...Object.keys(values).reduce((result, item) => ({
                ...result,
                [values[item].header]: values[item].value || values[item].checked
            }), {})
        }))
    }

    function handleChange(event, data, key = null) {
        event.persist();

        if (key) {
            setValues(previousValues => ({
                ...previousValues,
                [key]: {
                    ...previousValues[key],
                    [data.name]: data.value || data.checked,
                    // values: {
                    //     ...previousValues[key].values,
                    //     [data.name]: data.value || data.checked,                        
                    // }
                }
            }));
        } else {
            setValues(previousValues => ({
                ...previousValues,
                [data.name]: data.value === undefined
                    ? data.checked
                    : data.value
            }));
        }
    }

    function handleBlur() {
        const validationErrors = validate(values);
        setErrors(validationErrors);
    }

    function handleSubmit(event) {
        event.preventDefault();
        const validationErrors = validate(values);
        setErrors(validationErrors);
        setSubmitting(true);
    }

    function updateOptions(key, options) {
        setValues(previousValues => ({
            ...previousValues,
            [key]: {
                ...previousValues[key],
                options: options
            }
        }))
    }

    return { handleSubmit, handleBlur, handleChange, updateValues, updateOptions, reset, values, errors, isSubmitting }
}

export default useFormValidation;
