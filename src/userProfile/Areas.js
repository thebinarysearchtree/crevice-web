import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import useFetch from '../hooks/useFetch';
import Progress from '../common/Progress';

function Areas(props) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [months, setMonths] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

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
        type: 'filled',
        roleId: period.roleId,
        start,
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
        days: daysBetween(endOfYear, startOfYear)
      });
    }
    else {
      const lastSection = sections[sections.length - 1];
      if (lastSection.end !== endOfYear) {
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
  });

  return (
    <div></div>
  );
}

export default Areas;
