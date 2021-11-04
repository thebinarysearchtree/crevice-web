import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import { useClient } from '../auth';
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
  const [timeZone, setTimeZone] = useState('');
  const [address, setAddress] = useState('');
  const [changedCount, setChangedCount] = useState(0);

  const hasChanged = changedCount > 1;

  const isDisabled = !name || !timeZone || !hasChanged;

  const classes = useStyles();
  const client = useClient();

  const { selectedLocation, setSelectedLocation } = props;

  useEffect(() => {
    if (selectedLocation) {
      const { name, timeZone, address } = selectedLocation;

      setName(name);
      setTimeZone(timeZone);
      setAddress(address);
      setChangedCount(0);
    }
  }, [selectedLocation]);

  useEffect(() => {
    setChangedCount(count => count + 1);
  }, [name, timeZone, address]);

  const handleClose = () => {
    setSelectedLocation(null);
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
    <Dialog 
      open={Boolean(selectedLocation)}
      onClose={handleClose}
      fullScreen
      transitionDuration={0}>
        <FormLayout title={title} onClose={handleClose}>
          <div className={classes.root}>
            <TextField
              InputProps={{ className: classes.input }}
              className={classes.spacing}
              variant="outlined"
              size="small"
              label="Location name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off" />
            <FormControl className={`${classes.input} ${classes.spacing}`} variant="outlined" size="small">
              <InputLabel id="time-zone">Time zone</InputLabel>
              <Select
                labelId="time-zone"
                label="Time zone"
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
              InputProps={{ className: classes.input }}
              variant="outlined"
              size="small"
              label="Address (optional)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              multiline
              rows={4} />
            <div className={classes.buttons}>
              <Button 
                className={classes.cancel}
                onClick={handleClose} 
                color="primary">Cancel</Button>
              <Button 
                onClick={saveLocation} 
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
