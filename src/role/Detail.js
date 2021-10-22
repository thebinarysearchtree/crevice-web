import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import InputAdornment from '@material-ui/core/InputAdornment';
import ColourGrid from '../common/ColourGrid';
import { useClient } from '../auth';
import useChanged from '../hooks/useChanged';
import FormLayout from '../FormLayout';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '330px'
  },
  spacing: {
    marginBottom: theme.spacing(2)
  },
  colour: {
    marginBottom: '10px'
  },
  input: {
    backgroundColor: 'white'
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2)
  },
  cancel: {
    marginRight: theme.spacing(1)
  },
  preview: {
    width: '15px',
    height: '15px'
  },
  settings: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1)
  }
}));

const hex = /^[0-9a-fA-F]{3,6}$/;

function Detail(props) {
  const [name, setName] = useState('');
  const [colour, setColour] = useState('');
  const [cancelBeforeHours, setCancelBeforeHours] = useState(1);
  const [bookBeforeHours, setBookBeforeHours] = useState(1);
  const [canBookAndCancel, setCanBookAndCancel] = useState(true);
  const hasChanged = useChanged(props.selectedRole, [name, colour, cancelBeforeHours, bookBeforeHours, canBookAndCancel]);

  const error = colour && !hex.test(colour);
  const isDisabled = !name || !hex.test(colour) || !hasChanged;

  const classes = useStyles();
  const client = useClient();

  const { selectedRole, setSelectedRole } = props;

  useEffect(() => {
    if (selectedRole) {
      const { 
        name, 
        colour, 
        cancelBeforeMinutes, 
        bookBeforeMinutes, 
        canBookAndCancel 
      } = selectedRole;

      setName(name);
      setColour(colour);
      setCancelBeforeHours(cancelBeforeMinutes / 60);
      setBookBeforeHours(bookBeforeMinutes / 60);
      setCanBookAndCancel(canBookAndCancel);
    }
  }, [selectedRole]);

  const handleClose = () => {
    setSelectedRole(null);
  }

  if (!selectedRole) {
    return null;
  }

  const role = {
    ...selectedRole, 
    name, 
    colour,
    cancelBeforeMinutes: cancelBeforeHours * 60,
    bookBeforeMinutes: bookBeforeHours * 60,
    canBookAndCancel
  };

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
    <Dialog 
      open={Boolean(selectedRole)}
      onClose={handleClose}
      fullScreen
      transitionDuration={0}>
        <FormLayout title={title} onClose={handleClose}>
          <div className={classes.root}>
            <TextField
              InputProps={{ className: classes.input }}
              className={classes.spacing}
              variant="outlined"
              size="small"
              label="Role name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off" />
            <TextField
              InputProps={{ className: classes.input }}
              className={classes.colour}
              variant="outlined"
              size="small"
              label="Colour"
              value={colour}
              onChange={(e) => setColour(e.target.value)}
              InputProps={{ 
                className: classes.input, 
                startAdornment: <InputAdornment position="start">#</InputAdornment>,
                endAdornment: <InputAdornment position="end"><div className={classes.preview} style={{ backgroundColor: colour ? `#${colour}` : '' }} /></InputAdornment>
              }}
              autoComplete="off"
              error={Boolean(error)}
              helperText={error ? 'Invalid colour' : ''} />
            <ColourGrid selectedColour={colour} onClick={(c) => setColour(c)} />
            <FormControlLabel
              className={classes.settings}
              control={<Checkbox checked={canBookAndCancel} onChange={(e) => setCanBookAndCancel(e.target.checked)} />}
              label="Can book and cancel their own shifts?" />
            <TextField
              className={classes.spacing}
              variant="outlined"
              size="small"
              type="number"
              label="Cancellation deadline"
              InputLabelProps={{ shrink: true }}
              InputProps={{ className: classes.input, endAdornment: <InputAdornment>hours</InputAdornment> }}
              error={cancelBeforeHours < 0}
              helperText={cancelBeforeHours < 0 ? 'Must be a non-negative number' : ''}
              disabled={!canBookAndCancel}
              value={cancelBeforeHours}
              onChange={(e) => setCancelBeforeHours(e.target.value)} />
            <TextField
              variant="outlined"
              size="small"
              type="number"
              label="Booking deadline"
              InputLabelProps={{ shrink: true }}
              InputProps={{ className: classes.input, endAdornment: <InputAdornment>hours</InputAdornment> }}
              error={bookBeforeHours < 0}
              helperText={bookBeforeHours < 0 ? 'Must be a non-negative number' : ''}
              disabled={!canBookAndCancel}
              value={bookBeforeHours}
              onChange={(e) => setBookBeforeHours(e.target.value)} />
            <div className={classes.buttons}>
              <Button 
                className={classes.cancel}
                onClick={handleClose} 
                color="primary">Cancel</Button>
              <Button 
                onClick={saveRole} 
                variant="contained" 
                color="primary"
                disabled={isDisabled}>{isUpdate ? 'Update' : 'Save'}</Button>
            </div>
          </div>
        </FormLayout>
    </Dialog>
  );
}

export default Detail;
