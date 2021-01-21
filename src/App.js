import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from './theme';
import SignUp from './user/SignUp';
import Login from './user/Login';
import Verify from './user/Verify';
import Invite from './user/Invite';
import Nav from './Nav';
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ProvideClient>
        <Router>
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
            <Route path="/nav">
              <Nav />
            </Route>
          </Switch>
        </Router>
      </ProvideClient>
    </ThemeProvider>
  );
}

export default App;
