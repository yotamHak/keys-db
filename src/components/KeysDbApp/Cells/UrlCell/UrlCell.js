import React from "react";
import { Table, Image } from "semantic-ui-react";

function UrlCell({ website, url }) {
    return (
        <Table.Cell>
            <Image
                src={
                    website === 'steam'
                        ? 'https://store.steampowered.com/favicon.ico'
                        : 'https://d2uym1p5obf9p8.cloudfront.net/images/favicon.png'
                }
                as='a'
                size='tiny'
                avatar
                href={`${url}`}
                target='_blank'
            />
        </Table.Cell>
    );
}

export default UrlCell;
