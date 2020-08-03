import React, { useState, } from "react";
import { Modal, Button, Confirm, Container, Segment, Grid, Form, Checkbox, Input, } from "semantic-ui-react";
import { useSelector, useDispatch } from "react-redux";
import _ from "lodash";

import useFormValidation from "../../../Authentication/useFormValidation";
import OptionsEditor from "../../OptionsEditor/OptionsEditor";
import ErrorBox from "../../../Authentication/ErrorBox/ErrorBox";
import { fieldTypes, cleanRedundentOptions } from "../../../../utils";
import validateHeaderSetting from "../../../Authentication/validateHeaderSetting";
import { setNewRowChange } from "../../../../actions";

function SetColumnSettingsModal({ triggerElement, headerLabel, }) {
    const dispatch = useDispatch()
    const headers = useSelector((state) => state.table.changes.headers)

    const handleOpen = () => setModalOpen(true)
    const handleClose = () => setModalOpen(false)

    const Child = React.Children.only(triggerElement);
    const newChildren = React.cloneElement(Child, { onClick: handleOpen });

    const [modalOpen, setModalOpen] = useState(false)

    const INITIAL_STATE = headers[headerLabel];

    const { handleSubmit, handleChange, reset, values, errors } = useFormValidation(INITIAL_STATE, validateHeaderSetting, saveHeaderSettings);

    function saveHeaderSettings() {
        dispatch(setNewRowChange('headers', {
            ...headers,
            [headerLabel]: cleanRedundentOptions(values)
        }))
        handleClose()
    }

    const modalContent = (
        <Modal.Content>
            <Form autoComplete="off">
                <Modal.Description>
                    <Container>
                        <Segment className="show-messages">
                            <Grid columns={2}>
                                <Grid.Row>
                                    <Grid.Column>
                                        <Form.Field inline>
                                            <label>Field Name</label>
                                            <Input
                                                fluid
                                                name={"label"}
                                                value={values["label"]}
                                                onChange={handleChange}
                                            />
                                        </Form.Field>
                                        <Form.Field>
                                            <Form.Checkbox
                                                label='Private'
                                                checked={values['isPrivate']}
                                                name={'isPrivate'}
                                                onChange={handleChange}
                                            />
                                        </Form.Field>
                                        <Form.Field>
                                            <Form.Checkbox
                                                label='Display'
                                                checked={values['display']}
                                                name={'display'}
                                                onChange={handleChange}
                                            />
                                        </Form.Field>
                                        <Form.Field>
                                            <Checkbox
                                                label='Filterable'
                                                checked={values['isFilter']}
                                                name={'isFilter'}
                                                onChange={handleChange}
                                            />
                                        </Form.Field>
                                        <Form.Field>
                                            <Form.Checkbox
                                                label='Sortable'
                                                checked={values['sortable']}
                                                name={'sortable'}
                                                onChange={handleChange}
                                            />
                                        </Form.Field>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Form.Field inline>
                                            <label>Type</label>
                                            <Form.Select
                                                options={fieldTypes}
                                                name={"type"}
                                                value={values["type"]}
                                                onChange={handleChange}
                                            />
                                        </Form.Field>
                                        {
                                            (values["type"] === 'steam_ownership' || values["type"] === 'steam_cards' || values["type"] === 'dropdown') &&
                                            <OptionsEditor headerKey={headerLabel} headers={headers} />
                                        }
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                            <ErrorBox errors={errors} />
                        </Segment>
                    </Container>
                </Modal.Description>
            </Form>
        </Modal.Content>
    )

    return (
        <Confirm
            size={'large'}
            open={modalOpen}
            header={`${headerLabel} Settings`}
            content={modalContent}
            onCancel={handleClose}
            onConfirm={handleSubmit}
            confirmButton={<Button positive>Save</Button>}
            trigger={newChildren}
        />
    )
}

export default SetColumnSettingsModal;