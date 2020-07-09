// https://steamdb.info/app/730/

import React, { useState, useEffect } from "react";
import { Modal, Icon, Grid, Item, Placeholder, Statistic, Segment, Header, Message, Container } from "semantic-ui-react";
import steamApi from '../../../../steam'
import ImageCarousel from "../../../ImageCarousel/ImageCarousel";
import _ from 'lodash';
import itadApi from "../../../../itad";

function GameInfoModal({ appId, children, }) {
    const [showModal, setShowModal] = useState(false)
    const [appData, setAppData] = useState(null)
    const [gameBundles, setGameBundles] = useState({ success: false })

    const [errorGettingSteamData, setErrorGettingSteamData] = useState(false)
    const [errorGettingItadData, setErrorGettingItadData] = useState(false)

    const [extendedDescription, setExtendedDescription] = useState(false)

    const Child = React.Children.only(children);
    const newChildren = React.cloneElement(Child, { onClick: openModal });

    function openModal() { setShowModal(true) }
    function closeModal() { setShowModal(false) }

    useEffect(() => {
        if (showModal) {
            steamApi.AppDetails(appId)
                .then(response => {
                    if (response) {
                        itadApi.GetInfoAboutBundles(response.name)
                            .then(response => {
                                if (response.success) {
                                    console.log("ITAD Bundled data:", response)
                                    setGameBundles(response)
                                } else {
                                    setErrorGettingItadData(true)
                                }
                            })

                        console.log("Steam data:", response)
                        setAppData(response)
                    } else {
                        setErrorGettingSteamData(true)
                    }
                })
        }
    }, [showModal])

    return (
        <Modal
            closeIcon={<Icon name="close" onClick={closeModal} />}
            trigger={newChildren}
            centered={false}
            size={errorGettingSteamData ? 'small' : 'large'}
            open={showModal}
        >
            {
                errorGettingSteamData
                    ? (
                        <React.Fragment>
                            <Modal.Header>Error Loading Game Info</Modal.Header>
                            <Modal.Content>
                                <Segment>
                                    <Message error>
                                        Error loading game info...
                                    </Message>
                                </Segment>
                            </Modal.Content>
                        </React.Fragment>
                    )
                    : (
                        <React.Fragment>
                            {
                                appData
                                    ? (
                                        <React.Fragment>
                                            <Modal.Header>
                                                <span>{appData.name}</span>
                                            </Modal.Header>
                                            <Modal.Content scrolling>
                                                <Grid columns={4}>
                                                    <Grid.Row>
                                                        <Grid.Column width={6}>
                                                            <ImageCarousel images={appData.screenshots.reduce((result, item) => (_.concat(result, [item.path_full])), [])} />
                                                        </Grid.Column>
                                                        <Grid.Column width={10}>
                                                            <Segment vertical>
                                                                <Statistic.Group>
                                                                    {
                                                                        appData.metacritic && (
                                                                            <Statistic horizontal
                                                                                color={appData.metacritic.score > 80 ? 'green' : appData.metacritic.score < 50 ? 'red' : 'yellow'}
                                                                                as='a'
                                                                                target='_blank'
                                                                                rel='noopener noreferrer'
                                                                                href={appData.metacritic.url}
                                                                            >
                                                                                <Statistic.Label>Metacritic Score</Statistic.Label>
                                                                                <Statistic.Value>{appData.metacritic.score}</Statistic.Value>
                                                                            </Statistic>
                                                                        )
                                                                    }

                                                                    <Statistic horizontal
                                                                        as='a'
                                                                        target='_blank'
                                                                        rel='noopener noreferrer'
                                                                        href={`https://store.steampowered.com/app/${appId}/`}
                                                                    >
                                                                        <Statistic.Label>Current Price</Statistic.Label>
                                                                        <Statistic.Value>{appData.price_overview.final_formatted}</Statistic.Value>
                                                                    </Statistic>

                                                                    {
                                                                        gameBundles.success && (
                                                                            <Statistic horizontal
                                                                                color={gameBundles.times_bundled == 0 ? 'green' : gameBundles.times_bundled <= 3 ? 'yellow' : 'red'}
                                                                                as='a'
                                                                                target='_blank'
                                                                                rel='noopener noreferrer'
                                                                                href={gameBundles.bundle_url}
                                                                            >
                                                                                <Statistic.Label>Times Bundled</Statistic.Label>
                                                                                <Statistic.Value>{gameBundles.times_bundled}</Statistic.Value>
                                                                            </Statistic>
                                                                        )
                                                                    }
                                                                </Statistic.Group>
                                                            </Segment>
                                                            <Segment vertical>
                                                                <Header as='h3' style={{ width: '100%' }} className='pointer' onClick={() => setExtendedDescription(!extendedDescription)}>
                                                                    <Grid width={16}>
                                                                        <Grid.Column floated='left' width={10} textAlign='left'>
                                                                            About the game
                                                                    </Grid.Column>
                                                                        <Grid.Column floated='right' width={6} textAlign='right'>
                                                                            <Icon name={extendedDescription ? 'angle up' : 'angle down'} />
                                                                        </Grid.Column>
                                                                    </Grid>
                                                                </Header>
                                                                <Container>
                                                                    <div dangerouslySetInnerHTML={{ __html: extendedDescription ? appData.detailed_description : appData.short_description }} />
                                                                </Container>
                                                            </Segment>
                                                        </Grid.Column>
                                                    </Grid.Row>
                                                </Grid>
                                            </Modal.Content>
                                        </React.Fragment>
                                    )
                                    : (
                                        <React.Fragment>
                                            <Modal.Header>
                                                <Placeholder>
                                                    <Placeholder.Header>
                                                        <Placeholder.Line length='full' />
                                                    </Placeholder.Header>
                                                </Placeholder>
                                            </Modal.Header>
                                            <Modal.Content scrolling>
                                                <Grid columns={4}>
                                                    <Grid.Row>
                                                        <Grid.Column width={6}>
                                                            <Placeholder>
                                                                <Placeholder.Image rectangular />
                                                            </Placeholder>
                                                        </Grid.Column>
                                                        <Grid.Column width={10}>
                                                            <Segment vertical>
                                                                <Grid columns={3}>
                                                                    <Grid.Column>
                                                                        <Placeholder>
                                                                            <Placeholder.Header>
                                                                                <Placeholder.Line />
                                                                            </Placeholder.Header>
                                                                        </Placeholder>
                                                                    </Grid.Column>
                                                                    <Grid.Column>
                                                                        <Placeholder>
                                                                            <Placeholder.Header>
                                                                                <Placeholder.Line />
                                                                            </Placeholder.Header>
                                                                        </Placeholder>
                                                                    </Grid.Column>
                                                                    <Grid.Column>
                                                                        <Placeholder>
                                                                            <Placeholder.Header>
                                                                                <Placeholder.Line />
                                                                            </Placeholder.Header>
                                                                        </Placeholder>
                                                                    </Grid.Column>
                                                                </Grid>
                                                            </Segment>

                                                            <Segment vertical>
                                                                <Header as='h3' style={{ width: '100%' }} >
                                                                    <Placeholder>
                                                                        <Placeholder.Header>
                                                                            <Placeholder.Line length='full' />
                                                                        </Placeholder.Header>
                                                                    </Placeholder>
                                                                </Header>
                                                                <Container>
                                                                    <Placeholder>
                                                                        <Placeholder.Paragraph>
                                                                            <Placeholder.Line />
                                                                            <Placeholder.Line />
                                                                            <Placeholder.Line />
                                                                            <Placeholder.Line />
                                                                            <Placeholder.Line />
                                                                        </Placeholder.Paragraph>
                                                                        <Placeholder.Paragraph>
                                                                            <Placeholder.Line />
                                                                            <Placeholder.Line />
                                                                            <Placeholder.Line />
                                                                        </Placeholder.Paragraph>
                                                                    </Placeholder>
                                                                </Container>
                                                            </Segment>
                                                        </Grid.Column>
                                                    </Grid.Row>
                                                </Grid>
                                            </Modal.Content>
                                        </React.Fragment>
                                    )
                            }
                        </React.Fragment>
                    )
            }
        </Modal >
    );
}

export default GameInfoModal;


{/* <Modal.Description>
    <ImageCarousel images={appData.screenshots.reduce((result, item) => (
        _.concat(result, [item.path_full])
    ), [])} />
</Modal.Description> */}