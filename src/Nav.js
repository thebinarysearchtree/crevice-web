import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
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
import { Link, useHistory, useLocation } from 'react-router-dom';

function ListItemLink(props) {
  const { icon, primary, to, selected } = props;
  const ref = useRef(null);

  const renderLink = React.useMemo(
    () => React.forwardRef((itemProps, ref) => <Link to={to} ref={ref} {...itemProps} />),
    [to],
  );

  return (
    <ListItem 
      button 
      component={renderLink}
      key={primary}
      selected={selected}
      ref={ref}
      onClick={() => ref.current.blur()}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={primary} />
    </ListItem>
  );
}

ListItemLink.propTypes = {
  icon: PropTypes.element.isRequired,
  primary: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired
};

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    width: '100%'
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
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3)
  },
  grow: {
    flexGrow: 1
  },
  logoSection: {
    display: 'flex',
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
  const [anchorEl, setAnchorEl] = useState(null);

  const classes = useStyles();
  const client = useClient();
  const history = useHistory();
  const location = useLocation();

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
        <ListItemLink
          icon={item.icon}
          primary={item.name}
          to={item.url}
          selected={location.pathname === item.url || location.pathname.startsWith(`${item.url}/`)}
          key={item.name} />
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
            <Typography variant="h5" className={classes.appName}>Crevice</Typography>
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
