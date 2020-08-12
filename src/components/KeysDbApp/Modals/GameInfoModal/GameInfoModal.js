import React, { useState, } from "react";
import { Modal, Icon, Grid, Statistic, Segment, Header, Message, Dropdown, List, Divider, Image, Popup, Tab, Dimmer, Loader, } from "semantic-ui-react";
import _ from 'lodash';
import dateFns from 'date-fns';

import AwesomeSlider from 'react-awesome-slider';
// import 'react-awesome-slider/dist/styles.css';
import withAutoplay from 'react-awesome-slider/dist/autoplay';

import itadApi from "../../../../itad";
import { STEAM_CATEGORIES, } from "../../../../utils";
import { GetAppDetails, GetPackageDetails } from "../../../../steam/steamApi";

function GameInfoModal({ appId, title, trigger = <Dropdown.Item text="Info" /> }) {
    const [appData, setAppData] = useState(null)
    const [itadData, setItadData] = useState(null)

    const [errorGettingSteamData, setErrorGettingSteamData] = useState(false)
    // const [errorGettingItadData, setErrorGettingItadData] = useState(false)

    const [finishedLoadingSteamData, setFinishedLoadingSteamData] = useState(false)
    const [finishedLoadingItadData, setFinishedLoadingItadData] = useState(false)

    const [showScreenshotsTab, setShowScreenshotsTab] = useState(true)
    const [showMoviesTab, setShowMoviesTab] = useState(false)
    const [showYoutubeTab, setShowYoutubeTab] = useState(false)

    const AutoplaySlider = withAutoplay(AwesomeSlider);

    const panes = [
        {
            menuItem: 'Screenshots',
            render: () => (
                <Tab.Pane as='div'>
                    {
                        showScreenshotsTab && (
                            <AutoplaySlider
                                play={true}
                                cancelOnInteraction={true}
                                interval={6000}
                                media={appData.screenshots.reduce((result, item) => (
                                    _.concat(result,
                                        [{
                                            source: item.path_full,
                                            onClick: () => { fullscreenModal(item.path_full) }
                                        }]
                                    )
                                ), [])}
                            />
                        )
                    }
                </Tab.Pane>
            ),
        },
        {
            menuItem: 'Trailers',
            render: () => (
                <Tab.Pane as='div'>
                    {
                        showMoviesTab && (
                            <AutoplaySlider
                                media={appData.movies.reduce((result, item) => (
                                    _.concat(result,
                                        [{
                                            caption: "item.name",
                                            source: item.mp4.max,
                                        }]
                                    )
                                ), [])}
                            />
                        )
                    }
                </Tab.Pane>
            ),
        },
        {
            menuItem: 'Youtube',
            render: () => (
                <Tab.Pane as='div' style={{ height: '100%', minHeight: '470px' }}>
                    {
                        showYoutubeTab && (
                            <iframe
                                title='youtube-gameplay'
                                id="ytplayer"
                                type="text/html"
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed?listType=search&list=intitle%3A%22${title}%20Gameplay%22%20%22PC%22&origin=https://store.steampowered.com/`}
                                frameBorder="0"
                            />
                        )
                    }
                </Tab.Pane>
            ),
        },
    ]

    function loadGameData(id, title) {
        if (appData && itadData) return


        GetAppDetails(id)
            .then(response => {
                if (response.success && response.data[id]) {
                    // console.log("Steam App data:", response.data[id].data)
                    if (response.data[id].success && response.data[id].success !== false) {
                        setAppData(response.data[id].data)
                        setFinishedLoadingSteamData(true)
                    } else {
                        if (id === 2000) {
                            setErrorGettingSteamData(true)
                            return
                        }
                        GetPackageDetails(id)
                            .then(response => {
                                if (response.success && response.data[id].success && response.data[id].success !== false) {
                                    // console.log(response.data)
                                    setAppData(response.data[id].data)
                                    setFinishedLoadingSteamData(true)
                                } else {
                                    setErrorGettingSteamData(true)
                                }
                            })
                    }
                } else {
                    setErrorGettingSteamData(true)
                }
            })

        itadApi.GetOverview(title)
            .then(response => {
                // console.log("ITAD data:", response.data)
                if (response.success) {
                    setItadData(response.data)
                    setFinishedLoadingItadData(true)
                } else {
                    // setErrorGettingItadData(true)
                }
            })
    }

    function fullscreenModal(imageUrl) { console.log(imageUrl) }

    function handleTabChange(e, data) {
        switch (data.activeIndex) {
            case 0:
                setShowScreenshotsTab(true)
                setShowMoviesTab(false)
                setShowYoutubeTab(false)
                break;
            case 1:
                setShowScreenshotsTab(false)
                setShowMoviesTab(true)
                setShowYoutubeTab(false)
                break;
            case 2:
                setShowScreenshotsTab(false)
                setShowMoviesTab(false)
                setShowYoutubeTab(true)
                break;
            default:
                break;
        }
    }

    const renderMedia = (screenshots, movies) => {
        return (
            <Grid.Column width={10} textAlign='center'>
                <Grid centered style={{ height: '100%' }}>
                    <Grid.Row centered style={{ height: '100%' }}>
                        <Grid.Column />
                        <Grid.Column width={14} style={{ marginBottom: '40px', height: '100%' }}>
                            {
                                movies
                                    ? <Tab menu={{ secondary: true, pointing: true }} onTabChange={handleTabChange} panes={panes} className='white-tabs' style={{ height: '100%' }} />
                                    : <AutoplaySlider
                                        play={true}
                                        cancelOnInteraction={true}
                                        interval={6000}
                                        media={screenshots.reduce((result, item) => (
                                            _.concat(result,
                                                [{
                                                    source: item.path_full,
                                                    onClick: () => { fullscreenModal(item.path_full) }
                                                }]
                                            )
                                        ), [])}
                                    />
                            }
                        </Grid.Column>
                        <Grid.Column />
                    </Grid.Row>
                </Grid>
            </Grid.Column>
        )
    }

    function getBundleWebsiteImage(bundleWebSiteName) {
        switch (bundleWebSiteName) {
            case 'Humble Bundle':
                return <Image avatar src={require('../../../../assets/humblebundle.png')} title={bundleWebSiteName} />
            case 'Fanatical':
                return <Image avatar src={require('../../../../assets/fanatical.png')} title={bundleWebSiteName} />
            case 'Indie Gala':
                return <Image avatar src={require('../../../../assets/indiegala.ico')} title={bundleWebSiteName} />
            case 'DailyIndieGame Bundles':
                return <Image avatar src={require('../../../../assets/dailyindiegame.png')} title={bundleWebSiteName} />
            case 'Groupees':
                return <Image avatar src={require('../../../../assets/groupees.ico')} title={bundleWebSiteName} />
            case 'MacGameStore':
                return <Image avatar src={require('../../../../assets/macgamestore.ico')} title={bundleWebSiteName} />
            default:
                return ''
        }
    }

    const renderReviews = (reviews) => (
        <Grid.Row>
            <Grid.Column width={16}>
                <Divider />
                <Segment vertical>
                    <Header as='h2' inverted>
                        <Grid width={16}>
                            <Grid.Column textAlign='center'>
                                Reviews
                            </Grid.Column>
                        </Grid>
                    </Header>
                    <Grid centered>
                        <Grid.Column>
                            <div dangerouslySetInnerHTML={{ __html: reviews }} />
                        </Grid.Column>
                    </Grid>
                </Segment>
            </Grid.Column>
        </Grid.Row>
    )

    const renderDescription = (description) => (
        <Grid.Row>
            <Grid.Column width={16}>
                <Divider />
                <Segment vertical>
                    <Header as='h2' inverted>
                        <Grid width={16}>
                            <Grid.Column textAlign='center'>
                                Description
                            </Grid.Column>
                        </Grid>
                    </Header>
                    <Grid centered>
                        <Grid.Column>
                            <div dangerouslySetInnerHTML={{ __html: description }} />
                        </Grid.Column>
                    </Grid>
                </Segment>
            </Grid.Column>
        </Grid.Row>
    )

    const renderIncludedApps = (apps) => (
        <Grid.Row columns={1} textAlign='center'>
            <Grid.Column width={16}>
                <Divider />
                <Segment vertical>
                    <Header as='h2' inverted>
                        <Grid width={16}>
                            <Grid.Column textAlign='center'>
                                Included in this package
                            </Grid.Column>
                        </Grid>
                    </Header>
                    <Grid>
                        {
                            _.chunk(apps, 16).map((chunk, index) => (
                                <Grid.Row key={index}>
                                    <Grid.Column>
                                        <Image.Group size='medium'>
                                            {
                                                chunk.map((game, index) => (
                                                    <Image
                                                        as='a'
                                                        target='_blank'
                                                        rel='noopener noreferrer'
                                                        href={`https://store.steampowered.com/app/${game.id}/`}
                                                        title={game.name}
                                                        src={`https://steamcdn-a.akamaihd.net/steam/apps/${game.id}/header.jpg`}
                                                        key={index}
                                                    />
                                                ))
                                            }
                                        </Image.Group>
                                    </Grid.Column>
                                </Grid.Row>
                            ))
                        }
                    </Grid>
                </Segment>
            </Grid.Column>
        </Grid.Row>
    )

    return (
        <Modal
            className={finishedLoadingSteamData && finishedLoadingItadData && appData ? "gameinfo-with-background" : ''}
            onOpen={() => { loadGameData(appId, title) }}
            closeIcon={<Icon name="close" />}
            trigger={trigger}
            centered={false}
            size={!errorGettingSteamData && finishedLoadingSteamData && finishedLoadingItadData && appData ? 'fullscreen' : 'small'}
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
                                finishedLoadingSteamData && finishedLoadingItadData && appData
                                    ? (
                                        <React.Fragment>
                                            <Modal.Header style={appData.background && { backgroundImage: `url(${appData.background})`, backgroundPositionX: 'center' }}>
                                                <span>{appData.name}</span>
                                            </Modal.Header>
                                            <Modal.Content scrolling style={{ backgroundImage: `url(${appData.background})`, backgroundPositionY: "-55px", backgroundPositionX: 'center', backgroundRepeat: 'no-repeat' }}>
                                                <Grid stackable columns={2}>
                                                    <Grid.Row>
                                                        <Grid.Column width={6}>
                                                            <Grid.Row columns={'equal'} textAlign='left' verticalAlign='middle'>
                                                                {
                                                                    itadData && (
                                                                        <Statistic.Group widths='2'>
                                                                            <Statistic
                                                                                floated='left'
                                                                                size='large'
                                                                                horizontal
                                                                                as='a'
                                                                                target='_blank'
                                                                                rel='noopener noreferrer'
                                                                                href={`https://store.steampowered.com/app/${appId}/`}
                                                                                color={itadData.price ? (itadData.lowest.cut > itadData.price.cut ? 'red' : 'green') : 'red'}
                                                                            >
                                                                                <Statistic.Label>Current Price</Statistic.Label>
                                                                                <Statistic.Value>{itadData.price ? itadData.price.price_formatted : 'N\\A'}</Statistic.Value>
                                                                            </Statistic>

                                                                            <Statistic
                                                                                floated='left'
                                                                                size='large'
                                                                                horizontal
                                                                                as='a'
                                                                                target='_blank'
                                                                                rel='noopener noreferrer'
                                                                                href={`https://store.steampowered.com/app/${appId}/`}
                                                                                color={'grey'}
                                                                            >
                                                                                <Statistic.Label>Lowest Price</Statistic.Label>
                                                                                <Statistic.Value>{itadData.lowest ? itadData.lowest.price_formatted : 'N\\A'}</Statistic.Value>
                                                                            </Statistic>
                                                                        </Statistic.Group>
                                                                    )
                                                                }
                                                                <Divider />
                                                            </Grid.Row>
                                                            <Grid.Row columns={'equal'} textAlign='left' verticalAlign='middle'>
                                                                <Statistic.Group widths='2'>
                                                                    {
                                                                        appData.metacritic && (
                                                                            <Statistic
                                                                                floated='left'
                                                                                size='large'
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
                                                                    {
                                                                        itadData && (
                                                                            <Statistic
                                                                                floated='left'
                                                                                size='large'
                                                                                horizontal
                                                                                color={itadData.bundles.count === 0 ? 'green' : itadData.bundles.count <= 3 ? 'yellow' : 'red'}
                                                                                as='a'
                                                                                target='_blank'
                                                                                rel='noopener noreferrer'
                                                                                href={itadData.urls.bundles}
                                                                            >
                                                                                <Statistic.Label>Times Bundled</Statistic.Label>
                                                                                <Statistic.Value>{itadData.bundles.count}</Statistic.Value>
                                                                            </Statistic>
                                                                        )
                                                                    }
                                                                </Statistic.Group>
                                                            </Grid.Row>

                                                            {
                                                                itadData && _.isArray(itadData.bundles.live) && itadData.bundles.live.length > 0 && (
                                                                    <Message>
                                                                        <Message.Header><Icon name='circle' color='red' /> Live bundles</Message.Header>
                                                                        <List selection verticalAlign='middle'>
                                                                            {
                                                                                itadData.bundles.live.map((bundle, index) => (
                                                                                    <List.Item key={index}>
                                                                                        {getBundleWebsiteImage(bundle.page)}
                                                                                        <List.Content>
                                                                                            <List.Header
                                                                                                as='a'
                                                                                                target='_blank'
                                                                                                rel='noopener noreferrer'
                                                                                                href={`${bundle.url}`}
                                                                                            >
                                                                                                {bundle.title}
                                                                                            </List.Header>
                                                                                            <List.Description>
                                                                                                Expires in {dateFns.distanceInWords(new Date(), new Date(bundle.expiry_rfc))}
                                                                                            </List.Description>
                                                                                        </List.Content>
                                                                                    </List.Item>
                                                                                ))
                                                                            }
                                                                        </List>
                                                                    </Message>
                                                                )
                                                            }
                                                            {
                                                                appData.categories && (
                                                                    <Grid.Row>
                                                                        <Divider />
                                                                        <Segment inverted color='black'>
                                                                            <Image.Group size='mini'>
                                                                                {
                                                                                    appData.categories.map(category => <Popup content={category.description} position='top center' trigger={<Image className="no-margin" src={STEAM_CATEGORIES[category.id]} size='mini' key={category.id} />} key={category.id} />)
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
                                                                        <Grid columns={'equal'} verticalAlign='middle'>
                                                                            <Grid.Column verticalAlign='middle'>
                                                                                <Header inverted as='h3'>Genre</Header>
                                                                            </Grid.Column>
                                                                            {
                                                                                appData.genres.map((genre, index) => (
                                                                                    <Grid.Column key={index} verticalAlign='middle'>
                                                                                        <Grid.Row style={{ display: 'flex' }}>
                                                                                            <a target='_blank' rel='noopener noreferrer' href={`https://store.steampowered.com/tags/en/${genre.description}`}>{genre.description}</a>
                                                                                        </Grid.Row>
                                                                                    </Grid.Column>
                                                                                ))
                                                                            }
                                                                        </Grid>
                                                                    </Grid.Row>
                                                                )
                                                            }
                                                            {
                                                                appData.achievements && appData.achievements.total > 0 && (
                                                                    <Grid.Row>
                                                                        <Divider />
                                                                        <Grid columns={'equal'} verticalAlign='middle'>
                                                                            <Grid.Column style={{ display: 'inline-table' }}>
                                                                                <Statistic size='small' inverted>
                                                                                    <Statistic.Value>{appData.achievements.total}</Statistic.Value>
                                                                                    <Statistic.Label>Achievements</Statistic.Label>
                                                                                </Statistic>
                                                                            </Grid.Column>
                                                                            {
                                                                                _.chunk(appData.achievements.highlighted, 6)[0]
                                                                                    .map((achievement, index) => (
                                                                                        <Grid.Column key={index} style={{ padding: '0.5em' }} title={achievement.name}>
                                                                                            <Grid.Row style={{ display: 'flex' }}>
                                                                                                <Image
                                                                                                    as={'div'}
                                                                                                    src={achievement.path}
                                                                                                    centered
                                                                                                />
                                                                                            </Grid.Row>
                                                                                        </Grid.Column>
                                                                                    ))
                                                                            }
                                                                            <Grid.Column
                                                                                style={{
                                                                                    padding: '0.5em',
                                                                                    cursor: 'pointer'
                                                                                }}
                                                                                as='a'
                                                                                target='_blank'
                                                                                rel='noopener noreferrer'
                                                                                href={`https://steamcommunity.com/stats/${appData.steam_appid}/achievements`}
                                                                                title="View all"
                                                                            >
                                                                                <Grid.Row
                                                                                    style={{
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                    }}
                                                                                >
                                                                                    <Image
                                                                                        as={'div'}
                                                                                        src={"https://steamstore-a.akamaihd.net/public/images/v6/ico/ico_achievements.png"}
                                                                                        centered
                                                                                    />
                                                                                </Grid.Row>
                                                                                <Grid.Row style={{
                                                                                    whiteSpace: 'nowrap',
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis',
                                                                                    color: 'white',
                                                                                    textAlign: 'center'
                                                                                }}>
                                                                                    View all
                                                                                            </Grid.Row>
                                                                            </Grid.Column>
                                                                        </Grid>
                                                                    </Grid.Row>
                                                                )
                                                            }
                                                        </Grid.Column>

                                                        {
                                                            appData.screenshots
                                                                ? renderMedia(appData.screenshots, appData.movies)
                                                                : appData.page_image && (
                                                                    <Grid.Column width={10} textAlign='center'>
                                                                        <Image
                                                                            centered
                                                                            src={appData.page_image}
                                                                        />
                                                                    </Grid.Column>
                                                                )
                                                        }

                                                    </Grid.Row>
                                                    {
                                                        ((appData.detailed_description || appData.page_content) && renderDescription(appData.detailed_description || appData.page_content))
                                                    }
                                                    {
                                                        appData.reviews && renderReviews(appData.reviews)
                                                    }
                                                    {
                                                        appData.apps && renderIncludedApps(appData.apps)
                                                    }
                                                </Grid>
                                            </Modal.Content>
                                        </React.Fragment>
                                    )
                                    : (

                                        <Modal.Content>
                                            <Segment style={{ minHeight: '10em' }} vertical>
                                                <Dimmer active inverted>
                                                    <Loader inverted>
                                                        <p>
                                                            <span>Loading IsThereAnyDeal data...</span> {finishedLoadingItadData && <Icon color='green' name='check' />}
                                                        </p>
                                                        <p>
                                                            <span>Loading Steam data...</span> {finishedLoadingSteamData && <Icon color='green' name='check' />}
                                                        </p>
                                                    </Loader>
                                                </Dimmer>
                                            </Segment>
                                        </Modal.Content>
                                    )
                            }
                        </React.Fragment>
                    )
            }
        </Modal >
    );
}

export default GameInfoModal;