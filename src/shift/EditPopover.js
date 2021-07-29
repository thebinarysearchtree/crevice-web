import React from 'react';
import Popover from '@material-ui/core/Popover';
import EditDialog from './EditDialog';

function EditPopover(props) {
  const { selectedDay, setSelectedDay, open, anchorEl, setAnchorEl } = props;
  
  const { date } = selectedDay;

  const handleClose = () => {
    setSelectedDay(null);
    setAnchorEl(null);
  }

  const leftPopover = date.getDay() > 3;

  return (
    <Popover 
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'center',
        horizontal: leftPopover ? 'left' : 'right'
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: leftPopover ? 'right' : 'left'
      }}
      onClose={handleClose}
      disableRestoreFocus>
        <EditDialog {...props} handleClose={handleClose} />
    </Popover>
  );
}

export default EditPopover;
