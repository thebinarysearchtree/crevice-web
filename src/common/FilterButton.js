import React, { useState, useEffect } from 'react';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

function FilterButton(props) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [label, setLabel] = useState(props.children);

  const { id, items, selectedItemId, filterBy } = props;

  useEffect(() => {
    if (selectedItemId) {
      setLabel(items.find(item => item.id === selectedItemId).name);
    }
  }, []);

  const handleItemClick = (item) => {
    setAnchorEl(null);
    if (!item) {
      setLabel(props.children);
      filterBy(-1);
    }
    else {
      setLabel(item.name);
      filterBy(item.id);
    }
  }

  const menuItems = items.map(item => {
    return (
      <MenuItem
        key={item.id}
        onClick={() => handleItemClick(item)}>{item.name}</MenuItem>
    );
  });

  return (
    <React.Fragment>
      <Button
        variant="outlined"
        endIcon={<ArrowDropDownIcon />}
        aria-controls={id}
        aria-haspopup="true"
        onClick={(e) => setAnchorEl(e.currentTarget)}>{label}</Button>
      <Menu
        id={id}
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => handleItemClick()}>All</MenuItem>
          {menuItems}
      </Menu>
    </React.Fragment>
  );
}

export default FilterButton;
