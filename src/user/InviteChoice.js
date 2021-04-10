import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Link, useHistory } from 'react-router-dom';
import BackButton from '../common/BackButton';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
    alignItems: 'center'
  },
  content: {
    maxWidth: '500px',
    width: '100%',
    flexDirection: 'column'
  },
  heading: {
    display: 'flex',
    marginBottom: theme.spacing(3),
    justifyContent: 'space-between'
  },
  header: {
    display: 'flex',
    alignItems: 'center'
  },
  paper: {
    display: 'flex',
    padding: theme.spacing(2),
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#ffe0b2'
    },
    textDecoration: 'none'
  },
  container: {
    display: 'flex'
  },
  spacing: {
    marginBottom: theme.spacing(2)
  }
}));

function Invite() {
  const history = useHistory();
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.heading}>
          <div className={classes.header}>
            <BackButton to="/users" />
            <Typography variant="h4">Invite users</Typography>
          </div>
        </div>
        <Paper 
          className={`${classes.paper} ${classes.spacing}`} 
          component={Link} 
          to="/users/invite/single">
            <Typography variant="h5">Single user</Typography>
        </Paper>
        <Paper 
          className={classes.paper}
          component={Link}
          to="/users/invite/many">
            <Typography variant="h5">Many users</Typography>
        </Paper>
      </div>
    </div>
  );
}

export default Invite;
