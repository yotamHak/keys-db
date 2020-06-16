import React from "react";
import { withRouter, NavLink } from 'react-router-dom';
import { FirebaseContext } from "../../firebase";

function Header() {
  const { user, firebase } = React.useContext(FirebaseContext);

  return (
    <div className="header">
      <div className="flex">
        <img src="/logo.png" alt="Hooks News Logo" className="logo" />
        <NavLink to="/forum-app/" className="header-title">
          Hooks News
        </NavLink>
        <NavLink to="/forum-app/" className="header-link">
          New
        </NavLink>
        <div className="divider">|</div>
        <NavLink to="/forum-app/top" className="header-link">
          Top
        </NavLink>
        <div className="divider">|</div>
        <NavLink to="/forum-app/search" className="header-link">
          Search
        </NavLink>
        {user && (
          <>
            <div className="divider">|</div>
            <NavLink to="/forum-app/create" className="header-link">
              Submit
            </NavLink>
          </>
        )}
      </div>
      <div className="flex">
        {user ? (
          <>
            <div className="header-name">{user.displayName}</div>
            <div className="divider">|</div>
            <div className="header-button" onClick={() => firebase.logout()}>logout</div>
          </>
        )
          : <NavLink to="/forum-app/login" className="header-link">
            login
        </NavLink>}
      </div>
    </div>
  )
}

export default withRouter(Header);