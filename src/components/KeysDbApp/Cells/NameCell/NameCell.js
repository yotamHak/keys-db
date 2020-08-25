import React, { useEffect, useState } from "react";
import { Table, Popup, Header, Grid, Image } from "semantic-ui-react";
import { useSelector, } from "react-redux";

import { getValueByType, } from "../../../../utils";
import GameInfoModal from "../../Modals/GameInfoModal";

function NameCell({ name, rowIndex }) {
    const headers = useSelector((state) => state.table.headers)
    const gameData = useSelector((state) => state.table.rows[rowIndex])

    const [steamAppId, setSteamAppId] = useState(null)
    const [steamTitle, setSteamTitle] = useState(null)

    useEffect(() => {
        setSteamAppId(getValueByType(gameData, headers, "steam_appid"))
        setSteamTitle(getValueByType(gameData, headers, "steam_title"))
    }, [headers])

    return (
        <React.Fragment>
            {
                steamAppId && steamTitle
                    ? (
                        <GameInfoModal
                            appId={steamAppId}
                            title={steamTitle}
                            trigger={
                                <Table.Cell className={'pointer'}>
                                    <Grid columns='equal'>
                                        <Popup
                                            on='hover'
                                            mouseEnterDelay={1000}
                                            position='bottom left'
                                            popperDependencies={[steamAppId, steamTitle]}
                                            trigger={<Grid.Column floated='left'>{name}</Grid.Column>}
                                            wide
                                        >
                                            <div>
                                                {/* subheader={data.title} */}
                                                <Header as='h2' content={steamTitle} />
                                                <Image src={`https://steamcdn-a.akamaihd.net/steam/apps/${steamAppId}/header.jpg`} size='medium' />
                                            </div>
                                        </Popup>
                                    </Grid>
                                </Table.Cell>}
                        />
                    )
                    : (
                        <Table.Cell>{name}</Table.Cell>
                    )
            }
        </React.Fragment>
    );
}

export default NameCell;
