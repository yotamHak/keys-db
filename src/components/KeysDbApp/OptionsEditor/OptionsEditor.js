import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash'

import { setNewOptionsChange, removeNewOptionsChange, initOptionsChange, resetOptionsChange } from '../../../actions';
import useFormValidation from '../../Authentication/useFormValidation';
import validateOption from '../../Authentication/validateOption';
import { Segment, Label, Form, Input, List, Button, Message, } from 'semantic-ui-react';
import { colorOptions } from '../../../utils';

function OptionsEditor({ headerKey, }) {
    const headerToBeChanged = useSelector((state) => state.table.changes.headers[headerKey])
    const optionsObject = useSelector((state) => state.table.changes.headers[headerKey].options || { allowEdit: true, values: [] })

    const dispatch = useDispatch()

    const addNewOption = () => {
        dispatch(setNewOptionsChange(headerKey, [values]));
        reset()
    }

    const removeOption = (option) => dispatch(removeNewOptionsChange(headerKey, option))

    const INITIAL_STATE = { value: '', color: "black" }
    const { handleSubmit, handleChange, reset, values, errors } = useFormValidation(INITIAL_STATE, validateOption, addNewOption);

    useEffect(() => {
        if (optionsObject.values.length === 0) {
            dispatch(initOptionsChange(headerKey))
        }

        return () => {
            if (optionsObject.values.length === 0 || (headerToBeChanged.type !== 'dropdown')) {
                dispatch(resetOptionsChange(headerKey, headerToBeChanged.type))
            }
        }
    }, [])

    return (
        <Segment className={'segment-no-last-child-bottom-margin'}>
            <Label attached='top'>Options</Label>
            {
                optionsObject.allowEdit && (
                    <Form autoComplete="off" as="div" className="show-messages">
                        <Form.Group widths="equal" style={{}}>
                            <Form.Field
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
                            <Form.Field>
                                <label>Color</label>
                                <Form.Select
                                    options={colorOptions}
                                    name={"color"}
                                    value={values["color"]}
                                    onChange={handleChange}
                                />
                            </Form.Field>
                        </Form.Group>
                        <Form.Button onClick={handleSubmit}>Add</Form.Button>
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