import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import RoomIcon from '@material-ui/icons/Room';
import HomeIcon from '@material-ui/icons/Home';
import PersonIcon from '@material-ui/icons/Person';
import LabelIcon from '@material-ui/icons/Label';
import { Link, useLocation } from 'react-router-dom';
import ScheduleIcon from '@material-ui/icons/Schedule';
import { useClient } from './auth';

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
    width: drawerWidth,
    flexShrink: 0,
  },
  paper: {
    width: drawerWidth,
  },
  toolbar: theme.mixins.toolbar
}));

function MainDrawer() {
  const classes = useStyles();
  const location = useLocation();
  const client = useClient();

  const { user } = client;

  const menuItemGroups = [];
  if (user.isAdmin) {
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
        name: 'Fields',
        url: '/fields'
      },
      {
        icon: <ScheduleIcon />,
        name: 'Shifts',
        url: '/shifts'
      }
    ]);
  }
  const menuItems = menuItemGroups.map((group, i) => {
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
      <React.Fragment key={groupKey}>
        <List>{items}</List>
      </React.Fragment>
    );
  });
  
  return (
    <Drawer
      className={classes.root}
      variant="permanent"
      classes={{
        paper: classes.paper,
      }}
      anchor="left">
        <div className={classes.toolbar} />
        {menuItems}
    </Drawer>
  );
}

export default MainDrawer;
