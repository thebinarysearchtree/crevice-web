import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Link, useHistory } from 'react-router-dom';
import styles from '../styles/form';

const useStyles = makeStyles(styles);

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginFailed, setLoginFailed] = useState(false);

  const history = useHistory();
  const classes = useStyles();

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
    const user = await client.logIn(email, password);
    if (user) {
      history.push(user.defaultView);
    }
    else {
      setLoginFailed(true);
    }
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <form className={classes.container} onSubmit={logIn} noValidate>
          <Typography className={classes.heading} variant="h3">Log in</Typography>
          <TextField
            className={classes.formControl}
            type="email"
            label="Email"
            value={email}
            onChange={handleEmailChange} />
          <TextField
            className={classes.formControl}
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
            type="submit">Log in</Button>
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
