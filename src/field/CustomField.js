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
  root: {
    display: 'flex'
  },
  input: {
    backgroundColor: 'white'
  },
  mr: {
    marginRight: theme.spacing(2)
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

  const { setFields, className } = props;

  const root = className ? `${classes.root} ${className}` : classes.root;

  const handleChange = (e, index) => {
    const value = e instanceof Date ? e : e.target.value;
    setFields(fields => fields.map((f, i) => i === index ? {...f, value } : f));
  }

  const fields = props.fields.map((field, i) => {
    const { name, fieldType, selectItems, value } = field;
    const mr = i !== props.fields.length - 1 ? classes.mr : '';
    const onChange = (e) => handleChange(e, i);
    const elementId = uuid();

    if (fieldType === 'Short') {
      return (
        <TextField
          key={i}
          InputProps={{ className: classes.input }}
          className={`${classes.short} ${mr}`}
          variant="outlined"
          size="small"
          label={name}
          value={value}
          onChange={onChange} />
      );
    }
    if (fieldType === 'Standard') {
      return (
        <TextField
          key={i}
          InputProps={{ className: classes.input }}
          className={`${classes.standard} ${mr}`}
          variant="outlined"
          size="small"
          label={name}
          value={value}
          onChange={onChange} />
      );
    }
    if (fieldType === 'Select') {
      const items = selectItems.map(item => {
        return <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>;
      });
      return (
        <FormControl 
          key={i} 
          className={`${classes.standard} ${mr} ${classes.input}`} 
          variant="outlined" 
          size="small">
            <InputLabel id={elementId}>{name}</InputLabel>
            <Select 
              value={value} 
              onChange={onChange} 
              label={name} 
              labelId={elementId}>
                {items}
            </Select>
        </FormControl>
      );
    }
    if (fieldType === 'Date') {
      return (
        <MuiPickersUtilsProvider key={i} utils={DateFnsUtils}>
          <KeyboardDatePicker
            InputProps={{ className: classes.input }}
            className={`${classes.standard} ${mr}`}
            disableToolbar
            variant="inline"
            format="dd/MM/yyyy"
            margin="none"
            id={elementId}
            label={name}
            inputVariant="outlined"
            size="small"
            value={value}
            onChange={onChange}
            KeyboardButtonProps={{ 'aria-label': 'change date' }} />
        </MuiPickersUtilsProvider>
      );
    }
    if (fieldType === 'Number') {
      return (
        <TextField
          key={i}
          InputProps={{ className: classes.input }}
          className={`${classes.standard} ${mr}`}
          variant="outlined"
          size="small"
          label={name}
          type="Number"
          value={value}
          onChange={onChange} />
      );
    }
  });

  return (
    <div className={root}>{fields}</div>
  );
}

export default CustomField;
