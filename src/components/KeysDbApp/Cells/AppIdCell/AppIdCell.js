import React from "react";
import { Table, Icon } from "semantic-ui-react";

function AppIdCell({ appId, rowIndex }) {
    return (
        <Table.Cell>
            {
                appId && (
                    <a target='_blank' rel='noopener noreferrer' href={`https://steamdb.info/app/${appId}/`}>
                        <Icon
                            link={true}
                            color='black'
                            name={'database'}
                        />
                        &nbsp;
                        {appId}
                    </a>
                )
            }
        </Table.Cell>
    );
}

export default AppIdCell;
