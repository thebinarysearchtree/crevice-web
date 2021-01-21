import React, { useState } from 'react';
import { useClient } from '../client';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { Link } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import useStyles from './styles';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginFailed, setLoginFailed] = useState(false);

  const history = useHistory();
  const classes = useStyles();
  const client = useClient();

  const isValid = email && password;

  const handleEmailChange = async (e) => {
    setLoginFailed(false);
    setEmail(e.target.value);
  }

  const handlePasswordChange = async (e) => {
    setLoginFailed(false);
    setPassword(e.target.value);
  }

  const logIn = async (e) => {
    e.preventDefault();
    if (!isValid) {
      return;
    }
    const result = await client.logIn(email, password);
    if (result) {
      if (result.tasks) {
        const tasks = result.tasks;
        if (tasks.needsRoles) {
          history.push('/roles');
        }
        else if (tasks.needsAreas) {
          history.push('/areas');
        }
      }
      else {
        history.push(result.defaultView);
      }
    }
    else {
      setLoginFailed(true);
    }
  };

  return (
    <div className={classes.signUp}>
      <Paper className={classes.paper}>
        <form className={classes.container} onSubmit={logIn} noValidate>
          <h1 className={classes.heading}>Log in</h1>
          <TextField
            className={classes.fc}
            type="email"
            label="Email"
            value={email}
            onChange={handleEmailChange} />
          <TextField
            className={classes.fc}
            type="password"
            label="Password"
            value={password}
            onChange={handlePasswordChange}
            error={loginFailed}
            helperText={loginFailed ? 'Invalid username or password' : ''} />
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            type="submit"
            disabled={!isValid}>Log in</Button>
        </form>
      </Paper>
      <Paper>
        <div className={`${classes.container} ${classes.question}`}>
          <p>
            Don't have an account?
            <Link
              className={classes.link}
              to="/signup">Sign up</Link>
          </p>
        </div>
      </Paper>
    </div>
  );
}

export default Login;
