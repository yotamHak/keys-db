import React from "react";
import { Header, Dropdown, Grid, Button, Icon } from "semantic-ui-react";
import { useSelector, useDispatch } from "react-redux";
import { changeOrderby } from "../../../actions";

function SortDropdown() {
    const headers = useSelector((state) => state.table.headers)
    const orderBy = useSelector((state) => state.table.orderBy)

    const dispatch = useDispatch()

    return (
        <Header as='h5'>
            <Header.Content>
                <Dropdown
                    text={`Sort: ${orderBy.sort} ${orderBy.asc ? ' (Ascending)' : ' (Descending)'}`}
                    compact
                >
                    <Dropdown.Menu>
                        {
                            Object.keys(headers)
                                .filter(header => header !== "ID" && headers[header].sortable)
                                .map((key, index) => (
                                    <Dropdown.Item
                                        active={orderBy.sort === key}
                                        className={"cursor-auto"}
                                        key={index}
                                    >
                                        <Grid>
                                            <Grid.Column width={5} floated='left' verticalAlign='middle' textAlign='left'>
                                                {key}
                                            </Grid.Column>
                                            <Grid.Column width={11} floated='right' verticalAlign='middle' textAlign='right'>
                                                <Button.Group basic size='small'>
                                                    <Button
                                                        active={orderBy.sort === key && orderBy.asc === true}
                                                        size='medium'
                                                        onClick={() => { dispatch(changeOrderby({ sort: key, asc: true })) }}
                                                    >
                                                        <Icon
                                                            size='massive'
                                                            name={`sort ${headers[key].type === 'string' || 'text'
                                                                ? 'alphabet ascending'
                                                                : headers[key].type === 'number'
                                                                    ? 'numeric ascending'
                                                                    : 'content ascending'
                                                                }`}
                                                        />
                                                    </Button>
                                                    <Button.Or />
                                                    <Button
                                                        active={orderBy.sort === key && orderBy.asc === false}
                                                        size='medium'
                                                        onClick={() => { dispatch(changeOrderby({ sort: key, asc: false })) }}
                                                    >
                                                        <Icon
                                                            size='massive'
                                                            name={`sort ${headers[key].type === 'string' || 'text'
                                                                ? 'alphabet descending'
                                                                : headers[key].type === 'number'
                                                                    ? 'numeric descending'
                                                                    : 'content descending'
                                                                }`}
                                                        />
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
