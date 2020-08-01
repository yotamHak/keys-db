import React from "react";
import { Modal, Icon, List, Segment, Header, } from "semantic-ui-react";
import _ from 'lodash';


function ChangelogModal({trigger}) {
    const changes = [
        {
            date: '1/8/2020',
            list: [
                'Game categories fix',
                'Needs at least 1 character to add a game, not 3',
                'Changelog added'
            ]
        }
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