import React from 'react';
import { Form, Input, Grid, Popup, Icon, Checkbox, } from 'semantic-ui-react';

import { isDropdownType, getAllFieldTypes } from '../../../utils';
import ErrorBox from '../../ErrorBox';
import OptionsEditor from '../OptionsEditor';

function FieldSettings({ headerKey, values, errors, handleChange, }) {
    function handleInitOptions(headerKey, values) {
        handleChange(null, {
            name: 'options',
            value: {
                allowEdit: values ? false : true,
                values: values || [],
            }
        },
            headerKey ? headerKey : undefined
        )
    }

    function handleOptionsChange(newValues, headerKey) {
        handleChange(null, {
            name: 'options',
            value: newValues
        },
            headerKey ? headerKey : undefined
        )
    }

    function handleChangeWrapper(event, data) {
        handleChange(event,
            data,
            headerKey ? headerKey : undefined
        )
    }

    return (
        <React.Fragment>
            <Grid columns={2}>
                <Grid.Row>
                    <Grid.Column>
                        <Form.Field inline>
                            <label>
                                <Popup
                                    trigger={<Icon name='question circle' />}
                                    content='This represents the column header label.'
                                    position='right center'
                                /> Label
                            </label>
                            <Input
                                fluid
                                name={"label"}
                                value={values["label"]}
                                onChange={handleChangeWrapper}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Form.Checkbox
                                label={
                                    <label>
                                        <Popup
                                            trigger={<Icon name='question circle' />}
                                            content='Checking this will make this a private column, meaning, when you export, these columns will be removed from the newly spreadsheet.'
                                            position='right center'
                                        /> Private
                                    </label>
                                }
                                checked={values['isPrivate']}
                                name={'isPrivate'}
                                onChange={handleChangeWrapper}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Form.Checkbox
                                label={
                                    <label>
                                        <Popup
                                            trigger={<Icon name='question circle' />}
                                            content='Checking this will make this show up on the table.'
                                            position='right center'
                                        /> Display
                                    </label>
                                }
                                checked={values['display']}
                                name={'display'}
                                onChange={handleChangeWrapper}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Checkbox
                                label={
                                    <label>
                                        <Popup
                                            trigger={<Icon name='question circle' />}
                                            content='Checking this will allow the user to apply a filter using the options, this only works for multi-options types.'
                                            position='right center'
                                        /> Filterable
                                    </label>
                                }
                                checked={values['isFilter']}
                                name={'isFilter'}
                                onChange={handleChangeWrapper}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Form.Checkbox
                                label={
                                    <label>
                                        <Popup
                                            trigger={<Icon name='question circle' />}
                                            content='Checking this will allow the user to apply sort on this field.'
                                            position='right center'
                                        /> Sortable
                                    </label>
                                }
                                checked={values['sortable']}
                                name={'sortable'}
                                onChange={handleChangeWrapper}
                            />
                        </Form.Field>
                    </Grid.Column>
                    <Grid.Column>
                        <Form.Field inline>
                            <label>
                                <Popup
                                    trigger={<Icon name='question circle' />}
                                    content='This represents the value type of the data that will be inputted in this specific column.'
                                    position='right center'
                                /> Type
                            </label>
                            <Form.Select
                                options={getAllFieldTypes()}
                                name={"type"}
                                value={values["type"]}
                                onChange={handleChangeWrapper}
                            />
                        </Form.Field>
                        {

                            isDropdownType(values["type"]) && <OptionsEditor
                                headerKey={headerKey}
                                type={values["type"]}
                                options={values.options}
                                onInitOptions={handleInitOptions}
                                onOptionsChange={handleOptionsChange}
                            />
                        }
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            <ErrorBox errors={errors} />
        </React.Fragment>
    )
}

export default FieldSettings;