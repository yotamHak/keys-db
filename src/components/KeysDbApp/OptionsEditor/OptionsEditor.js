import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Segment, Label, Form, Input, List, Button, Message, } from 'semantic-ui-react';
import _ from 'lodash'

import { setNewOptionsChange, removeNewOptionsChange, initOptionsChange, resetOptionsChange, editOptionsChange, } from '../../../actions';
import useFormValidation from '../../Authentication/useFormValidation';
import validateOption from '../../Authentication/validateOption';
import { colorOptions } from '../../../utils';
import { useState } from 'react';

function OptionsEditor({ headerKey, }) {
    const headerToBeChanged = useSelector((state) => state.table.changes.headers[headerKey])
    const optionsObject = useSelector((state) => state.table.changes.headers[headerKey].options || { allowEdit: true, values: [] })

    const [isEditing, setIsEditing] = useState(false)

    const dispatch = useDispatch()

    const addNewOption = () => {
        if (isEditing) {
            dispatch(editOptionsChange(headerKey, isEditing, [values]))
            setIsEditing(false)
        } else {
            dispatch(setNewOptionsChange(headerKey, [values]))
        }
        reset()
    }

    const INITIAL_STATE = { value: '', color: "black" }
    const { handleSubmit, handleChange, reset, values, errors } = useFormValidation(INITIAL_STATE, validateOption, addNewOption);

    useEffect(() => {
        if (optionsObject.values.length === 0) {
            dispatch(initOptionsChange(headerKey))
        }

        return () => {
            const ignoredTypes = ['dropdown', 'steam_ownership', 'steam_cards']

            if (optionsObject.values.length === 0 || ignoredTypes.find(item => headerToBeChanged.type === item) === undefined) {
                dispatch(resetOptionsChange(headerKey, headerToBeChanged.type))
            }
        }
    }, [])

    const removeOption = option => dispatch(removeNewOptionsChange(headerKey, option))

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
                optionsObject.allowEdit && (
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
                    optionsObject.values.map((option, index) => (
                        <List.Item key={index}>
                            <List.Content floated='left' style={{ display: 'flex', alignItems: 'center' }}>
                                <Label circular color={option.color || 'black'} />
                                &nbsp;
                                <List.Description>{option.value}</List.Description>
                            </List.Content>
                            {
                                optionsObject.allowEdit && (
                                    <List.Content floated='right' style={{ display: 'flex', alignItems: 'center' }}>
                                        <Button icon='pencil' size='mini' circular basic onClick={(event) => { handleEditOption(event, index, option) }} />
                                        <Button icon='x' size='mini' circular basic onClick={() => { removeOption(option) }} />
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