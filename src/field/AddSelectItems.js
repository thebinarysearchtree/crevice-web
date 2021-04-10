import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';
import ClearIcon from '@material-ui/icons/Clear';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
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
    display: 'flex',
    alignItems: 'baseline'
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
    marginBottom: theme.spacing(2),
    marginRight: theme.spacing(1)
  },
  avatar: {
    width: '150px',
    height: '150px'
  },
  input: {
    backgroundColor: 'white'
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
  },
  list: {
    listStyleType: 'none',
    padding: '0px',
    margin: '0px'
  },
  fieldName: {
    marginBottom: theme.spacing(2)
  },
  backButton: {
    marginRight: theme.spacing(1)
  },
  buttons: {
    display: 'flex',
    alignItems: 'flex-end'
  }
}));

function AddSelectItems(props) {
  const [name, setName] = useState('');

  const history = useHistory();
  const classes = useStyles();

  const { fieldName, selectItems, setSelectItems, setShowSelect, insertField } = props;

  const isDisabled = selectItems.length < 2;

  const error = selectItems.includes(name);

  const addItem = (e) => {
    e.preventDefault();
    setName('');
    setSelectItems(selectItems => [...selectItems, name]);
  }

  const removeItem = (index) => {
    setSelectItems(selectItems => selectItems.filter((item, i) => i !== index));
  }

  const items = selectItems.map((item, i) => {
    return (
      <ListItem key={item}>
        <ListItemText primary={item} />
        <ListItemSecondaryAction>
          <IconButton onClick={() => removeItem(i)}>
            <ClearIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  });

  const list = selectItems.length === 0 ? null : (
    <List component={Paper}>{items}</List>
  );

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.heading}>
          <div className={classes.header}>
            <BackButton onClick={() => setShowSelect(false)} />
            <Typography variant="h4">Add select items</Typography>
          </div>
        </div>
        <Typography className={classes.fieldName} variant="h6">{fieldName}</Typography>
        <form className={classes.form} onSubmit={addItem} noValidate>
          <div className={classes.container}>
            <TextField
              className={classes.name}
              InputProps={{ className: classes.input }}
              variant="outlined"
              size="small"
              label="Option"
              error={error}
              helperText={error ? 'This option already exists' : ''}
              value={name}
              onChange={(e) => setName(e.target.value)} />
            <Button
              variant="contained"
              color="secondary"
              disabled={error || name.length === 0}
              type="submit">Add</Button>
          </div>
          {list}
        </form>
        <div className={classes.buttons}>
          <Button
            className={classes.backButton}
            onClick={() => props.setShowSelect(false)}
            color="primary">Back</Button>
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            disabled={isDisabled}
            onClick={insertField}>Save</Button>
        </div>
      </div>
    </div>
  );
}

export default AddSelectItems;
