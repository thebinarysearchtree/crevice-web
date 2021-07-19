import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4)
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: theme.spacing(1)
  },
  list: {
    maxHeight: '300px',
    overflowY: 'scroll'
  }
}));

function BookedList(props) {
  const classes = useStyles();

  const { open, anchorEl, setAnchorEl, bookedUsers } = props;

  const users = bookedUsers.map(user => {
    const { id, name, roleName, imageId } = user;
    const photoSrc = imageId ? `/photos/${imageId}.jpg` : null;
    return (
      <ListItem key={id}>
        <ListItemAvatar>
          <Avatar className={classes.avatar} src={photoSrc} alt={name} />
        </ListItemAvatar>
        <ListItemText primary={name} secondary={roleName} />
      </ListItem>
    );
  });

  return (
    <Popover 
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
      onClose={() => setAnchorEl(null)}
      disableRestoreFocus>
        <List className={classes.list} dense>{users}</List>
        <div className={classes.actions}>
          <Button color="primary" onClick={() => setAnchorEl(null)}>Close</Button>
        </div>
    </Popover>
  );
}

export default BookedList;
