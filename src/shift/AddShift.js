import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import FormHelperText from '@material-ui/core/FormHelperText';
import Popover from '@material-ui/core/Popover';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import client from '../client';
import { makePgDate } from '../utils/date';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import RoleChip from '../common/RoleChip';
import RepeatSelector from './RepeatSelector';
import NotesChip from './NotesChip';
import SettingsButton from './SettingsButton';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '375px'
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
    display: 'flex',
    alignItems: 'baseline'
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
  startTime: {
    flex: 1
  },
  endTime: {
    flex: 1
  },
  to: {
    marginLeft: '12px',
    marginRight: '12px'
  },
  role: {
    flexGrow: 1,
    marginRight: theme.spacing(1)
  },
  capacity: {
    width: '50px',
    marginRight: theme.spacing(1)
  },
  roleContainer: {
    display: 'flex',
    alignItems: 'flex-end'
  },
  breakMinutes: {
    marginRight: theme.spacing(1),
    cursor: 'pointer'
  },
  addButton: {
    marginRight: '5px'
  },
  settingsContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  breakMinutesContainer: {
    display: 'flex',
    alignItems: 'baseline',
    marginBottom: theme.spacing(3)
  },
  emptyRoles: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px'
  },
  addedRoles: {
    display: 'flex',
    flexDirection: 'column',
    height: '200px',
    overflowY: 'scroll'
  },
  addedRole: {
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  },
  addedChip: {
    flexGrow: 1
  },
  addedCapacity: {
    width: '40px'
  },
  errorMessage: {
    height: '16px'
  }
}));

const formatter = new Intl.DateTimeFormat('default', { weekday: 'long', day: 'numeric', month: 'long' });
const defaultSettings = {
  cancelBeforeHours: 1,
  bookBeforeHours: 1,
  canBookAndCancel: true,
  canAssign: false,
  canBeAssigned: false
};

