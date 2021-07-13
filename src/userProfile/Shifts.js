import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import useFetchMany from '../hooks/useFetchMany';
import Progress from '../common/Progress';
import Typography from '@material-ui/core/Typography';
import { addMonths, isWeekend, getTimeString, makePgDate, addDays, overlaps } from '../utils/date';
import CalendarButtons from '../common/CalendarButtons';
import Paper from '@material-ui/core/Paper';
import client from '../client';
import { useParams } from 'react-router-dom';
import { makeReviver, dateParser } from '../utils/data';
import AvailableShifts from './AvailableShifts';
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
  available: {
    backgroundColor: '#e3f2fd'
  }
}));

const formatter = new Intl.DateTimeFormat('default', { month: 'long' });
const reviver = makeReviver(dateParser);

const startDate = new Date();
startDate.setDate(1);
startDate.setHours(0, 0, 0, 0);

const today = new Date();
today.setHours(0, 0, 0, 0);

function Shifts() {
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState([]);
  const [date, setDate] = useState(startDate);
  const [selectedDay, setSelectedDay] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [message, setMessage] = useState('');

  const open = Boolean(anchorEl);

  const monthName = formatter.format(date);
  const year = date.getFullYear();

  const classes = useStyles();

  const { userId } = useParams();

  const handleDayClick = (e, day) => {
    setSelectedDay(day);
    setAnchorEl(e.currentTarget);
  }

  const makeDays = async () => {
    const monthStartTime = date;
    const monthEndTime = new Date(monthStartTime);
    monthEndTime.setMonth(monthEndTime.getMonth() + 1);
    monthEndTime.setDate(0);
    const query = {
      userId,
      startTime: addDays(monthStartTime, -1),
      endTime: addDays(monthEndTime, 1)
    };
    const promise = client.postData('/shifts/getAvailableShifts', query);
    const calendarStart = addDays(monthStartTime, -monthStartTime.getDay());
    const calendarEnd = addDays(monthEndTime, 6 - monthEndTime.getDay());
    const days = [];
    let currentDate = calendarStart;
    while (currentDate.getTime() <= calendarEnd.getTime()) {
      days.push({ 
        date: currentDate, 
        isDifferentMonth: currentDate.getMonth() !== monthStartTime.getMonth(),
        bookedShifts: [],
        availableShifts: []
      });
      currentDate = addDays(currentDate, 1);
    }
    const response = await promise;
    if (response.ok) {
      const text = await response.text();
      const shifts = JSON.parse(text, reviver);
      const booked = shifts.filter(s => s.booked);
      const available = shifts
        .filter(s => !s.booked)
        .filter(s => !overlaps(s, booked));
      const filteredShifts = booked.concat(available);
      for (const shift of filteredShifts) {
        const { startTime } = shift;
        if (startTime.getMonth() !== date.getMonth()) {
          continue;
        }
        const day = days[date.getDay() + startTime.getDate() - 1];
        if (shift.booked) {
          day.bookedShifts.push(shift);
        }
        else {
          day.availableShifts.push(shift);
        }
      }
    }
    setDays(days);
  }

  useEffect(() => {
    makeDays();
  }, [date]);

  if (loading) {
    return <Progress loading={loading} />;
  }

  const dayElements = days.map((day, i) => {
    const dayNumber = day.date.getDate();
    const available = day.availableShifts.length > 0;
    const dayClassName = available > 0 ? classes.available : (isWeekend(day.date) ? classes.weekend : classes.weekDay);
    const numberClassName = day.date.getTime() === today.getTime() ? classes.today : '';
    if (day.isDifferentMonth) {
      return <div key={`e${i}`} className={dayClassName}></div>;
    }
    return (
      <div 
        key={`d${dayNumber}`} 
        className={dayClassName}
        onClick={available ? (e) => handleDayClick(e, day) : null}>
          <div className={classes.dayNumber}>
            <div className={numberClassName}>{dayNumber}</div>
          </div>
      </div>
    );
  });
  const calendar = <div className={classes.calendar}>{dayElements}</div>;
  const availableShifts = selectedDay ? (
    <AvailableShifts
      setMessage={setMessage}
      makeDays={makeDays}
      userId={userId}
      date={selectedDay.date}
      shifts={selectedDay.availableShifts}
      anchorEl={anchorEl}
      setAnchorEl={setAnchorEl}
      open={open} />
  ) : null;

  return (
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
      </div>
      {availableShifts}
      <Snackbar message={message} setMessage={setMessage} />
    </div>
  );
}

export default Shifts;
