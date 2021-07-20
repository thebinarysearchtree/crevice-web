import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ListSubheader from '@material-ui/core/ListSubheader';

const useStyles = makeStyles((theme) => ({
  button: {
    width: '150px',
    marginRight: theme.spacing(1)
  },
  label: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    width: '100px'
  }
}));

function AreaButton(props) {
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const classes = useStyles();

  const { selectedArea, setSelectedArea, locations } = props;

  const handleAreaClick = (area) => {
    setAnchorEl(null);
    setSelectedArea(area);
  }

  const menuItems = [];
  const locationCount = locations.length;
  for (const location of locations) {
    const { id, name, areas } = location;
    if (locationCount > 1) {
      const menuItem = <ListSubheader key={`l${id}`}>{name}</ListSubheader>;
      menuItems.push(menuItem);
    }
    for (const area of areas) {
      const { id, name } = area;
      const menuItem = (
        <MenuItem
          key={`a${id}`}
          value={area}
          selected={selectedArea.id === id}
          onClick={() => handleAreaClick(area)}>{name}</MenuItem>
      );
      menuItems.push(menuItem);
    }
  }

  return (
    <React.Fragment>
      <Button 
        className={classes.button}
        variant="contained" 
        color="secondary"
        aria-controls="area-menu"
        aria-haspopup="true"
        endIcon={<ArrowDropDownIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}>
          <span className={classes.label}>{selectedArea.name}</span>
      </Button>
      <Menu
        id="area-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={() => setAnchorEl(null)}>
          {menuItems}
      </Menu>
    </React.Fragment>
  );
}

export default AreaButton;
