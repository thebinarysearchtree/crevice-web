import React, { useState, useEffect } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Avatar from '../common/Avatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { useClient } from '../auth';
import cache from '../cache';

const useStyles = makeStyles((theme) => ({
  content: {
    width: '370px',
    paddingBottom: theme.spacing(5)
  }
}));

function BookedList(props) {
  const [cancelledUserIds, setCancelledUserIds] = useState([]);
  const [inProgressUserIds, setInProgressUserIds] = useState([]);

  const classes = useStyles();
  const client = useClient();

  const { setMutationCount } = client;

  const { open, setAnchorEl, bookedUsers } = props;

  const cancelBooking = async (userId, bookingId) => {
    setInProgressUserIds([...inProgressUserIds, userId]);
    const response = await client.postData('/bookings/remove', { userId, bookingId });
    if (response.ok) {
      setCancelledUserIds(userIds => [...userIds, userId]);
    }
    setInProgressUserIds(userIds => userIds.filter(id => id !== userId));
  }

  const handleClose = () => {
    setAnchorEl(null);
    if (cancelledUserIds.length !== 0) {
      cache.clear();
      setMutationCount(count => count + 1);
    }
  }

  useEffect(() => {
    if (open) {
      setCancelledUserIds([]);
    }
  }, [open]);

  const users = bookedUsers.map(user => {
    const { id, bookingId, name, roleName } = user;
    const cancelled = cancelledUserIds.includes(id);
    const inProgress = inProgressUserIds.includes(id);

    const button = cancelled ? (
      <Button 
        variant="contained" 
        size="small"
        disabled>Cancelled</Button>
    ) : (
      <Button 
        variant="contained" 
        color="secondary" 
        size="small"
        onClick={() => cancelBooking(id, bookingId)}
        disabled={inProgress}>Cancel</Button>
    );
    
    return (
      <ListItem key={id} disableGutters>
        <ListItemAvatar>
          <Avatar user={user} />
        </ListItemAvatar>
        <ListItemText primary={name} secondary={roleName} />
        <ListItemSecondaryAction>
          {button}
        </ListItemSecondaryAction>
      </ListItem>
    );
  });

  return (
    <Dialog 
      open={open}
      scroll="paper"
      onClose={handleClose}>
        <DialogTitle>Booked users</DialogTitle>
        <DialogContent className={classes.content}>
          <List>{users}</List>
        </DialogContent>
    </Dialog>
  );
}

export default BookedList;
