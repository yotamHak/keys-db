import React from "react";
import { Image, List, Loader, Dimmer } from 'semantic-ui-react'

import steamApi from "../../steam";

/*

// setter
localStorage.setItem('myData', data);
// getter
localStorage.getItem('myData');
// remove
localStorage.removeItem('myData');
// remove all
localStorage.clear();

*/

function SteamGame(props) {
    React.useEffect(() => {
        console.log(props)
        getAppDetails();
    }, []);

    const [gameData, setGameData] = React.useState({});
    const style = {
        game: {
            "display": "flex",
            "width": 'calc(100% / 6)'
        }
    }
    const image_url = props.game.img_logo_url;
    const appid = props.game.appid;


    async function getAppDetails() {
        return
        try {
            await steamApi.AppDetails(props.game.appid)
                .then(response => {
                    setGameData(response.data[props.game.appid].data);
                });
        } catch (err) {
            console.error("Error getting app details", err);
        }
    }

    function renderGame() {
        return (
            // <List.Item>
            //     <Image
            //         src={gameData.header_image}
            //         as='a'
            //         size='medium'
            //         target='_blank'
            //         href={`/steam-app/app/${props.appid}`}
            //     />
            // </List.Item>

            <div style={style.game}>
                <Image
                    // src={`https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/${appid}/${image_url}.jpg`}
                    src={`https://steamcdn-a.akamaihd.net/steam/apps/${appid}/header.jpg`}
                    as='a'
                    size='medium'
                    target='_blank'
                    // href={`/steam-app/app/${appid}`}
                    href={`https://store.steampowered.com/app/${appid}/`}
                />
            </div>
        )
    }

    return (
        <React.Fragment>
            {
                appid === null && (
                    <List.Item className="steam-game-template">
                        <Dimmer active>
                            <Loader />
                        </Dimmer>
                    </List.Item>
                )
            }
            {
                appid !== null && renderGame()
            }
        </React.Fragment>
    )
}

export default SteamGame;