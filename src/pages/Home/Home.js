import React, { } from "react";
import { Container, Header, Segment, Grid, Divider, Image, Icon, List } from "semantic-ui-react";
import { Link } from "react-router-dom";

import AwesomeSlider from 'react-awesome-slider';
import 'react-awesome-slider/dist/styles.css';
import withAutoplay from 'react-awesome-slider/dist/autoplay';


function Home() {
    const AutoplaySlider = withAutoplay(AwesomeSlider);

    const firstSegmentImages = [
        {
            source: require('../../assets/images/table.png')
        },
        {
            source: require('../../assets/images/addNew.png')
        },
        {
            source: require('../../assets/images/fieldSettings.png')
        },
        {
            source: require('../../assets/images/gameInfo-1.png')
        },
        {
            source: require('../../assets/images/gameInfo-2.png')
        },
    ]

    const importExportSegmentImages = [
        {
            source: require('../../assets/images/statistics.png')
        },
        {
            source: require('../../assets/images/export.png')
        },
        {
            source: require('../../assets/images/import-1.png')
        },
        {
            source: require('../../assets/images/import-2.png')
        },
    ]

    const features = [
        {
            header: `Easy Browsing`,
            paragraph: `Filter and Search your keys collection with ease using an intuitive and slick UI`
        },
        {
            header: `Dynamic Fields`,
            paragraph: `Control your Spreadsheet,<br />
                        Add custom and pre-defined fields,<br />
                        Set what options each field has,<br />
                        decide whats sortable, filterable and whats private,<br />
                        More field types are coming!`
        },
        {
            header: `Add keys with API help`,
            paragraph: `Using 
                        <a target='_blank' rel='noopener noreferrer' href='https://isthereanydeal.com/'>IsThereAnyDeal.com</a> 
                        and 
                        <a target='_blank' rel='noopener noreferrer' href='https://partner.steamgames.com/doc/webapi_overview'>Steam</a> API, 
                        get additional and helpful data about the game you're adding.`
        },
        {
            header: `Game Info`,
            paragraph: `Want to check the game? <br />
                        Get lowest and current price, times bundled, live bundle indicator, screenshots, trailers, gameplay,and more game data...`
        },
    ]

    const importExport = [
        {
            header: `Statistics`,
            paragraph: `Get an overview of your collection with a dynamic statistic page.`
        },
        {
            header: `Import`,
            paragraph: `Already have a spreadsheet? no worries, you can import your spreadsheet and remap your headers.`
        },
        {
            header: `Export and Share`,
            paragraph: `Want to share your keys collection for trading or just showing off? I got you!<br />
                        Customize what you want to share and share it easily with whomever you want.`
        },
    ]

    const renderHeader = () => (
        <Grid>
            <Grid.Row columns={2} centered>
                <Grid.Column textAlign='center'>
                    <Header
                        as='h1'
                        content='Keys DB'
                        style={{
                            fontSize: '4em',
                            fontWeight: 'normal',
                            marginBottom: 0,
                            marginTop: '1.5em',
                        }}
                    />
                    <Header
                        as='h2'
                        content='Your private Game Keys Collection'
                        style={{
                            fontSize: '1.5em',
                            fontWeight: 'normal',
                            marginTop: '1.5em',
                            marginBottom: '1.5em',
                        }}
                    />
                </Grid.Column>
            </Grid.Row>
            <Divider />
        </Grid>
    )

    const renderAboutProjectSegment = () => (
        <Segment style={{ padding: '8em 0em' }} vertical>
            <Container text>
                <Header as='h3' style={{ fontSize: '2em' }}>
                    What is this?
                </Header>
                <p style={{ fontSize: '1.33em' }}>
                    As a Gamer and a hoarder I had a lot of Steam\GOG\Origin\etc keys to keep, <br />
                    So I started saving them all into a google spreadsheet, from there I added a <a target='_blank' rel='noopener noreferrer' href='https://github.com/yotamHak/Steam-Related/wiki/Google-Apps-Script'>GScript</a> that collected some data about the game I added, <br />
                    Overtime the GScript turned into a chore to maintain so I decided to upgrade it a bit and add some more functionality to it, <br />
                    This is the result!
                </p>
            </Container>
        </Segment>
    )

    const renderProjectSegment = () => (
        <Segment style={{ padding: '8em 3em' }} vertical>
            <Grid stackable verticalAlign='top'>
                <Grid.Row columns={'equal'} textAlign='center'>
                    <Grid.Column>
                        <Header as='h3' style={{ fontSize: '2em' }}>
                            Open-Source
                         </Header>
                        <p style={{ fontSize: '1.33em' }}>
                            This project is an open-source project,<br />
                            If you want to check it out, submit bugs or even help, here's the link<br />
                            <a target='_blank' rel='noopener noreferrer' href='https://github.com/yotamHak/keys-db'><Icon name='github' />&nbsp;GitHub</a>.
                        </p>
                    </Grid.Column>
                    <Grid.Column>
                        <Header as='h3' style={{ fontSize: '2em' }}>
                            No Additional User Needed
                        </Header>
                        <p style={{ fontSize: '1.33em' }}>
                            You don't need an additional user to use this tool,<br />
                            All you need is a Google account to manage your spreadsheet and a Steam account to get additional data.
                         </p>
                    </Grid.Column>
                    <Grid.Column>
                        <Header as='h3' style={{ fontSize: '2em' }}>
                            No Database
                        </Header>
                        <p style={{ fontSize: '1.33em' }}>
                            Obviously keeping your collection of keys must be safe and private,<br />
                            I decided to go with Google Spreadsheets and not have a dedicated database, <br />
                            So there's no third-party database, I use your private Google Spreadsheet as the database!
                        </p>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Segment>
    )

    function renderFeaturesSegment(features, images, imageTransitionInterval, reverse) {
        return (
            <Segment style={{ padding: '8em 3em' }} vertical>
                <Grid stackable verticalAlign='middle' style={reverse ? { flexDirection: 'row-reverse' } : {}}>
                    <Grid.Column width={9}>
                        <AutoplaySlider
                            key={features[0].header}
                            className={'img-contain'}
                            play={true}
                            cancelOnInteraction={true}
                            interval={imageTransitionInterval}
                            media={images}
                        />
                    </Grid.Column>
                    <Grid.Column width={7} style={{ padding: '0 3em' }}>
                        {
                            features.map((feature, index) => (
                                <React.Fragment key={index}>
                                    <Header as='h3' style={{ fontSize: '2em' }}>
                                        {feature.header}
                                    </Header>
                                    <p
                                        style={{ fontSize: '1.33em' }}
                                        dangerouslySetInnerHTML={{ __html: feature.paragraph }}
                                    />
                                    {
                                        features.length - 1 !== index && <Divider />
                                    }
                                </React.Fragment>
                            ))
                        }
                    </Grid.Column>
                </Grid>
            </Segment>
        )
    }

    const renderGetStartedSegment = () => (
        <Segment style={{ padding: '8em 0em' }} vertical>
            <Grid container stackable verticalAlign='middle'>
                <Grid.Row columns={1}>
                    <Grid.Column width={16}>
                        <Link to={`/get-started`} >
                            <Image size='large' centered src={require('../../assets/im-in.jpg')} />
                        </Link>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Segment>
    )

    const renderFooter = () => (
        <Segment vertical style={{ position: 'fixed', width: '100%', bottom: '0', zIndex: '11', backgroundColor: 'white' }}>
            <Container>
                <Grid divided stackable>
                    <Grid.Row centered>
                        <List horizontal relaxed>
                            {/* <List.Item>
                                <List.Content>
                                    <List.Header>
                                        Created By Lynx
                                    </List.Header>
                                </List.Content>
                            </List.Item> */}
                            <List.Item>
                                <List.Content>
                                    <List.Header>
                                        <List.Icon name='github' size='large' verticalAlign='middle' />&nbsp;<a target='_blank'
                                            rel='noopener noreferrer'
                                            href={`https://github.com/yotamHak/keys-db/`}>Keys-DB</a>
                                    </List.Header>
                                </List.Content>
                            </List.Item>
                            <List.Item>
                                <List.Content>
                                    <Link to={`/terms-and-conditions`} >
                                        <List.Header style={{ color: '#4183c4', textDecoration: 'none' }}>Terms Of Use</List.Header>
                                    </Link>
                                </List.Content>
                            </List.Item>
                            <List.Item>
                                <List.Content>
                                    <Link to={`/privacy-notice`} >
                                        <List.Header style={{ color: '#4183c4', textDecoration: 'none' }}>Privacy Policy</List.Header>
                                    </Link>
                                </List.Content>
                            </List.Item>
                        </List>
                    </Grid.Row>
                </Grid>
            </Container>
        </Segment>
    )

    return (
        <React.Fragment>
            {renderHeader()}
            {renderAboutProjectSegment()}
            {renderProjectSegment()}
            {renderFeaturesSegment(features, firstSegmentImages, 4500, false)}
            {renderFeaturesSegment(importExport, importExportSegmentImages, 5100, true)}
            {renderGetStartedSegment()}
            {renderFooter()}
        </React.Fragment>
    )
}

export default Home;