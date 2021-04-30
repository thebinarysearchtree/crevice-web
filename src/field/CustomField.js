import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';
import { v4 as uuid } from 'uuid';

const useStyles = makeStyles((theme) => ({
  input: {
    backgroundColor: 'white'
  },
  short: {
    width: '100px',
  },
  standard: {
    width: '200px',
  }
}));

function CustomField(props) {
  const classes = useStyles();

  const { field, setValue, className } = props;

  const { name, fieldType, selectItems, value } = field;

  const elementId = uuid();

  if (fieldType === 'Short') {
    return (
      <TextField
        InputProps={{ className: classes.input }}
        className={`${classes.short} ${className}`}
        variant="outlined"
        size="small"
        label={name}
        value={value}
        onChange={(e) => setValue(e.target.value)} />
    );
  }
  if (fieldType === 'Standard') {
    return (
      <TextField
        InputProps={{ className: classes.input }}
        className={`${classes.standard} ${className}`}
        variant="outlined"
        size="small"
        label={name}
        value={value}
        onChange={(e) => setValue(e.target.value)} />
    );
  }
  if (fieldType === 'Select') {
    const items = selectItems.map(item => {
      return <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>;
    });
    return (
      <FormControl 
        className={`${classes.standard} ${className} ${classes.input}`} 
        variant="outlined" 
        size="small">
          <InputLabel id={elementId}>{name}</InputLabel>
          <Select 
            value={value} 
            onChange={(e) => setValue(e.target.value)} 
            label={name} 
            labelId={elementId}>
              {items}
          </Select>
      </FormControl>
    );
  }
  if (fieldType === 'Date') {
    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          InputProps={{ className: classes.input }}
          className={`${classes.standard} ${className}`}
          disableToolbar
          variant="inline"
          format="dd/MM/yyyy"
          margin="none"
          id={elementId}
          label={name}
          inputVariant="outlined"
          size="small"
          value={value}
          onChange={(d) => setValue(d)}
          KeyboardButtonProps={{ 'aria-label': 'change date' }} />
      </MuiPickersUtilsProvider>
    );
  }
  if (fieldType === 'Number') {
    return (
      <TextField
        InputProps={{ className: classes.input }}
        className={`${classes.standard} ${className}`}
        variant="outlined"
        size="small"
        label={name}
        type="Number"
        value={value}
        onChange={(e) => setValue(e.target.value)} />
    );
  }
}

export default CustomField;
