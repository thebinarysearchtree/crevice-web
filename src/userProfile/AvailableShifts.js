import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { getTimeString, overlaps } from '../utils/date';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import BookedList from './BookedList';
import Avatar from '../common/Avatar';
import { useClient } from '../auth';

const useStyles = makeStyles((theme) => ({
  content: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '375px'
  },
  shift: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2)
  },
  time: {
    backgroundColor: '#ffcdd2',
    cursor: 'pointer',
    border: '2px solid white'
  },
  selected: {
    border: '2px solid #b71c1c'
  },
  avatar: {
    marginRight: '4px'
  },
  areaName: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  link: {
    cursor: 'pointer'
  }
}));

function AvailableShifts(props) {
  const [selectedShifts, setSelectedShifts] = useState([]);
  const [bookedAnchorEl, setBookedAnchorEl] = useState(null);
  const [bookedUsers, setBookedUsers] = useState([]);

  const bookedUsersOpen = Boolean(bookedAnchorEl);

  const classes = useStyles();
  const client = useClient();

  const { setSelectedDay, userId, date, shifts, anchorEl, setAnchorEl, open } = props;

  const isDisabled = selectedShifts.length === 0;

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedDay(null);
  }

  const handleTimeClick = (e, shift) => {
    e.stopPropagation();
    setSelectedShifts(shifts => {
      if (shifts.includes(shift)) {
        return shifts.filter(s => s !== shift);
      }
      return [...shifts, shift];
    });
  }

  const handleClickBookedUsers = (e, bookedUsers) => {
    e.stopPropagation();
    setBookedAnchorEl(e.currentTarget);
    setBookedUsers(bookedUsers);
  }

  const handleBookClick = async () => {
    handleClose();
    const shiftRoleIds = selectedShifts.map(s => s.shiftRoleId);
    await client.postMutation({
      url: '/bookings/insert',
      data: { userId, shiftRoleIds },
      message: shiftRoleIds.length === 1 ? 'Shift booked' : 'Shifts booked'
    });
  }

  const shiftElements = shifts.map(shift => {
    const { areaName, startTime, endTime, shiftRoles } = shift;
    const start = getTimeString(startTime);
    const end = getTimeString(endTime);
    const time = `${start} - ${end}`;
    const selected = selectedShifts.includes(shift);
    const className = selected ? `${classes.time} ${classes.selected}` : classes.time;
    const bookedUsers = shiftRoles.flatMap(sr => sr.bookedUsers.map(b => ({ ...b, roleName: sr.name })));
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
          <Avatar key={user.id} className={classes.avatar} user={user} size="small" tooltip />
        );
      });
    }
    const isDisabled = overlaps(shift, selectedShifts.filter(s => s !== shift));

    return (
      <div key={shift.id} className={classes.shift}>
        <Chip 
          className={className} 
          onClick={(e) => handleTimeClick(e, shift)}
          label={time}
          disabled={isDisabled}
          clickable={!isDisabled} />
        <div className={classes.areaName}><Typography variant="body2">{areaName}</Typography></div>
        {users}
      </div>
    );
  });

  const bookedUsersPopover = bookedUsersOpen ? (
    <BookedList
      anchorEl={bookedAnchorEl}
      setAnchorEl={setBookedAnchorEl}
      open={bookedUsersOpen}
      bookedUsers={bookedUsers} />
  ) : null;

  const buttonText = selectedShifts.length > 1 ? `Book ${selectedShifts.length} shifts` : 'Book';

  const leftPopover = date.getDay() > 3;

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
      onClose={handleClose}
      onClick={() => setSelectedShifts([])}
      disableRestoreFocus>
      <DialogTitle>Available shifts</DialogTitle>
      <DialogContent className={classes.content}>
        {shiftElements}
        {bookedUsersPopover}
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          disabled={isDisabled}
          onClick={handleBookClick}>{buttonText}</Button>
      </DialogActions>
    </Popover>
  );
}

export default AvailableShifts;
