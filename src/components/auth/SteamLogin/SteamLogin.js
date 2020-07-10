import React, { useEffect } from "react";
import querystring from 'querystring'

import { useDispatch, useSelector } from "react-redux";
import { steamLoggedIn } from "../../../actions";
import steamApi from "../../../steam";
import steamConfig from "../../../steam/config";
import axios from "axios";
import { Container } from "semantic-ui-react";

function SteamLogin() {
    // function getUrlParams(search) {
    //     let hashes = search.slice(search.indexOf('?') + 1).split('&')
    //     return hashes.reduce((params, hash) => {
    //         let [key, val] = hash.split('=')
    //         return Object.assign(params, { [key]: decodeURIComponent(val) })
    //     }, {})
    // }
    // console.log(getUrlParams(window.location.search))    

    const env = window.location.origin

    const isLogged = useSelector((state) => state.authentication.steam)
    const dispatch = useDispatch()

    useEffect(() => {
        if (localStorage.getItem('steamId')) {
            dispatch(steamLoggedIn(true))
            return
        }

        if (!window.location.search) return;

        const query = querystring.parse(window.location.search.substr(1)) || {};
        const id = query['openid.claimed_id'];

        if (query['openid.mode'] !== 'id_res' || !id) return;

        const steamId = id.replace('https://steamcommunity.com/openid/id/', '');

        localStorage.setItem('steamId', steamId)
        dispatch(steamLoggedIn(true))
    }, [])

    return (
        !isLogged && (
            <Container textAlign='center'>
                <form method="get" action="https://steamcommunity.com/openid/login">
                    <input type="hidden" name="openid.ns" value="http://specs.openid.net/auth/2.0" />
                    <input type="hidden" name="openid.ns.sreg" value="http://openid.net/extensions/sreg/1.1" />
                    <input type="hidden" name="openid.mode" value="checkid_setup" />
                    <input type="hidden" name="openid.return_to" value={`${env}/?steamlogin`} />
                    <input type="hidden" name="openid.realm" value={`${env}/`} />
                    <input type="hidden" name="openid.identity" value="http://specs.openid.net/auth/2.0/identifier_select" />
                    <input type="hidden" name="openid.claimed_id" value="http://specs.openid.net/auth/2.0/identifier_select" />
                    <input type="image" alt="Login to Steam" src="https://steamcommunity-a.akamaihd.net/public/images/signinthroughsteam/sits_02.png" />
                </form>
            </Container>
        )
    )
}

export default SteamLogin;