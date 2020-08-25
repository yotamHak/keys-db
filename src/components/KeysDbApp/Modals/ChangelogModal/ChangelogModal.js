import React from "react";
import { Modal, Icon, List, Segment, Header, Container, } from "semantic-ui-react";

export const changelog = [
    {
        date: '25/8/2020',
        list: [
            'Table - Moved filter from table headers into it\'s own dropdown, near sorting.',
        ]
    },
    {
        date: '23/8/2020',
        list: [
            'Table - You can now update ITAD information from the actions dropdown.',
            'General - Bugs, stability, performance fixes, and other boring stuff.',
        ]
    },
    {
        date: '20/8/2020',
        list: [
            'Table - Hovering for at least 1 second on game title will show popover of the games title and the games image from Steam.',
            'Fields - New Steam Bundled field, will be filled automatically.',
        ]
    },
    {
        date: '19/8/2020',
        list: [
            'Settings - You can now add and delete fields.',
            'Fields - New Steam Achievements field, will be filled automatically.',
            'Note Field - Fixed issue where the note i still displayed even though it\'s empty.',
            'General - Bugs, stability, performance fixes, and other boring stuff.',
        ]
    },
    {
        date: '12/8/2020',
        list: [
            'Game Info - Changed loading to give a better feedback.',
            'Home - Grammatical fixes.',
        ]
    },
    {
        date: '11/8/2020',
        list: [
            'New\\Edit Key - Date have a date picker.',
            'New\\Edit Key - Fixed issue with initial date.',
            'New\\Edit Key - Fixed issue with selection inputs.',
            'Home - Redesign to reflect features and grammatical fixes.',
        ]
    },
    {
        date: '10/8/2020',
        list: [
            'Added TOS and Privacy Policy to comply with Google OAuth verification request.',
        ]
    },
    {
        date: '9/8/2020',
        list: [
            'Import is now available.',
            'Settings - Better explanation to each setting.',
            'Options - Fixed editing issues.',
            'Options - Pre-set options for certain types.',
        ]
    },
    {
        date: '2/8/2020',
        list: [
            'Options - Options are now editable.',
        ]
    },
    {
        date: '1/8/2020',
        list: [
            'Game Info - Game categories fix.',
            'New\\Edit Key - Changed the minimum characters needed to add a game from 3 to 1.',
            'Export - Export fix.',
            'New\\Edit Key - Date value will be filled to today\'s date on open.',
            'Changelog added.'
        ]
    },
]

function ChangelogModal({ trigger }) {
    return (
        <Modal
            trigger={trigger}
            closeIcon={<Icon name="close" />}
            centered={false}
            size={'small'}
        >
            <Modal.Header as={'h1'}>Changelog</Modal.Header>
            <Modal.Content scrolling>
                <Modal.Description>
                    <Container>
                        {
                            changelog.map((changelist, index) => (
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
                    </Container>
                </Modal.Description>
            </Modal.Content>
        </Modal >
    );
}

export default ChangelogModal;