import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import RoleChip from '../common/RoleChip';
import Popover from '@material-ui/core/Popover';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { getTimeString } from '../utils/date';
import ScheduleIcon from '@material-ui/icons/Schedule';

const useStyles = makeStyles((theme) => ({
  right: {
    marginLeft: '5px'
  },
  left: {
    marginLeft: '-5px'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    width: '375px'
  },
  time: {
    display: 'flex',
    alignItems: 'center'
  },
  clock: {
    marginRight: theme.spacing(1)
  }
}));

const titleFormatter = new Intl.DateTimeFormat('default', { weekday: 'long', day: 'numeric', month: 'long' });

function Details(props) {
  const [edit, setEdit] = useState(false);

  const classes = useStyles();

  const { selectedShift, setSelectedShift, anchorEl, setAnchorEl, open } = props;

  const { startTime, endTime, breakMinutes, notes, shiftRoles } = selectedShift;

  const time = `${getTimeString(startTime)} to ${getTimeString(endTime)}${breakMinutes ? ` with ${breakMinutes} minutes break` : ' with no break'}`;

  const handleClose = () => {
    setSelectedShift(null);
    setAnchorEl(null);
  }

  const leftPopover = startTime.getDay() > 3;

  return (
    <Popover 
      className={leftPopover ? classes.left : classes.right}
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
      onClose={handleClose}
      disableRestoreFocus>
      <DialogTitle>{titleFormatter.format(startTime)}</DialogTitle>
      <DialogContent className={classes.content}>
        <div className={classes.time}>
          <ScheduleIcon className={classes.clock} fontSize="small" />
          <Typography variant="body1">{time}</Typography>
        </div>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleClose}>Close</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setEdit(true)}>Edit</Button>
      </DialogActions>
    </Popover>
  );
}

export default Details;
