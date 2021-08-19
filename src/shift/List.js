import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import useFetchMany from '../hooks/useFetchMany';
import Progress from '../common/Progress';
import Typography from '@material-ui/core/Typography';
import Snackbar from '../common/Snackbar';
import { addMonths, isWeekend, getTimeString, makePgDate, addDays } from '../utils/date';
import CalendarButtons from '../common/CalendarButtons';
import EditPopover from './EditPopover';
import client from '../client';
import AreaButton from './AreaButton';
import { makeReviver, dateParser } from '../utils/data';
import Details from './Details';
import { useLocation, useHistory } from 'react-router-dom';
import useScrollRestore from '../hooks/useScrollRestore';
import cache from '../cache';
import useSyncParams from '../hooks/useSyncParams';

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
    borderBottom: '1px solid #ddd'
  },
  day: {
    display: 'flex',
    flexDirection: 'column',
    height: '139px',
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
  },
  selectedDay: {
    backgroundColor: theme.palette.grey[100]
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1)
  },
  shift: {
    width: '100px',
    padding: '4px',
    marginBottom: theme.spacing(1),
    borderRadius: '5px',
    cursor: 'pointer'
  },
  empty: {
    backgroundColor: '#ffcdd2',
    '&$selected': {
      border: '2px solid #b71c1c'
    }
  },
  full: {
    backgroundColor: '#c8e6c9',
    '&$selected': {
      border: '2px solid #1b5e20'
    }
  },
  partial: {
    backgroundColor: '#bbdefb',
    '&$selected': {
      border: '2px solid #0d47a1'
    }
  },
  selected: {
    marginTop: '-2px',
    marginBottom: '6px',
    paddingLeft: '2px'
  },
  grow: {
    flexGrow: 1
  },
  loading: {
    height: '2000px'
  }
}));

const formatter = new Intl.DateTimeFormat('default', { month: 'long' });
const reviver = makeReviver(dateParser);

const startDate = new Date();
startDate.setDate(1);
startDate.setHours(0, 0, 0, 0);

const today = new Date();
today.setHours(0, 0, 0, 0);

