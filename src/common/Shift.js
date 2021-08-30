import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { getTimeString } from '../utils/date';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '102px',
    padding: '4px',
    marginBottom: theme.spacing(1),
    borderRadius: '5px',
    cursor: 'pointer',
    textAlign: 'center',
    backgroundColor: '#90caf9',
    '&$selected': {
      border: '2px solid #0d47a1'
    }
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
    marginBottom: '6px'
  }
}));

function Shift(props) {
  const classes = useStyles();

  const { selected, booked, capacity, startTime, endTime, onClick } = props;

  const label = `${getTimeString(startTime)} - ${getTimeString(endTime)}`;

  let className = classes.root;
  if (booked !== undefined) {
    if (booked === 0) {
      className += ` ${classes.empty}`;
    }
    else if (booked === capacity) {
      className += ` ${classes.full}`;
    }
    else {
      className += ` ${classes.partial}`;
    }
  }
  if (selected) {
    className += ` ${classes.selected}`;
  }

  return (
    <div 
      className={className}
      onClick={onClick}>
        <Typography variant="body2">{label}</Typography>
    </div>
  );
}

export default Shift;
