// https://steamdb.info/app/730/

import React, { useState, useEffect } from "react";
import { Modal, Icon } from "semantic-ui-react";
import steamApi from '../../../../steam'

function GameInfoModal({ appId, children, }) {
    const [showModal, setShowModal] = useState(false)

    const Child = React.Children.only(children);
    const newChildren = React.cloneElement(Child, { onClick: openModal });

    function openModal() { setShowModal(true) }
    function closeModal() { setShowModal(false) }

    useEffect(() => {
        if (showModal) {
            steamApi.AppDetails(appId)
                .then(response => {
                    console.log(response)
                })
            // fetch(`https://store.steampowered.com/api/appdetails/?appids=${appId}/`,
            //     {
            //         method: 'GET', // *GET, POST, PUT, DELETE, etc.
            //         mode: 'cors', // no-cors, *cors, same-origin
            //         cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            //         credentials: 'include',
            //         headers: {
            //             'Access-Control-Allow-Origin': '*',
            //             // 'Content-Type': 'application/json'
            //             // 'Content-Type': 'application/x-www-form-urlencoded',
            //         },
            //         redirect: 'follow', // manual, *follow, error
            //         referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            //     }
            // )
            //     .then(response => {
            //         console.log(response)
            //     })
        }
    }, [showModal])

    return (
        <Modal
            closeIcon={<Icon name="close" onClick={closeModal} />}
            trigger={newChildren}
            centered={false}
            size="large"
            open={showModal}
        >
            <Modal.Header>Game Info</Modal.Header>
            <Modal.Content>
                <Modal.Description>

                </Modal.Description>
            </Modal.Content>
        </Modal >
    );
}

export default GameInfoModal;