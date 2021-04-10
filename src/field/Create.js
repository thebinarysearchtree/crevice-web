import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Snackbar from '../common/Snackbar';
import { useHistory } from 'react-router-dom';
import Radio from '@material-ui/core/Radio';
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
import AddSelectItems from './AddSelectItems';
import MultipleFields from './MultipleFields';
import BackButton from '../common/BackButton';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
    alignItems: 'center'
  },
  content: {
    flexDirection: 'column'
  },
  heading: {
    display: 'flex',
    marginBottom: theme.spacing(3),
    justifyContent: 'space-between'
  },
  header: {
    display: 'flex',
    alignItems: 'center'
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2)
  },
  container: {
    display: 'flex'
  },
  button: {
    marginTop: theme.spacing(2),
    alignSelf: 'flex-start'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  spacing: {
    marginBottom: theme.spacing(1)
  },
  name: {
    width: '300px',
    backgroundColor: 'white',
    marginBottom: theme.spacing(2)
  },
  avatar: {
    width: '150px',
    height: '150px'
  },
  input: {
    display: 'none'
  },
  mr: {
    marginRight: theme.spacing(1)
  },
  short: {
    width: '100px',
    backgroundColor: 'white'
  },
  standard: {
    width: '204px',
    backgroundColor: 'white'
  }
}));

function Create() {
  const [name, setName] = useState('');
  const [fieldType, setFieldType] = useState('');
  const [selectItems, setSelectItems] = useState([]);
  const [exampleDate, setExampleDate] = useState(null);
  const [showSelect, setShowSelect] = useState(false);
  const [showGroup, setShowGroup] = useState(false);
  const [message, setMessage] = useState('');

  const history = useHistory();
  const classes = useStyles();

  const isDisabled = !name || !fieldType;

  const handleNextClick = async (e) => {
    e.preventDefault();
    if (fieldType === 'Select') {
      setShowSelect(true);
    }
    else if (fieldType === 'Multiple fields') {
      setShowGroup(true);
    }
    else {
      insertField();
    }
  }

  const insertField = async () => {
    const items = selectItems.map((item, i) => ({ name: item, itemNumber: i + 1 }));
    const response = await client.postData('/fields/insert', { groupId: null, name, fieldType, fieldNumber: 1, selectItems: items });
    if (response.ok) {
      history.push('/fields', { message: 'Field created' });
    }
    else {
      setMessage('Something went wrong');
    }
  }

  if (showSelect) {
    return (
      <AddSelectItems
        fieldName={name}
        selectItems={selectItems}
        setSelectItems={setSelectItems}
        setShowSelect={setShowSelect}
        insertField={insertField} />
    );
  }

  if (showGroup) {
    return (
      <MultipleFields fieldName={name} setShowGroup={setShowGroup} />
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.heading}>
          <div className={classes.header}>
            <BackButton to="/fields" />
            <Typography variant="h4">Create a field</Typography>
          </div>
        </div>
        <form className={classes.form} onSubmit={handleNextClick} noValidate>
          <TextField
            className={classes.name}
            variant="outlined"
            size="small"
            label="Field name"
            value={name}
            onChange={(e) => setName(e.target.value)} />
          <Typography className={classes.spacing} variant="h6">Field type</Typography>
          <div className={classes.spacing}>
            <Radio
              checked={fieldType === 'Short'}
              onChange={(e) => setFieldType(e.target.value)}
              value="Short"
              name="fieldType"
              inputProps={{ 'aria-label': 'Short' }} />
            <TextField
              className={classes.short}
              variant="outlined"
              size="small"
              label="Short" />
          </div>
          <div className={classes.spacing}>
            <Radio
              checked={fieldType === 'Standard'}
              onChange={(e) => setFieldType(e.target.value)}
              value="Standard"
              name="fieldType"
              inputProps={{ 'aria-label': 'Standard' }} />
            <TextField
              className={classes.standard}
              variant="outlined"
              size="small"
              label="Standard" />
          </div>
          <div className={classes.spacing}>
            <Radio
              checked={fieldType === 'Comment'}
              onChange={(e) => setFieldType(e.target.value)}
              value="Comment"
              name="fieldType"
              inputProps={{ 'aria-label': 'Comment' }} />
            <TextField
              className={classes.standard}
              variant="outlined"
              size="small"
              label="Comment"
              multiline
              rows={4} />
          </div>
          <div className={classes.spacing}>
            <Radio
              checked={fieldType === 'Select'}
              onChange={(e) => setFieldType(e.target.value)}
              value="Select"
              name="fieldType"
              inputProps={{ 'aria-label': 'Select' }} />
            <FormControl className={classes.standard} variant="outlined" size="small">
              <InputLabel id="select">Select</InputLabel>
              <Select value={''} label="Select" labelId="select">
                <MenuItem value="Option 1">Option 1</MenuItem>
                <MenuItem value="Option 2">Option 2</MenuItem>
                <MenuItem value="Option 3">Option 3</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className={classes.spacing}>
            <Radio
              checked={fieldType === 'Date'}
              onChange={(e) => setFieldType(e.target.value)}
              value="Date"
              name="fieldType"
              inputProps={{ 'aria-label': 'Date' }} />
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                className={classes.standard}
                disableToolbar
                variant="inline"
                format="dd/MM/yyyy"
                margin="none"
                id="date"
                label="Date"
                inputVariant="outlined"
                size="small"
                value={exampleDate}
                onChange={(d) => setExampleDate(d)}
                KeyboardButtonProps={{ 'aria-label': 'change date' }} />
            </MuiPickersUtilsProvider>
          </div>
          <div className={classes.spacing}>
            <Radio
              checked={fieldType === 'Number'}
              onChange={(e) => setFieldType(e.target.value)}
              value="Number"
              name="fieldType"
              inputProps={{ 'aria-label': 'Number' }} />
            <TextField
              className={classes.standard}
              variant="outlined"
              size="small"
              label="Number"
              type="Number" />
          </div>
          <div className={classes.spacing}>
            <div className={classes.container}>
              <Radio
                checked={fieldType === 'Multiple fields'}
                onChange={(e) => setFieldType(e.target.value)}
                value="Multiple fields"
                name="fieldType"
                inputProps={{ 'aria-label': 'Multiple fields' }} />
              <div className={classes.container}>
                <TextField
                  className={`${classes.standard} ${classes.mr}`}
                  variant="outlined"
                  size="small"
                  label="Multiple fields" />
                <TextField
                  className={classes.short}
                  variant="outlined"
                  size="small" />
              </div>
            </div>
          </div>
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            type="submit"
            disabled={isDisabled}>Next</Button>
        </form>
        <Snackbar message={message} setMessage={setMessage} />
      </div>
    </div>
  );
}

export default Create;
