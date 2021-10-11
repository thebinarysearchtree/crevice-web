import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Avatar from '../common/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import Portal from '@material-ui/core/Portal';
import { useClient } from '../auth';

const useStyles = makeStyles((theme) => ({
  root: {
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
  },
  primary: {
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
}));

function UserSearch(props) {
  const [searchPosition, setSearchPosition] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(0);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [selectedUserIndex, setSelectedUserIndex] = useState(-1);
  const [users, setUsers] = useState([]);

  const classes = useStyles();
  const client = useClient();

  const { ref } = client;

  const { className, onClick, onSearch, placeholder } = props;

  const handleUserClick = async (user) => {
    setSearchTerm('');
    setUsers([]);
    onClick(user);
  }

  const search = async (searchTerm) => {
    const users = await onSearch(searchTerm);
    setUsers(users);
  }

  const handleSearchChange = async (e) => {
    clearTimeout(searchTimeout);
    setSelectedUserIndex(-1);
    const latestSearchTerm = e.target.value;
    setSearchTerm(latestSearchTerm);
    if (latestSearchTerm === '') {
      setUsers([]);
      return;
    }
    if (!searchPosition) {
      const rect = e.currentTarget.getBoundingClientRect();
      const position = { 
        bottom: rect.bottom + window.scrollY, 
        left: rect.left,
        width: rect.width
      };
      setSearchPosition(position);
      setSearchAnchorEl(e.currentTarget);
    }
    const timeout = latestSearchTerm.length < searchTerm.length ? 500 : 200;
    setSearchTimeout(setTimeout(() => search(latestSearchTerm), timeout));
  }

  const handleKeyUp = (e) => {
    const length = users.length;
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
          const selectedUser = users[selectedUserIndex];
          if (selectedUser) {
            handleUserClick(selectedUser);
          }
        }
      }
    }
  }

  const handleClickAway = (e) => {
    if (e.target !== searchAnchorEl) {
      setUsers([]);
    }
  }

  const userItems = users.map((user, i) => {
    const { id, name, roleName } = user;
    return (
      <MenuItem
        key={id}
        className={roleName ? classes.menuItem : null}
        value={id}
        selected={i === selectedUserIndex}
        onClick={() => handleUserClick(user)}>
          <ListItemAvatar>
            <Avatar user={user} noLink />
          </ListItemAvatar>
          <ListItemText classes={{ primary: classes.primary }} primary={name} secondary={roleName} />
      </MenuItem>
    )
  });

  return (
    <React.Fragment>
      <TextField 
        className={className ? `${classes.root} ${className}` : classes.root} 
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleSearchChange}
        onKeyUp={handleKeyUp}
        autoFocus />
      {users.length === 0 ? null : (
        <Portal container={ref.current}>
          <ClickAwayListener onClickAway={handleClickAway}>
            <Paper 
              className={classes.searchResults} 
              style={{ width: searchPosition?.width, top: searchPosition?.bottom, left: searchPosition?.left }}>
                <List className={classes.list} style={{ maxHeight: searchPosition ? (window.innerHeight + window.scrollY) - searchPosition.bottom : null }}>{userItems}</List>
            </Paper>
          </ClickAwayListener>
        </Portal>
      )}
    </React.Fragment>
  );
}

export default UserSearch;
