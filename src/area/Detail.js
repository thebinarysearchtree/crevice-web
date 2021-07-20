import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
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

const useStyles = makeStyles(styles);

function Detail(props) {
  const [name, setName] = useState('');
  const [locationId, setLocationId] = useState(-1);
  const [notes, setNotes] = useState('');

  const isDisabled = !name || locationId === -1;

  const { setAreas, setFilteredAreas, selectedArea, setSelectedArea, open, anchorEl, setAnchorEl, setMessage } = props;
  const classes = useStyles();

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
    const locationName = props
      .locations
      .find(l => l.id === area.locationId)
      .name;
    if (area.id !== -1) {
      const response = await client.postData('/areas/update', area);
      if (response.ok) {
        setAreas(areas => {
          const updatedAreas = areas.map(a => {
            if (a.id === area.id) {
              return { ...area, locationName };
            }
            return a;
          });
          setFilteredAreas(updatedAreas);
          return updatedAreas;
        });
        setMessage('Area updated');
      }
      else {
        setMessage('Something went wrong');
      }
    }
    else {
      const response = await client.postData('/areas/insert', area);
      if (response.ok) {
        const result = await response.json();
        const { areaId } = result;
        const savedArea = { ...area, id: areaId, locationName };
        setAreas(areas => {
          const newAreas = [...areas, savedArea];
          setFilteredAreas(newAreas);
          return newAreas;
        });
        setMessage('Area created');
      }
      else {
        setMessage('Something went wrong');
      }
    }
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
