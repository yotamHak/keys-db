import React from "react";
import { Modal, Icon, List, Segment, Header, } from "semantic-ui-react";

function ChangelogModal({ trigger }) {
    const changes = [
        {
            date: '5/8/2020',
            list: [
                'Import is now available.',
            ]
        },
        {
            date: '2/8/2020',
            list: [
                'Options are now editable.',
            ]
        },
        {
            date: '1/8/2020',
            list: [
                'Game categories fix.',
                'Changed the minimum characters needed to add a game from 3 to 1.',
                'Export fix.',
                'In the new\\edit key, the date value will be filled to today\'s date on open.',
                'Changelog added.'
            ]
        },
    ]

    return (
        <Modal
            trigger={trigger}
            closeIcon={<Icon name="close" />}
            centered={false}
            size={'large'}
        >
            <Modal.Header as={'h1'}>Changelog</Modal.Header>
            <Modal.Content scrolling>
                <Modal.Description>
                    {
                        changes.map((changelist, index) => (
                            <Segment key={index}>
                                <Header as={'h3'}>{changelist.date}</Header>
                                <List bulleted>
                                    {
                                        changelist.list.map((listitem, index) => (
                                            <List.Item key={index}>{listitem}</List.Item>
                                        ))
                                    }
                                </List>
                            </Segment>
                        ))
                    }
                </Modal.Description>
            </Modal.Content>
        </Modal >
    );
}

export default ChangelogModal;