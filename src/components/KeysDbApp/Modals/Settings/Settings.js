import React from 'react'
import { Button, Form, Grid, Header, Message, Segment, Label, Modal, Icon } from 'semantic-ui-react'
import useFormValidation from '../../../Authentication/useFormValidation';

function Settings({ onSelect, initialValue, children }) {
    const INITIAL_STATE = {}

    const [showModal, setShowModal] = React.useState(false)

    // const { handleSubmit, handleChange, updateValues, values, errors } = useFormValidationn(INITIAL_STATE, validateSettings, handleCreateKey);

    const Child = React.Children.only(children);
    const newChildren = React.cloneElement(Child, { onClick: openModal });

    function openModal() { setShowModal(true) }
    function closeModal() { setShowModal(false) }

    return (
        <Modal
            closeIcon={<Icon name="close" onClick={closeModal} />}
            trigger={newChildren}
            centered={false}
            size="large"
            open={showModal}
        >
            <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
                <Grid.Column style={{ maxWidth: 600 }}>
                    <Header as='h2' color='black' textAlign='center'>
                        Settings
                </Header>
                    <Form size='large'>
                        <Segment stacked>
                            <Form.Input
                                fluid
                                icon='file excel'
                                iconPosition='left'
                                placeholder='Spreadsheet ID'
                            />
                            <Form.Input
                                fluid
                                icon='steam'
                                iconPosition='left'
                                placeholder='Steam Web API Key'
                            />
                            {/* <Form.Input
                            fluid
                            icon='rocket'
                            iconPosition='left'
                            placeholder='IsThereAnyDeal API Key'
                        /> */}

                            <Button color='black' fluid size='large'>
                                Save
                        </Button>
                        </Segment>
                    </Form>
                    <Message style={{ textAlign: 'left' }}>
                        <Message.Header>Where do I get them from?</Message.Header>
                        <Message.List>
                            <Message.Item>
                                Make a copy of <a target='_blank' href='https://docs.google.com/spreadsheets/d/1Xu-kbGGwi40FKgrf5NJMAjGQgHlR3qYmk-w6dUs74Fo/edit#gid=0'>this</a> and get the ID of your copy from the url,
                            <br />
                            ID looks like: <Label>1Xu-kbGGwi40FKgrf5NJMAjGQgHlR3qYmk-w6dUs74Fo</Label>
                            </Message.Item>
                            <Message.Item>Get your Steam Web API Key <a target='_blank' href='https://steamcommunity.com/dev/apikey'>Here</a></Message.Item>
                            {/* <Message.Item>Get your IsThereAnyDeal API Key <a target='_blank' href='https://isthereanydeal.com/dev/app/'>Here</a></Message.Item> */}
                        </Message.List>
                    </Message>
                </Grid.Column>
            </Grid>
        </Modal>
    )
}

export default Settings