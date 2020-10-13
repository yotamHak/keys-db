import React from "react";
import { useDispatch, } from "react-redux";
import { Container, Message, List, Header, Button, } from "semantic-ui-react";

import { steamLogged } from "../../../store/actions/AuthenticationActions";
import SteamLoginComponent from "../SteamLoginComponent/SteamLoginComponent";
import useSteam from "../../../hooks/useSteam";

function SteamLogin() {
    const dispatch = useDispatch()

    const { handleSignIn, isAuthenticated, } = useSteam({
        env: window.location.origin,
        returnTo: 'get-started',
    })

    function skip() {
        dispatch(steamLogged(false))
    }

    return (
        isAuthenticated === false && (
            <div>
                <Container textAlign='center'>
                    <SteamLoginComponent handleSignIn={handleSignIn} />

                    <Header as='h2'>Steam is optional but it is highly recommended</Header>

                    <Message info style={{ textAlign: 'left' }}>
                        <Message.Header>Steam is used for:</Message.Header>
                        <List bulleted>
                            <List.Item>Checking if you own a game you're adding</List.Item>
                            <List.Item>Checking if games are on your wishlist</List.Item>
                            <List.Item>And more...</List.Item>
                        </List>
                    </Message>

                    <Button onClick={skip}>Skip</Button>

                </Container>
            </div>
        )
    )
}

export default SteamLogin;