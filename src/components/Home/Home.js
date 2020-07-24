import React, { } from "react";
import { Container, Header, Segment, Grid, Divider, Image } from "semantic-ui-react";

const Home = () => (
    <Container>
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
                        content='Maintain your keys with ease and maximum safety'
                        style={{
                            fontSize: '1.5em',
                            fontWeight: 'normal',
                            marginTop: '1.5em',
                            marginBottom: '1.5em',
                        }}
                    />
                </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={1}>
                <Grid.Column textAlign='center'>
                    <Divider />
                </Grid.Column>
            </Grid.Row>
        </Grid>

        <Segment style={{ padding: '8em 0em' }} vertical>
            <Container text>
                <Header as='h3' style={{ fontSize: '2em' }}>
                    What is this?
                </Header>
                <p style={{ fontSize: '1.33em' }}>
                    As a Gamer and a hoarder I had a lot of Steam\GOG\Origin\etc keys to keep,
                    So I started saving it all into a google spreadsheet, from there I added a <a target='_blank' rel='noopener noreferrer' href='https://github.com/yotamHak/Steam-Related/wiki/Google-Apps-Script'>GScript</a> that collected some data about the game I added, <br />
                    Overtime the GScript turned into a chore to maintain so I decided to upgrade it a bit and add some more functionality to it, <br />
                    This is the result!
                </p>
            </Container>
        </Segment>

        <Segment style={{ padding: '8em 0em' }} vertical>
            <Grid container stackable verticalAlign='middle'>
                <Grid.Row>
                    <Grid.Column width={8}>
                        <Header as='h3' style={{ fontSize: '2em' }}>
                            Open-Source
                        </Header>
                        <p style={{ fontSize: '1.33em' }}>
                            This project is an open-source project,<br />
                            If you want to check it out, submit bugs or even help, here's the link to <a target='_blank' rel='noopener noreferrer' href='https://github.com/yotamHak/key-db'>GitHub</a>.
                        </p>

                        <Header as='h3' style={{ fontSize: '2em' }}>
                            No Users
                        </Header>
                        <p style={{ fontSize: '1.33em' }}>
                            You don't need a user to use this tool, <br />
                            You will need to login with your Google account to manage your spreadsheet and a Steam account to get additional data (If you own a game)
                        </p>

                        <Header as='h3' style={{ fontSize: '2em' }}>
                            No Database
                        </Header>
                        <p style={{ fontSize: '1.33em' }}>
                            Obviously keeping your collection of keys must be safe and private, <br />
                            I decided to go with Google Spreadsheets and not have a dedicated database,
                            So there's no third-party database, I use your Google Spreadsheet as the database!
                        </p>
                    </Grid.Column>
                    <Grid.Column floated='right' width={6}>
                        <Image bordered rounded size='large' src='/images/wireframe/white-image.png' />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Segment>

        <Segment style={{ padding: '8em 0em' }} vertical>
            <Grid container stackable verticalAlign='middle'>
                <Grid.Row>
                    <Grid.Column width={6}>
                        {/* <video id="background-video" loop autoPlay width="480">
                            <source src={"https://a.pomf.cat/rehqdw.mp4"} type="video/mp4" />
                            <source src={"https://a.pomf.cat/rehqdw.mp4"} type="video/ogg" />
                            Your browser does not support the video tag.
                        </video> */}


                        {/* <Image bordered rounded size='large' src='../../assets/vids/gameinfo.mp4' /> */}
                    </Grid.Column>
                    <Grid.Column floated='right' width={8}>
                        <Header as='h3' style={{ fontSize: '2em' }}>
                            Easy Browsing
                        </Header>
                        <p style={{ fontSize: '1.33em' }}>
                            Filter and Search your keys collection with ease using an intuitive and slick UI
                        </p>

                        <Header as='h3' style={{ fontSize: '2em' }}>
                            Dynamic Fields
                        </Header>
                        <p style={{ fontSize: '1.33em' }}>
                            Set what options each field has,<br />
                            Set what's sortable, filterable and whats private,<br />
                            Change the label without breaking stuff,<br />
                            And more field types are coming!
                        </p>

                        <Header as='h3' style={{ fontSize: '2em' }}>
                            Add keys with ease
                        </Header>
                        <p style={{ fontSize: '1.33em' }}>
                            Using <a target='_blank' rel='noopener noreferrer' href='https://isthereanydeal.com/'>IsThereAnyDeal.com</a> and <a target='_blank' rel='noopener noreferrer' href='https://partner.steamgames.com/doc/webapi_overview'>Steam</a> API, get additional and helpful info about the game you're adding.
                        </p>

                        <Header as='h3' style={{ fontSize: '2em' }}>
                            Game Info
                        </Header>

                        <p style={{ fontSize: '1.33em' }}>
                            Want to check the game? <br />
                            Get all the game data you need in one click.
                        </p>
                    </Grid.Column>

                </Grid.Row>
            </Grid>
        </Segment>

        <Segment style={{ padding: '8em 0em' }} vertical>
            <Grid container stackable verticalAlign='middle'>
                <Grid.Row columns={1}>
                    <Grid.Column width={16}>
                        <Header as='h3' style={{ fontSize: '2em' }}>
                            But wait, there's more!
                        </Header>
                        <p style={{ fontSize: '1.33em' }}>
                            Want to share your keys collection for trading or just showing off? I got you!<br />
                            Customize what you want to share and share it easily with whomever you want
                        </p>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Segment>

        <Segment style={{ padding: '8em 0em' }} vertical>
            <Grid container stackable verticalAlign='middle'>
                <Grid.Row columns={1} textAlign='center'>
                    <Grid.Column width={16} textAlign='center'>
                        {/* <video id="background-video" loop autoPlay width="480">
                            <source src={"https://a.pomf.cat/rehqdw.mp4"} type="video/mp4" />
                            <source src={"https://a.pomf.cat/rehqdw.mp4"} type="video/ogg" />
                            Your browser does not support the video tag.
                        </video> */}


                        <Image size='large' src={require('../../assets/im-in.jpg')} />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Segment>

    </Container>
)

export default Home;