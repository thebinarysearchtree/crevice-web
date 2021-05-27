import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
  today: {
    marginLeft: '5px',
    marginRight: '5px'
  },
  chevron: {
    paddingLeft: '0px',
    paddingRight: '0px',
    minWidth: '35px'
  }
}));

function CalendarButtons(props) {
  const classes = useStyles();

  const { className, onBack, onToday, onForward } = props;

  return (
    <div className={className}>
      <Button 
        className={classes.chevron}
        variant="contained"
        onClick={onBack}>
          <ChevronLeftIcon />
      </Button>
      <Button 
        className={classes.today}
        variant="contained" 
        onClick={onToday}>Today</Button>
      <Button 
        className={classes.chevron}
        variant="contained"
        onClick={onForward}>
          <ChevronRightIcon />
      </Button>
    </div>
  );
}

export default CalendarButtons;
