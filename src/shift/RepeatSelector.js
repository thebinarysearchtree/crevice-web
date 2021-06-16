import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'baseline'
  },
  option: {
    cursor: 'pointer',
    marginRight: theme.spacing(1)
  },
  datePicker: {
    width: '150px'
  },
  hidden: {
    visibility: 'hidden'
  }
}));

function RepeatSelector(props) {
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const classes = useStyles();

  const { date, repeatOption, setRepeatOption, repeatUntil, setRepeatUntil } = props;

  const noRepeat = repeatOption === 'Does not repeat';

  const handleSelect = (option) => {
    setRepeatOption(option);
    setAnchorEl(null);
  }

  const repeatOptions = [
    'Does not repeat',
    'Repeats weekly',
    'Repeats fortnightly',
    'Repeats monthly'
  ];

  const menuItems = repeatOptions.map(option => {
    return (
      <MenuItem
        key={option}
        onClick={() => handleSelect(option)}
        selected={repeatOption === option}>{option}</MenuItem>
    );
  });

  const repeatText = noRepeat ? repeatOption : `${repeatOption} until`;

  return (
    <div className={classes.root}>
      <div 
        className={classes.option}
        aria-controls="repeat-menu"
        aria-haspopup="true"
        onClick={(e) => setAnchorEl(e.currentTarget)}>{repeatText}</div>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          className={noRepeat ? `${classes.datePicker} ${classes.hidden}` : classes.datePicker}
          disableToolbar
          variant="inline"
          format="dd/MM/yyyy"
          margin="none"
          id="end-date"
          value={repeatUntil}
          onChange={(d) => setRepeatUntil(d)}
          KeyboardButtonProps={{ 'aria-label': 'change end date' }}
          autoOk />
      </MuiPickersUtilsProvider>
      <Menu
        id="repeat-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={() => setAnchorEl(null)}>{menuItems}</Menu>
    </div>
  );
}

export default RepeatSelector;
