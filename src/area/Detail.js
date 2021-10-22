import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { useClient } from '../auth';
import useChanged from '../hooks/useChanged';
import FormLayout from '../FormLayout';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '330px'
  },
  spacing: {
    marginBottom: theme.spacing(2)
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
  }
}));

function Detail(props) {
  const [name, setName] = useState('');
  const [locationId, setLocationId] = useState(-1);
  const [notes, setNotes] = useState('');
  const hasChanged = useChanged(props.selectedArea, [name, locationId, notes]);

  const isDisabled = !name || locationId === -1 || !hasChanged;

  const classes = useStyles();
  const client = useClient();

  const { selectedArea, setSelectedArea } = props;

  useEffect(() => {
    if (selectedArea) {
      const { name, locationId, notes } = selectedArea;

      setName(name);
      setLocationId(locationId);
      setNotes(notes);
    }
  }, [selectedArea]);

  const handleClose = () => {
    setSelectedArea(null);
  }

  if (!selectedArea) {
    return null;
  }

  const area = { ...selectedArea, name, locationId, notes };

  const isUpdate = area.id !== -1;

  const saveArea = async (e) => {
    e.preventDefault();
    if (isUpdate) {
      await client.postMutation({
        url: '/areas/update',
        data: area,
        message: 'Area updated'
      });
    }
    else {
      await client.postMutation({
        url: '/areas/insert',
        data: area,
        message: 'Area created'
      });
    }
    setSelectedArea(null);
  }

  const title = isUpdate ? 'Edit area' : 'Create a new area';

  const menuItems = props
    .locations
    .map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>);

  return (
    <Dialog 
      open={Boolean(selectedArea)}
      onClose={handleClose}
      fullScreen
      transitionDuration={0}>
        <FormLayout title={title} onClose={handleClose}>
          <div className={classes.root}>
            <TextField
              InputProps={{ className: classes.input }}
              className={classes.spacing}
              label="Area name"
              variant="outlined"
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off" />
            <FormControl className={`${classes.input} ${classes.spacing}`} variant="outlined" size="small">
              <InputLabel id="location">Location</InputLabel>
              <Select
                labelId="location"
                label="Location"
                value={locationId === -1 ? '' : locationId}
                onChange={(e) => setLocationId(e.target.value)}>
                  {menuItems}
              </Select>
            </FormControl>
            <TextField
              InputProps={{ className: classes.input }}
              label="Notes (optional)"
              variant="outlined"
              size="small"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              rows={4} />
            <div className={classes.buttons}>
              <Button 
                className={classes.cancel}
                onClick={handleClose} 
                color="primary">Cancel</Button>
              <Button 
                onClick={saveArea} 
                variant="contained" 
                color="primary"
                disabled={isDisabled}>{isUpdate ? 'Update' : 'Save'}</Button>
            </div>
          </div>
        </FormLayout>
    </Dialog>
  );
}

export default Detail;
