import React from "react";
import { Header, Dropdown, Grid, Button, Icon, Placeholder } from "semantic-ui-react";
import _ from 'lodash'

function SortDropdown({ headers, value, onSort }) {
    const styles = {
        placeholder: { width: '8em', height: '0.5em', display: 'inherit' },
        placeholderLine: { margin: '0', display: 'inherit' }
    }

    return (
        <Header as='h4'>
            <Header.Content>
                Sort: <React.Fragment>
                    {value.sort} {value.asc ? ' (Ascending)' : ' (Descending)'}
                </React.Fragment>
                {/* {
                    value.sort.length === 1
                        ? (
                            <React.Fragment>
                                {Object.keys(headers).filter(key => headers[key].id === value.sort ? headers[key].label : false)[0]} {value.asc ? ' (Ascending)' : ' (Descending)'}
                            </React.Fragment>
                        )
                        : (
                            <Placeholder style={styles.placeholder}>
                                <Placeholder.Line length='full' style={styles.placeholderLine} />
                            </Placeholder>
                        )
                } */}
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
