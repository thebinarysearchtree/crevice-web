import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Snackbar from '../common/Snackbar';
import { useHistory } from 'react-router-dom';
import BackButton from '../common/BackButton';
import Progress from '../common/Progress';
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
import useFetchMany from '../hooks/useFetchMany';
import FormGroup from '@material-ui/core/FormGroup';
import FormHelperText from '@material-ui/core/FormHelperText';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
    alignItems: 'center'
  },
  content: {
    flexDirection: 'column'
  },
  heading: {
    display: 'flex',
    marginBottom: theme.spacing(3),
    justifyContent: 'space-between'
  },
  header: {
    display: 'flex',
    alignItems: 'center'
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2)
  },
  container: {
    display: 'flex'
  },
  short: {
    width: '200px'
  },
  button: {
    marginTop: theme.spacing(2),
    alignSelf: 'flex-start'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  spacing: {
    marginBottom: theme.spacing(2)
  },
  email: {
    width: '416px'
  },
  avatar: {
    width: '150px',
    height: '150px'
  },
  upload: {
    display: 'none'
  },
  mr: {
    marginRight: theme.spacing(2)
  },
  input: {
    backgroundColor: 'white'
  },
  areasContainer: {
    marginBottom: theme.spacing(4)
  },
  location: {
    marginBottom: theme.spacing(1)
  }
}));

function AddArea(props) {
  const [roleIndex, setRoleIndex] = useState(-1);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState('');
  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [locationIndex, setLocationIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [overlappingError, setOverlappingError] = useState(false);

  const startError = startTime && endTime && startTime.getTime() > endTime.getTime();

  const history = useHistory();
  const classes = useStyles();

  const { setShowAddArea, setUserAreas } = props;

  const selectedAreaCount = locations.flatMap(l => l.areas).filter(a => a.checked).length;
  const isDisabled = roleIndex === -1 || selectedAreaCount === 0 || !startTime || isNaN(startTime.getTime());

  const addAreas = (e) => {
    e.preventDefault();
    const role = roles[roleIndex];
    const userAreas = locations
      .flatMap(l => l.areas)
      .filter(a => a.checked)
      .map(a => {
        const { checked, ...area } = a;
        return {
          role,
          area,
          startTime,
          endTime,
          isAdmin
        }
      });
    let hasError = false;
    for (const userArea of userAreas) {
      const area = userArea.area;
      const overlapping = props.userAreas.some(ua => 
        ua.area.id === area.id &&
        (!endTime || ua.startTime.getTime() <= endTime.getTime()) &&
        (!ua.endTime || ua.endTime.getTime() >= startTime.getTime()));
      if (overlapping) {
        hasError = true;
        break;
      }
    }
    if (hasError) {
      setOverlappingError(true);
    }
    else {
      setUserAreas(a => [...a, ...userAreas]);
      setShowAddArea(false);
    }
  }

  const handleCheckArea = (e, locationIndex, areaIndex) => {
    setLocations(locations => {
      const location = locations[locationIndex];
      const area = location.areas[areaIndex];
      area.checked = e.target.checked;
      location.areas = [...location.areas];
      return [...locations];
    });
  }

  const handleSelectAll = (e) => {
    setLocations(locations => {
      const location = locations[locationIndex];
      const checked = e.target.checked;
      location.checked = checked;
      location.areas = location.areas.map(a => ({...a, checked }));
      return [...locations];
    });
  }

  const rolesHandler = (roles) => setRoles(roles);
  const locationsHandler = (locations) => {
    locations = locations.map(location => {
      location = {...location, checked: false };
      location.areas = location.areas.map(a => ({...a, checked: false }));
      return location;
    })
    setLocations(locations);
    setLocationIndex(0);
  };

  useFetchMany(setLoading, [
    { url: '/roles/getSelectListItems', handler: rolesHandler },
    { url: '/areas/getWithLocation', handler: locationsHandler }]);

  if (loading) {
    return <Progress setLoading={setLoading} />;
  }

  const roleItems = roles.map((r, i) => <MenuItem key={r.id} value={i}>{r.name}</MenuItem>);
  const locationItems = locations.map((l, i) => <MenuItem key={l.name} value={i}>{l.name}</MenuItem>);
  const areaItems = locationIndex !== -1 ? locations[locationIndex].areas.map((area, areaIndex) => {
    const { id, name, abbreviation, checked } = area;
    return (
      <FormControlLabel
        key={id}
        control={<Checkbox checked={checked} onChange={(e) => handleCheckArea(e, locationIndex, areaIndex)} />}
        label={`${abbreviation} ${name}`} />
    );
  }) : null;

  const allAreas = locationIndex !== -1 ? (
    <FormControlLabel
      control={<Checkbox checked={locations[locationIndex].checked} onChange={handleSelectAll} />}
      label="Select all areas" />
  ) : null;

  const areasContainer = locationIndex !== -1 ? (
    <FormGroup className={classes.areasContainer}>
      {allAreas}
      {areaItems}
    </FormGroup>
  ) : null;

  let addButtonText;
  if (selectedAreaCount === 0) {
    addButtonText = 'Add';
  }
  else if (selectedAreaCount === 1) {
    addButtonText = 'Add 1 area';
  }
  else {
    addButtonText = `Add ${selectedAreaCount} areas`;
  }

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.heading}>
          <div className={classes.header}>
            <BackButton onClick={() => setShowAddArea(false)} />
            <Typography variant="h4">Add areas</Typography>
          </div>
        </div>
        <form className={classes.form} onSubmit={addAreas} noValidate>
          <FormControl 
            className={classes.spacing}
            variant="outlined"
            size="small">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                inputProps={{ className: classes.input }}
                labelId="role-label"
                label="Role"
                value={roleIndex !== -1 ? roleIndex : ''}
                onChange={(e) => setRoleIndex(e.target.value)}>
                  {roleItems}
              </Select>
          </FormControl>
          <FormControl 
            className={classes.location}
            variant="outlined"
            size="small">
              <InputLabel id="location-label">Location</InputLabel>
              <Select
                inputProps={{ className: classes.input }}
                labelId="location-label"
                label="Location"
                value={locationIndex !== -1 ? locationIndex : ''}
                onChange={(e) => setLocationIndex(e.target.value)}>
                  {locationItems}
              </Select>
          </FormControl>
          {areasContainer}
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
              KeyboardButtonProps={{ 'aria-label': 'change start date' }} />
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
              KeyboardButtonProps={{ 'aria-label': 'change end date' }} />
          </MuiPickersUtilsProvider>
          <FormControlLabel
            className={classes.spacing}
            control={<Checkbox checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />}
            label="Is administrator for these areas?" />
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            type="submit"
            disabled={isDisabled}
            onBlur={() => setOverlappingError(false)}>{addButtonText}</Button>
          <FormHelperText error={overlappingError}>{overlappingError ? 'The same areas cannot overlap in time' : ''}</FormHelperText>
        </form>
        <Snackbar message={message} setMessage={setMessage} />
      </div>
    </div>
  );
}

export default AddArea;
