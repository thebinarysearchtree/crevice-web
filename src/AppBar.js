import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MuiAppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import client from './client';
import { Link, useHistory } from 'react-router-dom';
import SearchBox from './common/SearchBox';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: 'white',
    boxShadow: 'none',
    borderBottom: `1px solid ${theme.palette.divider}`,
    zIndex: theme.zIndex.drawer + 1
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

function AppBar() {
  const [anchorEl, setAnchorEl] = useState(null);

  const classes = useStyles();
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
    <React.Fragment>
      <MuiAppBar position="fixed" className={classes.root}>
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
      </MuiAppBar>
      {renderMenu}
    </React.Fragment>
  );
}

export default AppBar;
