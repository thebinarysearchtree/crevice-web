import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import Avatar from '@material-ui/core/Avatar';
import { useHistory, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import Progress from '../common/Progress';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    width: '240px'
  },
  content: {
    display: 'flex',
    flexDirection: 'column'
  }
}));

function UserDetails(props) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const classes = useStyles();

  const { userId } = useParams();

  const handler = (user) => {
    setUser(user);
    setLoading(false);
  }

  useFetch('/users/getUserDetails', handler, { userId });

  if (loading) {
    return <Progress loading={loading} />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.userDetails}></div>
      <div className={classes.content}>{props.children}</div>
    </div>
  );
}

export default UserDetails;
