import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputAdornment from '@material-ui/core/InputAdornment';
import ColourGrid from '../common/ColourGrid';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '330px'
  },
  spacing: {
    marginBottom: '10px'
  },
  popover: {
    marginTop: theme.spacing(1)
  }
}));

const hex = /^[0-9a-fA-F]{6}$/;

function Detail(props) {
  const [name, setName] = useState('');
  const [colour, setColour] = useState('');

  const error = colour && !hex.test(colour);
  const isDisabled = !name || !hex.test(colour);

  const { setRoles, selectedRole, setSelectedRole, open, anchorEl, setAnchorEl, setMessage } = props;
  const classes = useStyles();

  useEffect(() => {
    if (selectedRole) {
      const { name, colour } = selectedRole;

      setName(name);
      setColour(colour);
    }
  }, [selectedRole]);

  const handleClose = () => {
    setSelectedRole(null);
    setAnchorEl(null);
  }

  if (!selectedRole) {
    return null;
  }

  const role = { ...selectedRole, name, colour };

  const saveRole = async (e) => {
    e.preventDefault();
    setAnchorEl(null);
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
    <Popover 
      className={classes.popover}
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: role.id === -1 ? 'right' : 'left'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: role.id === -1 ? 'right' : 'left'
      }}
      onClose={handleClose}
      disableRestoreFocus>
      <DialogTitle>{title}</DialogTitle>
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
          error={Boolean(error)}
          helperText={error ? 'Invalid colour' : ''} />
        <ColourGrid selectedColour={colour} onClick={(c) => setColour(c)} />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose} 
          color="primary">Cancel</Button>
        <Button 
          onClick={saveRole} 
          variant="contained" 
          color="primary"
          disabled={isDisabled}>Save</Button>
      </DialogActions>
    </Popover>
  );
}

export default Detail;
