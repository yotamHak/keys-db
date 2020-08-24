import React, { useRef, useState, } from "react";
import { Table, Icon, Grid, Popup, Input, Button } from "semantic-ui-react";

import { isSteamKey, isUrl } from "../../../../utils";
import useInterval from '../../../../hooks/useInterval'

function KeyCell({ gameKey, rowIndex, onChange, header }) {
    const [, setCopySuccess] = useState(null);
    const [resetCopyFeedback, setResetCopyFeedback] = useState(false);

    const inputRef = useRef(null);

    useInterval(() => {
        setResetCopyFeedback(false)
    }, resetCopyFeedback ? 3000 : null);

    function copyToClipboard(e) {
        inputRef.current.select();
        document.execCommand('copy');
        e.target.focus();

        setCopySuccess('Copied!');

        setResetCopyFeedback(true)
    };

    return (
        <Table.Cell singleLine>
            <Grid columns={1}>
                <Grid.Row className='width-auto'>
                    <Grid.Column className='width-auto'>
                        <Input
                            type='text'
                            defaultValue={gameKey}
                            action
                            style={{ width: '100%' }}
                            onChange={(e, { value }) => { onChange(header, value) }}
                        >
                            <input ref={inputRef} />
                            {
                                resetCopyFeedback
                                    ? (
                                        <Popup
                                            open
                                            size='mini'
                                            content={"Copied to clipboard!"}
                                            position='top center'
                                            trigger={
                                                <Button
                                                    color='teal'
                                                    icon
                                                    onClick={copyToClipboard}>
                                                    <Icon name='copy' />
                                                </Button>
                                            }
                                        />
                                    )
                                    : <Button
                                        color='teal'
                                        icon
                                        onClick={copyToClipboard}>
                                        <Icon name='copy' />
                                    </Button>
                            }
                            {
                                isSteamKey(gameKey) && (
                                    <Popup
                                        size='mini'
                                        content={"Activate on Steam"}
                                        position='top center'
                                        trigger={
                                            <Button
                                                color='teal'
                                                icon
                                                as='a'
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                href={`https://store.steampowered.com/account/registerkey?key=${gameKey}`}
                                            >
                                                <Icon name='key' />
                                            </Button>
                                        }
                                    />
                                )
                            }
                            {
                                isUrl(gameKey) && (
                                    <Popup
                                        size='mini'
                                        content={"Open link"}
                                        position='top center'
                                        trigger={
                                            <Button
                                                color='teal'
                                                icon
                                                as='a'
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                href={gameKey}
                                            >
                                                <Icon name='world' />
                                            </Button>
                                        }
                                    />
                                )
                            }
                        </Input>
                    </Grid.Column>

                </Grid.Row>
            </Grid>
        </Table.Cell>
    );
}

export default KeyCell;