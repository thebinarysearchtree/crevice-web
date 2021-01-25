import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import RoomIcon from '@material-ui/icons/Room';
import PersonIcon from '@material-ui/icons/Person';
import LabelIcon from '@material-ui/icons/Label';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { useClient } from './client';
import { Link, useHistory } from 'react-router-dom';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    backgroundColor: 'white',
    boxShadow: 'none',
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.grey[200],
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
  grow: {
    flexGrow: 1
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  appName: {
    fontWeight: 600,
    color: '#282828'
  },
  link: {
    textDecoration: 'none'
  }
}));

function Nav(props) {
  const [selectedItem, setSelectedItem] = useState('');
  const [anchorEl, setAnchorEl] = React.useState(null);

  const classes = useStyles();
  const client = useClient();
  const history = useHistory();

  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    client.signOut();
    history.push('/login');
  }

  const handleItemClick = (name, url) => {
    setSelectedItem(name);
    history.push(url);
  }

  const user = client.user;
  const menuItemGroups = [];
  if (true || user.isAdmin) {
    menuItemGroups.push([
      {
        icon: <SupervisorAccountIcon />,
        name: 'Roles',
        url: '/roles'
      },
      {
        icon: <RoomIcon />,
        name: 'Areas',
        url: '/areas'
      },
      {
        icon: <PersonIcon />,
        name: 'Users',
        url: '/users'
      },
      {
        icon: <LabelIcon />,
        name: 'Tags',
        url: '/tags'
      }
    ]);
  }
  const menuItems = menuItemGroups.map(group => {
    const items = group.map(item => {
      return (
        <ListItem 
          button 
          key={item.name}
          selected={selectedItem === item.name}
          onClick={() => handleItemClick(item.name, item.url)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.name} />
        </ListItem>
      );
    });
    const groupKey = group.map(i => i.name).join();
    return (
      <List key={groupKey}>{items}</List>
    );
  }).reduce((a, c) => {
    a.push(c);
    a.push(<Divider key={a.length + 1} />);
    return a;
  }, [<Divider key={1} />]);

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
        <MenuItem onClick={handleMenuClose}>My account</MenuItem>
        <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
    </Menu>
  );

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <div className={classes.grow} />
          <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon color="action" />
              </div>
              <InputBase
                placeholder="Find people..."
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                inputProps={{ 'aria-label': 'search' }} />
          </div>
          <div>
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}>
                <AccountCircle />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor="left">
        <div className={`${classes.toolbar} ${classes.logoSection}`}>
          <Link to="/" className={classes.link}>
            <Typography variant="h5" className={classes.appName}>crevice</Typography>
          </Link>
        </div>
        {menuItems}
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {props.children}
      </main>
      {renderMenu}
    </div>
  );
}

export default Nav;
