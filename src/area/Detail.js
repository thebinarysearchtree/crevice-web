import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import styles from '../styles/dialog';
import { useClient } from '../auth';

const useStyles = makeStyles(styles);

function Detail(props) {
  const [name, setName] = useState('');
  const [locationId, setLocationId] = useState(-1);
  const [notes, setNotes] = useState('');

  const isDisabled = !name || locationId === -1;

  const classes = useStyles();
  const client = useClient();

  const { selectedArea, setSelectedArea, open, anchorEl, setAnchorEl } = props;

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
    setAnchorEl(null);
  }

  if (!selectedArea) {
    return null;
  }

  const area = { ...selectedArea, name, locationId, notes };

  const saveArea = async (e) => {
    e.preventDefault();
    setAnchorEl(null);
    if (area.id !== -1) {
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

  const title = area.id !== -1 ? 'Edit area' : 'Create a new area';

  const menuItems = props
    .locations
    .map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>);

  return (
    <Popover 
      className={classes.popover}
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: area.id === -1 ? 'right' : 'left'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: area.id === -1 ? 'right' : 'left'
      }}
      onClose={handleClose}
      disableRestoreFocus>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent className={classes.root}>
        <TextField
          className={classes.spacing}
          label="Area name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off" />
        <FormControl className={classes.spacing}>
          <InputLabel id="location">Location</InputLabel>
          <Select
            labelId="location"
            value={locationId === -1 ? '' : locationId}
            onChange={(e) => setLocationId(e.target.value)}>
              {menuItems}
          </Select>
        </FormControl>
        <TextField
          className={classes.spacing}
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          rows={4} />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose} 
          color="primary">Cancel</Button>
        <Button 
          onClick={saveArea} 
          variant="contained" 
          color="primary"
          disabled={isDisabled}>Save</Button>
      </DialogActions>
    </Popover>
  );
}

export default Detail;
