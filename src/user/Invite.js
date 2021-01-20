import React, { useEffect } from 'react';
import client from '../client';
import { useHistory, useParams } from 'react-router-dom';
import useStyles from './styles';

function Invite() {
  const { userId, emailToken } = useParams();

  const history = useHistory();
  const classes = useStyles();

  useEffect(() => {
    const verifyToken = async () => {
      const verified = await client.postData('/users/verify', {
        userId,
        emailToken
      });
      if (verified) {
        history.push('/login');
      }
    }
    verifyToken();
  });

  return (
    <div className={classes.signUp}>
      <h1>Verifying...</h1>
    </div>
  );
}

export default Invite;
