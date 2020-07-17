import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {  steamSetId } from "../../../actions";
import { Container } from "semantic-ui-react";

function SteamLogin() {
    const env = window.location.origin
    const [steamId, setSteamId] = useState(localStorage.getItem('steam') && localStorage.getItem('steam').id)
    const steam = useSelector((state) => state.authentication.steam)
    const dispatch = useDispatch()    

    useEffect(() => {
        if (steam.loggedIn !== null) {
            if (steam.loggedIn) {                       // Steam logged in
                console.log("Steam logged in")
            } else {                                    // Steam isn't Logged in
                console.log("Steam is logged out")
            }
        } else {                                        // Steam isn't initialized
            if (steamId) {
                console.log("Steam isn't initialized but was signed before")
                dispatch(steamSetId(steamId))
            } else {
                console.log("Steam isn't initialized and wasn't signed before")
                setSteamId(getSteamId(window.location.search))
            }
        }
    }, [steamId])

    function getSteamId(url) {
        if (!url) return null

        const urlParams = getUrlParams(url)
        const id = urlParams['openid.claimed_id']

        if (urlParams['openid.mode'] !== 'id_res' || !id) return null

        return id.replace('https://steamcommunity.com/openid/id/', '')
    }

    function getUrlParams(search) {
        let hashes = search.slice(search.indexOf('?') + 1).split('&')
        return hashes.reduce((params, hash) => {
            let [key, val] = hash.split('=')
            return Object.assign(params, { [key]: decodeURIComponent(val) })
        }, {})
    }

    return (
        !steamId && (
            <Container textAlign='center'>
                <form method="get" action="https://steamcommunity.com/openid/login">
                    <input type="hidden" name="openid.ns" value="http://specs.openid.net/auth/2.0" />
                    <input type="hidden" name="openid.ns.sreg" value="http://openid.net/extensions/sreg/1.1" />
                    <input type="hidden" name="openid.mode" value="checkid_setup" />
                    <input type="hidden" name="openid.return_to" value={`${env}/login?steamlogin`} />
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