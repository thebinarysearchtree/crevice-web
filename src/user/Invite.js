import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIos from '@material-ui/icons/ArrowBackIos';
import Button from '@material-ui/core/Button';
import Snackbar from '../common/Snackbar';
import { Link, useHistory } from 'react-router-dom';

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
    maxWidth: '700px',
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
    flexDirection: 'column',
    padding: theme.spacing(2)
  },
  nameContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2)
  },
  name: {
    width: '200px'
  },
  email: {
    marginBottom: theme.spacing(3)
  },
  button: {
    marginTop: theme.spacing(2),
    width: '200px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '427px'
  }
}));

function Invite() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState([]);
  const [message, setMessage] = useState('');

  const history = useHistory();
  const classes = useStyles();

  const saveUser = async (e) => {
    e.preventDefault();
    const user = {
      firstName,
      lastName
    };
    const response = await client.postData('/users/insert', user);
    if (response.ok) {
      history.push('/users', { message: 'User created' });
    }
    else {
      setMessage('Something went wrong');
    }
  }

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <Paper className={classes.paper}>
          <div className={classes.heading}>
            <div className={classes.header}>
              <IconButton 
                className={classes.iconButton} 
                component={Link} 
                to="/users">
                  <ArrowBackIos fontSize="large" />
              </IconButton>
              <Typography variant="h4">Invite users</Typography>
            </div>
          </div>
          <form className={classes.form} onSubmit={saveUser} noValidate>
            <div className={classes.nameContainer}>
              <TextField
                className={classes.name}
                variant="outlined"
                size="small"
                label="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)} />
              <TextField
                className={classes.name}
                variant="outlined"
                size="small"
                label="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)} />
            </div>
            <TextField
              className={classes.email}
              variant="outlined"
              size="small"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} />
            <Button
              className={classes.button}
              variant="contained"
              color="primary"
              type="submit">Save</Button>
          </form>
        </Paper>
        <Snackbar message={message} setMessage={setMessage} />
      </div>
    </div>
  );
}

export default Invite;
