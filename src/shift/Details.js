import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';
import DialogContent from '@material-ui/core/DialogContent';
import { getTimeString, makePgDate } from '../utils/date';
import ScheduleIcon from '@material-ui/icons/Schedule';
import Divider from '@material-ui/core/Divider';
import Avatar from '../common/Avatar';
import EventNoteIcon from '@material-ui/icons/EventNote';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import PopoverToolbar from '../common/PopoverToolbar';
import DeleteDialog from './DeleteDialog';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import UserTooltip from './UserTooltip';
import { makeReviver } from '../utils/data';
import BookedList from './BookedList';
import { useClient } from '../auth';
import EditDialog from './EditDialog';
import UserSearch from '../common/UserSearch';

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
    cursor: 'pointer',
    marginLeft: theme.spacing(1)
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
  },
  list: {
    overflow: 'auto'
  }
}));

const today = new Date();
today.setHours(0, 0, 0, 0);

const reviver = makeReviver();

function Details(props) {
  const [edit, setEdit] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bookedAnchorEl, setBookedAnchorEl] = useState(null);
  const [detach, setDetach] = useState(false);

  const bookedOpen = Boolean(bookedAnchorEl);

  const classes = useStyles();
  const client = useClient();

  const { setMessage } = client;

  const { area, selectedShift, setSelectedShift, setCopiedShift, anchorEl, setAnchorEl, open } = props;

  const { id: shiftId, seriesId, isSingle, startTime, endTime, breakMinutes, notes, shiftRoles } = selectedShift;

  const { id: areaId, timeZone } = area;

  const shiftStartTime = makePgDate(startTime, timeZone);

  const bookedUsers = shiftRoles.flatMap(sr => sr.bookedUsers.map(b => ({ ...b, roleName: sr.roleName })));
  const roleIds = shiftRoles.map(sr => sr.roleId);
  const bookedUserIds = bookedUsers.map(u => u.id);

  const time = `${getTimeString(startTime)} to ${getTimeString(endTime)}${breakMinutes ? ` with ${breakMinutes} minutes break` : ' with no break'}`;

  const isPast = startTime.getTime() < today.getTime();

  const handleClose = () => {
    setSelectedShift(null);
    setAnchorEl(null);
  }

  const handleCopy = () => {
    setCopiedShift(selectedShift);
    setMessage('Shift copied');
    handleClose();
  }

  const handleSeries = () => {
    setDetach(false);
    setEdit(true);
  }

  const handleEdit = () => {
    setDetach(true);
    setEdit(true);
  }

  const handleClickBookedUsers = (e) => {
    if (bookedUsers.length === 0) {
      return;
    }
    if (bookedUsers.length <= 5 && searchOpen) {
      setSearchOpen(false);
    }
    else {
      setBookedAnchorEl(e.currentTarget);
    }
  }

  const handleUserClick = async (user) => {
    const { id: userId, roleId } = user;
    const { shiftId, id: shiftRoleId } = shiftRoles.find(sr => sr.roleId === roleId);
    const shift = { shiftId, shiftRoleId };
    await client.postMutation({
      url: '/bookings/insert',
      data: { userId, shifts: [shift] },
      message: 'User booked'
    });
  }

  const search = async (searchTerm) => {
    const query = {
      areaId, 
      roleIds,
      searchTerm, 
      shiftStartTime,
      bookedUserIds
    };
    const response = await client.postData('/users/findPotentialBookings', query);
    if (response.ok) {
      const text = await response.text();
      return JSON.parse(text, reviver);
    }
    return [];
  }

  const removeShift = async (type) => {
    setDialogOpen(false);
    setAnchorEl(null);
    const message = type === 'shift' ? 'Shift deleted' : 'Series deleted';
    await client.postMutation({
      url: '/shifts/remove',
      data: { shiftId, seriesId, type },
      message
    });
  }

  const cancelBooking = async (userId, bookingId) => {
    await client.postMutation({
      url: '/bookings/remove',
      data: { userId, bookingId },
      message: 'Booking cancelled'
    });
  }

  const roleItems = shiftRoles.map(shiftRole => {
    const { id, roleName, roleColour, capacity } = shiftRole;
    return (
      <ListItem key={id} disableGutters>
        <div className={classes.colour} style={{ backgroundColor: `#${roleColour}` }} />
        <ListItemText primary={roleName} />
        <ListItemSecondaryAction><Typography varaint="body1">{capacity}</Typography></ListItemSecondaryAction>
      </ListItem>
    );
  });

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

  const searchInput = searchOpen ? (
    <UserSearch
      placeholder="Find users..."
      onClick={handleUserClick}
      onSearch={search} />
  ) : null;

  const leftPopover = startTime.getDay() > 3;

  const dialogProps = {...props, handleClose, detach };

  const content = edit ? <EditDialog {...dialogProps} /> : (
    <React.Fragment>
      <PopoverToolbar 
        onCopy={handleCopy}
        onSeries={isSingle ? null : handleSeries}
        onEdit={handleEdit}
        onDelete={() => setDialogOpen(true)} 
        onClose={handleClose}
        copyText="Copy shift"
        seriesText="Edit series"
        editText="Edit shift"
        deleteText="Delete shift" />
      <DialogContent className={classes.content}>
        <div className={classes.detail}>
          <ScheduleIcon className={classes.icon} fontSize="small" color="action" />
          <Typography variant="body1">{time}</Typography>
        </div>
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
      <BookedList 
        open={bookedOpen} 
        anchorEl={bookedAnchorEl} 
        setAnchorEl={setBookedAnchorEl} 
        bookedUsers={bookedUsers} />
      <DeleteDialog 
        open={dialogOpen} 
        setOpen={setDialogOpen} 
        onDelete={removeShift}
        isSingle={isSingle} />
    </React.Fragment>
  );

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
          {content}
      </Popover>
    </React.Fragment>
  );
}

export default Details;
