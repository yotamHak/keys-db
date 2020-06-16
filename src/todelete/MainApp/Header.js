import React from "react";
import { NavLink, withRouter } from 'react-router-dom';
import { Menu, Icon } from "semantic-ui-react";

function Header({ history }) {
    React.useEffect(() => {
        if (history.location.pathname.includes('forum')) {
            setActiveItem('forum');
        }
    }, []);

    const [activeItem, setActiveItem] = React.useState('home');

    function handleItemClick(event, { name }) {
        setActiveItem(name);
    }

    return (
        <Menu secondary>
            <Menu.Item
                name='home'
                active={activeItem === 'home'}
                onClick={handleItemClick}
                as={NavLink}
                to="/"
                exact
            >
                <Icon name="home" />
            </Menu.Item>
            <Menu.Item
                name='forum'
                active={activeItem === 'forum'}
                onClick={handleItemClick}
                as={NavLink}
                to="/forum-app/"
                exact
            />
            <Menu.Item
                name='steamApp'
                active={activeItem === 'steamApp'}
                onClick={handleItemClick}
                as={NavLink}
                to="/steam-app/"
                exact
            />
            <Menu.Item
                name='streamingApp'
                active={activeItem === 'StreamingApp'}
                onClick={handleItemClick}
                as={NavLink}
                to="/streaming/"
                exact
            />
            <Menu.Item
                name='scheduleApp'
                active={activeItem === 'scheduleApp'}
                onClick={handleItemClick}
                as={NavLink}
                to="/schedule/"
                exact
            />
        </Menu>
    )
}

export default withRouter(Header);