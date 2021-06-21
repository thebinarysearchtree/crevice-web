import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';
import Popover from '@material-ui/core/Popover';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import Tooltip from '@material-ui/core/Tooltip';
import FormHelperText from '@material-ui/core/FormHelperText';
import { addDays, addYears } from '../utils/date';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    height: '44px'
  },
  option: {
    cursor: 'pointer'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '0px'
  },
  form: {
    display: 'flex',
    alignItems: 'baseline'
  },
  weeks: {
    width: '70px',
    marginLeft: '8px',
    marginRight: '8px'
  },
  until: {
    width: '170px',
    marginLeft: '8px'
  },
  filled: {
    paddingTop: '12px'
  },
  error: {
    height: '20px'
  }
}));

function RepeatSelector(props) {
  const [weeks, setWeeks] = useState(1);
  const [until, setUntil] = useState(new Date());
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const classes = useStyles();

  const earliestUntil = addDays(props.date, 7 * weeks);
  const latestUntil = addYears(props.date, 5);

  const isDisabled = weeks < 1 || !until || Number.isNaN(until.getTime()) || until.getTime() < earliestUntil.getTime() || until.getTime() > latestUntil.getTime();

  let error = '';
  if (weeks !== '' && weeks < 1) {
    error = 'Weeks cannot be less than 1';
  }
  else if (!Number.isInteger(Number(weeks))) {
    error = 'Weeks must be an integer';
  }
  else if (until && Number.isNaN(until.getTime())) {
    error = 'Invalid date format';
  }
  else if (until && until.getTime() < earliestUntil.getTime()) {
    error = `Date must be at least ${weeks} ${weeks === 1 ? 'week' : 'weeks'} into the future`;
  }
  else if (until && until.getTime() > latestUntil.getTime()) {
    error = 'Date cannot be more than 5 years into the future';
  }

  useEffect(() => {
    if (open) {
      setWeeks(props.weeks === 0 ? 1 : props.weeks);
      setUntil(props.until.getTime() < earliestUntil.getTime() ? earliestUntil : props.until);
    }
  }, [open]);

  const handleChangeWeeks = (e) => {
    const weeks = e.target.value;
    const earliestUntil = addDays(props.date, 7 * weeks);
    if (until && until.getTime() < earliestUntil.getTime()) {
      setUntil(earliestUntil);
    }
    setWeeks(weeks);
  }

  const handleSave = () => {
    props.setWeeks(parseInt(weeks, 10));
    props.setUntil(until);
    setAnchorEl(null);
  }

  const deleteButton = props.weeks ? (
    <Tooltip title="Clear">
      <IconButton onClick={() => props.setWeeks(0)}>
        <ClearIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  ) : null;

  const repeatText = props.weeks ? `Repeats every ${props.weeks === 1 ? 'week' : `${props.weeks} weeks`} until ${props.until.toLocaleDateString()}` : 'Does not repeat';

  return (
    <div className={classes.root}>
      <div 
        className={classes.option}
        onClick={(e) => setAnchorEl(e.currentTarget)}>{repeatText}</div>
      {deleteButton}
      <Popover 
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'center'
        }}
        onClose={() => setAnchorEl(null)}
        disableRestoreFocus>
          <DialogContent className={classes.content}>
            <div className={classes.form}>
              <Typography variant="body1">Repeats every</Typography>
              <TextField
                className={classes.weeks}
                type="number"
                variant="filled"
                InputProps={{ classes: { input: classes.filled }}}
                value={weeks}
                onChange={handleChangeWeeks} />
              <Typography variant="body1">{weeks == 1 ? 'week until' : 'weeks until'}</Typography>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  className={classes.until}
                  disableToolbar
                  variant="inline"
                  inputVariant="filled"
                  InputProps={{ classes: { input: classes.filled }}}
                  format="dd/MM/yyyy"
                  margin="none"
                  id="end-date"
                  shouldDisableDate={(d) => d.getTime() < earliestUntil.getTime()}
                  error={false}
                  helperText=""
                  value={until}
                  onChange={(d) => setUntil(d)}
                  KeyboardButtonProps={{ 'aria-label': 'change end date' }}
                  autoOk />
              </MuiPickersUtilsProvider>
            </div>
            <FormHelperText className={classes.error} error={true}>{error}</FormHelperText>
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={() => setAnchorEl(null)}>Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              disabled={isDisabled}
              onClick={handleSave}>Save</Button>
          </DialogActions>
      </Popover>
    </div>
  );
}

export default RepeatSelector;
