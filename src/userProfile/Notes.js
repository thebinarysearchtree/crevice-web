import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import EditIcon from '@material-ui/icons/Edit';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import FormLayout from '../FormLayout';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center'
  },
  input: {
    backgroundColor: 'white'
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2)
  },
  cancel: {
    marginRight: theme.spacing(1)
  },
  form: {
    width: '300px'
  }
}));

function Notes(props) {
  const [notes, setNotes] = useState('');
  const [open, setOpen] = useState(false);

  const classes = useStyles();

  const { user, notes : existingNotes, onSave } = props;
  const { shift } = user;

  useEffect(() => {
    if (open) {
      setNotes(existingNotes || '');
    }
  }, [open, existingNotes]);

  const editButton = shift ? (
    <Tooltip title={existingNotes ? 'Edit notes' : 'Add notes'}>
      <IconButton onClick={() => setOpen(true)}>
        <EditIcon 
          color="action" 
          fontSize="small" />
      </IconButton>
    </Tooltip>
  ) : null;

  return (
    <React.Fragment>
      <div className={classes.root}>
        {editButton}
        <Typography variant="body1">{existingNotes}</Typography>
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullScreen
        transitionDuration={0}>
          <FormLayout title={existingNotes ? 'Edit notes' : 'Add notes'} onClose={() => setOpen(false)}>
            <div className={classes.form}>
              <TextField
                InputProps={{ className: classes.input }}
                className={classes.spacing}
                fullWidth
                label="Notes"
                variant="outlined"
                size="small"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={5} />
              <div className={classes.buttons}>
                <Button 
                  className={classes.cancel}
                  onClick={() => setOpen(false)} 
                  color="primary">Cancel</Button>
                <Button 
                  onClick={() => onSave(user, notes)} 
                  variant="contained"
                  color="primary" 
                  autoFocus
                  disabled={!notes}>Save</Button>
              </div>
            </div>
          </FormLayout>
      </Dialog>
    </React.Fragment>
  );
}

export default Notes;

