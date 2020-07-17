import React, { useEffect, } from "react"
import { Menu, Dropdown, Image, Grid, Placeholder } from "semantic-ui-react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import { spreadsheetSetId, steamLoad, } from "../../actions";
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

    return <React.Fragment>
        <GoogleAuthentication dontLogin={true} />
        <Menu pointing secondary>
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
                    google.loggedIn && steam.loggedIn
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
                                        <Grid>
                                            {
                                                google
                                                    ? google.profile
                                                        ? (
                                                            <Grid.Row>
                                                                <Grid.Column floated='left' verticalAlign='middle' textAlign='left'>
                                                                    Logout from Google
                                                </Grid.Column>
                                                                <Grid.Column floated='right' verticalAlign='middle' textAlign='right' width={6} style={{ paddingRight: "0" }}>
                                                                    <Image verticalAlign='middle' avatar src={google.profile.imageUrl} />
                                                                </Grid.Column>
                                                            </Grid.Row>
                                                        )
                                                        : (
                                                            <Grid.Row>
                                                                <Grid.Column floated='left' verticalAlign='middle' textAlign='right'>
                                                                    Login to Google
                                                </Grid.Column>
                                                            </Grid.Row>)
                                                    : (
                                                        <Grid.Row>
                                                            <Placeholder>
                                                                <Placeholder.Line />
                                                            </Placeholder>
                                                        </Grid.Row>
                                                    )
                                            }
                                        </Grid>
                                    </Dropdown.Item>
                                    <Dropdown.Item>
                                        <Grid>
                                            {
                                                steam.profile
                                                    ? (
                                                        <Grid.Row>
                                                            <Grid.Column floated='left' verticalAlign='middle' textAlign='left'>
                                                                Logout from Steam
                                                            </Grid.Column>
                                                            <Grid.Column floated='right' verticalAlign='middle' textAlign='right' width={6} style={{ paddingRight: "0" }}>
                                                                <Image verticalAlign='middle' avatar src={steam.profile && steam.profile.avatar} />
                                                            </Grid.Column>
                                                        </Grid.Row>
                                                    )
                                                    : (
                                                        <Grid.Row>
                                                            <Grid.Column floated='left' verticalAlign='middle' textAlign='right'>
                                                                Login to Steam
                                                            </Grid.Column>
                                                        </Grid.Row>)
                                            }
                                        </Grid>
                                    </Dropdown.Item>
                                    <Dropdown.Item>
                                        <Grid>
                                            <Grid.Row>
                                                <Grid.Column floated='left' verticalAlign='middle' textAlign='left'>
                                                    <NavLink to="/settings">
                                                        <Menu.Item name='Settings' />
                                                    </NavLink>
                                                </Grid.Column>
                                            </Grid.Row>
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

}

export default Header;