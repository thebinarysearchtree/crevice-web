import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import useFetchMany from '../hooks/useFetchMany';
import Progress from '../common/Progress';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import EditPeriod from './EditPeriod';
import AddArea from '../user/AddArea';
import { makeAreaDate } from '../utils/date';
import Snackbar from '../common/Snackbar';
import Typography from '@material-ui/core/Typography';
import CalendarButtons from '../common/CalendarButtons';
import { parse } from '../utils/data';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(7),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3)
  },
  sections: {
    display: 'flex',
    height: '30px',
    overflow: 'hidden'
  },
  section: {
    height: '100%'
  },
  filled: {
    cursor: 'pointer'
  },
  area: {
    display: 'flex',
    marginBottom: theme.spacing(3)
  },
  areaName: {
    width: '100px',
    lineHeight: '30px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginRight: theme.spacing(1),
    textAlign: 'right'
  },
  months: {
    display: 'flex',
    marginBottom: theme.spacing(2)
  },
  toolbar: {
    display: 'flex',
    marginBottom: theme.spacing(2),
    alignItems: 'center',
    width: '838px'
  },
  year: {
    marginRight: theme.spacing(1)
  },
  grow: {
    flexGrow: 1
  },
  disabledAreaName: {
    color: theme.palette.text.disabled
  },
  disabledPeriod: {
    opacity: 0.3
  },
  container: {
    display: 'flex'
  },
  calendarButtons: {
    marginRight: theme.spacing(1)
  }
}));

const formatter = new Intl.DateTimeFormat('default', { month: 'short' });
const today = new Date();

