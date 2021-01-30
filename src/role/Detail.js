import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useClient } from '../client';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIos from '@material-ui/icons/ArrowBackIos';
import DeleteIcon from '@material-ui/icons/Delete';
import Button from '@material-ui/core/Button';
import { Link, useParams, useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    flexDirection: 'column',
    width: '100%',
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5)
  },
  content: {
    maxWidth: '700px',
    flexDirection: 'column'
  },
  heading: {
    marginBottom: theme.spacing(3),
    justifyContent: 'space-between'
  },
  header: {
    alignItems: 'center'
  },
  deleteButton: {
    alignSelf: 'center'
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(50)
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    display: 'flex',
    justifyContent: 'space-between',
    marginLeft: '0px'
  },
  iconButton: {
    paddingLeft: '18px',
    paddingRight: '6px'
  }
}));

function Detail() {
  const [role, setRole] = useState({
    name: '',
    defaultView: '',
    canBookBefore: false,
    canBookAfter: false,
    canCancelBefore: false,
    canCancelAfter: false,
    canRequestCancellation: false,
    canApproveCancellation: false,
    canBookForOthers: false,
    canCancelForOthers: false,
    canDelete: false,
    canEditBefore: false,
    canEditAfter: false,
    canChangeCapacity: false,
    canAssignTasks: false,
    canInviteUsers: false
  });

  const { roleId } = useParams();
  const client = useClient();
  const history = useHistory();
  const classes = useStyles();

  const handleInputChange = (e) => {
    const name = e.target.name;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    setRole(r => ({ ...r, [name] : value }));
  }

  const saveRole = async () => {
    const url = roleId === 'new' ? '/roles/insert' : '/roles/update';
    const result = await client.postData(url, role);
    if (result) {
      history.push('/roles');
    }
  }

  const deleteRole = async () => {
    const result = await client.postData('/roles/deleteRole', { roleId });
    if (result) {
      history.push('/roles');
    }
  }

  useEffect(() => {
    const getRole = async () => {
      const result = await client.postData('/roles/getById', { roleId });
      if (result) {
        const { role } = result;
        setRole(role);
      }
    };
    if (roleId !== 'new') {
      getRole();
    }
  }, [roleId, client]);

  const title = roleId === 'new' ? 'Create a new role' : 'Edit role';
  const deleteButton = roleId !== 'new' ? (
    <Button 
      variant="contained" 
      color="secondary"
      onClick={deleteRole}>Delete</Button>) : null;

  const isValid = role.name !== '';

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.heading}>
          <div className={classes.header}>
            <IconButton className={classes.iconButton} component={Link} to="/roles">
              <ArrowBackIos fontSize="large" />
            </IconButton>
            <Typography variant="h4">{title}</Typography>
          </div>
          <div className={classes.deleteButton}>
            {deleteButton}
          </div>
        </div>
        <Paper className={classes.paper}>
          <form
            className={classes.form}
            onSubmit={saveRole} 
            noValidate>
              <TextField
                name="name"
                className={classes.fc}
                label="Role name"
                value={role.name}
                onChange={handleInputChange} />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={role.canBookBefore}
                    onChange={handleInputChange}
                    name="canBookBefore" />
                }
                label="Book shifts before they start"
                labelPlacement="start"
                classes={{ root: classes.label }} />
              <Divider />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={role.canBookAfter}
                    onChange={handleInputChange}
                    name="canBookAfter" />
                }
                label="Book shifts after they start"
                labelPlacement="start"
                classes={{ root: classes.label }} />
              <Divider />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={role.canCancelBefore}
                    onChange={handleInputChange}
                    name="canCancelBefore" />
                }
                label="Cancel bookings before the shift starts"
                labelPlacement="start"
                classes={{ root: classes.label }} />
              <Divider />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={role.canCancelAfter}
                    onChange={handleInputChange}
                    name="canCancelAfter" />
                }
                label="Cancel bookings after the shift starts"
                labelPlacement="start"
                classes={{ root: classes.label }} />
              <Divider />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={role.canRequestCancellation}
                    onChange={handleInputChange}
                    name="canRequestCancellation" />
                }
                label="Request the cancellation of a booking"
                labelPlacement="start"
                classes={{ root: classes.label }} />
              <Divider />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={role.canApproveCancellation}
                    onChange={handleInputChange}
                    name="canApproveCancellation" />
                }
                label="Approve the cancellation of a booking"
                labelPlacement="start"
                classes={{ root: classes.label }} />
              <Divider />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={role.canBookForOthers}
                    onChange={handleInputChange}
                    name="canBookForOthers" />
                }
                label="Book shifts for other users"
                labelPlacement="start"
                classes={{ root: classes.label }} />
              <Divider />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={role.canCancelForOthers}
                    onChange={handleInputChange}
                    name="canCancelForOthers" />
                }
                label="Cancel the shifts of other users"
                labelPlacement="start"
                classes={{ root: classes.label }} />
              <Divider />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={role.canDelete}
                    onChange={handleInputChange}
                    name="canDelete" />
                }
                label="Delete shifts"
                labelPlacement="start"
                classes={{ root: classes.label }} />
              <Divider />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={role.canEditBefore}
                    onChange={handleInputChange}
                    name="canEditBefore" />
                }
                label="Edit shift details before they start"
                labelPlacement="start"
                classes={{ root: classes.label }} />
              <Divider />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={role.canEditAfter}
                    onChange={handleInputChange}
                    name="canEditAfter" />
                }
                label="Edit shift details after they start"
                labelPlacement="start"
                classes={{ root: classes.label }} />
              <Divider />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={role.canChangeCapacity}
                    onChange={handleInputChange}
                    name="canChangeCapacity" />
                }
                label="Change the capacity of shifts"
                labelPlacement="start"
                classes={{ root: classes.label }} />
              <Divider />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={role.canAssignTasks}
                    onChange={handleInputChange}
                    name="canAssignTasks" />
                }
                label="Assign tasks to shifts"
                labelPlacement="start"
                classes={{ root: classes.label }} />
              <Divider />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={role.canInviteUsers}
                    onChange={handleInputChange}
                    name="canInviteUsers" />
                }
                label="Invite users"
                labelPlacement="start"
                classes={{ root: classes.label }} />
              <Button
                className={classes.button}
                variant="contained"
                color="primary"
                type="submit"
                disabled={!isValid}>Save</Button>
          </form>
        </Paper>
      </div>
    </div>
  );
}

export default Detail;