function AddShift(props) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [roleIndex, setRoleIndex] = useState(-1);
  const [capacity, setCapacity] = useState(1);
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [shiftRoles, setShiftRoles] = useState([]);
  const [shiftRolesError, setShiftRolesError] = useState(false);
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [notes, setNotes] = useState('');
  const [editBreakMinutes, setEditBreakMinutes] = useState(false);
  const [repeatOption, setRepeatOption] = useState('Does not repeat');
  const [repeatUntil, setRepeatUntil] = useState(new Date());

  const capacityError = capacity < 0 || !Number.isInteger(Number(capacity));
  const breakMinutesError = breakMinutes < 0 || !Number.isInteger(Number(breakMinutes));

  const classes = useStyles();

  const { area, day, handleAddShift, roles, open, anchorEl, setAnchorEl, setMessage } = props;

  const isDisabled = loading || !startTime || !endTime || shiftRoles.length === 0 || breakMinutes === '' || breakMinutesError || (repeatOption !== 'Does not repeat' && (!repeatUntil || Number.isNaN(repeatUntil.getTime())));
  const addRoleIsDisabled = capacity === '' || capacityError || roleIndex === -1;

  const clearRoleFields = () => {
    setRoleIndex(-1);
    setCapacity(1);
    setSettings(defaultSettings);
  }

  useEffect(() => {
    if (open) {
      setStartTime('09:00');
      setEndTime('17:00');
      setBreakMinutes(0);
      setEditBreakMinutes(false);
      setNotes('');
      setShiftRoles([]);
      setRepeatOption('Does not repeat');
      setRepeatUntil(day.date);
      clearRoleFields();
    }
  }, [open]);

  const removeRole = (roleId) => {
    setShiftRoles(shiftRoles => shiftRoles.filter(sr => sr.role.id !== roleId));
  }

  const makeFullDate = (date, timeString) => {
    const fullDate = new Date(date);
    const [hours, minutes] = timeString.split(':').map(t => parseInt(t, 10));
    fullDate.setHours(hours, minutes, 0, 0);
    return fullDate;
  }

  const addShiftRole = () => {
    const role = roles[roleIndex];
    const duplicateRoles = shiftRoles.some(sr => sr.roleId === role.id);
    if (duplicateRoles) {
      setShiftRolesError(true);
    }
    else {
      setShiftRoles(shiftRoles => {
        const shiftRole = {
          roleId: role.id,
          role,
          capacity,
          ...settings
        };
        return [...shiftRoles, shiftRole];
      });
      clearRoleFields();
    }
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
      breakMinutes,
      notes
    };
    const adjustedShiftRoles = shiftRoles.map(sr => {
      const cancelBeforeMinutes = parseInt(sr.cancelBeforeHours * 60, 10);
      const bookBeforeMinutes = parseInt(sr.bookBeforeHours * 60, 10);
      return {...sr, cancelBeforeMinutes, bookBeforeMinutes };
    });
    const response = await client.postData('/shifts/insert', { shift, shiftRoles: adjustedShiftRoles });
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

  const roleItems = roles.map((r, i) => <MenuItem key={r.id} value={i}>{r.name}</MenuItem>);

  const addedRoles = shiftRoles.map(shiftRole => {
    const { roleId, role, capacity, ...settings } = shiftRole;
    const setSettings = (settings) => {
      setShiftRoles(shiftRoles => shiftRoles.map(sr => {
        if (sr.roleId !== roleId) {
          return sr;
        }
        return {...sr, ...settings };
      }));
    }
    return (
      <div key={role.id} className={classes.addedRole}>
        <div className={classes.addedChip}><RoleChip label={role.name} colour={role.colour} /></div>
        <div className={classes.addedCapacity}>{capacity}</div>
        <div>
          <SettingsButton settings={settings} setSettings={setSettings} iconOnly />
          <Tooltip title="Delete">
            <IconButton onClick={() => removeRole(role.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    );
  });

  const list = shiftRoles.length === 0 ? (
    <div className={classes.emptyRoles}>Add some roles</div>
  ) : (
    <div className={classes.addedRoles}>{addedRoles}</div>
  );

  const breakElement = editBreakMinutes ? (
    <TextField
      className={classes.breakMinutes}
      type="number"
      label="Break time"
      InputLabelProps={{ shrink: true }}
      InputProps={{ endAdornment: <InputAdornment>minutes</InputAdornment> }}
      error={breakMinutesError}
      helperText={breakMinutesError ? 'Must be a non-negative integer' : ''}
      value={breakMinutes}
      onChange={(e) => setBreakMinutes(e.target.value)}
      autoFocus />
  ) : (
    <Typography 
      className={classes.breakMinutes} 
      variant="body2"
      onClick={() => setEditBreakMinutes(true)}>{breakMinutes} minutes break</Typography>
  );

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
        <div className={`${classes.container} ${classes.spacing}`}>
          <TextField 
            className={classes.startTime}
            type="time" 
            label="Start time"
            InputLabelProps={{ shrink: true }}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)} />
          <Typography className={classes.to} variant="body1">to</Typography>
          <TextField 
            className={classes.endTime}
            type="time" 
            label="End time"
            InputLabelProps={{ shrink: true }}
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)} />
        </div>
        <div className={classes.breakMinutesContainer}>
          {breakElement}
          <NotesChip notes={notes} setNotes={setNotes} />
        </div>
        <div className={classes.roleContainer}>
          <FormControl className={classes.role}>
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              label="Role"
              value={roleIndex === -1 ? '' : roleIndex}
              onChange={(e) => setRoleIndex(e.target.value)}>
                {roleItems}
            </Select>
          </FormControl>
          <TextField
            className={classes.capacity}
            type="number"
            label="Capacity"
            InputLabelProps={{ shrink: true }}
            error={capacityError}
            helperText={capacityError ? 'Must be a non-negative integer' : ''}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)} />
          <Button 
            className={classes.addButton}
            variant="contained" 
            onClick={addShiftRole}
            disabled={addRoleIsDisabled}
            onBlur={() => setShiftRolesError(false)}>Add</Button>
          <SettingsButton settings={settings} setSettings={setSettings} />
        </div>
        <FormHelperText className={classes.errorMessage} error={shiftRolesError}>{shiftRolesError ? 'This role has already been added' : ''}</FormHelperText>
        {list}
        <RepeatSelector 
          date={date} 
          repeatOption={repeatOption} 
          setRepeatOption={setRepeatOption} 
          repeatUntil={repeatUntil} 
          setRepeatUntil={setRepeatUntil} />
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
