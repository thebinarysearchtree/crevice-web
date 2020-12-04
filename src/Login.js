import React, { useState } from 'react';
import client from './client';
import logo from './logo.svg';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import useStyles from './styles';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const history = useHistory();
  const classes = useStyles();

  const isValid = email && password;

  const logIn = async (e) => {
    e.preventDefault();
    if (!isValid) {
      return;
    }
    const result = await client.logIn(email, password);
    if (result) {
      history.push('/');
    }
  };

  return (
    <div className={classes.signUp}>
      <img className={classes.logo} src={logo} alt="Logo" />
      <form className={classes.container} onSubmit={logIn} noValidate>
        <h1 className={classes.heading}>Log in</h1>
        <TextField
          className={classes.fc}
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} />
        <TextField
          className={classes.fc}
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} />
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          type="submit"
          disabled={!isValid}>Log in</Button>
      </form>
      <div className={classes.question}>
        <p>
          Don't have an account?
          <Link
            className={classes.link}
            to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
