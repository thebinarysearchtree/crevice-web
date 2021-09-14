import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import styles from '../styles/dialog';
import { useClient } from '../auth';
import useChanged from '../hooks/useChanged';

const useStyles = makeStyles(styles);

function Detail(props) {
  const [name, setName] = useState('');
  const [timeZone, setTimeZone] = useState('');
  const [address, setAddress] = useState('');
  const hasChanged = useChanged(props.open, [name, timeZone, address]);

  const isDisabled = !name || !timeZone || !hasChanged;

  const classes = useStyles();
  const client = useClient();

  const { selectedLocation, setSelectedLocation, open, anchorEl, setAnchorEl } = props;

  useEffect(() => {
    if (selectedLocation) {
      const { name, timeZone, address } = selectedLocation;

      setName(name);
      setTimeZone(timeZone);
      setAddress(address);
    }
  }, [selectedLocation]);

  const handleClose = () => {
    setSelectedLocation(null);
    setAnchorEl(null);
  }

  if (!selectedLocation) {
    return null;
  }

  const location = { ...selectedLocation, name, timeZone, address };

  const isUpdate = location.id !== -1;

  const saveLocation = async (e) => {
    e.preventDefault();
    handleClose();
    if (isUpdate) {
      await client.postMutation({
        url: '/locations/update',
        data: location,
        message: 'Location updated'
      });
    }
    else {
      await client.postMutation({
        url: '/locations/insert',
        data: location,
        message: 'Location created'
      });
    }
  }

  const title = isUpdate ? 'Edit location' : 'Create a new location';

  return (
    <Popover 
      className={classes.popover}
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: isUpdate ? 'left' : 'right'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: isUpdate ? 'left' : 'right'
      }}
      onClose={handleClose}
      disableRestoreFocus>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent className={classes.root}>
        <TextField
          className={classes.spacing}
          label="Location name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off" />
        <FormControl className={classes.spacing}>
          <InputLabel id="time-zone">Time zone</InputLabel>
          <Select
            labelId="time-zone"
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}>
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
          className={classes.spacing}
          label="Address (optional)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          multiline
          rows={4} />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose} 
          color="primary">Cancel</Button>
        <Button 
          onClick={saveLocation} 
          variant="contained" 
          color="primary"
          disabled={isDisabled}>{isUpdate ? 'Update' : 'Save'}</Button>
      </DialogActions>
    </Popover>
  );
}

export default Detail;
