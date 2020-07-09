import React, { useEffect } from "react";
import querystring from 'querystring'

import { useDispatch, useSelector } from "react-redux";
import { steamLoggedIn } from "../../../actions";
import steamApi from "../../../steam";
import steamConfig from "../../../steam/config";
import axios from "axios";

function SteamLogin() {
    function getUrlParams(search) {
        let hashes = search.slice(search.indexOf('?') + 1).split('&')
        return hashes.reduce((params, hash) => {
            let [key, val] = hash.split('=')
            return Object.assign(params, { [key]: decodeURIComponent(val) })
        }, {})
    }
    // console.log(getUrlParams(window.location.search))    

    const isLogged = useSelector((state) => state.authentication.steam)
    const dispatch = useDispatch()

    useEffect(() => {
        if (document.cookie) {
            const cookies = querystring.parse(document.cookie, '; ');

            if (cookies.steamId) {
                axios.get(`https://us-central1-keys-db.cloudfunctions.net/steamOwnedGames`)
                    .then(response => {
                        console.log(response)
                    })
                dispatch(steamLoggedIn(true))
                return
            }
        }

        if (!window.location.search) return;

        const query = querystring.parse(window.location.search.substr(1)) || {};
        const id = query['openid.claimed_id'];

        if (query['openid.mode'] !== 'id_res' || !id) return;

        const steamId = id.replace('http://steamcommunity.com/openid/id/', '');





        dispatch(steamLoggedIn(true))
        document.cookie = 'steamId=' + steamId;
    }, [])

    return (
        !isLogged && (
            <React.Fragment>
                <form method="get" action="https://steamcommunity.com/openid/login">
                    <input type="hidden" name="openid.ns" value="http://specs.openid.net/auth/2.0" />
                    <input type="hidden" name="openid.ns.sreg" value="http://openid.net/extensions/sreg/1.1" />
                    <input type="hidden" name="openid.mode" value="checkid_setup" />
                    <input type="hidden" name="openid.return_to" value="http://localhost:3000/?steamlogin" />
                    <input type="hidden" name="openid.realm" value="http://localhost:3000/" />
                    <input type="hidden" name="openid.identity" value="http://specs.openid.net/auth/2.0/identifier_select" />
                    <input type="hidden" name="openid.claimed_id" value="http://specs.openid.net/auth/2.0/identifier_select" />
                    <input type="image" alt="Login to Steam" src="https://steamcommunity-a.akamaihd.net/public/images/signinthroughsteam/sits_02.png" />
                </form>
            </React.Fragment>
        )
    )
}

export default SteamLogin;