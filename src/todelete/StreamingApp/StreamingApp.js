import React from "react";
import Hls from 'hls.js';
import { Container, Header, Divider, ItemGroup, Item, Label, Grid, Reveal, Card, Sidebar, Icon, Menu, Segment, Image } from "semantic-ui-react";
import axios from "axios";

/**
 * https://github.com/foxford/react-hls
 * https://github.com/mingxinstar/react-hls
 */

function StreamingApp() {
    const Kan11 = "https://kanlivep2event-i.akamaihd.net/hls/live/747610/747610/source1_2.5k/chunklist.m3u8";
    const ReshetTV = "https://reshet-live-il.ctedgecdn.net/13tv-desktop/r13_1200.m3u8";
    const Keshet = "https://keshethlslive-i.akamaihd.net/hls/live/512033/CH2LIVE_HIGH/index_2200.m3u8"
    const hls = new Hls({
        xhrSetup: function (xhr, url) {
            if (videoURL === Keshet) {
                xhr.withCredentials = true; // do send cookies                
            }
        }
        // xhrSetup: async (xhr, url) => {
        //     const accessToken = await Axios.get("https://www.mako.co.il/tv/Article-3bf5c3a8e967f51006.htm")
        //     xhr.open('GET', url, true);
        //     xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
        //  }

        // xhrSetup: function (xhr, url) {
        //     if (videoURL === Keshet) {
        //         xhr.withCredentials = true; // do send cookies
        //         xhr.setRequestHeader('Set-Referer', `https://www.mako.co.il/tv/Article-3bf5c3a8e967f51006.htm`)
        //         xhr.setRequestHeader('Access-Control-Allow-Origin', `http://mobile.mako.co.il`)
        //     }
        // }
    });
    const [videoURL, setVideoUrl] = React.useState(Kan11);
    const [radioData, setRadioData] = React.useState({});
    const [radioUrl, setRadioUrl] = React.useState(null);

    const [activeItem, setActiveItem] = React.useState('kan11');
    const [visible, setVisible] = React.useState(true)

    React.useEffect(() => {
        if (activeItem === 'radio') {
            if (Object.keys(radioData).length === 0) {
                getRadio();
            }
        } else {
            const video = document.getElementById('video');

            if (!video.hasAttribute("src") || video.getAttribute("data") !== videoURL) {
                initVideo();
            };
        }
    });

    function initVideo() {
        const video = document.getElementById('video');
        video.setAttribute("data", videoURL);
        video.volume = 0.05;
        hls.on(Hls.Events.MANIFEST_PARSED, function () { video.play(); });
        hls.loadSource(videoURL);
        hls.attachMedia(video);
    }

    function changeTo(channel) { hls.stopLoad(); setVideoUrl(channel) }

    function changeRadio(channel) {
        console.log(channel)
        setRadioUrl(channel)

        const audio = document.getElementById('audio');
        audio.load();
        // audio.play();
    }

    function getRadio() {
        // axios.get("https://glz.co.il/umbraco/api/playerv2/live?rootId=1051.json",
        //     {
        //         headers: {
        //             'Access-Control-Allow-Origin': '*',
        //             'Content-Type': 'application/json',
        //         },
        //         withCredentials: true,
        //         crossDomain: true,
        //     })
        //     .then((response) => { console.log(response) })


        axios.get("https://cors-anywhere.herokuapp.com/https://glz.co.il/umbraco/api/playerv2/live?rootId=1051")
            .then((response) => {
                console.log(response.data);
                setRadioData(response.data);
            })

        setTimeout(getRadio, 60 * 1000);
    }

    function renderProgramme(info, isCurrent = false) {
        return (
            <Grid.Row key={info.title}>
                <Label>{isCurrent === true ? "Currently Playing..." : "Coming Up Next..."}</Label>

                <Card style={{ width: '100%' }}>
                    <Item.Image src={`https://glz.co.il/${info.image}`} wrapped ui={false} />

                    <Card.Content>
                        <Card.Header>{info.title}</Card.Header>
                        <Card.Meta>{/* <span className='date'>Joined in 2015</span> */}</Card.Meta>
                        <Card.Description>
                            {info.desc}
                        </Card.Description>
                    </Card.Content>

                    {!!info.songs && info.songs.map((song, index) => {
                        return (
                            <Card.Content key={index} extra>
                                <Item>
                                    <Item.Header>{index === 0 ? "Playing..." : "Next..."}</Item.Header>
                                    <Item.Description>{song.artist} {!!song.artist && !!song.title ? "-" : ""} {song.title}</Item.Description>
                                </Item>
                            </Card.Content>
                        )
                    })}
                </Card>
            </Grid.Row>
        )
    }

    return (
        <>
            <Sidebar.Pushable as={Segment}>
                <Sidebar
                    as={Menu}
                    animation='overlay'
                    direction='left'
                    icon='labeled'
                    visible={visible}
                    vertical
                    width='thin'
                // onHide={() => setVisible(false)}
                >
                    <Menu.Item>
                        <Menu.Header><Icon name='tv' /> TV</Menu.Header>
                        <Menu.Menu>
                            <Menu.Item
                                name='Kan 11'
                                as='a'
                                active={activeItem === 'kan11'}
                                onClick={() => { setActiveItem('kan11'); changeTo(Kan11) }}
                            />
                            <Menu.Item
                                as='a'
                                active={activeItem === 'keshet'}
                                onClick={() => { setActiveItem('kesher'); changeTo(Keshet) }}
                            >
                                Keshet
                            </Menu.Item>
                            <Menu.Item
                                name='Reshet'
                                as='a'
                                active={activeItem === 'reshet'}
                                onClick={() => { setActiveItem('reshet'); changeTo(ReshetTV) }}
                            />
                        </Menu.Menu>
                    </Menu.Item>
                    <Menu.Item
                        as='a'
                        active={activeItem === 'radio'}
                        onClick={() => { setActiveItem('radio') }}
                    >
                        <Icon name='headphones' /> Radio
                    </Menu.Item>
                </Sidebar>
                <Sidebar.Pusher style={{ width: "calc(100vw - 170px)", marginLeft: "auto" }}>
                    {
                        activeItem !== 'radio'
                            ? (
                                <Segment basic style={{ minHeight: "650px", height: "calc(100vh - 56px)" }}>
                                    <video id="video" data="" height="100%" width="100%" controls style={{ maxHeight: "calc(100vh - 111px)" }}></video>
                                    <Icon name='lock' circular size='small' onClick={() => window.open("https://www.mako.co.il/tv/Article-3bf5c3a8e967f51006.htm", "_blank")} />
                                </Segment>
                            )
                            : (
                                <Segment basic style={{ minHeight: "650px", height: "calc(100vh - 56px)" }}>
                                    <audio id="audio" controls>
                                        <source src={radioUrl} type="audio/mp3" />
                                        <em>Sorry, your browser doesn't support HTML5 audio.</em>
                                    </audio>
                                    <Divider />
                                    <Grid columns={Object.keys(radioData).length === 0 ? 1 : Object.keys(radioData).length} divided >
                                        {Object.keys(radioData).map(channelName => {
                                            const url = radioData[channelName][0].url;

                                            return (
                                                <Grid.Column key={channelName}>
                                                    <ItemGroup>
                                                        <Header as="a" onClick={() => { changeRadio(url) }}>{channelName}</Header>
                                                        {radioData[channelName].map((programme, index) => { return renderProgramme(programme, index === 0) })}
                                                    </ItemGroup>
                                                </Grid.Column>
                                            )
                                        })}
                                    </Grid>
                                </Segment>
                            )
                    }
                </Sidebar.Pusher>
            </Sidebar.Pushable>
        </>
    );
}

