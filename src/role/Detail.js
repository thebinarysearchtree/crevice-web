import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputAdornment from '@material-ui/core/InputAdornment';
import ColourGrid from '../common/ColourGrid';
import styles from '../styles/dialog';

const useStyles = makeStyles(styles);

const hex = /^[0-9a-fA-F]{6}$/;

function Detail(props) {
  const [name, setName] = useState('');
  const [colour, setColour] = useState('');

  const error = colour && !hex.test(colour);
  const isDisabled = !name || !hex.test(colour);

  const { setRoles, selectedRole, open, setOpen, setMessage } = props;
  const classes = useStyles();

  useEffect(() => {
    if (selectedRole) {
      const { name, colour } = selectedRole;

      setName(name);
      setColour(colour);
    }
  }, [selectedRole]);

  if (!selectedRole) {
    return null;
  }

  const role = { ...selectedRole, name, colour };

  const saveRole = async (e) => {
    e.preventDefault();
    setOpen(false);
    if (role.id !== -1) {
      const response = await client.postData('/roles/update', role);
      if (response.ok) {
        setRoles(roles => roles.map(r => {
          if (r.id === role.id) {
            return role;
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

  const title = role.id !== -1 ? 'Edit role' : 'Create a new role';

  return (
    <Dialog 
      open={open} 
      onClose={() => setOpen(false)} 
      aria-labelledby="dialog-title">
      <DialogTitle id="dialog-title">{title}</DialogTitle>
      <DialogContent className={classes.root}>
        <TextField
          className={classes.spacing}
          label="Role name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off" />
        <TextField
          className={classes.spacing}
          label="Colour"
          value={colour}
          onChange={(e) => setColour(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start">#</InputAdornment>}}
          autoComplete="off"
          error={error}
          helperText={error ? 'Invalid colour' : ''} />
        <ColourGrid selectedColour={colour} onClick={(c) => setColour(c)} />
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
