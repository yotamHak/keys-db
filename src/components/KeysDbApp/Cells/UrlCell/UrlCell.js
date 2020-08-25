import React from "react";
import { Table, Grid, Icon } from "semantic-ui-react";

function UrlCell({ urls, rowIndex }) {
    return (
        <Table.Cell>
            <Grid>
                <Grid.Row textAlign='center' className={'urls-wrapper'}>
                    {
                        urls.map((url, index) => url.url && (
                            <div className={'url-icon-wrapper'} key={index}>
                                <a target='_blank' rel='noopener noreferrer' href={url.url}>
                                    <Icon
                                        link={true}
                                        color='black'
                                        name={url.website === 'steam' ? 'steam' : 'rocket'}
                                    />
                                </a>
                            </div>
                        ))
                    }
                </Grid.Row>
            </Grid>
        </Table.Cell>
    );
}

export default UrlCell;
