import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import makeInputHandler from '../common/input';
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
  const [area, setArea] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    setArea(props.selectedArea);
    setIsDisabled(true);
  }, [props.selectedArea]);

  const { setAreas, setFilteredAreas, open, setOpen, setMessage } = props;
  const classes = useStyles();

  const handleInputChange = makeInputHandler(
    setArea, 
    setIsDisabled, 
    (a) => a.name && a.abbreviation && a.locationId !== -1);

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

  if (!area) {
    return null;
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
          name="name"
          label="Area name"
          value={area.name}
          onChange={handleInputChange}
          autoComplete="off" />
        <TextField
          className={classes.formControl}
          name="abbreviation"
          label="Abbreviation"
          value={area.abbreviation}
          onChange={handleInputChange}
          autoComplete="off" />
        <FormControl className={classes.formControl}>
          <InputLabel id="location">Location</InputLabel>
          <Select
            name="locationId"
            labelId="location"
            value={area.locationId === -1 ? '' : area.locationId}
            onChange={handleInputChange}>
              {menuItems}
          </Select>
        </FormControl>
        <TextField
          className={classes.formControl}
          name="notes"
          label="Notes (optional)"
          value={area.notes}
          onChange={handleInputChange}
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
