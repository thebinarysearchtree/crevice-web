import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import FormHelperText from '@material-ui/core/FormHelperText';
import Popover from '@material-ui/core/Popover';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { TextField } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '330px'
  },
  spacing: {
    marginBottom: '10px'
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2)
  },
  container: {
    display: 'flex'
  },
  short: {
    width: '200px'
  },
  button: {
    marginTop: theme.spacing(2),
    alignSelf: 'flex-start'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  email: {
    width: '416px'
  },
  avatar: {
    width: '150px',
    height: '150px'
  },
  upload: {
    display: 'none'
  },
  mr: {
    marginRight: theme.spacing(2)
  },
  input: {
    backgroundColor: 'white'
  },
  areasContainer: {
    marginBottom: theme.spacing(4)
  },
  location: {
    marginBottom: theme.spacing(1)
  }
}));

const formatter = new Intl.DateTimeFormat('default', { weekday: 'long', day: 'numeric', month: 'long' });

function AddShift(props) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [capacity, setCapacity] = useState(1);
  const [loading, setLoading] = useState(false);

  const capacityError = capacity && (capacity < 0 || !Number.isInteger(Number(capacity)));
  const timeError = startTime && startTime === endTime;

  const classes = useStyles();

  const { day, open, anchorEl, setAnchorEl, setMessage } = props;

  const isDisabled = loading || !startTime || !endTime || !capacity || capacityError || timeError;

  useEffect(() => {
    if (open) {
      setStartTime('09:00');
      setEndTime('17:00');
      setCapacity(1);
    }
  }, [open]);

  const addShift = async (e) => {
    e.preventDefault();
    setAnchorEl(null);
    setMessage('Shift added');
  }

  if (!day) {
    return null;
  }

  const { date } = day;

  const title = formatter.format(date);

  const leftPopover = date.getDay() > 3;

  let addButtonText;
  if (loading) {
    addButtonText = 'Saving...';
  }
  else {
    addButtonText = 'Add shift';
  }

  return (
    <Popover 
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'center',
        horizontal: leftPopover ? 'left' : 'right'
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: leftPopover ? 'right' : 'left'
      }}
      onClose={() => setAnchorEl(null)}
      disableRestoreFocus>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent className={classes.root}>
        <TextField 
          className={classes.spacing}
          type="time" 
          label="Start time"
          InputLabelProps={{ shrink: true }}
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)} />
        <TextField 
          className={classes.spacing}
          type="time" 
          label="End time"
          InputLabelProps={{ shrink: true }}
          error={timeError}
          helperText={timeError ? 'The start and end time cannot be the same' : ''}
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)} />
        <TextField
          className={classes.spacing}
          type="number"
          label="Capacity"
          InputLabelProps={{ shrink: true }}
          error={capacityError}
          helperText={capacityError ? 'Must be a non-negative integer' : ''}
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={() => setAnchorEl(null)}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          disabled={isDisabled}
          onClick={addShift}>{addButtonText}</Button>
      </DialogActions>
    </Popover>
  );
}

export default AddShift;
