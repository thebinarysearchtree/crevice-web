import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Snackbar from '../common/Snackbar';
import Avatar from '@material-ui/core/Avatar';
import BackButton from '../common/BackButton';
import AreasTable from './AreasTable';
import AddArea from './AddArea';

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
    padding: theme.spacing(2),
    marginBottom: theme.spacing(4),
    alignItems: 'center'
  },
  container: {
    display: 'flex'
  },
  button: {
    marginTop: theme.spacing(2),
    width: '200px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  spacing: {
    marginBottom: theme.spacing(2)
  },
  email: {
    width: '416px'
  },
  avatar: {
    width: '70px',
    height: '70px',
    marginRight: theme.spacing(1)
  },
  mr: {
    marginRight: theme.spacing(2)
  },
  backButton: {
    marginRight: theme.spacing(1)
  },
  label: {
    marginRight: '4px'
  },
  fieldContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: theme.spacing(4)
  }
}));

function InviteSingleAreas(props) {
  const [showAddArea, setShowAddArea] = useState(false);
  const [message, setMessage] = useState('');

  const classes = useStyles();

  const { userAreas, setUserAreas, user, inviteUser } = props;

  function DisplayField(props) {
    const { label, value } = props;
    return value ? (
      <div className={classes.container}>
        <Typography className={classes.label} variant="subtitle2">{label}:</Typography>
        <Typography variant="body2" color="textSecondary">{value}</Typography>
      </div>
    ) : null;
  }

  if (showAddArea) {
    return <AddArea setShowAddArea={setShowAddArea} setUserAreas={setUserAreas} userAreas={userAreas} />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.heading}>
          <div className={classes.header}>
            <BackButton onClick={() => props.setShowAreas(false)} />
            <Typography variant="h4">Invite users</Typography>
          </div>
        </div>
        <Paper className={classes.paper}>
          <Avatar className={classes.avatar} src={user.imageId ? `/photos/${user.imageId}.jpg` : null} />
          <div className={classes.container}>
            <div className={classes.form}>
              <Typography variant="subtitle2">{`${user.firstName} ${user.lastName}`}</Typography>
              <Typography variant="body2" color="textSecondary">{user.email}</Typography>
            </div>
            <div className={classes.fieldContainer}>
              <DisplayField label="Phone" value={user.phone} />
              <DisplayField label="Pager" value={user.pager} />
            </div>
          </div>
        </Paper>
        <AreasTable setShowAddArea={setShowAddArea} userAreas={userAreas} setUserAreas={setUserAreas} />
        <Button
          className={classes.backButton}
          onClick={() => props.setShowAreas(false)}
          color="primary">Back</Button>
        <Button
          onClick={inviteUser}
          variant="contained"
          color="primary"
          disabled={userAreas.length === 0}>Invite user</Button>
        <Snackbar message={message} setMessage={setMessage} />
      </div>
    </div>
  );
}

export default InviteSingleAreas;