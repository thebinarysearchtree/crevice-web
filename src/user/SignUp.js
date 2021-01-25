import React, { useState } from 'react';
import { useClient } from '../client';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { Link, useHistory } from 'react-router-dom';
import useStyles from './styles';

function SignUp() {
  const [organisationName, setOrganisationName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailIsValid, setEmailIsValid] = useState(true);
  const [passwordIsValid, setPasswordIsValid] = useState(true);

  const history = useHistory();
  const classes = useStyles();
  const client = useClient();

  const isValid = organisationName && firstName && lastName && email && email.includes('@') && password && password.length >= 6;
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (e.target.value.includes('@')) {
      setEmailIsValid(true);
    }
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (e.target.value.length >= 6) {
      setPasswordIsValid(true);
    }
  }

  const handleEmailBlur = (e) => {
    if (e.target.value !== '') {
      if (!e.target.value.includes('@')) {
        setEmailIsValid(false);
      }
    }
  }

  const handlePasswordBlur = (e) => {
    if (e.target.value !== '') {
      if (!e.target.value.length < 6) {
        setPasswordIsValid(false);
      }
    }
  }

  const signUp = async (e) => {
    e.preventDefault();
    if (!isValid) {
      return;
    }
    const result = await client.postData('/users/signUp', {
      organisationName,
      firstName,
      lastName,
      email,
      password
    });
    if (result) {
      history.push('/verify');
    }
  };

  return (
    <div className={classes.signUp}>
      <Paper className={classes.paper}>
        <form
          className={classes.container}
          onSubmit={signUp}
          noValidate>
          <h1 className={classes.heading}>Sign up</h1>
          <TextField
            className={classes.fc}
            label="Company name"
            value={organisationName}
            onChange={(e) => setOrganisationName(e.target.value)} />
          <TextField
            className={classes.fc}
            label="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)} />
          <TextField
            className={classes.fc}
            label="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)} />
          <TextField
            className={classes.fc}
            type="email"
            label="Email"
            value={email}
            onChange={handleEmailChange}
            error={!emailIsValid}
            helperText={emailIsValid ? '' : 'Please enter a valid email address'}
            onBlur={handleEmailBlur} />
          <TextField
            className={classes.fc}
            type="password"
            label="Password"
            value={password}
            onChange={handlePasswordChange}
            error={!passwordIsValid}
            helperText={passwordIsValid ? '' : 'Password must contain at least 6 characters'}
            onBlur={handlePasswordBlur} />
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            type="submit"
            disabled={!isValid}>Sign up</Button>
        </form>
      </Paper>
      <Paper>
        <div className={`${classes.container} ${classes.question}`}>
          <p>
            Have an account?
            <Link
              className={classes.link}
              to="/login">Log in</Link>
          </p>
        </div>
      </Paper>
    </div>
  );
}

export default SignUp;
