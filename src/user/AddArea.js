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
  },
  popover: {
    marginTop: theme.spacing(1)
  }
}));

function AddArea(props) {
  const [roleIndex, setRoleIndex] = useState(-1);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [locationIndex, setLocationIndex] = useState(0);
  const [overlappingError, setOverlappingError] = useState(false);
  const [selectedAreaIds, setSelectedAreaIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const startError = startTime && endTime && startTime.getTime() > endTime.getTime();

  const classes = useStyles();

  const { checkOverlapping, asyncHandleAddAreas, handleAddAreas, roles, locations, open, anchorEl, setAnchorEl, setMessage } = props;

  const isDisabled = loading || roleIndex === -1 || selectedAreaIds.length === 0 || !startTime || isNaN(startTime.getTime()) || (endTime && isNaN(endTime.getTime())) || startError;

  useEffect(() => {
    if (open) {
      setRoleIndex(-1);
      setStartTime(new Date());
      setEndTime(null);
      setLocationIndex(0);
      setSelectedAreaIds([]);
    }
  }, [open]);

  const addAreas = async (e) => {
    e.preventDefault();
    const role = roles[roleIndex]
    const userAreas = locations
      .flatMap(l => l.areas)
      .filter(a => selectedAreaIds.includes(a.id))
      .map(a => {
        const area = {...a };
        return {
          role,
          area,
          startTime,
          endTime,
          isAdmin
        }
      });
    const overlapping = checkOverlapping(userAreas);
    if (overlapping) {
      setOverlappingError(true);
    }
    else {
      if (asyncHandleAddAreas) {
        setLoading(true);
        const error = await asyncHandleAddAreas(userAreas);
        setLoading(false);
        if (error) {
          setMessage('Something went wrong');
        }
        else {
          setAnchorEl(null);
          setMessage('Areas added');
        }
      }
      else {
        handleAddAreas(userAreas);
        setAnchorEl(null);
      }
    }
  }

  const roleItems = roles.map((r, i) => <MenuItem key={r.id} value={i}>{r.name}</MenuItem>);
  const locationItems = locations.map((l, i) => <MenuItem key={l.id} value={i}>{l.name}</MenuItem>);
  const areaItems = locations[locationIndex].areas.map(a => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>);

  const locationSelect = locations.length > 1 ? (
    <FormControl className={classes.spacing}>
      <InputLabel id="location-label">Location</InputLabel>
      <Select
        labelId="location-label"
        label="Location"
        value={locationIndex !== -1 ? locationIndex : ''}
        onChange={(e) => setLocationIndex(e.target.value)}>
          {locationItems}
      </Select>
    </FormControl>
  ) : null;

  let addButtonText;
  if (loading) {
    addButtonText = 'Saving...';
  }
  else if (selectedAreaIds.length === 0) {
    addButtonText = 'Add';
  }
  else if (selectedAreaIds.length === 1) {
    addButtonText = 'Add 1 area';
  }
  else {
    addButtonText = `Add ${selectedAreaIds.length} areas`;
  }

  return (
    <Popover 
      className={classes.popover}
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      onClose={() => setAnchorEl(null)}
      disableRestoreFocus>
      <DialogTitle>Add areas</DialogTitle>
      <DialogContent className={classes.root}>
        <FormControl className={classes.spacing}>
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              label="Role"
              value={roleIndex !== -1 ? roleIndex : ''}
              onChange={(e) => setRoleIndex(e.target.value)}>
                {roleItems}
            </Select>
        </FormControl>
        {locationSelect}
        <FormControl className={classes.spacing}>
          <InputLabel id="area-label">Areas</InputLabel>
          <Select
            multiple
            labelId="area-label"
            label="Areas"
            value={selectedAreaIds}
            onChange={(e) => setSelectedAreaIds(e.target.value)}>
              {areaItems}
          </Select>
        </FormControl>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            className={classes.spacing}
            disableToolbar
            variant="inline"
            format="dd/MM/yyyy"
            margin="none"
            id="start-date"
            label="Start date"
            error={startError}
            helperText={startError ? 'Start date must be before end date' : ''}
            value={startTime}
            onChange={(d) => setStartTime(d)}
            KeyboardButtonProps={{ 'aria-label': 'change start date' }}
            autoOk />
        </MuiPickersUtilsProvider>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            className={classes.spacing}
            disableToolbar
            variant="inline"
            format="dd/MM/yyyy"
            margin="none"
            id="end-date"
            label="End date (optional)"
            value={endTime}
            onChange={(d) => setEndTime(d)}
            KeyboardButtonProps={{ 'aria-label': 'change end date' }}
            autoOk />
        </MuiPickersUtilsProvider>
        <FormControlLabel
          className={classes.spacing}
          control={<Checkbox checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />}
          label="Is administrator for these areas?" />
        <FormHelperText error={overlappingError}>{overlappingError ? 'Areas cannot have overlapping periods' : ''}</FormHelperText>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={() => setAnchorEl(null)}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          disabled={isDisabled}
          onBlur={() => setOverlappingError(false)}
          onClick={addAreas}>{addButtonText}</Button>
      </DialogActions>
    </Popover>
  );
}

export default AddArea;
