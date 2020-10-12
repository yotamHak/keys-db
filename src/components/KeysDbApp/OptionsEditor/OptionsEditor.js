import React, { useEffect, useState } from 'react';
import { Segment, Label, Form, Input, List, Button, Message, } from 'semantic-ui-react';
import _ from 'lodash'

import useFormValidation from '../../../hooks/useFormValidation';
import validateOption from '../../../hooks/formValidations/validateOption';
import usePrevious from '../../../hooks/usePrevious'
import { colorOptions, } from '../../../utils';

function OptionsEditor({ headerKey, type, options, onInitOptions, onOptionsChange, }) {
    const [isEditing, setIsEditing] = useState(false)
    const prevType = usePrevious(type);

    const defaultDropdownValues = {
        'steam_ownership': [
            {
                value: 'Own',
                color: 'green',
            },
            {
                value: 'Missing',
                color: 'red',
            },
        ],
        'steam_cards': [
            {
                value: 'Have',
                color: 'green',
            },
            {
                value: 'Missing',
                color: 'red',
            },
        ],
        'steam_achievements': [
            {
                value: 'Have',
                color: 'green',
            },
            {
                value: 'Missing',
                color: 'red',
            },
        ],
    }

    const startingDropdownValues = {
        'key_platform': [
            {
                value: 'Steam',
                color: 'blue',
            },
            {
                value: 'GOG',
                color: 'purple',
            },
            {
                value: 'Epic Game Store',
                color: 'grey',
            },
            {
                value: 'Uplay',
                color: 'black',
            },
            {
                value: 'Origin',
                color: 'orange',
            },
            {
                value: 'Microsoft',
                color: 'green',
            },
            {
                value: 'Battle.net',
                color: 'blue',
            },
        ],
    }

    const INITIAL_STATE = { value: '', color: "black" }
    const { handleSubmit, handleChange, reset, values, errors } = useFormValidation(INITIAL_STATE, validateOption, addNewOption);

    useEffect(() => {
        if (options === undefined || ((prevType !== undefined) && type !== prevType)) {
            onInitOptions(headerKey, startingDropdownValues[type] || defaultDropdownValues[type], defaultDropdownValues[type] ? false : true)
        }
    }, [options, type])

    function addNewOption() {
        if (isEditing !== false) {
            onOptionsChange(
                {
                    ...options,
                    values: options.values.reduce((result, value, currentIndex) => ([
                        ...result,
                        currentIndex === isEditing
                            ? values
                            : value
                    ]), [])
                },
                headerKey)
            setIsEditing(false)
        } else {
            onOptionsChange(
                {
                    ...options,
                    values: _.concat(options.values, [values]),
                },
                headerKey)
        }
        reset()
    }

    function removeOption(index) {
        onOptionsChange(
            {
                ...options,
                values: options.values.filter((item, currentIndex) => currentIndex !== index)
            },
            headerKey)
    }

    function handleEditOption(event, index, option) {
        handleChange(event, { name: "value", value: option.value })
        handleChange(event, { name: "color", value: option.color })

        setIsEditing(index)
    }

    function handleCancelEdit(event) {
        event.preventDefault()
        handleChange(event, { name: "value", value: INITIAL_STATE.value })
        handleChange(event, { name: "color", value: INITIAL_STATE.color })
        setIsEditing(false)
    }

    return (
        <Segment className={'segment-no-last-child-bottom-margin'}>
            <Label attached='top'>Options</Label>
            {
                options && options.allowEdit && (
                    <Form autoComplete="off" as="div" className="show-messages">
                        <Form.Group>
                            <Form.Field
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    maxWidth: '50%',
                                    flexGrow: 1,
                                }}
                                error={errors.value && {
                                    content: errors.value,
                                    pointing: 'below',
                                }}
                            >
                                <label>Option</label>
                                <Input
                                    name={"value"}
                                    value={values["value"]}
                                    onChange={handleChange}
                                />
                            </Form.Field>
                            <Form.Field style={{
                                display: "flex",
                                flexDirection: "column",
                                flexGrow: 1,
                            }}>
                                <label>Color</label>
                                <Form.Select
                                    style={{ minWidth: "100%" }}
                                    options={colorOptions}
                                    name={"color"}
                                    value={values["color"]}
                                    onChange={handleChange}
                                />
                            </Form.Field>
                            <Form.Field
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "flex-end",
                                    alignItems: "center",
                                    marginBottom: "0.1em",
                                }}>
                                {
                                    isEditing === false
                                        ? <Form.Button inline onClick={handleSubmit}>Add</Form.Button>
                                        : <Button.Group>
                                            <Button icon='x' negative onClick={handleCancelEdit} />
                                            <Button.Or />
                                            <Button icon='check' positive onClick={handleSubmit} />
                                        </Button.Group>
                                }
                            </Form.Field>
                        </Form.Group>
                        {
                            !_.isEmpty(errors) && (
                                <Message attached='bottom' error>
                                    <Message.List>
                                        {
                                            Object.keys(errors).map((errorKey, index) => (
                                                <Message.Item key={errorKey}>
                                                    {errors[errorKey]}
                                                </Message.Item>
                                            ))
                                        }
                                    </Message.List>
                                </Message>
                            )
                        }
                    </Form>
                )
            }

            <List style={{ maxHeight: '10em', overflow: 'auto' }}>
                {
                    options && options.values.map((option, index) => (
                        <List.Item key={index}>
                            <List.Content floated='left' style={{ display: 'flex', alignItems: 'center' }}>
                                <Label circular color={option.color || 'black'} />
                                &nbsp;
                                <List.Description>{option.value}</List.Description>
                            </List.Content>
                            {
                                options.allowEdit && (
                                    <List.Content floated='right' style={{ display: 'flex', alignItems: 'center' }}>
                                        <Button icon='pencil' size='mini' onClick={(event) => { handleEditOption(event, index, option) }} circular basic />
                                        <Button icon='x' size='mini' onClick={() => { removeOption(index) }} circular basic />
                                    </List.Content>
                                )
                            }
                        </List.Item>
                    ))
                }
            </List>
        </Segment>
    )
}

export default OptionsEditor;