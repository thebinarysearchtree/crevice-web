import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import RoomIcon from '@material-ui/icons/Room';
import HomeIcon from '@material-ui/icons/Home';
import PersonIcon from '@material-ui/icons/Person';
import LabelIcon from '@material-ui/icons/Label';
import AccountCircle from '@material-ui/icons/AccountCircle';
import client from './client';
import { Link, useHistory, useLocation } from 'react-router-dom';
import SearchBox from './common/SearchBox';

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
    backgroundColor: 'white',
    boxShadow: 'none',
    borderBottom: `1px solid ${theme.palette.divider}`,
    zIndex: theme.zIndex.drawer + 1
  },
  appBarOnly: {
    backgroundColor: 'white',
    boxShadow: 'none',
    borderBottom: `1px solid ${theme.palette.divider}`
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
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    marginBottom: theme.spacing(40)
  },
  grow: {
    flexGrow: 1
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: drawerWidth - 49
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
        name: 'Locations',
        url: '/locations'
      },
      {
        icon: <HomeIcon />,
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
          selected={location.pathname === item.url}
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

  const drawer = !props.appBarOnly ? (
    <Drawer
      className={classes.drawer}
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
      anchor="left">
      <div className={classes.toolbar} />
      {menuItems}
    </Drawer>) : null;
  
  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={props.appBarOnly ? classes.appBarOnly : classes.appBar}>
        <Toolbar>
          <div className={classes.logoSection}>
            <Link to="/" className={classes.link}>
              <Typography variant="h5" className={classes.appName}>Crevice</Typography>
            </Link>
          </div>
          <div className={classes.grow} />
          <SearchBox placeholder="Find people..." />
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
      {drawer}
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {props.children}
      </main>
      {renderMenu}
    </div>
  );
}

export default Nav;
