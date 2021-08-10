import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
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
import FormHelperText from '@material-ui/core/FormHelperText';
import PeriodDetails from './PeriodDetails';

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
  const [overlappingError, setOverlappingError] = useState(false);
  const [edit, setEdit] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  const startError = startTime && endTime && startTime.getTime() > endTime.getTime();

  const isDisabled = !startTime || isNaN(startTime.getTime()) || (endTime && isNaN(endTime.getTime())) || startError || !hasChanged;

  const { checkOverlapping, setAreas, selectedPeriod, setSelectedPeriod, open, anchorEl, setAnchorEl, setMessage } = props;
  const classes = useStyles();

  useEffect(() => {
    const { start, end, isAdmin } = selectedPeriod;

    const startTime = new Date(start);
    const endTime = end ? addDays(new Date(end), -1) : null;

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

  const { id, userId, areaId, roleId, roleName, roleColour, timeZone } = selectedPeriod;

  const removePeriod = async () => {
    const userAreaId = selectedPeriod.id;
    setSelectedPeriod(null);
    setAnchorEl(null);
    const response = await client.postData('/userAreas/remove', { userAreaId });
    if (response.ok) {
      setAreas(areas => {
        return areas.map(area => {
          if (area.id !== areaId) {
            return area;
          }
          const updatedArea = {...area };
          updatedArea.periods = updatedArea.periods.filter(p => p.id !== id);
          return updatedArea;
        });
      });
      setMessage('Period deleted');
    }
    else {
      setMessage('Something went wrong');
    }
  }

  const updatePeriod = async (e) => {
    e.preventDefault();
    const overlapping = checkOverlapping({ id, areaId, startTime, endTime });
    if (overlapping) {
      setOverlappingError(true);
      return;
    }
    const userArea = {
      id,
      userId,
      areaId,
      roleId,
      startTime: makeAreaDate(startTime, timeZone),
      endTime: makeAreaDate(endTime, timeZone, 1),
      isAdmin
    };
    const response = await client.postData('/userAreas/update', userArea);
    if (response.ok) {
      setAreas(areas => {
        return areas.map(area => {
          if (area.id !== areaId) {
            return area;
          }
          const updatedArea = {...area };
          updatedArea.periods = updatedArea.periods.map(period => {
            if (period.id !== id) {
              return period;
            }
            return {
              ...selectedPeriod,
              startTime: startTime.getTime(),
              endTime: endTime ? addDays(endTime, 1).getTime() : null,
              isAdmin
            };
          });
          return updatedArea;
        });
      });
      setSelectedPeriod(null);
      setAnchorEl(null);
      setMessage('Period updated');
    }
    else {
      setSelectedPeriod(null);
      setAnchorEl(null);
      setMessage('Something went wrong');
    }
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
            error={startError}
            helperText={startError ? 'Start date must be before end date' : ''}
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
            value={endTime}
            onChange={handleEndTimeChange}
            KeyboardButtonProps={{ 'aria-label': 'change date' }}
            autoOk />
        </MuiPickersUtilsProvider>
        <FormHelperText error={overlappingError}>{overlappingError ? 'Areas cannot have overlapping periods' : ''}</FormHelperText>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleClose}>Cancel</Button>
        <Button 
          onBlur={() => setOverlappingError(false)}
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
