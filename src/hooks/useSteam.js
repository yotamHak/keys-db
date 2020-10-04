import { useEffect, useState, } from 'react';
import { useDispatch, } from 'react-redux';
import { useLocation } from 'react-router-dom';
import _ from 'lodash';

import { steamSetId } from '../actions';
import useLocalStorage from './useLocalStorage';
import useUrlParams from './useUrlParams';

// Custom hook to initialize and use the Steam
function useSteam(options) {
    const {
        env,
        returnTo,
    } = options;

    const [steamStorage,] = useLocalStorage("steam", null)

    const [steamId, setSteamId] = useState(steamStorage && steamStorage.id)
    const [isAuthenticated, setIsAuthenticated] = useState(steamId ? true : false);

    const { urlParamsObject, cleanUrl } = useUrlParams(useLocation())

    const dispatch = useDispatch();

    useEffect(() => {
        if (steamId) {
            setIsAuthenticated(true)
            dispatch(steamSetId(steamId))
        } else {
            if (urlParamsObject === null || !_getSteamId(urlParamsObject)) {
                return
            }

            setSteamId(urlParamsObject['openid.claimed_id'][0].replace('https://steamcommunity.com/openid/id/', ''))
            cleanUrl()
        }
    }, [steamId, urlParamsObject,])

    function handleSignIn() {
        if (_getSteamId(urlParamsObject)) {
            return
        }

        try {
            let formElement = document.createElement('form');
            formElement.setAttribute('method', 'get')
            formElement.setAttribute('action', 'https://steamcommunity.com/openid/login')
            formElement.setAttribute('style', 'visibility: hidden;')

            const childElements = [
                {
                    type: 'input',
                    attributes: [
                        {
                            key: 'type',
                            value: 'hidden'
                        },
                        {
                            key: 'name',
                            value: 'openid.ns'
                        },
                        {
                            key: 'value',
                            value: 'http://specs.openid.net/auth/2.0'
                        },
                    ]
                },
                {
                    type: 'input',
                    attributes: [
                        {
                            key: 'type',
                            value: 'hidden'
                        },
                        {
                            key: 'name',
                            value: 'openid.ns.sreg'
                        },
                        {
                            key: 'value',
                            value: 'http://openid.net/extensions/sreg/1.1'
                        },
                    ]
                },
                {
                    type: 'input',
                    attributes: [
                        {
                            key: 'type',
                            value: 'hidden'
                        },
                        {
                            key: 'name',
                            value: 'openid.mode'
                        },
                        {
                            key: 'value',
                            value: 'checkid_setup'
                        },
                    ]
                },
                {
                    type: 'input',
                    attributes: [
                        {
                            key: 'type',
                            value: 'hidden'
                        },
                        {
                            key: 'name',
                            value: 'openid.return_to'
                        },
                        {
                            key: 'value',
                            value: `${env}/${returnTo}`
                        },
                    ]
                },
                {
                    type: 'input',
                    attributes: [
                        {
                            key: 'type',
                            value: 'hidden'
                        },
                        {
                            key: 'name',
                            value: 'openid.realm'
                        },
                        {
                            key: 'value',
                            value: `${env}/`
                        },
                    ]
                },
                {
                    type: 'input',
                    attributes: [
                        {
                            key: 'type',
                            value: 'hidden'
                        },
                        {
                            key: 'name',
                            value: 'openid.identity'
                        },
                        {
                            key: 'value',
                            value: 'http://specs.openid.net/auth/2.0/identifier_select'
                        },
                    ]
                },
                {
                    type: 'input',
                    attributes: [
                        {
                            key: 'type',
                            value: 'hidden'
                        },
                        {
                            key: 'name',
                            value: 'openid.claimed_id'
                        },
                        {
                            key: 'value',
                            value: 'http://specs.openid.net/auth/2.0/identifier_select'
                        },
                    ]
                },
                {
                    type: 'input',
                    attributes: [
                        {
                            key: 'id',
                            value: 'steam-login'
                        },
                        {
                            key: 'type',
                            value: 'image'
                        },
                        {
                            key: 'alt',
                            value: 'Login to Steam'
                        },
                        {
                            key: 'src',
                            value: 'https://steamcommunity-a.akamaihd.net/public/images/signinthroughsteam/sits_02.png'
                        },
                    ]
                },
            ]

            childElements.forEach(item => {
                let newElement = document.createElement(item.type)

                item.attributes.forEach(attribute => {
                    newElement.setAttribute(attribute.key, attribute.value)
                })

                formElement.appendChild(newElement)
            })

            document.body.append(formElement)

            document.getElementById('steam-login').click()
        } catch (error) {
            console.log(error);
            throw new Error('Steam API not loaded', error);
        }
    };

    async function handleSignOut() {
        try {

        } catch (error) {
            console.log(error);
            throw new Error('Steam API not loaded', error);
        }
    };

    function _getSteamId(urlParamsObject) {
        try {
            if (_.isEmpty(urlParamsObject) || urlParamsObject['openid.mode'][0] !== 'id_res' || !urlParamsObject['openid.claimed_id']) {
                return null
            }

            return urlParamsObject['openid.claimed_id'][0].replace('https://steamcommunity.com/openid/id/', '')
        } catch (error) {
            return null
        }
    }

    return {
        steamId,
        isAuthenticated,
        handleSignIn,
        handleSignOut,
    };
}

export default useSteam;