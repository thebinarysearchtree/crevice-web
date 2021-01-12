import React from 'react';
import logo from '../logo.svg';
import useStyles from './styles';

function Verify() {
  const classes = useStyles();

  return (
    <div className={classes.signUp}>
      A message has been sent to your email address with instructions
      on how to continue the sign-up process.
    </div>
  );
}

export default Verify;
