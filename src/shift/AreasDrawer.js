import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    width: drawerWidth,
    flexShrink: 0,
  },
  paper: {
    width: drawerWidth,
  },
  toolbar: theme.mixins.toolbar,
  location: {
    fontWeight: 600
  },
  area: {
    paddingLeft: theme.spacing(4)
  }
}));

function AreasDrawer(props) {
  const classes = useStyles();

  const { selectedArea, handleAreaClick, locations } = props;

  const menuItems = [];
  for (const location of locations) {
    const { id, abbreviation } = location;
    const menuItem = (
      <ListItem key={`l${id}`}>
        <ListItemText classes={{ primary: classes.location }} primary={abbreviation} />
      </ListItem>
    );
    menuItems.push(menuItem);
    for (const area of location.areas) {
      const { id, abbreviation } = area;
      const menuItem = (
        <ListItem 
          button
          key={`a${id}`} 
          className={classes.area} 
          selected={id === selectedArea.id}
          onClick={() => handleAreaClick(area)}>
            <ListItemText primary={abbreviation} />
        </ListItem>
      );
      menuItems.push(menuItem);
    }
  }
  const menuList = <List>{menuItems}</List>;
  
  return (
    <Drawer
      className={classes.root}
      variant="permanent"
      classes={{
        paper: classes.paper,
      }}
      anchor="left">
        <div className={classes.toolbar} />
        {menuList}
    </Drawer>
  );
}

export default AreasDrawer;
