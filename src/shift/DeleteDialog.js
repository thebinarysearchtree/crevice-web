import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';

function DeleteDialog(props) {
  const [type, setType] = useState('shift');

  const { open, setOpen, onDelete, isSingle } = props;

  const options = isSingle ? null : (
    <FormControl component="fieldset">
      <RadioGroup name="type" value={type} onChange={(e) => setType(e.target.value)}>
        <FormControlLabel value="shift" control={<Radio />} label="Just this shift" />
        <FormControlLabel value="series" control={<Radio />} label="Entire series" />
      </RadioGroup>
    </FormControl>
  );

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
          {options}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpen(false)} 
            color="primary">Cancel</Button>
          <Button 
            onClick={() => onDelete(type)} 
            variant="contained"
            color="secondary" 
            autoFocus>Delete</Button>
        </DialogActions>
    </Dialog>
  );
}

export default DeleteDialog;
