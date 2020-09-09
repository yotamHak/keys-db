import React from "react";
import { Image } from "semantic-ui-react";

function SteamLoginComponent({ handleSignIn }) {
    return (
        <Image
            as='div'
            style={{ cursor: 'pointer' }}
            src="https://steamcommunity-a.akamaihd.net/public/images/signinthroughsteam/sits_02.png"
            onClick={handleSignIn}
        />
    )

    // return (
    //     <div>
    //         <form method="get" action="https://steamcommunity.com/openid/login">
    //             <input type="hidden" name="openid.ns" value="http://specs.openid.net/auth/2.0" />
    //             <input type="hidden" name="openid.ns.sreg" value="http://openid.net/extensions/sreg/1.1" />
    //             <input type="hidden" name="openid.mode" value="checkid_setup" />
    //             <input type="hidden" name="openid.return_to" value={`${env}/${returnTo}`} />
    //             <input type="hidden" name="openid.realm" value={`${env}/`} />
    //             <input type="hidden" name="openid.identity" value="http://specs.openid.net/auth/2.0/identifier_select" />
    //             <input type="hidden" name="openid.claimed_id" value="http://specs.openid.net/auth/2.0/identifier_select" />
    //             <input type="image" alt="Login to Steam" src="https://steamcommunity-a.akamaihd.net/public/images/signinthroughsteam/sits_02.png" />
    //         </form>
    //     </div>
    // )
}

export default SteamLoginComponent;