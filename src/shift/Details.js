import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';
import DialogContent from '@material-ui/core/DialogContent';
import { getTimeString } from '../utils/date';
import ScheduleIcon from '@material-ui/icons/Schedule';
import Link from '@material-ui/core/Link';
import Divider from '@material-ui/core/Divider';
import client from '../client';
import Avatar from '../common/Avatar';
import EventNoteIcon from '@material-ui/icons/EventNote';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import PopoverToolbar from '../common/PopoverToolbar';
import DeleteDialog from './DeleteDialog';
import LinearScaleIcon from '@material-ui/icons/LinearScale';

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
    marginBottom: theme.spacing(2)
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
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '200px',
    color: theme.palette.text.secondary
  },
  role: {
    display: 'flex'
  },
  colour: {
    width: '10px',
    height: '10px',
    borderRadius: '5px',
    marginRight: theme.spacing(1)
  },
  roleDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '12px',
    paddingBottom: '12px',
    paddingRight: theme.spacing(2),
    width: '100%'
  }
}));

const today = new Date();
today.setHours(0, 0, 0, 0);

function Details(props) {
  const [edit, setEdit] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const classes = useStyles();

  const { setMessage, makeDays, userId, selectedShift, setSelectedShift, anchorEl, setAnchorEl, open } = props;

  const { id, seriesId, areaName, startTime, endTime, breakMinutes, notes, shiftRoles } = selectedShift;

  const bookedUsers = shiftRoles.flatMap(sr => sr.bookedUsers.map(b => ({ ...b, roleName: sr.name })));

  const time = `${getTimeString(startTime)} to ${getTimeString(endTime)}${breakMinutes ? ` with ${breakMinutes} minutes break` : ' with no break'}`;

  const isPast = startTime.getTime() < today.getTime();

  const handleClose = () => {
    setSelectedShift(null);
    setAnchorEl(null);
  }

  const handleClickBookedUsers = (e, bookedUsers) => {
    setAnchorEl(null);
  }

  const removeShift = async () => {
    const response = await client.postData('/shifts/remove', { shiftId: id });
    setDialogOpen(false);
    setAnchorEl(null);
    if (response.ok) {
      makeDays();
      setMessage('Shift deleted');
    }
    else {
      setMessage('Something went wrong');
    }
  }

  const roles = shiftRoles.map(shiftRole => {
    const { id, roleName, roleColour, capacity, bookedUsers } = shiftRole;
    return (
      <ListItem key={id} disableGutters>
        <div className={classes.colour} style={{ backgroundColor: `#${roleColour}` }} />
        <ListItemText primary={roleName} />
        <ListItemSecondaryAction><Typography varaint="body1">{capacity}</Typography></ListItemSecondaryAction>
      </ListItem>
    );
  });

  const seriesElement = seriesId ? (
    <div className={classes.detail}>
      <LinearScaleIcon className={classes.icon} fontSize="small" color="action" />
      <Typography variant="body1">Part of a series</Typography>
    </div>
  ) : null;

  const notesElement = notes ? (
    <div className={classes.detail}>
      <EventNoteIcon className={classes.icon} fontSize="small" color="action" />
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
        itemName="shift" 
        onDelete={() => setDialogOpen(true)} 
        onClose={handleClose} />
      <DialogContent className={classes.content}>
        <div className={classes.detail}>
          <ScheduleIcon className={classes.icon} fontSize="small" color="action" />
          <Typography variant="body1">{time}</Typography>
        </div>
        {seriesElement}
        {notesElement}
        <Divider />
        <List>{roles}</List>
        <Divider />
        <Typography className={classes.title} variant="subtitle2">{isPast ? 'Attended' : 'Attendees'}</Typography>
        <div className={classes.bookedUsers}>{users}</div>
      </DialogContent>
      <DeleteDialog 
        open={dialogOpen} 
        setOpen={setDialogOpen} 
        onDelete={removeShift} />
    </Popover>
  );
}

export default Details;
