import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Popover from '@material-ui/core/Popover';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
  chip: {
    cursor: 'pointer'
  },
  popover: {
    marginTop: theme.spacing(1)
  }
}));

function NotesChip(props) {
  const [notesDraft, setNotesDraft] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const classes = useStyles();

  const { notes, setNotes } = props;

  const handleSave = () => {
    setNotes(notesDraft);
    setAnchorEl(null);
  }

  const handleClose = () => {
    setAnchorEl(null);
    setNotesDraft(notes);
  }

  return (
    <React.Fragment>
      <Chip 
        className={classes.chip} 
        label={notes ? 'Edit notes' : 'No notes'}
        onClick={(e) => setAnchorEl(e.currentTarget)} />
      <Popover
        className={classes.popover}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        onClose={handleClose}
        disableRestoreFocus>
        <DialogContent>
          <TextField
            label="Notes"
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            multiline
            rows={4} 
            autoFocus />
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}>Save</Button>
        </DialogActions>
      </Popover>
    </React.Fragment>
  );
}

export default NotesChip;
