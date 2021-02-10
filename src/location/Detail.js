import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useClient } from '../client';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

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
  const [location, setLocation] = useState(null);

  useEffect(() => {
    setLocation(props.selectedLocation);
  }, [props.selectedLocation]);

  const { setLocations, open, setOpen, setMessage } = props;
  const client = useClient();
  const classes = useStyles();

  const handleInputChange = (e) => {
    const name = e.target.name;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    setLocation(l => ({ ...l, [name] : value }));
  }

  const saveLocation = async (e) => {
    e.preventDefault();
    setOpen(false);
    if (location.id !== -1) {
      const result = await client.postData('/locations/update', { location });
      if (result) {
        setLocations(locations => locations.map(l => {
          if (l.id === location.id) {
            return { ...location };
          }
          return l;
        }));
        setMessage('Location updated');
      }
      else {
        setMessage('Something went wrong');
      }
    }
    else {
      const result = await client.postData('/locations/insert', { location });
      if (result) {
        const { locationId } = result;
        const savedLocation = { ...location, id: locationId };
        setLocations(locations => [savedLocation, ...locations]);
        setMessage('Location created');
      }
      else {
        setMessage('Something went wrong');
      }
    }
  }

  if (!location) {
    return null;
  }

  const title = location.id !== -1 ? 'Edit location' : 'Create a new location';

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
          label="Location name"
          value={location.name}
          onChange={handleInputChange}
          autoComplete="off" />
        <FormControl className={classes.formControl}>
          <InputLabel id="time-zone">Time zone</InputLabel>
          <Select
            name="timeZone"
            labelId="time-zone"
            value={location.timeZone}
            onChange={handleInputChange}>
              <MenuItem value="Australia/Adelaide">Adelaide</MenuItem>
              <MenuItem value="Australia/Brisbane">Brisbane</MenuItem>
              <MenuItem value="Australia/Broken_Hill">Broken Hill</MenuItem>
              <MenuItem value="Australia/Darwin">Darwin</MenuItem>
              <MenuItem value="Australia/Eucla">Eucla</MenuItem>
              <MenuItem value="Australia/Hobart">Hobart</MenuItem>
              <MenuItem value="Australia/Lindeman">Lindeman</MenuItem>
              <MenuItem value="Australia/Lord_Howe">Lord Howe Island</MenuItem>
              <MenuItem value="Australia/Melbourne">Melbourne</MenuItem>
              <MenuItem value="Australia/Perth">Perth</MenuItem>
              <MenuItem value="Australia/Sydney">Sydney</MenuItem>
          </Select>
        </FormControl>
        <TextField
          className={classes.formControl}
          name="address"
          label="Address (optional)"
          value={location.address}
          onChange={handleInputChange}
          multiline
          rows={4} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)} color="primary">Cancel</Button>
        <Button onClick={saveLocation} variant="contained" color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default Detail;
