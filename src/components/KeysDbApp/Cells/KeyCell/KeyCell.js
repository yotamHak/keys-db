import React, { useRef, useState, } from "react";
import { Table, Icon, Grid, Popup, Input, Button, Select } from "semantic-ui-react";
import _ from 'lodash';

import { getIndexById, getLabelByType, getValueByType, isSteamKey, isUrl } from "../../../../utils";
import useInterval from '../../../../hooks/useInterval'
import { useDispatch, useSelector } from "react-redux";
import { setNewRowChange } from "../../../../actions/TableActions";

function KeyCell({ gameKey, rowIndex, header }) {
    const headers = useSelector((state) => state.table.headers)
    const gameData = useSelector((state) => state.table.rows[rowIndex])

    const [, setCopySuccess] = useState(null);
    const [resetCopyFeedback, setResetCopyFeedback] = useState(false);

    const inputRef = useRef(null);
    const dispatch = useDispatch();

    const keyPlatformKey = getLabelByType(headers, "key_platform");

    const options = keyPlatformKey && headers[keyPlatformKey].options.values.reduce((result, option) => (_.concat(result, [{
        key: option.value,
        text: option.value,
        value: option.value,
    }])), [])

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

    const actions = () => (
        <>
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
                    : (
                        <Button
                            color='teal'
                            icon
                            onClick={copyToClipboard}>
                            <Icon name='copy' />
                        </Button>
                    )
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
        </>
    )

    function handleActivationButton() {

    }

    function handleChange(e, value, headerId) {
        dispatch(setNewRowChange(rowIndex, {
            ...gameData,
            [getIndexById(headerId)]: value
        }))
    }

    return (
        <Table.Cell singleLine>
            <Grid columns={1}>
                <Grid.Row className='width-auto'>
                    <Grid.Column className='width-auto'>
                        {
                            keyPlatformKey
                                ? (
                                    <Input
                                        ref={inputRef}
                                        type='text'
                                        defaultValue={gameKey}
                                        className="full-width"
                                        onChange={(e, { value }) => handleChange(e, value, header.id)}
                                        action
                                    >

                                        <Select
                                            compact
                                            options={options}
                                            defaultValue={getValueByType(gameData, headers, 'key_platform') || 'Steam'}
                                            onChange={(e, { value }) => handleChange(e, value, headers[keyPlatformKey].id)}
                                        />
                                        <input />
                                        {actions()}
                                    </Input>
                                )
                                : (
                                    <Input
                                        ref={inputRef}
                                        type='text'
                                        defaultValue={gameKey}
                                        className="full-width"
                                        onChange={(e, { value }) => handleChange(e, value, header.id)}
                                        action
                                    >
                                        <input />
                                        {actions()}
                                    </Input>
                                )
                        }

                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Table.Cell>
    );
}

export default KeyCell;