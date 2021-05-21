import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import useFetchMany from '../hooks/useFetchMany';
import Progress from '../common/Progress';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import Snackbar from '../common/Snackbar';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    marginBottom: theme.spacing(40)
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6)
  },
  heading: {
    display: 'flex',
    marginBottom: theme.spacing(2),
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  input: {
    width: '230px',
    marginBottom: '10px'
  },
  dayNames: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    width: '100%',
    marginBottom: '5px',
    '& > div': {
      textAlign: 'right',
      marginRight: '5px'
    }
  },
  calendar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    width: '100%',
    borderRight: '1px solid #ddd',
    borderBottom: '1px solid #ddd',
    '& > div': {
      display: 'flex',
      flexDirection: 'column',
      height: '130px',
      padding: '5px',
      borderTop: '1px solid #ddd',
      borderLeft: '1px solid #ddd'
    }
  },
  day: {
    display: 'flex',
    flexDirection: 'column',
    height: '130px',
    padding: '5px',
    borderTop: '1px solid #ddd',
    borderLeft: '1px solid #ddd'
  },
  dayNumber: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  today: {
    width: '20px',
    height: '20px',
    lineHeight: '20px',
    borderRadius: '50%',
    backgroundColor: 'red',
    color: 'white',
    textAlign: 'center'
  },
  weekDay: {
    backgroundColor: 'white'
  },
  weekend: {
    backgroundColor: theme.palette.grey[200]
  }
}));

const formatter = new Intl.DateTimeFormat('default', { month: 'long' });

const startDate = new Date();
const today = startDate.getDate();
startDate.setDate(1);
startDate.setHours(0, 0, 0, 0);

function List() {
  const [locations, setLocations] = useState([]);
  const [locationIndex, setLocationIndex] = useState(0);
  const [areaId, setAreaId] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [days, setDays] = useState([]);
  const [date, setDate] = useState(startDate);

  const monthName = formatter.format(date);
  const year = date.getFullYear();

  const classes = useStyles();

  const makeDays = (monthStartDate) => {
    let startDay = monthStartDate.getDay();
    const monthEndDate = new Date(monthStartDate.getFullYear(), monthStartDate.getMonth() + 1, 0);
    let daysInMonth = monthEndDate.getDate();
    const days = [];
    let dayNumber = 1;
    while (daysInMonth > 0) {
      for (let i = 0; i < 7; i++) {
        const isWeekend = i === 0 || i === 6;
        if (daysInMonth > 0 && startDay <= 0) {
          days.push({ type: 'day', dayNumber, isWeekend, shifts: [] });
        }
        else {
          days.push({ type: 'empty', isWeekend });
        }
        startDay--;
        if (startDay < 0) {
          dayNumber++;
          daysInMonth--;
        }
      }
    }
    setDays(days);
  }

  useEffect(() => {
    makeDays(date);
  }, []);

  const locationsHandler = (locations) => {
    setLocations(locations);
    setAreaId(locations[0].areas[0].id);
  }

  useFetchMany(setLoading, [
    { url: '/areas/getWithLocation', handler: locationsHandler }
  ]);

  if (loading) {
    return <Progress loading={loading} />;
  }

  const locationItems = locations.map((l, i) => <MenuItem key={l.id} value={i}>{l.name}</MenuItem>);
  const areaItems = locations[locationIndex].areas.map(a => <MenuItem key={a.id} value={a.id}>{a.abbreviation}</MenuItem>);

  const locationSelect = locations.length > 1 ? (
    <FormControl className={classes.input}>
      <InputLabel id="location-label">Location</InputLabel>
      <Select
        labelId="location-label"
        label="Location"
        value={locationIndex !== -1 ? locationIndex : ''}
        onChange={(e) => setLocationIndex(e.target.value)}>
          {locationItems}
      </Select>
    </FormControl>
  ) : null;

  const dayElements = days.map((day, i) => {
    const { type, dayNumber, isWeekend } = day;
    const dayClassName = isWeekend ? classes.weekend : classes.weekDay;
    const numberClassName = dayNumber === today ? classes.today : '';
    if (type === 'empty') {
      return <div key={`e${i}`} className={dayClassName}></div>;
    }
    return (
      <div key={`d${dayNumber}`} className={dayClassName}>
        <div className={classes.dayNumber}><div className={numberClassName}>{dayNumber}</div></div>
      </div>
    );
  });
  const calendar = <div className={classes.calendar}>{dayElements}</div>;

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.heading}>
          <Typography variant="h5">Shifts</Typography>
        </div>
        {locationSelect}
        <FormControl className={classes.input}>
          <InputLabel id="area-label">Area</InputLabel>
          <Select
            labelId="area-label"
            label="Area"
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}>
              {areaItems}
          </Select>
        </FormControl>
        <Typography variant="h6">{`${monthName} ${year}`}</Typography>
        <div className={classes.dayNames}>
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        {calendar}
        <Snackbar message={message} setMessage={setMessage} />
      </div>
    </div>
  );
}

export default List;
