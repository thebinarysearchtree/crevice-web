import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme) => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '330px'
  },
  formControl: {
    marginBottom: '10px'
  }
}));

function Detail(props) {
  const [name, setName] = useState('');
  const [abbreviation, setAbbreviation] = useState('');
  const [locationId, setLocationId] = useState(-1);
  const [notes, setNotes] = useState('');

  const isDisabled = !name || !abbreviation || locationId === -1;

  useEffect(() => {
    if (props.selectedArea) {
      const { name, abbreviation, locationId, notes } = props.selectedArea;

      setName(name);
      setAbbreviation(abbreviation);
      setLocationId(locationId);
      setNotes(notes);
    }
  }, [props.selectedArea]);

  const { setAreas, setFilteredAreas, open, setOpen, setMessage } = props;
  const classes = useStyles();

  if (!props.selectedArea) {
    return null;
  }

  const area = { ...props.selectedArea, name, abbreviation, locationId, notes };

  const saveArea = async (e) => {
    e.preventDefault();
    setOpen(false);
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
    <Dialog 
      open={open} 
      onClose={() => setOpen(false)} 
      aria-labelledby="dialog-title">
      <DialogTitle id="dialog-title">{title}</DialogTitle>
      <DialogContent className={classes.form}>
        <TextField
          className={classes.formControl}
          label="Area name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off" />
        <TextField
          className={classes.formControl}
          label="Abbreviation"
          value={abbreviation}
          onChange={(e) => setAbbreviation(e.target.value)}
          autoComplete="off" />
        <FormControl className={classes.formControl}>
          <InputLabel id="location">Location</InputLabel>
          <Select
            labelId="location"
            value={locationId === -1 ? '' : locationId}
            onChange={(e) => setLocationId(e.target.value)}>
              {menuItems}
          </Select>
        </FormControl>
        <TextField
          className={classes.formControl}
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          rows={4} />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => setOpen(false)} 
          color="primary">Cancel</Button>
        <Button 
          onClick={saveArea} 
          variant="contained" 
          color="primary"
          disabled={isDisabled}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default Detail;
