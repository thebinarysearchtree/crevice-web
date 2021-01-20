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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;
