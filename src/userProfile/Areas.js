import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import useFetch from '../hooks/useFetch';
import Progress from '../common/Progress';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Button from '@material-ui/core/Button';

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
  filled: {
    cursor: 'pointer'
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
    fontWeight: 600,
    marginRight: theme.spacing(1)
  },
  grow: {
    flexGrow: 1
  },
  chevron: {
    width: '32px',
    height: '32px'
  }
}));

function Areas(props) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [months, setMonths] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  const classes = useStyles();

  const startOfYear = new Date(year, 0, 1).getTime();
  const endOfYear = new Date(year + 1, 0, 1).getTime();

  const dayMs = 24 * 60 * 60 * 1000;

  const daysBetween = (start, end) => Math.round((end - start) / dayMs);

  const { userId } = props;

  useEffect(() => {
    const months = [];
    const formatter = new Intl.DateTimeFormat('default', { month: 'short' });
    for (let i = 0; i < 12; i++) {
      const currentDate = new Date(year, i + 1, 0);
      const name = formatter.format(currentDate);
      const days = currentDate.getDate();
      months.push({ name, days });
    }
    setMonths(months);
  }, [year]);

  const handler = (areas) => {
    setAreas(areas.map(area => {
      area.periods = area.periods.map(period => {
        const startTime = new Date(period.startTime).getTime();
        const endTime = period.endTime ? new Date(period.endTime).getTime() : null;
        return {...period, startTime, endTime };
      });
      return area;
    }));
    setLoading(false);
  }

  useFetch('/userAreas/find', handler, { userId });

  if (loading) {
    return <Progress loading={loading} />;
  }

  const monthLabels = months.map(month => {
    const width = `${month.days * 2}px`;
    return <div key={month.name} style={{ width }}>{month.name}</div>;
  });

  const areaBars = areas.map(area => {
    const { name, abbreviation, periods } = area;
    const periodsInYear = periods
      .filter(p => 
        p.startTime < endOfYear &&
        (!p.endTime || p.endTime > startOfYear));
    const sections = [];
    let start = startOfYear;
    for (const period of periodsInYear) {
      if (period.startTime > start) {
        const days = daysBetween(start, period.startTime);
        if (days > 1) {
          sections.push({
            type: 'empty',
            roleId: null,
            start,
            end: period.startTime,
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
      if (period.endTime) {
        const endTime = new Date(period.endTime);
        endTime.setDate(endTime.getDate() - 1);
        end = endTime.getTime();
      }
      else {
        end = null;
      }
      sections.push({
        type: 'filled',
        roleId: period.roleId,
        roleColour: period.roleColour,
        start: period.startTime,
        end,
        days
      });
      start = period.endTime + dayMs;
    }
    if (sections.length == 0) {
      sections.push({
        type: 'empty',
        roleId: null,
        start: startOfYear,
        end: endOfYear,
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
          roleId: null,
          start,
          end,
          days: daysBetween(start, end)
        });
      }
    }
    const sectionElements = sections.map(section => {
      const width = `${section.days * 2}px`;
      const start = new Date(section.start).toLocaleDateString();
      const end = section.end ? new Date(section.end).toLocaleDateString() : 'infinity';
      if (section.type === 'empty') {
        return <div key={start} className={classes.section} style={{ width }} />;
      }
      return (
        <div 
          key={start}
          className={`${classes.section} ${classes.filled}`} 
          style={{ width, backgroundColor: `#${section.roleColour}` }} />
      );
    });
    return (
      <div key={area.id} className={classes.area}>
        <div className={classes.areaName}>{abbreviation}</div>
        <Paper className={classes.sections}>{sectionElements}</Paper>
      </div>
    );
  });

  return (
    <div className={classes.root}>
      <div className={classes.toolbar}>
        <div className={classes.areaName} />
        <div className={classes.year}>{year}</div>
        <Tooltip title="Previous year">
          <IconButton 
            className={classes.chevron}
            onClick={() => setYear(year => year - 1)}>
              <ChevronLeftIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Next year">
          <IconButton 
            className={classes.chevron}
            onClick={() => setYear(year => year + 1)}>
              <ChevronRightIcon />
          </IconButton>
        </Tooltip>
        <div className={classes.grow} />
        <Button variant="contained" color="primary">Add area</Button>
      </div>
      <div className={classes.months}>
        <div className={classes.areaName} />
        {monthLabels}
      </div>
      {areaBars}
    </div>
  );
}

export default Areas;
