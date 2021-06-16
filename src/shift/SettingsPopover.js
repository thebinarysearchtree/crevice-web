import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import InputAdornment from '@material-ui/core/InputAdornment';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(1)
  },
  content: {
    display: 'flex',
    flexDirection: 'column'
  },
  spacing: {
    marginBottom: '10px'
  }
}));

function SettingsPopover(props) {
  const [cancelBeforeHours, setCancelBeforeHours] = useState(1);
  const [bookBeforeHours, setBookBeforeHours] = useState(1);
  const [canBookAndCancel, setCanBookAndCancel] = useState(true);
  const [canAssign, setCanAssign] = useState(false);
  const [canBeAssigned, setCanBeAssigned] = useState(false);

  const classes = useStyles();

  const { anchorEl, setAnchorEl, open, settings, setSettings } = props;

  const isDisabled = (canBookAndCancel && (cancelBeforeHours === '' || cancelBeforeHours < 0 || bookBeforeHours === '' || bookBeforeHours < 0));

  useEffect(() => {
    if (open) {
      const { cancelBeforeHours, bookBeforeHours, canBookAndCancel, canAssign, canBeAssigned } = settings;

      setCancelBeforeHours(cancelBeforeHours);
      setBookBeforeHours(bookBeforeHours);
      setCanBookAndCancel(canBookAndCancel);
      setCanAssign(canAssign);
      setCanBeAssigned(canBeAssigned);
    }
  }, [open]);

  const handleSave = () => {
    const settings = {
      cancelBeforeHours,
      bookBeforeHours,
      canBookAndCancel,
      canAssign,
      canBeAssigned
    };
    setSettings(settings);
    setAnchorEl(null);
  }

  return (
    <Popover
      className={classes.root}
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
      onClose={() => setAnchorEl(null)}
      disableRestoreFocus>
      <DialogContent className={classes.content}>
        <FormControlLabel
          className={classes.spacing}
          control={<Checkbox checked={canBookAndCancel} onChange={(e) => setCanBookAndCancel(e.target.checked)} />}
          label="Can book and cancel their own shifts?" />
        <TextField
          className={classes.spacing}
          type="number"
          label="Cancellation deadline"
          InputLabelProps={{ shrink: true }}
          InputProps={{ endAdornment: <InputAdornment>hours before start</InputAdornment> }}
          error={cancelBeforeHours < 0}
          helperText={cancelBeforeHours < 0 ? 'Must be a non-negative number' : ''}
          disabled={!canBookAndCancel}
          value={cancelBeforeHours}
          onChange={(e) => setCancelBeforeHours(e.target.value)} />
        <TextField
          className={classes.spacing}
          type="number"
          label="Booking deadline"
          InputLabelProps={{ shrink: true }}
          InputProps={{ endAdornment: <InputAdornment>hours before start</InputAdornment> }}
          error={bookBeforeHours < 0}
          helperText={bookBeforeHours < 0 ? 'Must be a non-negative number' : ''}
          disabled={!canBookAndCancel}
          value={bookBeforeHours}
          onChange={(e) => setBookBeforeHours(e.target.value)} />
        <FormControlLabel
          className={classes.spacing}
          control={<Checkbox checked={canAssign} onChange={(e) => setCanAssign(e.target.checked)} />}
          label="Can assign themselves to others?" />
        <FormControlLabel
          className={classes.spacing}
          control={<Checkbox checked={canBeAssigned} onChange={(e) => setCanBeAssigned(e.target.checked)} />}
          label="Can be assigned to others?" />
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={() => setAnchorEl(null)}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          disabled={isDisabled}
          onClick={handleSave}>Save</Button>
      </DialogActions>
    </Popover>
  );
}

export default SettingsPopover;
