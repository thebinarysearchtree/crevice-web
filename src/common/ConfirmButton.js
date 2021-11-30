import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const useStyles = makeStyles((theme) => ({
  root: {
    cursor: 'pointer'
  }
}));

function ConfirmButton(props) {
  const [open, setOpen] = useState(false);

  const classes = useStyles();

  const { title, content, onClick } = props;

  const handleButtonClick = (e) => {
    setOpen(false);
    onClick(e);
  }

  return (
    <React.Fragment>
      <span className={classes.root} onClick={() => setOpen(true)}>delete</span>
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
