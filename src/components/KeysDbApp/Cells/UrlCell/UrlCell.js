import React from "react";
import { Table, Grid, Icon } from "semantic-ui-react";

function UrlCell({ urls, rowIndex }) {
    return (
        <Table.Cell>
            <Grid columns={"equal"}>
                <Grid.Row>
                    {
                        urls.map((url, index) => url.url && (
                            <Grid.Column key={index}>
                                <a target='_blank' rel='noopener noreferrer' href={`${url.url}`}>
                                    <Icon
                                        link={true}
                                        color='black'
                                        name={url.website === 'steam' ? 'steam' : 'rocket'}
                                    />
                                </a>
                            </Grid.Column>
                        ))
                    }
                </Grid.Row>
            </Grid>
        </Table.Cell>
    );
}

export default UrlCell;
