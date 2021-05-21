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
import SignUp from './account/SignUp';
import Login from './account/Login';
import Verify from './account/Verify';
import Invite from './account/Invite';
import Nav from './Nav';
import RoleList from './role/List';
import LocationList from './location/List';
import AreaList from './area/List';
import UserList from './user/List';
import FieldList from './field/List';
import ShiftList from './shift/List';
import InviteSingleDetail from './user/InviteSingleDetail';
import InviteMany from './user/InviteMany';
import UploadPhotos from './user/UploadPhotos';
import UserDetails from './userProfile/UserDetails';
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
            <Route exact path="/users">
              <Nav>
                <UserList />
              </Nav>
            </Route>
            <Route exact path="/users/inviteSingle">
              <Nav appBarOnly>
                <InviteSingleDetail />
              </Nav>
            </Route>
            <Route exact path="/users/inviteMany">
              <Nav appBarOnly>
                <InviteMany />
              </Nav>
            </Route>
            <Route exact path="/users/uploadPhotos">
              <Nav appBarOnly>
                <UploadPhotos />
              </Nav>
            </Route>
            <Route path="/users/:userId">
              <Nav appBarOnly>
                <UserDetails />
              </Nav>
            </Route>
            <Route exact path="/fields">
              <Nav>
                <FieldList />
              </Nav>
            </Route>
            <Route exact path="/shifts">
              <Nav>
                <ShiftList />
              </Nav>
            </Route>
          </Switch>
        </Router>
      </ProvideAuth>
    </ThemeProvider>
  );
}

export default App;
