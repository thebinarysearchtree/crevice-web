import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useLocation
} from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from './theme';
import SignUp from './user/SignUp';
import Login from './user/Login';
import Verify from './user/Verify';
import Invite from './user/Invite';
import Nav from './Nav';
import RoleList from './role/List';
import RoleDetail from './role/Detail';
import LocationList from './location/List';
import LocationDetail from './location/Detail';
import { useClient, ProvideClient } from './client';

function PrivateRoute({ children, ...rest }) {
  const client = useClient();
  return (
    <Route
      {...rest}
      render={({ location }) =>
        client.user ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ProvideClient>
        <Router>
          <ScrollToTop />
          <Switch>
            <Route exact path="/">
              <SignUp />
            </Route>
            <Route path="/signup">
              <SignUp />
            </Route>
            <Route path="/login">
              <Login />
            </Route>
            <Route path="/verify">
              <Verify />
            </Route>
            <Route path="/invite/:userId/:emailToken">
              <Invite />
            </Route>
            <Nav>
              <Route exact path="/roles">
                <RoleList />
              </Route>
              <Route path="/roles/:roleId">
                <RoleDetail />
              </Route>
              <Route exact path="/locations">
                <LocationList />
              </Route>
              <Route path="/locations/:locationId">
                <LocationDetail />
              </Route>
            </Nav>
          </Switch>
        </Router>
      </ProvideClient>
    </ThemeProvider>
  );
}

export default App;
