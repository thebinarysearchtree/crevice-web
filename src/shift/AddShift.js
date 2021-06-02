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
import client from '../client';
import { makePgDate } from '../utils/date';

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

  const classes = useStyles();

  const { area, day, handleAddShift, open, anchorEl, setAnchorEl, setMessage } = props;

  const isDisabled = loading || !startTime || !endTime || !capacity || capacityError;

  useEffect(() => {
    if (open) {
      setStartTime('09:00');
      setEndTime('17:00');
      setCapacity(1);
    }
  }, [open]);

  const makeFullDate = (date, timeString) => {
    const fullDate = new Date(date);
    const [hours, minutes] = timeString.split(':').map(t => parseInt(t, 10));
    fullDate.setHours(hours, minutes, 0, 0);
    return fullDate;
  }

  const saveShift = async (e) => {
    e.preventDefault();
    setAnchorEl(null);
    const start = makeFullDate(day.date, startTime);
    const end = makeFullDate(day.date, endTime);
    const pgStartTime = makePgDate(start, area.timeZone);
    const pgEndTime = makePgDate(end, area.timeZone);
    const shift = {
      areaId: area.id,
      startTime: pgStartTime,
      endTime: pgEndTime,
      capacity
    };
    const response = await client.postData('/shifts/insert', shift);
    if (response.ok) {
      const { shiftId } = await response.json();
      const shift = {
        id: shiftId,
        areaId: area.id,
        startTime: start,
        endTime: end,
        capacity
      };
      handleAddShift(shift);
      setMessage('Shift added');
    }
    else {
      setMessage('Something went wrong');
    }
  }

  if (!day) {
    return null;
  }

  const { date } = day;

  const title = formatter.format(date);

  const leftPopover = date.getDay() > 3;

  let buttonText;
  if (loading) {
    buttonText = 'Saving...';
  }
  else {
    buttonText = 'Add shift';
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
          onClick={saveShift}>{buttonText}</Button>
      </DialogActions>
    </Popover>
  );
}

export default AddShift;
