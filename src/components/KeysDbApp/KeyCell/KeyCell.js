import React from "react";
import { Table, Icon, Button } from "semantic-ui-react";

function KeyCell({ gameKey }) {
    function unlockKey() {

    }

    return (
        <Table.Cell singleLine>
            <Icon circular size='small' name='lock' />
            <Icon circular size='small' name='paper plane' onClick={() => window.open(`https://store.steampowered.com/account/registerkey?key=${gameKey}`, "_blank")} />
        </Table.Cell>
    );
}

export default KeyCell;
