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
import AreaList from './area/List';
import { useAuth, ProvideAuth } from './auth';

function PrivateRoute({ children, ...rest }) {
  const auth = useAuth();
  
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth.user ? (
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
      <ProvideAuth>
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
            <Route exact path="/roles">
              <Nav>
                <RoleList />
              </Nav>
            </Route>
            <Route exact path="/locations">
              <Nav>
                <LocationList />
              </Nav>
            </Route>
            <Route exact path="/areas">
              <Nav>
                <AreaList />
              </Nav>
            </Route>
            <Route path="/roles/:roleId">
              <Nav appBarOnly>
                <RoleDetail />
              </Nav>
            </Route>
          </Switch>
        </Router>
      </ProvideAuth>
    </ThemeProvider>
  );
}

export default App;
