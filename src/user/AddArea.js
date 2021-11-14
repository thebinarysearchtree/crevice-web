import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import FormLayout from '../FormLayout';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';

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
  },
  chip: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  location: {
    cursor: 'pointer'
  }
}));

function AddArea(props) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedAreaIds, setSelectedAreaIds] = useState([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState([]);

  const startError = startTime && endTime && startTime.getTime() > endTime.getTime();

  const classes = useStyles();

  const { existingAreas, handleAddAreas, roles, locations, open, setOpen } = props;

  const isDisabled = !selectedRole || selectedAreaIds.length === 0 || !startTime || isNaN(startTime.getTime()) || (endTime && isNaN(endTime.getTime())) || startError;

  useEffect(() => {
    if (open) {
      setSelectedRole(null);
      setStartTime(new Date());
      setEndTime(null);
      setIsAdmin(false);
      setSelectedAreaIds([]);
      setSelectedLocationIds([]);
    }
  }, [open]);

  const addAreas = async (e) => {
    e.preventDefault();
    const areas = selectedAreaIds.map(areaId => {
      const area = locations.flatMap(l => l.areas).find(a => a.id === areaId);
      return {
        role: selectedRole,
        area,
        startTime,
        endTime,
        isAdmin
      };
    });
    setOpen(false);
    handleAddAreas(areas);
  }

  const roleItems = roles.map(r => <MenuItem key={r.id} value={r}>{r.name}</MenuItem>);
  const areas = locations.map(location => {
    const { id, name, areas } = location;
    const overlappingAreaIds = startTime ? areas.map(a => a.id).filter(areaId => {
      return existingAreas.some(ua => 
        ua.area.id === areaId &&
        (!endTime || ua.startTime.getTime() <= endTime.getTime()) &&
        (!ua.endTime || ua.endTime.getTime() >= startTime.getTime()));
    }) : [];
    const locationAreaIds = areas.map(a => a.id).filter(areaId => !overlappingAreaIds.includes(areaId));
    const selected = selectedLocationIds.includes(id);
    const removeLocationId = (locationIds) => locationIds.filter(locationId => locationId !== id);
    const addLocationId = (locationIds) => [...locationIds, id];
    const removeOnClick = () => {
      setSelectedLocationIds(removeLocationId);
      setSelectedAreaIds(areaIds => areaIds.filter(areaId => !locationAreaIds.includes(areaId)));
    };
    const addOnClick = () => {
      setSelectedLocationIds(addLocationId);
      setSelectedAreaIds(areaIds => [...areaIds, ...locationAreaIds]);
    }
    const locationOnClick = selected ? removeOnClick : addOnClick;
    const chips = areas.map(area => {
      const { id, name } = area;
      const overlapping = overlappingAreaIds.includes(id);
      const selected = selectedAreaIds.includes(id);
      const removeAreaId = (areaIds) => areaIds.filter(areaId => areaId !== id);
      const addAreaId = (areaIds) => [...areaIds, id];
      const onClick = selected ? () => setSelectedAreaIds(removeAreaId) : () => setSelectedAreaIds(addAreaId);
      return (
        <Chip 
          key={id}
          className={classes.chip} 
          color={selected ? 'secondary' : 'default'}
          label={name}
          onClick={onClick}
          disabled={overlapping} />
      );
    });
    return (
      <React.Fragment key={id}>
        <Typography 
          className={classes.location} 
          variant="h6"
          onClick={locationOnClick}>{name}</Typography>
        <div className={classes.spacing}>{chips}</div>
      </React.Fragment>
    );
  });

  const buttonText = selectedAreaIds.length < 2 ? 'Add' : `Add ${selectedAreaIds.length} areas`;

  return (
    <Dialog 
      open={open}
      onClose={() => setOpen(false)}
      fullScreen
      transitionDuration={0}>
        <FormLayout title="Add areas" onClose={() => setOpen(false)}>
          <div className={classes.root}>
            <FormControl className={`${classes.input} ${classes.spacing}`} variant="outlined" size="small">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                label="Role"
                value={selectedRole ? selectedRole : ''}
                onChange={(e) => setSelectedRole(e.target.value)}>
                  {roleItems}
              </Select>
            </FormControl>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                InputProps={{ className: classes.input }}
                className={classes.spacing}
                disableToolbar
                variant="inline"
                format="dd/MM/yyyy"
                margin="none"
                id="start-date"
                label="Start date"
                inputVariant="outlined"
                size="small"
                error={startError}
                helperText={startError ? 'Start date must be before end date' : ''}
                value={startTime}
                onChange={(d) => setStartTime(d)}
                KeyboardButtonProps={{ 'aria-label': 'change start date' }}
                autoOk />
            </MuiPickersUtilsProvider>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                InputProps={{ className: classes.input }}
                className={classes.spacing}
                disableToolbar
                variant="inline"
                format="dd/MM/yyyy"
                margin="none"
                id="end-date"
                label="End date (optional)"
                inputVariant="outlined"
                size="small"
                value={endTime}
                onChange={(d) => setEndTime(d)}
                KeyboardButtonProps={{ 'aria-label': 'change end date' }}
                autoOk />
            </MuiPickersUtilsProvider>
            {areas}
            <FormControlLabel
              control={<Checkbox checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />}
              label="Is administrator for these areas?" />
            <div className={classes.buttons}>
              <Button 
                className={classes.cancel} 
                color="primary" 
                onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                variant="contained"
                color="primary"
                disabled={isDisabled}
                onClick={addAreas}>{buttonText}</Button>
            </div>
          </div>
        </FormLayout>
    </Dialog>
  );
}

export default AddArea;
