import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
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
import { useClient, ProvideAuth } from './auth';
import MainDrawer from './MainDrawer';
import ScrollRestore from './ScrollRestore';

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

const drawer = <MainDrawer />;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ProvideAuth>
        <Router>
          <ScrollRestore />
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
              <Nav drawer={drawer}>
                <RoleList />
              </Nav>
            </Route>
            <Route exact path="/locations">
              <Nav drawer={drawer}>
                <LocationList />
              </Nav>
            </Route>
            <Route exact path="/areas">
              <Nav drawer={drawer}>
                <AreaList />
              </Nav>
            </Route>
            <Route exact path="/users">
              <Nav drawer={drawer}>
                <UserList />
              </Nav>
            </Route>
            <Route exact path="/users/inviteSingle">
              <InviteSingleDetail />
            </Route>
            <Route exact path="/users/inviteMany">
              <InviteMany />
            </Route>
            <Route exact path="/users/uploadPhotos">
              <UploadPhotos />
            </Route>
            <Route path="/users/:userId">
              <Nav>
                <UserDetails />
              </Nav>
            </Route>
            <Route exact path="/fields">
              <Nav drawer={drawer}>
                <FieldList />
              </Nav>
            </Route>
            <Route exact path="/shifts">
              <Nav drawer={drawer}>
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
