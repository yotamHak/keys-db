import React from "react";
import { Header, Dropdown, Grid, Button, Icon } from "semantic-ui-react";

function SortDropdown({ headers, value, onSort }) {
    return (
        <Header as='h4'>
            <Header.Content>
                Sort: <React.Fragment>
                    {value.sort} {value.asc ? ' (Ascending)' : ' (Descending)'}
                </React.Fragment>
                <Dropdown floating>
                    <Dropdown.Menu>
                        {
                            Object.keys(headers).map((key, index) => (
                                <Dropdown.Item key={index}>
                                    <Grid>
                                        <Grid.Column width={5} floated='left' verticalAlign='middle' textAlign='left'>
                                            {key}
                                        </Grid.Column>
                                        <Grid.Column width={11} floated='right' verticalAlign='middle' textAlign='right'>
                                            <Button.Group basic size='small'>
                                                <Button size='medium' onClick={() => { onSort({ sort: key, asc: true }) }}>
                                                    <Icon size='massive' name={`sort ${headers[key].type === 'string'
                                                        ? 'alphabet ascending'
                                                        : headers[key].type === 'number'
                                                            ? 'numeric ascending'
                                                            : 'content ascending'
                                                        }`} />
                                                </Button>
                                                <Button.Or />
                                                <Button size='medium' onClick={() => { onSort({ sort: key, asc: false }) }}>
                                                    <Icon size='massive' name={`sort ${headers[key].type === 'string'
                                                        ? 'alphabet descending'
                                                        : headers[key].type === 'number'
                                                            ? 'numeric descending'
                                                            : 'content descending'
                                                        }`} />
                                                </Button>
                                            </Button.Group>
                                        </Grid.Column>
                                    </Grid>
                                </Dropdown.Item>
                            ))
                        }
                    </Dropdown.Menu>
                </Dropdown>
            </Header.Content>
        </Header>
    );
}

export default SortDropdown;
