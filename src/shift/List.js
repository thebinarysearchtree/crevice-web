import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import useFetchMany from '../hooks/useFetchMany';
import Progress from '../common/Progress';
import Typography from '@material-ui/core/Typography';
import Snackbar from '../common/Snackbar';
import { addMonths, isWeekend, getTimeString, makePgDate, addDays } from '../utils/date';
import CalendarButtons from '../common/CalendarButtons';
import Nav from '../Nav';
import AreasDrawer from './AreasDrawer';
import AddShift from './AddShift';
import Paper from '@material-ui/core/Paper';
import client from '../client';

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
    marginBottom: '4px',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  empty: {
    backgroundColor: '#ffcdd2'
  },
  full: {
    backgroundColor: '#c8e6c9'
  },
  partial: {
    backgroundColor: '#bbdefb'
  }
}));

const formatter = new Intl.DateTimeFormat('default', { month: 'long' });

const startDate = new Date();
startDate.setDate(1);
startDate.setHours(0, 0, 0, 0);

const today = new Date();
today.setHours(0, 0, 0, 0);

function List() {
  const [locations, setLocations] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [days, setDays] = useState([]);
  const [date, setDate] = useState(startDate);
  const [selectedDay, setSelectedDay] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [roles, setRoles] = useState([]);

  const open = Boolean(anchorEl);

  const monthName = formatter.format(date);
  const year = date.getFullYear();

  const classes = useStyles();

  const handleAreaClick = (area) => {
    setSelectedArea(area);
  }

  const handleDayClick = (e, day) => {
    setSelectedDay(day);
    setAnchorEl(e.currentTarget);
  }

  const handleAddShift = (shift) => {
    const dayNumber = shift.startTime.getDate();
    const updatedDays = [...days];
    const day = {...days[date.getDay() + dayNumber - 1] };
    day.shifts = [...day.shifts, shift].sort((s1, s2) => s1.startTime.getTime() - s2.startTime.getTime());
    setDays(updatedDays);
  }

  const makeDays = async (monthStartTime) => {
    const monthEndTime = new Date(monthStartTime);
    monthEndTime.setMonth(monthEndTime.getMonth() + 1);
    monthEndTime.setDate(0);
    const query = {
      areaId: selectedArea.id,
      startTime: makePgDate(monthStartTime, selectedArea.timeZone),
      endTime: makePgDate(monthEndTime, selectedArea.timeZone)
    }
    const promise = client.postData('/shifts/find', query);
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
    const response = await promise;
    if (response.ok) {
      const shifts = await response.json();
      for (const shift of shifts) {
        const { startTime, endTime } = shift;
        const start = new Date(startTime);
        const end = new Date(endTime);
        const day = days[date.getDay() + start.getDate() - 1];
        day.shifts.push({...shift, startTime: start, endTime: end });
      }
    }
    setDays(days);
  }

  useEffect(() => {
    if (selectedArea) {
      makeDays(date);
    }
  }, [date, selectedArea]);

  const locationsHandler = (locations) => {
    setLocations(locations);
    setSelectedArea(locations[0].areas[0]);
  }
  const rolesHandler = (roles) => setRoles(roles);

  useFetchMany(setLoading, [
    { url: '/areas/getWithLocation', handler: locationsHandler },
    { url: '/roles/getSelectListItems', handler: rolesHandler }
  ]);

  if (loading) {
    return <Progress loading={loading} />;
  }

  const dayElements = days.map((day, i) => {
    const dayNumber = day.date.getDate();
    const dayClassName = isWeekend(day.date) ? classes.weekend : classes.weekDay;
    const numberClassName = day.date.getTime() === today.getTime() ? classes.today : '';
    if (day.isDifferentMonth) {
      return <div key={`e${i}`} className={dayClassName}></div>;
    }
    const shifts = day.shifts.map(shift => {
      const { id, startTime, endTime, capacity, booked } = shift;
      const start = getTimeString(startTime);
      const end = getTimeString(endTime);
      const time = `${start} - ${end}`;
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
      return (
        <div key={id} className={`${classes.shift} ${className}`}>
          <Typography variant="body2">{time}</Typography>
        </div>
      );
    });
    return (
      <div 
        key={`d${dayNumber}`} 
        className={dayClassName}
        onClick={(e) => handleDayClick(e, day)}>
          <div className={classes.dayNumber}>
            <div className={numberClassName}>{dayNumber}</div>
          </div>
          <div>{shifts}</div>
      </div>
    );
  });
  const calendar = <div className={classes.calendar}>{dayElements}</div>;
  const drawer = (
    <AreasDrawer 
      selectedArea={selectedArea} 
      handleAreaClick={handleAreaClick} 
      locations={locations} />
  );

  return (
    <Nav drawer={drawer}>
      <div className={classes.root}>
        <div className={classes.content}>
          <div className={classes.toolbar}>
            <Typography variant="h4">{`${monthName} ${year}`}</Typography>
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
          <AddShift
            area={selectedArea}
            day={selectedDay}
            handleAddShift={handleAddShift}
            roles={roles}
            anchorEl={anchorEl}
            setAnchorEl={setAnchorEl}
            open={open}
            setMessage={setMessage} />
          <Snackbar message={message} setMessage={setMessage} />
        </div>
      </div>
    </Nav>
  );
}

export default List;
