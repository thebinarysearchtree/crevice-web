import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import styles from '../styles/dialog';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import FormHelperText from '@material-ui/core/FormHelperText';

const useStyles = makeStyles(styles);

function AreaDialog(props) {
  const [role, setRole] = useState(null);
  const [area, setArea] = useState(null);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const startError = startTime && endTime && startTime.getTime() > endTime.getTime();

  const { userAreas, setUserAreas, open, setOpen } = props;
  const classes = useStyles();

  useEffect(() => {
    setRole(null);
    setArea(null);
    setIsAdmin(false);
  }, [open]);

  const overlapping = area && userAreas.some(ua => 
    ua.area.id === area.id &&
    (!endTime || ua.startTime.getTime() <= endTime.getTime()) &&
    (!ua.endTime || ua.endTime.getTime() >= startTime.getTime()));

  const isDisabled = !role || !area || !startTime || isNaN(startTime.getTime()) || overlapping;

  const addArea = () => {
    setOpen(false);
    const userArea = { role, area, startTime, endTime, isAdmin };
    setUserAreas(userAreas => [...userAreas, userArea]);
  }

  const roleItems = props.roles.map(r => <MenuItem key={r.id} value={r}>{r.name}</MenuItem>);
  const areaItems = props.areas.map(a => <MenuItem key={a.id} value={a}>{a.name}</MenuItem>);

  return (
    <Dialog 
      open={open} 
      onClose={() => setOpen(false)} 
      aria-labelledby="dialog-title">
      <DialogTitle id="dialog-title">Add area</DialogTitle>
      <DialogContent className={classes.root}>
      <FormControl className={classes.spacing}>
        <InputLabel id="role-label">Role</InputLabel>
        <Select
          labelId="role-label"
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}>
            {roleItems}
        </Select>
      </FormControl>
      <FormControl error={overlapping} className={classes.spacing}>
        <InputLabel id="area-label">Area</InputLabel>
        <Select
          labelId="area-label"
          label="Area"
          value={area}
          onChange={(e) => setArea(e.target.value)}>
            {areaItems}
        </Select>
        <FormHelperText>{overlapping ? 'The same areas cannot overlap in time' : ''}</FormHelperText>
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
          KeyboardButtonProps={{ 'aria-label': 'change start date' }} />
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
          KeyboardButtonProps={{ 'aria-label': 'change end date' }} />
      </MuiPickersUtilsProvider>
      <FormControlLabel
        className={classes.spacing}
        control={<Checkbox checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />}
        label="Is administrator for this area?" />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => setOpen(false)} 
          color="primary">Cancel</Button>
        <Button 
          onClick={addArea} 
          variant="contained" 
          color="primary"
          disabled={isDisabled}>Add</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AreaDialog;