function Areas(props) {
  const [year, setYear] = useState(today.getFullYear());
  const [months, setMonths] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [message, setMessage] = useState('');
  const [periodEl, setPeriodEl] = useState(null);
  const [buttonEl, setButtonEl] = useState(null);
  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);

  const periodOpen = Boolean(periodEl);
  const buttonOpen = Boolean(buttonEl);

  const classes = useStyles();

  const startOfYear = new Date(year, 0, 1).getTime();
  const endOfYear = new Date(year + 1, 0, 1).getTime();

  const dayMs = 24 * 60 * 60 * 1000;

  const daysBetween = (start, end) => Math.round((end - start) / dayMs);

  const { userId } = props;

  useEffect(() => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const currentDate = new Date(year, i + 1, 0);
      const name = formatter.format(currentDate);
      const days = currentDate.getDate();
      months.push({ name, days });
    }
    setMonths(months);
  }, [year]);

  const handlePeriodClick = (e, period) => {
    setSelectedPeriod(period);
    setPeriodEl(e.currentTarget);
  }

  const checkOverlappingPeriod = (period) => {
    const area = areas.find(a => a.id === period.areaId);
    return area.periods.some(p => 
      p.id !== period.id &&
      (!period.endTime || p.startTime <= period.endTime) &&
      (!p.endTime || p.endTime >= period.startTime));
  }

  const checkOverlapping = (suppliedUserAreas) => {
    let overlapping = false;
    for (const userArea of suppliedUserAreas) {
      const area = areas.find(a => a.id === userArea.area.id);
      if (area) {
        overlapping = area.periods.some(p => 
          (!userArea.endTime || p.startTime <= userArea.endTime.getTime()) &&
          (!p.endTime || p.endTime >= userArea.startTime.getTime()));
        if (overlapping) {
          break;
        }
      }
    }
    return overlapping;
  }

  const handleAddAreas = async (suppliedUserAreas) => {
    const userAreas = suppliedUserAreas.map(ua => {
      const timeZone = ua.area.timeZone;
      return {
        userId,
        roleId: ua.role.id, 
        areaId: ua.area.id,
        startTime: makeAreaDate(ua.startTime, timeZone),
        endTime: makeAreaDate(ua.endTime, timeZone, 1),
        isAdmin: ua.isAdmin
      }
    });
    const response = await client.postData('/userAreas/insertMany', { userAreas, userId });
    if (response.ok) {
      const updatedAreas = await parse(response);
      areasHandler(updatedAreas);
      return false;
    }
    return true;
  }

  const areasHandler = (areas) => {
    setAreas(areas.map(area => {
      area.periods = area.periods.map(period => {
        const startTime = new Date(period.startTime).getTime();
        const endTime = period.endTime ? new Date(period.endTime).getTime() : null;
        return {...period, startTime, endTime };
      });
      return area;
    }));
  }
  const rolesHandler = (roles) => setRoles(roles);
  const locationsHandler = (locations) => setLocations(locations);

  useFetchMany(setLoading, [
    { url: '/userAreas/find', handler: areasHandler, data: { userId } },
    { url: '/roles/getSelectListItems', handler: rolesHandler },
    { url: '/areas/getWithLocation', handler: locationsHandler }]);

  if (loading) {
    return <Progress loading={loading} />;
  }

  const monthLabels = months.map(month => {
    const width = `${month.days * 2}px`;
    return <div key={month.name} style={{ width }}>{month.name}</div>;
  });

  const areaBars = areas.map(area => {
    const { name, abbreviation, timeZone, periods } = area;
    const periodsInYear = periods
      .filter(p => 
        p.startTime < endOfYear &&
        (!p.endTime || p.endTime > startOfYear));
    const sections = [];
    let start = startOfYear;
    for (const period of periodsInYear) {
      if (period.startTime > start) {
        const days = daysBetween(start, period.startTime);
        if (days > 0) {
          sections.push({
            type: 'empty',
            start,
            days
          });
        }
      }
      start = period.startTime;
      if (period.startTime < startOfYear) {
        start = startOfYear;
      }
      let end;
      if (!period.endTime) {
        end = endOfYear;
      }
      else if (period.endTime > endOfYear) {
        end = endOfYear;
      }
      else {
        end = period.endTime;
      }
      const days = daysBetween(start, end);
      sections.push({
        id: period.id,
        type: 'filled',
        userId,
        areaId: area.id,
        areaName: name,
        roleId: period.roleId,
        roleName: period.roleName,
        roleColour: period.roleColour,
        start: period.startTime,
        end: period.endTime,
        days,
        isAdmin: period.isAdmin,
        timeZone
      });
      start = period.endTime;
    }
    if (sections.length == 0) {
      sections.push({
        type: 'empty',
        start: startOfYear,
        days: daysBetween(startOfYear, endOfYear)
      });
    }
    else {
      const lastSection = sections[sections.length - 1];
      if (lastSection.end && lastSection.end !== endOfYear) {
        const start = lastSection.end + dayMs;
        const end = endOfYear;
        sections.push({
          type: 'empty',
          days: daysBetween(start, end)
        });
      }
    }
    const sectionElements = sections.map(section => {
      const { type, roleColour, start, days } = section;

      const width = `${days * 2}px`;

      if (type === 'empty') {
        return <div key={start} className={classes.section} style={{ width }} />;
      }
      return (
        <div 
          key={start}
          className={`${classes.section} ${classes.filled} ${selectedPeriod && selectedPeriod.id !== section.id ? classes.disabledPeriod : ''}`} 
          style={{ width, backgroundColor: `#${roleColour}` }}
          onClick={(e) => handlePeriodClick(e, section)} />
      );
    });
    return (
      <div key={area.id} className={classes.area}>
        <div className={`${classes.areaName} ${selectedPeriod && selectedPeriod.areaId !== area.id ? classes.disabledAreaName : ''}`}>{abbreviation}</div>
        <Paper className={classes.sections}>{sectionElements}</Paper>
      </div>
    );
  });

  const editPeriod = selectedPeriod ? (
    <EditPeriod 
      open={periodOpen}
      anchorEl={periodEl}
      setAnchorEl={setPeriodEl}
      selectedPeriod={selectedPeriod}
      setSelectedPeriod={setSelectedPeriod}
      checkOverlapping={checkOverlappingPeriod}
      setAreas={setAreas}
      setMessage={setMessage} />
  ) : null;

  return (
    <div className={classes.root}>
      <div className={classes.toolbar}>
        <div className={classes.areaName} />
        <Typography className={classes.year} variant="h5">{year}</Typography>
        <div className={classes.grow} />
        <CalendarButtons
          className={classes.calendarButtons}
          onBack={() => setYear(year => year - 1)}
          onToday={() => setYear(today.getFullYear())}
          onForward={() => setYear(year => year + 1)} />
        <Button 
          variant="contained" 
          color="primary"
          onClick={(e) => setButtonEl(e.currentTarget)}>Add area</Button>
      </div>
      <div className={classes.months}>
        <div className={classes.areaName} />
        {monthLabels}
      </div>
      {areaBars}
      <AddArea
        checkOverlapping={checkOverlapping}
        asyncHandleAddAreas={handleAddAreas}
        roles={roles}
        locations={locations}
        open={buttonOpen}
        anchorEl={buttonEl}
        setAnchorEl={setButtonEl}
        setMessage={setMessage} />
      {editPeriod}
      <Snackbar message={message} setMessage={setMessage} />
    </div>
  );
}

export default Areas;
