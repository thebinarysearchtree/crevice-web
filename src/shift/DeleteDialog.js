import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

function DeleteDialog(props) {
  const { open, setOpen, onDelete } = props;

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">Delete shift</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This will also cancel any bookings for this shift.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpen(false)} 
            color="primary">Cancel</Button>
          <Button 
            onClick={onDelete} 
            variant="contained"
            color="secondary" 
            autoFocus>Delete</Button>
        </DialogActions>
    </Dialog>
  );
}

export default DeleteDialog;
