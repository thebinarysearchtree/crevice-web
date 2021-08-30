import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import useFetch from '../hooks/useFetch';
import Progress from '../common/Progress';
import Typography from '@material-ui/core/Typography';
import { addMonths, isWeekend, makePgDate, addDays } from '../utils/date';
import CalendarButtons from '../common/CalendarButtons';
import EditPopover from './EditPopover';
import AreaButton from './AreaButton';
import { makeReviver, dateParser } from '../utils/data';
import Details from './Details';
import useSyncParams from '../hooks/useSyncParams';
import useParamState from '../hooks/useParamState';
import Shift from '../common/Shift';

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
    borderLeft: '1px solid #ddd',
    overflowY: 'scroll'
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
  const getAreaById = (areaId) => locations.flatMap(l => l.areas).find(a => a.id === areaId);
  const [initialAreaId, setInitialAreaId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState([]);

  const [date, setDate, dateTranslator] = useParamState({ 
    name: 'date',
    to: (date) => date.getTime(),
    from: (dateMs) => new Date(dateMs),
    defaultValue: startDate 
  });
  const [selectedArea, setSelectedArea, areaTranslator, areaIdParam] = useParamState({
    name: 'areaId',
    to: (selectedArea) => selectedArea?.id || initialAreaId,
    from: getAreaById
  });
  const [selectedDay, setSelectedDay] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [detailsAnchorEl, setDetailsAnchorEl] = useState(null);

  const areaId = selectedArea?.id || initialAreaId || areaIdParam;
  const area = getAreaById(areaId);

  const open = Boolean(anchorEl);
  const detailsOpen = Boolean(detailsAnchorEl);

  const monthName = formatter.format(date);
  const year = date.getFullYear();

  const classes = useStyles();

  const monthStartTime = date;
  const monthEndTime = new Date(monthStartTime);
  monthEndTime.setMonth(monthEndTime.getMonth() + 1);
  monthEndTime.setDate(0);
  const timeZone = area?.timeZone || '';
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

  const makeDays = (queryResult) => {
    const { shifts, areaId } = queryResult[0];
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
    if (!initialAreaId) {
      setInitialAreaId(areaId);
    }
  }

  useSyncParams(areaId !== null, [areaTranslator, dateTranslator]);

  const locationsHandler = (locations) => setLocations(locations);
  const rolesHandler = (roles) => setRoles(roles);

  useFetch(setLoading, [
    { url: '/shifts/find', data: query, handler: makeDays, reviver },
    { url: '/areas/getWithLocation', handler: locationsHandler, once: true },
    { url: '/roles/getSelectListItems', handler: rolesHandler, once: true }
  ], [date, selectedArea]);

  if (!area) {
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
      return (
        <Shift 
          key={id}
          startTime={startTime} 
          endTime={endTime} 
          booked={booked} 
          capacity={capacity}
          selected={shift === selectedShift}
          onClick={(e) => handleShiftClick(e, shift)} />
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
      roles={roles}
      anchorEl={anchorEl}
      setAnchorEl={setAnchorEl}
      open={open} />) : null;
  const details = selectedShift ? (
    <Details
      area={area}
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
      </div>
    </div>
  );
}

export default List;
