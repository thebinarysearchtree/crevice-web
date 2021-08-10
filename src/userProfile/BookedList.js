import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Avatar from '../common/Avatar';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  content: {
    paddingBottom: theme.spacing(4)
  }
}));

function BookedList(props) {
  const classes = useStyles();

  const { open, setAnchorEl, bookedUsers } = props;

  const users = bookedUsers.map(user => {
    const { id, name, roleName } = user;
    return (
      <ListItem key={id} disableGutters>
        <ListItemAvatar>
          <Avatar user={user} />
        </ListItemAvatar>
        <ListItemText primary={name} secondary={roleName} />
      </ListItem>
    );
  });

  return (
    <Dialog 
      open={open}
      scroll="paper"
      onClose={() => setAnchorEl(null)}>
        <DialogTitle>Booked users</DialogTitle>
        <DialogContent className={classes.content}>
          <List>{users}</List>
        </DialogContent>
    </Dialog>
  );
}

export default BookedList;
