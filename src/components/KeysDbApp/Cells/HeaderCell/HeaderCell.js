import React from "react";
import { Table, Grid, } from "semantic-ui-react";
import { useSelector } from "react-redux";

function HeaderCell({ title }) {
    const headers = useSelector((state) => state.table.headers)

    return (
        <Table.HeaderCell singleLine>
            <Grid>
                <Grid.Row>
                    <Grid.Column>
                        {(headers[title] && headers[title].label) || title}
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Table.HeaderCell>
    );
}

export default HeaderCell;
