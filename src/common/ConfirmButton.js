import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

function ConfirmButton(props) {
  const [open, setOpen] = useState(false);

  const { name, color, title, content, onClick, className } = props;

  const handleButtonClick = (e) => {
    setOpen(false);
    onClick(e);
  }

  return (
    <div className={className}>
      <Button 
        variant="contained" 
        color={color}
        onClick={() => setOpen(true)}>{name}</Button>
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
            <Button onClick={() => setOpen(false)} color="primary">Cancel</Button>
            <Button onClick={handleButtonClick} color="primary" autoFocus>{name}</Button>
          </DialogActions>
      </Dialog>
    </div>
  );
}

export default ConfirmButton;
