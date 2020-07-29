import React, { useEffect, } from "react"
import { Menu, Dropdown, Image, Grid, } from "semantic-ui-react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, } from "react-router-dom";
import { spreadsheetSetId, steamLoad, steamLogged, setupComplete, } from "../../actions";
import GoogleAuthentication from "../../google/GoogleAuthentication";

function Header() {
    const google = useSelector((state) => state.authentication.google)
    const steam = useSelector((state) => state.authentication.steam)
    const spreadsheetId = useSelector((state) => state.authentication.spreadsheetId)

    const dispatch = useDispatch()

    useEffect(() => {
        if (!steam.loggedIn && localStorage.getItem('steam')) {
            dispatch(steamLoad(JSON.parse(localStorage.getItem('steam'))))
        }

        if (!spreadsheetId && localStorage.getItem('spreadsheetId')) {
            dispatch(spreadsheetSetId(localStorage.getItem('spreadsheetId')))
        }
    }, [google, steam, spreadsheetId,])

    function handleLoginWithSteam() {
        dispatch(setupComplete(false))
        dispatch(steamLogged(null))
    }

    return (
        <React.Fragment>
            <GoogleAuthentication dontLogin={true} />
            <Menu pointing>
                <NavLink to="/">
                    <Menu.Item name='Home' />
                </NavLink>
                {
                    spreadsheetId && (
                        <NavLink to={`/id/${spreadsheetId}`}>
                            <Menu.Item name='My Collection' />
                        </NavLink>
                    )
                }

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
                                            <Image verticalAlign='middle' avatar src={google.profile.imageUrl} />
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
                                                            <Grid.Row columns={'equal'}>
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
                                                                <NavLink to="/login">
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
                                                            <Grid.Row columns={'equal'}>
                                                                <Grid.Column floated='left' verticalAlign='middle' textAlign='left'>
                                                                    Logout from Steam
                                                                </Grid.Column>
                                                                <Grid.Column floated='right' verticalAlign='middle' textAlign='right'>
                                                                    <Image verticalAlign='middle' avatar src={steam.profile.avatar} />
                                                                </Grid.Column>
                                                            </Grid.Row>
                                                        )
                                                        : (
                                                            <Grid.Column floated='left' verticalAlign='middle' textAlign='left'>
                                                                <NavLink to="/login" onClick={handleLoginWithSteam}>
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
                                <NavLink to="/login">
                                    <Menu.Item name='Login' />
                                </NavLink>
                            )
                    }
                </Menu.Menu>
            </Menu>
        </React.Fragment>
    )

}

export default Header;