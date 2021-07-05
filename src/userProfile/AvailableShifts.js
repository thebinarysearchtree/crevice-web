import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { getTimeString, overlaps } from '../utils/date';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  content: {
    display: 'flex',
    flexDirection: 'column',
    width: '375px'
  },
  shift: {
    display: 'flex',
    alignItems: 'center'
  },
  time: {
    backgroundColor: '#ffcdd2',
    cursor: 'pointer',
    border: '2px solid white',
    marginRight: theme.spacing(1)
  },
  selected: {
    border: '2px solid #b71c1c'
  }
}));

const formatter = new Intl.DateTimeFormat('default', { weekday: 'long', day: 'numeric', month: 'long' });

function AvailableShifts(props) {
  const [selectedShifts, setSelectedShifts] = useState([]);

  const classes = useStyles();

  const { userId, date, shifts, anchorEl, setAnchorEl, open } = props;

  const isDisabled = selectedShifts.length === 0;

  const handleTimeClick = (e, shift) => {
    e.stopPropagation();
    setSelectedShifts(shifts => {
      if (shifts.includes(shift)) {
        return shifts.filter(s => s !== shift);
      }
      return [...shifts, shift];
    });
  }

  const handleBookClick = () => {
    const shiftRoleIds = selectedShifts.map(s => s.shiftRoleId);
  }

  const shiftElements = shifts.map(shift => {
    const { areaName, startTime, endTime, shiftRoles } = shift;
    const start = getTimeString(startTime);
    const end = getTimeString(endTime);
    const time = `${start} - ${end}`;
    const selected = selectedShifts.includes(shift);
    const className = selected ? `${classes.time} ${classes.selected}` : classes.time;
    const users = shiftRoles.flatMap(sr => sr.bookedUsers).slice(0, 4).map(user => {
      const { id, name, imageId } = user;
      const photoSrc = imageId ? `/photos/${imageId}.jpg` : null;
      return <Avatar key={id} src={photoSrc} alt={name} />;
    });
    const isDisabled = overlaps(shift, selectedShifts.filter(s => s !== shift));

    return (
      <div key={shift.id} className={classes.shift}>
        <Chip 
          className={className} 
          onClick={(e) => handleTimeClick(e, shift)}
          label={time}
          disabled={isDisabled}
          clickable={!isDisabled} />
        <div><Typography variant="body2">{areaName}</Typography></div>
        {users}
      </div>
    );
  });

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
      onClose={() => setAnchorEl(null)}
      onClick={() => setSelectedShifts([])}
      disableRestoreFocus>
      <DialogTitle>{formatter.format(date)}</DialogTitle>
      <DialogContent className={classes.content}>
        {shiftElements}
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={() => setAnchorEl(null)}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          disabled={isDisabled}
          onClick={() => setAnchorEl(null)}>Book</Button>
      </DialogActions>
    </Popover>
  );
}

export default AvailableShifts;
