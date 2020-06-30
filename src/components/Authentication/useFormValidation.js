import React from "react";

function useFormValidation(initialState, validate, authenticate) {
    const [values, setValues] = React.useState(initialState);
    const [errors, setErrors] = React.useState({});
    const [isSubmitting, setSubmitting] = React.useState(false);

    React.useEffect(() => {
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

    function updateValues(event, values) {
        event.persist();
        setValues(previousValues => ({
            ...previousValues,
            ...Object.keys(values).reduce((result, item) => ({
                ...result,
                [values[item].header]: values[item].value
            }), {})
        }))
    }

    function handleChange(event, { name, value }) {
        event.persist();
        setValues(previousValues => ({
            ...previousValues,
            [name]: value
        }));
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

    return { handleSubmit, handleBlur, handleChange, updateValues, values, errors, isSubmitting }
}

export default useFormValidation;
