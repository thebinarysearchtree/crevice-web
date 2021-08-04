import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';
import DialogContent from '@material-ui/core/DialogContent';
import { getTimeString, makePgDate } from '../utils/date';
import ScheduleIcon from '@material-ui/icons/Schedule';
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
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import UserTooltip from './UserTooltip';
import TextField from '@material-ui/core/TextField';
import { makeReviver } from '../utils/data';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

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
    display: 'flex',
    alignItems: 'center'
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
  },
  grow: {
    flexGrow: 1
  },
  fab: {
    boxShadow: 'none'
  },
  bookedCount: {
    cursor: 'pointer'
  },
  search: {
    marginRight: theme.spacing(1),
    width: '230px'
  },
  searchResults: {
    position: 'absolute',
    zIndex: 99999,
    width: '230px'
  },
  menuItem: {
    paddingTop: '0px',
    paddingBottom: '0px'
  }
}));

const today = new Date();
today.setHours(0, 0, 0, 0);

const reviver = makeReviver();

function Details(props) {
  const [edit, setEdit] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [potentialUsers, setPotentialUsers] = useState([]);
  const [searchPosition, setSearchPosition] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(0);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [selectedUserIndex, setSelectedUserIndex] = useState(-1);

  const classes = useStyles();

  const { area, setMessage, makeDays, selectedShift, setSelectedShift, anchorEl, setAnchorEl, open } = props;

  const { id: shiftId, seriesId, startTime, endTime, breakMinutes, notes, shiftRoles } = selectedShift;

  const { id: areaId, timeZone } = area;

  const shiftStartTime = makePgDate(startTime, timeZone);

  const bookedUsers = shiftRoles.flatMap(sr => sr.bookedUsers.map(b => ({ ...b, roleName: sr.roleName })));
  const roleIds = shiftRoles.map(sr => sr.roleId);

  const time = `${getTimeString(startTime)} to ${getTimeString(endTime)}${breakMinutes ? ` with ${breakMinutes} minutes break` : ' with no break'}`;

  const isPast = startTime.getTime() < today.getTime();

  const handleClose = () => {
    setSelectedShift(null);
    setAnchorEl(null);
  }

  const handleClickBookedUsers = (e) => {
    if (bookedUsers.length <= 5 && searchOpen) {
      setSearchOpen(false);
    }
  }

  const handleUserClick = async (user) => {
    setSearchTerm('');
    setPotentialUsers([]);
    const { id: userId, roleId } = user;
    const shiftRoleId = shiftRoles.find(sr => sr.roleId === roleId).id;
    const response = await client.postData('/bookings/insert', { userId, shiftRoleIds: [shiftRoleId] });
    if (response.ok) {
      const { bookedCount } = await response.json();
      if (bookedCount === 1) {
        setMessage('User booked');
        makeDays();
      }
      else {
        setMessage('Something went wrong');
      }
    }
    else {
      setMessage('Something went wrong');
    }
  }

  const search = async (searchTerm) => {
    const query = { 
      areaId, 
      roleIds,
      searchTerm, 
      shiftStartTime 
    };
    const response = await client.postData('/users/findPotentialBookings', query);
    if (response.ok) {
      const text = await response.text();
      const users = JSON.parse(text, reviver);
      setPotentialUsers(users);
    }
  }

  const handleSearchChange = async (e) => {
    clearTimeout(searchTimeout);
    setSelectedUserIndex(-1);
    const latestSearchTerm = e.target.value;
    setSearchTerm(latestSearchTerm);
    if (latestSearchTerm === '') {
      setPotentialUsers([]);
      return;
    }
    if (!searchPosition) {
      const rect = e.currentTarget.getBoundingClientRect();
      const position = { 
        bottom: rect.bottom + window.scrollY, 
        left: rect.left 
      };
      setSearchPosition(position);
      setSearchAnchorEl(e.currentTarget);
    }
    const timeout = latestSearchTerm.length < searchTerm.length ? 500 : 200;
    setSearchTimeout(setTimeout(() => search(latestSearchTerm), timeout));
  }

  const handleKeyUp = (e) => {
    const length = potentialUsers.length;
    if (length) {
      if (e.code === 'ArrowDown') {
        setSelectedUserIndex(i => {
          if (i === length - 1) {
            return -1;
          }
          if (i === -1) {
            return 0;
          }
          return i + 1;
        });
      }
      if (e.code === 'ArrowUp') {
        setSelectedUserIndex(i => i < 0 ? -1 : i - 1);
      }
      if (e.code === 'Enter') {
        if (selectedUserIndex !== -1) {
          const selectedUser = potentialUsers[selectedUserIndex];
          if (selectedUser) {
            handleUserClick(selectedUser);
          }
        }
      }
    }
  }

  const handleClickAway = (e) => {
    if (e.target !== searchAnchorEl) {
      setPotentialUsers([]);
    }
  }

  const removeShift = async () => {
    const response = await client.postData('/shifts/remove', { shiftId });
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

  const cancelBooking = async (userId, bookingId) => {
    const response = await client.postData('/bookings/remove', { userId, bookingId });
    if (response.ok) {
      makeDays();
      setMessage('Booking cancelled');
    }
    else {
      setMessage('Something went wrong');
    }
  }

  const roleItems = shiftRoles.map(shiftRole => {
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
  if (bookedUsers.length > 5 || searchOpen) {
    users = (
      <Typography className={classes.bookedCount} variant="body1" onClick={(e) => handleClickBookedUsers(e)}>{bookedUsers.length}</Typography>
    );
  }
  else {
    users = bookedUsers.map(user => {
      const { id, bookingId, name, roleName } = user;
      return (
        <UserTooltip 
          key={id} 
          name={name} 
          roleName={roleName}
          onCancel={() => cancelBooking(id, bookingId)}>
            <Avatar className={classes.avatar} user={user} />
        </UserTooltip>
      );
    });
  }

  const userItems = potentialUsers.map((user, i) => {
    const { id, name, roleName } = user;
    return (
      <MenuItem
        key={id}
        className={classes.menuItem}
        value={id}
        selected={i === selectedUserIndex}
        onClick={() => handleUserClick(user)}>
          <ListItemAvatar>
            <Avatar user={user} noLink />
          </ListItemAvatar>
          <ListItemText primary={name} secondary={roleName} />
      </MenuItem>
    )
  });

  const searchInput = searchOpen ? (
    <TextField 
      className={classes.search} 
      placeholder="Find users..."
      value={searchTerm}
      onChange={handleSearchChange}
      onKeyUp={handleKeyUp}
      autoFocus />
  ) : null;

  const leftPopover = startTime.getDay() > 3;

  return (
    <React.Fragment>
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
        <List>{roleItems}</List>
        <Divider />
        <Typography className={classes.title} variant="subtitle2">{isPast ? 'Attended' : 'Attendees'}</Typography>
        <div className={classes.bookedUsers}>
          {users}
          <div className={classes.grow} />
          {searchInput}
          <Fab 
            className={classes.fab} 
            size="small" 
            onClick={() => setSearchOpen(true)}>
              <AddIcon color="action" />
          </Fab>
        </div>
      </DialogContent>
      <DeleteDialog 
        open={dialogOpen} 
        setOpen={setDialogOpen} 
        onDelete={removeShift} />
    </Popover>
    {potentialUsers.length === 0 ? null : (
      <ClickAwayListener onClickAway={handleClickAway}>
        <Paper 
          className={classes.searchResults} 
          style={{ top: searchPosition ? searchPosition.bottom : 0, left: searchPosition ? searchPosition.left : 0 }}>
            <List>{userItems}</List>
        </Paper>
      </ClickAwayListener>
    )}
    </React.Fragment>
  );
}

export default Details;
