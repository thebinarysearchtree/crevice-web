import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import useFetch from '../hooks/useFetch';
import Progress from '../common/Progress';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import EditPeriod from './EditPeriod';
import AddArea from '../user/AddArea';
import { makeAreaDate } from '../utils/date';
import Typography from '@material-ui/core/Typography';
import CalendarButtons from '../common/CalendarButtons';
import useAnchorState from '../hooks/useAnchorState';
import { useClient } from '../auth';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(7),
    paddingTop: theme.spacing(3),
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
  container: {
    display: 'flex'
  },
  calendarButtons: {
    marginRight: theme.spacing(1)
  },
  selectedPeriod: {
    filter: 'brightness(0.8)'
  }
}));

const formatter = new Intl.DateTimeFormat('default', { month: 'short' });
const today = new Date();

function Areas(props) {
  const [year, setYear] = useState(today.getFullYear());
  const [months, setMonths] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useAnchorState(null);
  const [periodEl, setPeriodEl] = useAnchorState(null);
  const [buttonOpen, setButtonOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);

  const periodOpen = Boolean(periodEl);

  const classes = useStyles();
  const client = useClient();

  const existingAreas = areas.flatMap(area => {
    const { id: areaId, periods } = area;
    return periods.map(period => {
      const { startTimeMs, endTimeMs } = period;
      return {
        area: {
          id: areaId
        },
        startTime: new Date(startTimeMs),
        endTime: endTimeMs ? new Date(endTimeMs) : null
      }
    });
  });

  const startOfYearMs = new Date(year, 0, 1).getTime();
  const endOfYearMs = new Date(year + 1, 0, 1).getTime();

  const dayMs = 24 * 60 * 60 * 1000;

  const daysBetween = (startTimeMs, endTimeMs) => Math.round((endTimeMs - startTimeMs) / dayMs);

  const userId = parseInt(props.userId, 10);

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

  useEffect(() => {
    setYear(today.getFullYear());
  }, [userId]);

  const handlePeriodClick = (e, period) => {
    setSelectedPeriod(period);
    setPeriodEl(e.currentTarget);
  }

  const handleAddAreas = async (suppliedUserAreas) => {
    const userAreas = suppliedUserAreas.map(userArea => {
      const { role, area, startTime, endTime, isAdmin } = userArea;
      const timeZone = area.timeZone;
      return {
        userId,
        roleId: role.id, 
        areaId: area.id,
        startTime: makeAreaDate(startTime, timeZone),
        endTime: makeAreaDate(endTime, timeZone, 1),
        isAdmin
      };
    });
    const message = userAreas.length === 1 ? 'Area added' : 'Areas added';
    await client.postMutation({
      url: '/userAreas/insertMany',
      data: userAreas,
      message
    });
  }

  const areasHandler = (areas) => {
    setAreas(areas.map(area => {
      area.periods = area.periods.map(period => {
        const startTimeMs = new Date(period.startTime).getTime();
        const endTimeMs = period.endTime ? new Date(period.endTime).getTime() : null;
        return {...period, startTimeMs, endTimeMs };
      });
      return area;
    }));
  }
  const rolesHandler = (roles) => setRoles(roles);
  const locationsHandler = (locations) => setLocations(locations);

  const loading = useFetch([
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
    const { name, timeZone, periods } = area;
    const periodsInYear = periods
      .filter(p => 
        p.startTimeMs < endOfYearMs &&
        (!p.endTimeMs || p.endTimeMs > startOfYearMs));
    const sections = [];
    let startTimeMs = startOfYearMs;
    for (const period of periodsInYear) {
      if (period.startTimeMs > startTimeMs) {
        const days = daysBetween(startTimeMs, period.startTimeMs);
        if (days > 0) {
          sections.push({
            type: 'empty',
            areaId: area.id,
            startTimeMs,
            endTimeMs: period.startTimeMs,
            days
          });
        }
      }
      startTimeMs = period.startTimeMs;
      if (period.startTimeMs < startOfYearMs) {
        startTimeMs = startOfYearMs;
      }
      let endTimeMs;
      if (!period.endTimeMs) {
        endTimeMs = endOfYearMs;
      }
      else if (period.endTimeMs > endOfYearMs) {
        endTimeMs = endOfYearMs;
      }
      else {
        endTimeMs = period.endTimeMs;
      }
      const days = daysBetween(startTimeMs, endTimeMs);
      sections.push({
        id: period.id,
        type: 'filled',
        userId,
        areaId: area.id,
        areaName: name,
        roleId: period.roleId,
        roleName: period.roleName,
        roleColour: period.roleColour,
        startTimeMs: period.startTimeMs,
        endTimeMs: period.endTimeMs,
        days,
        isAdmin: period.isAdmin,
        timeZone
      });
      startTimeMs = period.endTimeMs;
    }
    if (sections.length === 0) {
      sections.push({
        type: 'empty',
        areaId: area.id,
        startTimeMs: startOfYearMs,
        endTimeMs: endOfYearMs,
        days: daysBetween(startOfYearMs, endOfYearMs)
      });
    }
    else {
      const lastSection = sections[sections.length - 1];
      if (lastSection.endTimeMs && lastSection.endTimeMs !== endOfYearMs) {
        const startTimeMs = lastSection.endTimeMs + dayMs;
        const endTimeMs = endOfYearMs;
        sections.push({
          type: 'empty',
          areaId: area.id,
          startTimeMs,
          endTimeMs,
          days: daysBetween(startTimeMs, endTimeMs)
        });
      }
    }
    const sectionElements = sections.map(section => {
      const { type, roleColour, startTimeMs, days } = section;

      const width = `${days * 2}px`;

      if (type === 'empty') {
        return (
          <div 
            key={startTimeMs} 
            className={classes.section}
            style={{ width }} />
        );
      }
      return (
        <div 
          key={startTimeMs}
          className={`${classes.section} ${classes.filled} ${selectedPeriod && selectedPeriod.id === section.id ? classes.selectedPeriod : ''}`} 
          style={{ width, backgroundColor: `#${roleColour}` }}
          onClick={(e) => handlePeriodClick(e, section)} />
      );
    });
    return (
      <div key={area.id} className={classes.area}>
        <div className={classes.areaName}>{name}</div>
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
      otherPeriods={areas.find(a => a.id === selectedPeriod.areaId).periods.filter(p => p.id !== selectedPeriod.id)} />
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
          color="secondary"
          onClick={() => setButtonOpen(true)}>Add areas</Button>
      </div>
      <div className={classes.months}>
        <div className={classes.areaName} />
        {monthLabels}
      </div>
      {areaBars}
      <AddArea
        existingAreas={existingAreas}
        handleAddAreas={handleAddAreas}
        roles={roles}
        locations={locations}
        open={buttonOpen}
        setOpen={setButtonOpen} />
      {editPeriod}
    </div>
  );
}

export default Areas;
