import React from "react";
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import CreateLink from './Link/CreateLink';
import Login from './Auth/Login';
import ForgotPassword from './Auth/ForgotPassword';
import SearchLinks from './Link/SearchLinks';
import LinkList from './Link/LinkList';
import LinkDetail from './Link/LinkDetail';
import Header from "./Header";

import useAuth from './Auth/useAuth';
import firebase, { FirebaseContext } from '../../firebase';

import "../../styles/index.css";

function ForumApp() {
  const user = useAuth();

  const style = {
    forumAppContainer: {
      width: '85%',
      marginRight: 'auto',
      marginLeft: 'auto',
    },
    routeContainer: {
      backgroundColor: 'rgb(246, 246, 239)',
      paddingLeft: '1rem',
      paddingRight: '1rem',
      paddingTop: '0.25rem',
      paddingBottom: '0.25rem',
    },
  }

  return (
    <BrowserRouter>
      <FirebaseContext.Provider value={{ user, firebase }}>
        <div style={style.forumAppContainer} className="forum-app-container">
          <Header />
          <div style={style.routeContainer}>
            <Switch>
              <Route exact path="/forum-app/" render={() => <Redirect to="/forum-app/new/1" />} />
              <Route path="/forum-app/create" component={CreateLink} />
              <Route path="/forum-app/login" component={Login} />
              <Route path="/forum-app/forgot" component={ForgotPassword} />
              <Route path="/forum-app/search" component={SearchLinks} />
              <Route path="/forum-app/top" component={LinkList} />
              <Route path="/forum-app/new/:page" component={LinkList} />
              <Route path="/forum-app/link/:linkId" component={LinkDetail} />
            </Switch>
          </div>
        </div>
      </FirebaseContext.Provider>
    </BrowserRouter>
  );
}

export default ForumApp;
