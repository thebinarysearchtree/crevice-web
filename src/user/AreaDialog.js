import React, { useState } from 'react';
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

const useStyles = makeStyles(styles);

function AreaDialog(props) {
  const [roleId, setRoleId] = useState(-1);
  const [areaId, setAreaId] = useState(-1);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);

  const isDisabled = roleId === -1 || areaId === -1 || isNaN(startDate.getTime());

  const { setUserAreas, open, setOpen, setMessage } = props;
  const classes = useStyles();

  const addArea = () => {
    const role = props.roles.find(r => r.id === roleId);
    const area = props.areas.find(a => a.id === areaId);
    const userArea = { role, area, startDate, endDate };
    setUserAreas(userAreas => [...userAreas, userArea]);
    setOpen(false);
  }

  const roleItems = props.roles.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>);
  const areaItems = props.areas.map(a => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>);

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
          value={roleId === -1 ? '' : roleId}
          onChange={(e) => setRoleId(e.target.value)}>
            {roleItems}
        </Select>
      </FormControl>
      <FormControl className={classes.spacing}>
        <InputLabel id="area-label">Area</InputLabel>
        <Select
          labelId="area-label"
          label="Area"
          value={areaId === -1 ? '' : areaId}
          onChange={(e) => setAreaId(e.target.value)}>
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
          value={startDate}
          onChange={(d) => setStartDate(d)}
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
          value={endDate}
          onChange={(d) => setEndDate(d)}
          KeyboardButtonProps={{ 'aria-label': 'change end date' }} />
      </MuiPickersUtilsProvider>
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
