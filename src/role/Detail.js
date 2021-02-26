import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import makeInputHandler from '../common/input';

const useStyles = makeStyles((theme) => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '330px'
  },
  formControl: {
    marginBottom: '10px'
  }
}));

function Detail(props) {
  const [role, setRole] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    setRole(props.selectedRole);
    setIsDisabled(true);
  }, [props.selectedRole]);

  const { setRoles, open, setOpen, setMessage } = props;
  const classes = useStyles();

  const handleInputChange = makeInputHandler(
    setRole, 
    setIsDisabled, 
    (r) => r.name);

  const saveRole = async (e) => {
    e.preventDefault();
    setOpen(false);
    if (role.id !== -1) {
      const response = await client.postData('/roles/update', role);
      if (response.ok) {
        setRoles(roles => roles.map(r => {
          if (r.id === role.id) {
            return { ...role };
          }
          return r;
        }));
        setMessage('Role updated');
      }
      else {
        setMessage('Something went wrong');
      }
    }
    else {
      const response = await client.postData('/roles/insert', role);
      if (response.ok) {
        const result = await response.json();
        const { roleId } = result;
        const savedRole = { ...role, id: roleId };
        setRoles(roles => [savedRole, ...roles]);
        setMessage('Role created');
      }
      else {
        setMessage('Something went wrong');
      }
    }
  }

  if (!role) {
    return null;
  }

  const title = role.id !== -1 ? 'Edit role' : 'Create a new role';

  return (
    <Dialog 
      open={open} 
      onClose={() => setOpen(false)} 
      aria-labelledby="dialog-title">
      <DialogTitle id="dialog-title">{title}</DialogTitle>
      <DialogContent className={classes.form}>
        <TextField
          className={classes.formControl}
          name="name"
          label="Role name"
          value={role.name}
          onChange={handleInputChange}
          autoComplete="off" />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => setOpen(false)} 
          color="primary">Cancel</Button>
        <Button 
          onClick={saveRole} 
          variant="contained" 
          color="primary"
          disabled={isDisabled}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default Detail;
