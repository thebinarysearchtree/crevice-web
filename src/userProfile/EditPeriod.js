import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { addDays, makeAreaDate } from '../utils/date';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';
import Typography from '@material-ui/core/Typography';
import PeriodDetails from './PeriodDetails';
import { useClient } from '../auth';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'baseline',
    width: '375px'
  },
  spacing: {
    marginBottom: '10px'
  },
  popover: {
    marginTop: theme.spacing(1)
  },
  to: {
    marginLeft: '12px',
    marginRight: '12px'
  },
  detail: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1)
  },
  icon: {
    marginRight: theme.spacing(1)
  }
}));

function EditPeriod(props) {
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [edit, setEdit] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  const { otherPeriods, selectedPeriod, setSelectedPeriod, open, anchorEl, setAnchorEl } = props;

  const minStartTime = otherPeriods
    .filter(p => p.endTimeMs && p.endTimeMs < selectedPeriod.startTimeMs)
    .map(p => p.endTimeMs)
    .sort((p1, p2) => p1 - p2)
    .pop();
  const maxEndTime = selectedPeriod.endTimeMs ? otherPeriods
    .filter(p => p.startTimeMs > selectedPeriod.endTimeMs)
    .map(p => p.startTimeMs)
    .sort((p1, p2) => p1 - p2)
    .pop() : null;

  const isDisabled = 
    !startTime || 
    isNaN(startTime.getTime()) || 
    (endTime && isNaN(endTime.getTime())) || 
    !hasChanged ||
    (endTime && endTime.getTime() < startTime.getTime()) ||
    (minStartTime && startTime.getTime() < minStartTime) ||
    (maxEndTime && endTime && endTime.getTime() > maxEndTime);

  const classes = useStyles();
  const client = useClient();

  useEffect(() => {
    const { startTimeMs, endTimeMs, isAdmin } = selectedPeriod;

    const startTime = new Date(startTimeMs);
    const endTime = endTimeMs ? addDays(new Date(endTimeMs), -1) : null;

    setStartTime(startTime);
    setEndTime(endTime);
    setIsAdmin(isAdmin);
  }, [selectedPeriod]);

  const handleClose = () => {
    setSelectedPeriod(null);
    setAnchorEl(null);
  }

  const handleStartTimeChange = (date) => {
    setStartTime(date);
    setHasChanged(true);
  }

  const handleEndTimeChange = (date) => {
    setEndTime(date);
    setHasChanged(true);
  }

  const { id, userId, areaId, roleId, roleName, timeZone } = selectedPeriod;

  const removePeriod = async () => {
    const userAreaId = selectedPeriod.id;
    setSelectedPeriod(null);
    setAnchorEl(null);
    await client.postMutation({
      url: '/userAreas/remove',
      data: { userAreaId },
      message: 'Period deleted'
    });
  }

  const updatePeriod = async (e) => {
    e.preventDefault();
    const userArea = {
      id,
      userId,
      areaId,
      roleId,
      startTime: makeAreaDate(startTime, timeZone),
      endTime: makeAreaDate(endTime, timeZone, 1),
      isAdmin
    };
    setSelectedPeriod(null);
    setAnchorEl(null);
    await client.postMutation({
      url: '/userAreas/update',
      data: userArea,
      message: 'Period updated'
    });
  }

  const periodDetails = (
    <PeriodDetails
      roleName={roleName}
      startTime={startTime}
      endTime={endTime}
      isAdmin={isAdmin}
      onEdit={() => setEdit(true)}
      onDelete={removePeriod}
      onClose={handleClose} />
  );

  const editForm = (
    <React.Fragment>
      <DialogTitle>Edit period</DialogTitle>
      <DialogContent className={classes.root}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            className={classes.spacing}
            disableToolbar
            variant="inline"
            format="dd/MM/yyyy"
            margin="none"
            id="start-time"
            label="Start date"
            minDate={minStartTime ? new Date(minStartTime) : undefined}
            maxDate={endTime ? endTime : undefined}
            value={startTime}
            onChange={handleStartTimeChange}
            KeyboardButtonProps={{ 'aria-label': 'change date' }}
            autoOk />
        </MuiPickersUtilsProvider>
        <Typography className={classes.to} variant="body1">to</Typography>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            className={classes.spacing}
            disableToolbar
            variant="inline"
            format="dd/MM/yyyy"
            margin="none"
            id="end-time"
            label="End date"
            minDate={startTime ? startTime : undefined}
            maxDate={maxEndTime ? new Date(maxEndTime) : undefined}
            value={endTime}
            onChange={handleEndTimeChange}
            KeyboardButtonProps={{ 'aria-label': 'change date' }}
            autoOk />
        </MuiPickersUtilsProvider>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={updatePeriod} 
          variant="contained" 
          color="primary"
          disabled={isDisabled}>Update</Button>
      </DialogActions>
    </React.Fragment>
  );

  return (
    <Popover 
      className={classes.popover}
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left'
      }}
      onClose={handleClose}
      disableRestoreFocus>{edit ? editForm : periodDetails}</Popover>
  );
}

export default EditPeriod;
