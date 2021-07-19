import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    cursor: 'pointer'
  },
  icon: {
    marginLeft: '2px'
  },
  active: {
    backgroundColor: theme.palette.grey[300]
  }
}));

function TableFilterCell(props) {
  const [anchorEl, setAnchorEl] = useState(null);

  const classes = useStyles();

  const { items, menuId, filter, selectedItemId } = props;

  const label = selectedItemId === -1 ? props.children : items.find(i => i.id === selectedItemId).name;

  const className = selectedItemId === -1 ? null : classes.active;

  const handleClick = (itemId) => {
    setAnchorEl(null);
    filter(itemId);
  }

  const menuItems = items.map(i => {
    return (
      <MenuItem 
        key={i.id} 
        value={i.id} 
        onClick={() => handleClick(i.id)}>{i.name}</MenuItem>);
  });

  return (
    <TableCell className={className}>
      <div 
        className={classes.root} 
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={(e) => setAnchorEl(e.currentTarget)}>
        {label}
          <ArrowDropDownIcon className={classes.icon} />
      </div>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id={menuId}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}>
          <MenuItem 
            key={-1} 
            value={-1} 
            onClick={() => handleClick(-1)}>All</MenuItem>
          {menuItems}
      </Menu>
    </TableCell>
  );
}

export default TableFilterCell;
