// https://steamdb.info/app/730/

import React, { useState, } from "react";
import { Modal, Icon, Grid, Placeholder, Statistic, Segment, Header, Message, Container, Dropdown, List, Divider, Image, Popup } from "semantic-ui-react";
import steamApi from '../../../../steam'
import ImageCarousel from "../../../ImageCarousel/ImageCarousel";
import _ from 'lodash';
import itadApi from "../../../../itad";

const steamCategories = {
    "Single-player": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_singlePlayer.png",
    "Multi-player": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_multiPlayer.png",
    "Co-op": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_coop.png",
    "Additional High-Quality Audio": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_hdaudio.png",
    "Shared/Split Screen Co-op": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_coop.png",
    "Steam Achievements": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_achievements.png",
    "Full controller support": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_controller.png",
    "Partial Controller Support": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_partial_controller.png",
    "Steam Trading Cards": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_cards.png",
    "Captions available": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_cc.png",
    "Steam Workshop": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_workshop.png",
    "Steam Cloud": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_cloud.png",
    "Steam Leaderboards": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_leaderboards.png",
    "Includes level editor": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_editor.png",
    "Remote Play on Phone": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_remote_play.png",
    "Remote Play on Tablet": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_remote_play.png",
    "Remote Play on TV": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_remote_play.png",
    "Remote Play Together": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_remote_play_together.png",
    "SteamVR Collectibles": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_collectibles.png",
    "In-App Purchases": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_cart.png",
    "Valve Anti-Cheat enabled": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_vac.png",
    "Stats": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_stats.png",
    "Includes Source SDK": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_sdk.png",
    "Commentary available": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_commentary.png",
    "Cross-Platform Multiplayer": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_multiPlayer.png",
    "Online PvP": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_multiPlayer.png",
    "Online Co-op": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_coop.png",
    "Shared/Split Screen PvP": "https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_multiPlayer.png",
}

function GameInfoModal({ appId, trigger = <Dropdown.Item text="Info" /> }) {
    const [appData, setAppData] = useState(null)
    const [gameBundles, setGameBundles] = useState({ success: false })

    const [errorGettingSteamData, setErrorGettingSteamData] = useState(false)
    const [errorGettingItadData, setErrorGettingItadData] = useState(false)

    const [extendedDescription, setExtendedDescription] = useState(false)

    const loadGameData = (id) => steamApi.AppDetails(id)
        .then(response => {
            console.log("AppDetails data:", response)
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

                // console.log("Steam data:", response)
                setAppData(response)
            } else {
                setErrorGettingSteamData(true)
            }
        })

    return (
        <Modal
            className={appData && "gameinfo-with-background"}
            onOpen={() => { loadGameData(appId) }}
            closeIcon={<Icon name="close" />}
            trigger={trigger}
            centered={false}
            size={errorGettingSteamData ? 'small' : 'fullscreen'}
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
                                            <Modal.Header style={appData.background && { backgroundImage: `url(${appData.background})`, backgroundPositionX: 'center' }}>
                                                <span>{appData.name}</span>
                                            </Modal.Header>
                                            <Modal.Content scrolling style={{ backgroundImage: `url(${appData.background})`, backgroundPositionY: "-62px", backgroundPositionX: 'center' }}>
                                                <Grid stackable columns={2}>
                                                    <Grid.Row>
                                                        <Grid.Column width={8}>
                                                            <ImageCarousel images={appData.screenshots.reduce((result, item) => (_.concat(result, [item.path_full])), [])} />
                                                        </Grid.Column>
                                                        <Grid.Column width={8}>
                                                            <Grid.Row>
                                                                <Statistic.Group widths='3'>
                                                                    {
                                                                        appData.metacritic && (
                                                                            <Statistic
                                                                                style={{ justifyContent: 'center' }}
                                                                                horizontal
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

                                                                    <Statistic
                                                                        color="grey"
                                                                        style={{ justifyContent: 'center' }}
                                                                        horizontal
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
                                                                            <Statistic
                                                                                style={{ justifyContent: 'center' }}
                                                                                horizontal
                                                                                color={gameBundles.times_bundled === 0 ? 'green' : gameBundles.times_bundled <= 3 ? 'yellow' : 'red'}
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
                                                            </Grid.Row>
                                                            {
                                                                appData.categories && (
                                                                    <Grid.Row>
                                                                        <Divider />
                                                                        <Segment inverted color='black'>
                                                                            <Image.Group size='mini'>
                                                                                {
                                                                                    appData.categories.map(category => <Popup content={category.description} position='top center' trigger={<Image className="no-margin" src={steamCategories[category.description]} size='mini' key={category.id} />} key={category.id} />)
                                                                                }
                                                                            </Image.Group>
                                                                        </Segment>
                                                                    </Grid.Row>
                                                                )
                                                            }
                                                            {
                                                                appData.genres && (
                                                                    <Grid.Row>
                                                                        <Divider />
                                                                        <Header as='h3'>Genre</Header>
                                                                        <List horizontal>
                                                                            {
                                                                                appData.genres.map(genre => (
                                                                                    <List.Item key={genre.id}>
                                                                                        <List.Content>
                                                                                            <a target='_blank' rel='noopener noreferrer' href={`https://store.steampowered.com/tags/en/${genre.description}`}>{genre.description}</a>
                                                                                        </List.Content>
                                                                                    </List.Item>
                                                                                ))
                                                                            }
                                                                        </List>
                                                                    </Grid.Row>
                                                                )
                                                            }
                                                        </Grid.Column>
                                                    </Grid.Row>
                                                    <Grid.Row>
                                                        <Grid.Column width={16}>
                                                            <Segment vertical>
                                                                <Header as='h2'>
                                                                    <Grid width={16}>
                                                                        <Grid.Column textAlign='center'>
                                                                            About the game
                                                                            </Grid.Column>
                                                                    </Grid>
                                                                </Header>
                                                                <Grid centered>
                                                                    <Grid.Column>
                                                                        <div dangerouslySetInnerHTML={{ __html: appData.detailed_description }} />
                                                                    </Grid.Column>
                                                                </Grid>
                                                            </Segment>

                                                            {/* <Segment vertical>
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
                                                                <Grid centered columns={2}>
                                                                    <Grid.Column>
                                                                        <div dangerouslySetInnerHTML={{ __html: extendedDescription ? appData.detailed_description : appData.short_description }} />
                                                                    </Grid.Column>
                                                                </Grid>
                                                            </Segment> */}
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
                                                <Grid columns={16}>
                                                    <Grid.Row>
                                                        <Grid.Column width={8}>
                                                            <Placeholder>
                                                                <Placeholder.Image rectangular />
                                                            </Placeholder>
                                                        </Grid.Column>
                                                        <Grid.Column width={8}>
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