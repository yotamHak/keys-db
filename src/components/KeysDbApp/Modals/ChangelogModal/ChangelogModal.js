import React from "react";
import { Modal, Icon, List, Segment, Header, Container, } from "semantic-ui-react";

export const changelog = [
    {
        version: '0.6.2',
        date: '14/10/2020',
        list: [
            'New\\Edit Key - Key platform is now integrated to the key input.',
        ]
    },
    {
        version: '0.6.1',
        date: '13/10/2020',
        list: [
            'General - Bugs, stability, performance fixes, and other boring stuff.',
        ]
    },
    {
        version: '0.6',
        date: '12/10/2020',
        list: [
            'Fields - New Key Platform field, Field is a multi-select field, and will display under the key field.',
            'General - Bugs, stability, performance fixes, and other boring stuff.',
        ]
    },
    {
        version: '0.5.9',
        date: '8/10/2020',
        list: [
            'Table - New Create SteamGift giveaway feature, can be found in the actions dropdown.',
        ]
    },
    {
        version: '0.5.8.1',
        date: '4/10/2020',
        list: [
            'Steam Login - fixed small issue.',
            'General - Bugs, stability, performance fixes, and other boring stuff.',
        ]
    },
    {
        version: '0.5.8',
        date: '29/9/2020',
        list: [
            'General - Bugs, stability, performance fixes, and other boring stuff.',
            'Error handling - Better feedback when errors occur.',
        ]
    },
    {
        version: '0.5.7.1',
        date: '25/8/2020',
        list: [
            'Table - Moved filter from table headers into it\'s own dropdown, near sorting.',
            'Table - Some styling changes.',
        ]
    },
    {
        version: '0.5.7',
        date: '23/8/2020',
        list: [
            'Table - You can now update ITAD information from the actions dropdown.',
            'General - Bugs, stability, performance fixes, and other boring stuff.',
        ]
    },
    {
        version: '0.5.6',
        date: '20/8/2020',
        list: [
            'Table - Hovering for at least 1 second on game title will show popover of the games title and the games image from Steam.',
            'Fields - New Steam Bundled field, will be filled automatically.',
        ]
    },
    {
        version: '0.5.5',
        date: '19/8/2020',
        list: [
            'Settings - You can now add and delete fields.',
            'Fields - New Steam Achievements field, will be filled automatically.',
            'Note Field - Fixed issue where the note i still displayed even though it\'s empty.',
            'General - Bugs, stability, performance fixes, and other boring stuff.',
        ]
    },
    {
        version: '0.5.4.1',
        date: '12/8/2020',
        list: [
            'Game Info - Changed loading to give a better feedback.',
            'Home - Grammatical fixes.',
        ]
    },
    {
        version: '0.5.4',
        date: '11/8/2020',
        list: [
            'New\\Edit Key - Date have a date picker.',
            'New\\Edit Key - Fixed issue with initial date.',
            'New\\Edit Key - Fixed issue with selection inputs.',
            'Home - Redesign to reflect features and grammatical fixes.',
        ]
    },
    {
        version: '0.5.3',
        date: '10/8/2020',
        list: [
            'Added TOS and Privacy Policy to comply with Google OAuth verification request.',
        ]
    },
    {
        version: '0.5.2',
        date: '9/8/2020',
        list: [
            'Import is now available.',
            'Settings - Better explanation to each setting.',
            'Options - Fixed editing issues.',
            'Options - Pre-set options for certain types.',
        ]
    },
    {
        version: '0.5.1',
        date: '2/8/2020',
        list: [
            'Options - Options are now editable.',
        ]
    },
    {
        version: '0.5',
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
                                    <Header as={'h3'}>{changelist.version}</Header>
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