function List() {
  const [locations, setLocations] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [initialArea, setInitialArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [days, setDays] = useState([]);

  const location = useLocation();

  const params = new URLSearchParams(location.search);

  const areaIdParam = parseInt(params.get('areaId')) || null;
  const dateParam = parseInt(params.get('date')) || null;

  const [date, setDate] = useState(dateParam ? new Date(dateParam) : startDate);
  const [selectedDay, setSelectedDay] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [detailsAnchorEl, setDetailsAnchorEl] = useState(null);

  const currentUrl = `${location.pathname}${location.search}`;

  const area = selectedArea ? selectedArea : initialArea;

  const open = Boolean(anchorEl);
  const detailsOpen = Boolean(detailsAnchorEl);

  const monthName = formatter.format(date);
  const year = date.getFullYear();

  const classes = useStyles();
  const history = useHistory();

  useScrollRestore();

  const monthStartTime = date;
  const monthEndTime = new Date(monthStartTime);
  monthEndTime.setMonth(monthEndTime.getMonth() + 1);
  monthEndTime.setDate(0);
  const timeZone = area ? area.timeZone : '';
  const areaId = area ? area.id : areaIdParam;
  const query = {
    areaId,
    startTime: makePgDate(monthStartTime, timeZone),
    endTime: makePgDate(monthEndTime, timeZone)
  };

  const handleDayClick = (e, day) => {
    setSelectedDay(day);
    setAnchorEl(e.currentTarget);
  }

  const handleShiftClick = (e, shift) => {
    e.stopPropagation();
    setSelectedShift(shift);
    setDetailsAnchorEl(e.currentTarget);
  }

  const makeDays = (shifts) => {
    const calendarStart = addDays(monthStartTime, -monthStartTime.getDay());
    const calendarEnd = addDays(monthEndTime, 6 - monthEndTime.getDay());
    const days = [];
    let currentDate = calendarStart;
    while (currentDate.getTime() <= calendarEnd.getTime()) {
      days.push({ 
        date: currentDate, 
        isDifferentMonth: currentDate.getMonth() !== monthStartTime.getMonth(), 
        shifts: [] 
      });
      currentDate = addDays(currentDate, 1);
    }
    for (const shift of shifts) {
      const { startTime } = shift;
      const day = days[date.getDay() + startTime.getDate() - 1];
      day.shifts.push(shift);
      if (selectedShift && selectedShift.id === shift.id) {
        setSelectedShift(shift);
      }
    }
    setDays(days);
  }

  useSyncParams(area, [
    { 
      name: 'areaId', 
      state: area?.id, 
      param: areaIdParam, 
      reviver: (param) => setSelectedArea(locations.flatMap(l => l.areas).find(a => a.id === param))
    },
    {
      name: 'date',
      state: date.getTime(),
      param: dateParam,
      reviver: (param) => setDate(new Date(param))
    }
  ]);

  /*useEffect(() => {
    if (area) {
      if (areaIdParam && areaIdParam !== area.id) {
        const area = locations.flatMap(l => l.areas).find(a => a.id === areaIdParam);
        setSelectedArea(area);
      }
      if (dateParam && dateParam !== date.getTime()) {
        setDate(new Date(dateParam));
      }
    }
  }, [location]);

  useEffect(() => {
    if (area) {
      updateUrl();
    }
  }, [date, area]);

  const updateUrl = () => {
    const params = new URLSearchParams();
    params.append('areaId', area.id);
    params.append('date', date.getTime());
    const search = params.toString();
    const url = `${location.pathname}?${search}`;
    if (url !== currentUrl) {
      if (location.search === '') {
        history.replace(url);
      }
      else {
        history.push(url);
      }
    }
  }*/

  const locationsHandler = (locations) => {
    setLocations(locations);
    setInitialArea(areaIdParam ? locations.flatMap(l => l.areas).find(a => a.id === areaIdParam) : locations[0].areas[0]);
  }
  const rolesHandler = (roles) => setRoles(roles);

  useFetchMany(setLoading, [
    { url: '/shifts/find', data: query, handler: makeDays, reviver },
    { url: '/areas/getWithLocation', handler: locationsHandler, once: true },
    { url: '/roles/getSelectListItems', handler: rolesHandler, once: true }
  ], [date, selectedArea]);

  if (loading) {
    return <Progress loading={loading} />;
  }

  const dayElements = days.map((day, i) => {
    const dayNumber = day.date.getDate();
    let dayClassName;
    if (selectedDay && selectedDay.date.getTime() === day.date.getTime()) {
      dayClassName = classes.selectedDay;
    }
    else if (isWeekend(day.date)) {
      dayClassName = classes.weekend;
    }
    else {
      dayClassName = classes.weekDay;
    }
    const numberClassName = day.date.getTime() === today.getTime() ? classes.today : '';
    if (day.isDifferentMonth) {
      return <div key={`e${i}`} className={`${classes.day} ${dayClassName}`}></div>;
    }
    const shifts = day.shifts.map(shift => {
      const { id, startTime, endTime, capacity, booked } = shift;
      const start = getTimeString(startTime);
      const end = getTimeString(endTime);
      const time = `${start} - ${end}`;
      const selected = shift === selectedShift;
      let className;
      if (booked === 0) {
        className = classes.empty;
      }
      else if (booked === capacity) {
        className = classes.full;
      }
      else {
        className = classes.partial;
      }
      if (selected) {
        className += ` ${classes.selected}`;
      }
      return (
        <div 
          key={id} 
          className={`${classes.shift} ${className}`}
          onClick={(e) => handleShiftClick(e, shift)}>
            <Typography variant="body2">{time}</Typography>
        </div>
      );
    });
    return (
      <div 
        key={`d${dayNumber}`} 
        className={`${classes.day} ${dayClassName}`}
        onClick={(e) => handleDayClick(e, day)}>
          <div className={classes.dayNumber}>
            <div className={numberClassName}>{dayNumber}</div>
          </div>
          <div>{shifts}</div>
      </div>
    );
  });
  const calendar = <div className={classes.calendar}>{dayElements}</div>;
  
  const addShift = selectedDay ? (
    <EditPopover
      area={area}
      selectedDay={selectedDay}
      setSelectedDay={setSelectedDay}
      makeDays={makeDays}
      roles={roles}
      anchorEl={anchorEl}
      setAnchorEl={setAnchorEl}
      open={open}
      setMessage={setMessage} />) : null;
  const details = selectedShift ? (
    <Details
      area={area}
      setMessage={setMessage}
      makeDays={makeDays}
      selectedShift={selectedShift}
      setSelectedShift={setSelectedShift}
      anchorEl={detailsAnchorEl}
      setAnchorEl={setDetailsAnchorEl}
      open={detailsOpen} />
  ) : null;

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.toolbar}>
          <Typography variant="h4">{`${monthName} ${year}`}</Typography>
          <div className={classes.grow} />
          <AreaButton selectedArea={area} setSelectedArea={setSelectedArea} locations={locations} />
          <CalendarButtons
            onBack={() => setDate(date => addMonths(date, -1))}
            onToday={() => setDate(startDate)}
            onForward={() => setDate(date => addMonths(date, 1))} />
        </div>
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
        {addShift}
        {details}
        <Snackbar message={message} setMessage={setMessage} />
      </div>
    </div>
  );
}

export default List;
