import React, { useEffect } from 'react';
import { useClient } from '../client';
import { useHistory, useParams } from 'react-router-dom';
import useStyles from '../styles/form';

function Invite() {
  const { userId, emailToken } = useParams();

  const history = useHistory();
  const classes = useStyles();
  const client = useClient();

  useEffect(() => {
    const verifyToken = async () => {
      const response = await client.postData('/users/verify', {
        userId,
        emailToken
      });
      if (response.ok) {
        history.push('/login');
      }
    }
    verifyToken();
  });

  return (
    <div className={classes.root}>
      <h1>Verifying...</h1>
    </div>
  );
}

export default Invite;
