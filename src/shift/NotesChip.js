import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Popover from '@material-ui/core/Popover';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
  chip: {
    cursor: 'pointer',
    maxWidth: '190px'
  },
  popover: {
    marginTop: theme.spacing(1)
  },
  activeChip: {
    backgroundColor: '#d3d3',
    '&:hover, &:focus': {
      backgroundColor: '#90caf9'
    }
  },
  notes: {
    width: '240px'
  }
}));

function NotesChip(props) {
  const [notesDraft, setNotesDraft] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const classes = useStyles();

  const { notes, setNotes } = props;

  useEffect(() => {
    if (open) {
      setNotesDraft(notes);
    }
  }, [open]);

  const handleSave = () => {
    setNotes(notesDraft);
    setAnchorEl(null);
  }

  const handleClose = () => {
    setNotes(notesDraft);
    setAnchorEl(null);
  }

  return (
    <React.Fragment>
      <Chip 
        className={notes ? `${classes.chip} ${classes.activeChip}` : classes.chip}
        label={notes ? 'Notes' : 'No notes'}
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
            className={classes.notes}
            label="Notes"
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            multiline
            rows={4} 
            autoFocus />
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={handleClose}>Close</Button>
        </DialogActions>
      </Popover>
    </React.Fragment>
  );
}

export default NotesChip;
