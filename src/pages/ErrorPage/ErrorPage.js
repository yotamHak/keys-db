import React, { } from "react"
import { Segment, Header, Icon, Button, Grid, Message } from "semantic-ui-react";
import { useHistory } from "react-router-dom";

function ErrorPage(props) {
    const errorCode = props.match.params.error
    const history = useHistory()

    function showError(errorCode) {
        switch (errorCode) {
            case 'missing_settings':
                return (
                    <Grid centered columns={2}>
                        <Grid.Row>
                            <Grid.Column textAlign='center'>
                                <Message info>
                                    <Message.Header>Missing Settings</Message.Header>
                                    <p>
                                        Looks like your spreadsheet is missing crucial settings, <br />
                                        Try importing this spreadsheet and map the headers.
                                    </p>
                                </Message>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                )
            case 'unauthorized':
                return (
                    <Grid centered columns={2}>
                        <Grid.Row>
                            <Grid.Column textAlign='center'>
                                <Message info>
                                    <Message.Header>Unauthorized</Message.Header>
                                    <p>
                                        Looks like you're not authorized to view this, <br />
                                        Make sure the owner had shared correctly.
                                    </p>
                                </Message>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                )
            default:
                return (
                    <Grid centered columns={2}>
                        <Grid.Row>
                            <Grid.Column textAlign='center'>
                                <Message negative>
                                    <Message.Header>Error</Message.Header>
                                    <p>
                                        Something broke... sorry about this... <br />
                                        Please open an issue <a target='_blank' rel='noopener noreferrer' href='https://github.com/yotamHak/key-db/issues'>here (Github)</a> and I'll try getting on it...
                                    </p>
                                </Message>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                )
        }
    }

    return (
        <Segment placeholder vertical style={{ height: "calc(100vh - 4em)", backgroundColor: "white", boxShadow: "none" }}>
            <Header icon>
                <Icon name='frown outline' />
                Ooops...
                <Header.Subheader>
                    {showError(errorCode)}
                </Header.Subheader>
            </Header>
            <Button onClick={() => history.push(`/`)}>Home</Button>
        </Segment>
    )
}

export default ErrorPage;