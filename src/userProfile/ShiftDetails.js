import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { getTimeString } from '../utils/date';
import ScheduleIcon from '@material-ui/icons/Schedule';
import HomeIcon from '@material-ui/icons/Home';
import Link from '@material-ui/core/Link';
import Divider from '@material-ui/core/Divider';
import client from '../client';
import Avatar from '../common/Avatar';

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
  detail: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1)
  },
  icon: {
    marginRight: theme.spacing(1)
  },
  avatar: {
    marginRight: theme.spacing(1)
  },
  bookedUsers: {
    display: 'flex'
  },
  title: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  notes: {
    whiteSpace: 'pre-line',
    marginBottom: theme.spacing(1)
  }
}));

const today = new Date();
today.setHours(0, 0, 0, 0);

function Details(props) {
  const classes = useStyles();

  const { setMessage, makeDays, userId, selectedShift, setSelectedShift, anchorEl, setAnchorEl, open } = props;

  const { areaName, startTime, endTime, breakMinutes, notes, shiftRoles } = selectedShift;

  const bookedUsers = shiftRoles.flatMap(sr => sr.bookedUsers.map(b => ({ ...b, roleName: sr.name })));
  const canCancel = shiftRoles.find(sr => sr.booked).canCancel;

  const time = `${getTimeString(startTime)} to ${getTimeString(endTime)}${breakMinutes ? ` with ${breakMinutes} minutes break` : ' with no break'}`;

  const isPast = startTime.getTime() < today.getTime();

  const handleClose = () => {
    setSelectedShift(null);
    setAnchorEl(null);
  }

  const handleCancel = async () => {
    const bookingId = shiftRoles.find(sr => sr.booked).bookedUsers.find(u => u.id === userId).bookingId;
    const response = await client.postData('/bookings/remove', { userId, bookingId });
    if (response.ok) {
      const { cancelledCount } = await response.json();
      if (cancelledCount === 1) {
        handleClose();
        setMessage('Booking cancelled');
        makeDays();
      }
      else {
        handleClose();
        setMessage('Something went wrong');
      }
    }
    else {
      handleClose();
      setMessage('Something went wrong');
    }
  }

  const handleClickBookedUsers = (e, bookedUsers) => {
    setAnchorEl(null);
  }

  const notesElement = notes ? (
    <div className={classes.detail}>
      <Typography className={classes.notes} variant="body1">{notes}</Typography>
    </div>
  ) : null;

  let users;
  if (bookedUsers.length > 5) {
    users = (
      <Link 
        className={classes.link}
        onClick={(e) => handleClickBookedUsers(e, bookedUsers)}>{bookedUsers.length} booked</Link>
    );
  }
  else {
    users = bookedUsers.map(user => {
      return (
        <Avatar key={user.id} className={classes.avatar} user={user} tooltip />
      );
    });
  }

  const cancelButton = canCancel ? (
    <Button
      variant="contained"
      color="secondary"
      onClick={handleCancel}>Cancel booking</Button>
  ) : null;

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
      <DialogTitle>{isPast ? 'Attended shift' : 'Booked shift'}</DialogTitle>
      <DialogContent className={classes.content}>
        <div className={classes.detail}>
          <HomeIcon className={classes.icon} fontSize="small" color="action" />
          <Typography variant="body1">{areaName}</Typography>
        </div>
        <div className={classes.detail}>
          <ScheduleIcon className={classes.icon} fontSize="small" color="action" />
          <Typography variant="body1">{time}</Typography>
        </div>
        {notesElement}
        <Divider />
        <Typography className={classes.title} variant="subtitle2">{isPast ? 'Attended' : 'Attendees'}</Typography>
        <div className={classes.bookedUsers}>{users}</div>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleClose}>Close</Button>
        {cancelButton}
      </DialogActions>
    </Popover>
  );
}

export default Details;
