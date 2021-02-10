import React from 'react';
import useStyles from '../styles/form';

function Verify() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.verify}>
        <h1>Thanks</h1>
        <p>
          A message has been sent to your email address with instructions
          on how to continue the sign-up process.
        </p>
      </div>
    </div>
  );
}

export default Verify;