export default StreamingApp;


/**
 * <style>
    body {
        padding: 0;
        margin: 0;
    }
</style>

<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<!-- Or if you want a more recent canary version -->
<!-- <script src="https://cdn.jsdelivr.net/npm/hls.js@canary"></script> -->

<video id="video" controls height="100%" width="100%"></video>

<script>
    const ReshetTV = "https://reshet-live-il.ctedgecdn.net/13tv-desktop/r13.m3u8";
    const Kan11 = "https://kanlivep2event-i.akamaihd.net/hls/live/747610/747610/source1_2.5k/chunklist.m3u8";
    const Keshet = "https://keshethlslive-i.akamaihd.net/hls/live/512033/CH2LIVE_HIGH/index.m3u8?as=1&hdnea=st%3D1584201190%7Eexp%3D1584202090%7Eacl%3D%2F*%7Ehmac%3D092f7f460272c9b679c9b973c3c573c51ca6a773298322c264f71daf4e2e5847"
    const VideoURL = ReshetTV;

    var video = document.getElementById('video');
    if (Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(VideoURL);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play();
        });
    }
    // hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
    // When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element through the `src` property.
    // This is using the built-in support of the plain video element, without using hls.js.
    // Note: it would be more normal to wait on the 'canplay' event below however on Safari (where you are most likely to find built-in HLS support) the video.src URL must be on the user-driven
    // white-list before a 'canplay' event will be emitted; the last video event that can be reliably listened-for when the URL is not on the white-list is 'loadedmetadata'.
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = VideoURL;
        video.addEventListener('loadedmetadata', function () {
            video.play();
        });
    }
</script>
 */