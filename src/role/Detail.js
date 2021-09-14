import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputAdornment from '@material-ui/core/InputAdornment';
import ColourGrid from '../common/ColourGrid';
import { useClient } from '../auth';
import useChanged from '../hooks/useChanged';

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
  const hasChanged = useChanged(props.open, [name, colour]);

  const error = colour && !hex.test(colour);
  const isDisabled = !name || !hex.test(colour) || !hasChanged;

  const classes = useStyles();
  const client = useClient();

  const { selectedRole, setSelectedRole, open, anchorEl, setAnchorEl } = props;

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

  const isUpdate = role.id !== -1;

  const saveRole = async (e) => {
    e.preventDefault();
    handleClose();
    if (isUpdate) {
      await client.postMutation({
        url: '/roles/update',
        data: role,
        message: 'Role updated'
      });
    }
    else {
      await client.postMutation({
        url: '/roles/insert',
        data: role,
        message: 'Role created'
      });
    }
  }

  const title = isUpdate ? 'Edit role' : 'Create a new role';

  return (
    <Popover 
      className={classes.popover}
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: isUpdate ? 'left' : 'right'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: isUpdate ? 'left' : 'right'
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
          disabled={isDisabled}>{isUpdate ? 'Update' : 'Save'}</Button>
      </DialogActions>
    </Popover>
  );
}

export default Detail;
