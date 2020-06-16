import React from "react";
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import steamApi from '../../steam';
import SteamGame from "./steamGame";
import { Container, Header, List, Divider } from "semantic-ui-react";
import dateFns from "date-fns";

function SteamApp() {
    React.useEffect(() => {
        // localStorage.removeItem('recentlyPlayedGames');
        //localStorage.removeItem('ownedGames');
        const recentlyPlayedGames = JSON.parse(localStorage.getItem('recentlyPlayedGames'));
        const ownedGames = JSON.parse(localStorage.getItem('ownedGames'));
        console.log('recentlyPlayedGames', recentlyPlayedGames)
        console.log('ownedGames', ownedGames)

        if (recentlyPlayedGames && dateFns.differenceInHours(new Date(), new Date(recentlyPlayedGames.timestamp)) === 0) {
            setRecentlyPlayedGames(recentlyPlayedGames);
        } else {
            getRecentlyPlayedGames();
        }

        if (ownedGames && dateFns.differenceInHours(new Date(), new Date(ownedGames.timestamp)) === 0) {
            setOwnedGames(ownedGames);
        } else {
            getOwnedGames();
        }
    }, []);

    const [ownedGames, setOwnedGames] = React.useState([{ games: [], game_count: 0 }]);
    const [recentlyPlayedGames, setRecentlyPlayedGames] = React.useState({ games: [], total_count: 0 });
    const style = {
        gamesContainer: {
            "display": "flex",
            "justifyContent": "start",
            "alignItems": "flex-start",
            "flexWrap": "wrap"
        },
        container: {
            "display": "flex",

        }
    }

    async function getRecentlyPlayedGames() {
        try {
            await steamApi.GetRecentlyPlayedGames()
                .then(response => {
                    console.log(response);

                    const recentlyPlayedGames = {
                        timestamp: new Date(),
                        ...response.data.response
                    };

                    console.log(recentlyPlayedGames)

                    localStorage.setItem('recentlyPlayedGames', JSON.stringify(recentlyPlayedGames));
                    setRecentlyPlayedGames(recentlyPlayedGames);
                });
        } catch (err) {
            console.error("Error getting recently played games", err);
        }
    }

    async function getOwnedGames() {
        try {
            await steamApi.GetOwnedGames()
                .then(response => {
                    console.log(response);

                    const ownedGames = {
                        timestamp: new Date(),
                        ...response.data.response
                    };
                    localStorage.setItem('ownedGames', JSON.stringify(ownedGames));
                    setOwnedGames(ownedGames);
                });
        } catch (err) {
            console.error("Error getting owned games", err);
        }
    }

    return (
        <div style={{ "display": 'flex', "flexWrap": 'wrap', "padding": '0 1em' }}>
            <div style={{ "display": 'flex', "flexDirection": 'column', 'flexGrow': 1 }}>
                <Header>Recently Played Games</Header>
                {recentlyPlayedGames.total_count === 0 && (<div>Loading</div>)}
                {
                    recentlyPlayedGames.total_count > 0 && (
                        <div style={style.gamesContainer}>
                            {recentlyPlayedGames.games.map(game => <SteamGame game={game} key={game.appid} />)}
                        </div>

                        // <List horizontal>
                        //     {recentlyPlayedGames.map(game => <SteamGame appid={game.appid} key={game.appid} />)}
                        // </List>
                    )
                }
            </div>
            <Divider />
            <div style={{ "display": 'flex', "flexDirection": 'column', 'flexGrow': 1 }}>
                <Header>Owned Games</Header>
                {ownedGames.game_count === 0 && (<div>Loading</div>)}
                {
                    ownedGames.game_count > 0 && (
                        <div style={style.gamesContainer}>
                            {ownedGames.games.map(game => <SteamGame game={game} key={game.appid} />)}
                        </div>

                        // <List horizontal>
                        //     {ownedGames.map(game => <SteamGame game={game} key={game.appid} />)}
                        // </List>


                    )
                }
            </div>
        </div>
    );
}

export default SteamApp;
