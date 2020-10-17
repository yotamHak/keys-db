import React, { useEffect, useState, useCallback, } from "react"
import { Menu, Dropdown, Image, Grid, Label, } from "semantic-ui-react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, } from "react-router-dom";
import dateFns from 'date-fns';

import ChangelogModal, { changelog } from "../KeysDbApp/Modals/ChangelogModal/ChangelogModal";
import { parseSpreadsheetDate, } from "../../utils";
import useGapi from "../../hooks/useGapi";
import googleConfig from "../../lib/google/config";
import useLocalStorage from "../../hooks/useLocalStorage";
import { setupComplete, spreadsheetSetId, steamLoad, steamLogged } from "../../store/actions/AuthenticationActions";

function Header() {
    const google = useSelector((state) => state.authentication.google)
    const steam = useSelector((state) => state.authentication.steam)
    const spreadsheetId = useSelector((state) => state.authentication.spreadsheetId)

    const [openedNotifications, setOpenedNotifications] = useState(false)

    const [steamStorage,] = useLocalStorage("steam", null)
    const [spreadsheetIdStorage,] = useLocalStorage("spreadsheetId", null)

    const dispatch = useDispatch()
    const googleApi = useGapi({
        ...googleConfig,
        onLoaded: useCallback(gapi => {
            //   setApi(spreadsheetApi(gapi));
        }, [])
    });

    const { isAuthenticated, isLoading, handleSignOut, } = googleApi;

    useEffect(() => {
        if (!steam.loggedIn && steamStorage) {
            dispatch(steamLoad(JSON.parse(steamStorage)))
        }

        if (!spreadsheetId && spreadsheetIdStorage) {
            dispatch(spreadsheetSetId(spreadsheetIdStorage))
        }
    }, [google, steam, spreadsheetId, isLoading, isAuthenticated])

    function handleLoginWithSteam() {
        dispatch(setupComplete(false))
        dispatch(steamLogged(null))
    }

    function handleLogoutWithSteam() {
        dispatch(setupComplete(false))
        dispatch(steamLogged(false))
    }

    return (
        <React.Fragment>
            <Menu>
                <NavLink to="/">
                    <Menu.Item name='Home' />
                </NavLink>

                {
                    spreadsheetId && (
                        <>
                            <NavLink to={`/id/${spreadsheetId}`}>
                                <Menu.Item name='My Collection' />
                            </NavLink>
                            <NavLink to={`/id/${spreadsheetId}/statistics`}>
                                <Menu.Item name='Statistics' />
                            </NavLink>
                        </>
                    )
                }

                <ChangelogModal
                    trigger={
                        <Menu.Item onClick={() => { setOpenedNotifications(true) }}>
                            Changelog
                            {
                                !openedNotifications
                                && dateFns.differenceInWeeks(new Date(), parseSpreadsheetDate(changelog[0].date)) === 0
                                && (
                                    <Label size={'mini'} color='red'>
                                        {changelog.filter(item => dateFns.differenceInWeeks(new Date(), parseSpreadsheetDate(item.date)) === 0).length}
                                    </Label>
                                )
                            }
                        </Menu.Item>
                    }
                />

                <Menu.Menu position='right'>
                    {
                        google.loggedIn
                            ? (
                                <Dropdown
                                    trigger={
                                        <span style={{
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <Image verticalAlign='middle' avatar src={google.profile && google.profile.imageUrl} />
                                        </span>
                                    }
                                    // options={options}
                                    pointing='top right'
                                    icon={null}
                                >
                                    <Dropdown.Menu>
                                        <Dropdown.Item>
                                            <Grid style={{ minHeight: '4em' }}>
                                                <Grid.Column floated='left' verticalAlign='middle' textAlign='left'>
                                                    <NavLink to="/settings">
                                                        <Menu.Item name='Settings' style={{ padding: '0' }} />
                                                    </NavLink>
                                                </Grid.Column>
                                            </Grid>
                                        </Dropdown.Item>
                                        <Dropdown.Item>
                                            <Grid style={{ minHeight: '4em' }}>
                                                {
                                                    google.loggedIn && google.profile
                                                        ? (
                                                            <Grid.Row columns={'equal'} onClick={handleSignOut}>
                                                                <Grid.Column floated='left' verticalAlign='middle' textAlign='left'>
                                                                    Logout from Google
                                                                </Grid.Column>
                                                                <Grid.Column floated='right' verticalAlign='middle' textAlign='right'>
                                                                    <Image verticalAlign='middle' avatar src={google.profile.imageUrl} />
                                                                </Grid.Column>
                                                            </Grid.Row>
                                                        )
                                                        : (
                                                            <Grid.Column floated='left' verticalAlign='middle' textAlign='left'>
                                                                <NavLink to="/get-started">
                                                                    <Menu.Item name='Login with Google' />
                                                                </NavLink>
                                                            </Grid.Column>
                                                        )
                                                }
                                            </Grid>
                                        </Dropdown.Item>
                                        <Dropdown.Item>
                                            <Grid style={{ minHeight: '4em' }}>
                                                {
                                                    steam.loggedIn && steam.profile
                                                        ? (
                                                            <Grid.Row columns={'equal'} onClick={handleLogoutWithSteam}>
                                                                <Grid.Column floated='left' verticalAlign='middle' textAlign='left'>
                                                                    Logout from Steam
                                                                </Grid.Column>
                                                                <Grid.Column floated='right' verticalAlign='middle' textAlign='right'>
                                                                    <Image verticalAlign='middle' avatar src={steam.profile.avatar} />
                                                                </Grid.Column>
                                                            </Grid.Row>
                                                        )
                                                        : (
                                                            <Grid.Column floated='left' verticalAlign='middle' textAlign='left' onClick={handleLoginWithSteam}>
                                                                <NavLink to="/get-started">
                                                                    <Menu.Item name='Login with Steam' style={{ padding: '0' }} />
                                                                </NavLink>
                                                            </Grid.Column>
                                                        )
                                                }
                                            </Grid>
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            )
                            : (
                                <NavLink to="/get-started">
                                    <Menu.Item name='Get Started' />
                                </NavLink>
                            )
                    }
                </Menu.Menu>
            </Menu>
        </React.Fragment>
    )
}

export default Header;