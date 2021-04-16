import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { useHistory } from 'react-router-dom';

function ActionButton(props) {
  const [anchorEl, setAnchorEl] = useState(null);

  const history = useHistory();

  const { actions } = props;

  const menuItems = actions.map(a => {
    return (
      <MenuItem 
        key={a.name} 
        onClick={() => history.push(a.url)}>{a.name}</MenuItem>);
  });

  return (
    <React.Fragment>
      <Button 
        variant="contained" 
        color="primary"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-controls="action-menu">
          Actions
          <ArrowDropDownIcon />
      </Button>
      <Menu
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        id="action-menu"
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}>
          {menuItems}
      </Menu>
    </React.Fragment>
  );
}

export default ActionButton;
