import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';

function ConfirmButton(props) {
  const [open, setOpen] = useState(false);

  const { title, content, onClick, className } = props;

  const handleButtonClick = (e) => {
    setOpen(false);
    onClick(e);
  }

  return (
    <React.Fragment>
      <Tooltip title="Delete">
        <IconButton className={className} onClick={() => setOpen(true)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
          <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {content}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpen(false)} 
              color="primary">Cancel</Button>
            <Button 
              onClick={handleButtonClick} 
              variant="contained"
              color="secondary" 
              autoFocus>Delete</Button>
          </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default ConfirmButton;
