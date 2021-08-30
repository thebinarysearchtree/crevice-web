import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';
import DialogContent from '@material-ui/core/DialogContent';
import { getTimeString } from '../utils/date';
import ScheduleIcon from '@material-ui/icons/Schedule';
import HomeIcon from '@material-ui/icons/Home';
import Divider from '@material-ui/core/Divider';
import Avatar from '../common/Avatar';
import PopoverToolbar from '../common/PopoverToolbar';
import BookedList from './BookedList';
import { useClient } from '../auth';

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
    width: '375px',
    paddingBottom: theme.spacing(3)
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
  },
  bookedCount: {
    cursor: 'pointer',
    marginLeft: theme.spacing(1)
  }
}));

const today = new Date();
today.setHours(0, 0, 0, 0);

function Details(props) {
  const [bookedAnchorEl, setBookedAnchorEl] = useState(null);

  const bookedUsersOpen = Boolean(bookedAnchorEl);

  const classes = useStyles();
  const client = useClient();

  const { userId, selectedShift, setSelectedShift, anchorEl, setAnchorEl, open } = props;

  const { areaName, startTime, endTime, breakMinutes, notes, shiftRoles } = selectedShift;

  const bookedUsers = shiftRoles.flatMap(sr => sr.bookedUsers.map(b => ({ ...b, roleName: sr.name })));
  const canCancel = shiftRoles.find(sr => sr.booked).canCancel;

  const time = `${getTimeString(startTime)} to ${getTimeString(endTime)}${breakMinutes ? ` with ${breakMinutes} minutes break` : ' with no break'}`;

  const isPast = startTime.getTime() < today.getTime();

  useEffect(() => {
    setBookedAnchorEl(null);
  }, [open]);

  const handleClose = () => {
    setSelectedShift(null);
    setAnchorEl(null);
  }

  const handleCancel = async () => {
    handleClose();
    const bookingId = shiftRoles.find(sr => sr.booked).bookedUsers.find(u => u.id === userId).bookingId;
    await client.postMutation({
      url: '/bookings/remove',
      data: { userId, bookingId },
      message: 'Booking cancelled'
    });
  }

  const handleBookedUsersClick = (e, bookedUsers) => {
    setBookedAnchorEl(e.currentTarget);
  }

  const notesElement = notes ? (
    <div className={classes.detail}>
      <Typography className={classes.notes} variant="body1">{notes}</Typography>
    </div>
  ) : null;

  let users;
  if (bookedUsers.length > 5) {
    users = (
      <Typography 
        className={classes.bookedCount} 
        variant="body1"
        onClick={handleBookedUsersClick}>{bookedUsers.length}</Typography>
    );
  }
  else {
    users = bookedUsers.map(user => {
      return (
        <Avatar key={user.id} className={classes.avatar} user={user} tooltip />
      );
    });
  }

  const bookedUsersPopover = bookedUsersOpen ? (
    <BookedList
      anchorEl={bookedAnchorEl}
      setAnchorEl={setBookedAnchorEl}
      open={bookedUsersOpen}
      bookedUsers={bookedUsers} />
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
        <PopoverToolbar 
          onDelete={canCancel ? handleCancel : null} 
          onClose={handleClose} 
          deleteText="Cancel shift" />
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
          {bookedUsersPopover}
        </DialogContent>
    </Popover>
  );
}

export default Details;
