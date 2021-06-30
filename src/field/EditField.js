import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import Tooltip from '@material-ui/core/Tooltip';
import { parse } from '../utils/data';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '330px'
  },
  spacing: {
    marginBottom: '10px'
  },
  popover: {
    marginTop: theme.spacing(1)
  },
  actions: {
    visibility: 'hidden',
    right: '0px'
  },
  item: {
    '&:hover $actions': {
      visibility: 'visible'
    },
    '&:hover $itemText': {
      width: '190px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  },
  itemText: {
    cursor: 'pointer'
  },
  container: {
    display: 'flex',
    alignItems: 'baseline'
  },
  option: {
    width: '100%'
  },
  optionButton: {
    marginLeft: theme.spacing(2)
  },
  secondaryAction: {
    paddingRight: '0px'
  }
}));

function Detail(props) {
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('');
  const [existingSelectItems, setExistingSelectItems] = useState([]);
  const [selectItems, setSelectItems] = useState([]);
  const [optionName, setOptionName] = useState('');
  const [editIndex, setEditIndex] = useState(-1);
  const [nextId, setNextId] = useState(-1);

  const isDisabled = !fieldName || !fieldType || (fieldType === 'Select' && selectItems.length < 2);

  const error = optionName !== '' && selectItems.some(i => i.name === optionName);

  const { setFields, selectedField, setSelectedField, open, anchorEl, setAnchorEl, setMessage } = props;
  const classes = useStyles();

  useEffect(() => {
    if (selectedField) {
      const { name, fieldType, selectItems } = selectedField;

      setFieldName(name);
      setFieldType(fieldType);
      setExistingSelectItems(selectItems);
      setSelectItems(selectItems);
    }
  }, [selectedField]);

  const handleClose = () => {
    setSelectedField(null);
    setAnchorEl(null);
  }

  const addItem = (e) => {
    e.preventDefault();
    const name = optionName;
    setOptionName('');
    setSelectItems(selectItems => [...selectItems, { id: nextId, name }]);
    setNextId(id => id - 1);
  }

  const removeItem = (index) => {
    setSelectItems(selectItems => selectItems.filter((item, i) => i !== index));
  }

  const handleEditItem = (e, index) => {
    setSelectItems(selectItems => {
      const updatedItems = [...selectItems];
      const value = e.target.value;
      updatedItems[index] = {...updatedItems[index], name: value };
      return updatedItems;
    });
  }

  const moveUp = (index) => {
    if (index !== 0) {
      setSelectItems(selectItems => {
        const updatedItems = [...selectItems];
        const selectedItem = updatedItems[index];
        const itemAbove = updatedItems[index - 1];
        updatedItems[index] = itemAbove;
        updatedItems[index - 1] = selectedItem;
        return updatedItems;
      });
    }
  }

  if (!selectedField) {
    return null;
  }

  const field = { ...selectedField, name: fieldName, fieldType };

  const saveField = async (e) => {
    e.preventDefault();
    setSelectedField(null);
    setAnchorEl(null);
    if (field.id !== -1) {
      const selectItemIds = selectItems.map(i => i.id);
      const itemsToDelete = existingSelectItems
        .filter(item => !selectItemIds.includes(item.id));
      const itemsToAdd = selectItems
        .map((item, i) => ({...item, itemNumber: i + 1 }))
        .filter(i => i.id < 0);
      const itemsToUpdate = selectItems
        .map((item, i) => ({...item, itemNumber: i + 1 }))
        .filter(item => {
          const existingItem = existingSelectItems.find(i => i.id === item.id);
          if (existingItem) {
            if (existingItem.name !== item.name || existingItem.itemNumber !== item.itemNumber) {
              return true;
            }
            return false;
          }
          return false;
        });
      const response = await client.postData('/fields/update', { fieldId: field.id, name: fieldName, existingName: selectedField.name, itemsToDelete, itemsToAdd, itemsToUpdate });
      if (response.ok) {
        const updatedFields = await parse(response);
        const updatedField = updatedFields[0];
        setFields(fields => fields.map(f => {
          if (f.id === field.id) {
            return {...f, ...updatedField };
          }
          return f;
        }));
        setMessage('Field updated');
      }
      else {
        setMessage('Something went wrong');
      }
    }
    else {
      const items = selectItems.map((item, i) => ({ name: item.name, itemNumber: i + 1 }));
      const response = await client.postData('/fields/insert', { name: fieldName, fieldType, selectItems: items });
      if (response.ok) {
        const savedFields = await parse(response);
        const savedField = savedFields[0];
        setFields(fields => [...fields, {...savedField, userCount: 0 }]);
        setMessage('Field created');
      }
      else {
        setMessage('Something went wrong');
      }
    }
  }

  const title = field.id !== -1 ? 'Update field' : 'Create a field';

  const buttonText = field.id !== -1 ? 'Update' : 'Save';

  const items = selectItems.map((item, i) => {
    const error = item.name === '';
    let itemText;
    if (i !== editIndex) {
      itemText = (
        <ListItemText 
          classes={{ primary: classes.itemText }}
          primary={item.name} 
          onClick={() => setEditIndex(i)} />
      );
    }
    else {
      itemText = (
        <TextField
          size="small"
          error={error}
          helperText={error ? 'The name cannot be blank' : ''}
          value={item.name}
          onBlur={() => error ? null : setEditIndex(-1)}
          onChange={(e) => handleEditItem(e, i)}
          autoFocus />
      );
    }
    return (
      <ListItem key={item.id} classes={{ secondaryAction: classes.secondaryAction }} ContainerProps={{ className: classes.item }} disableGutters>
        {itemText}
        <ListItemSecondaryAction className={classes.actions}>
          <Tooltip title="Move up">
            <IconButton onClick={() => moveUp(i)}>
              <ArrowUpwardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => removeItem(i)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </ListItemSecondaryAction>
      </ListItem>
    );
  });

  const list = selectItems.length === 0 ? null : (
    <List>{items}</List>
  );

  const selectForm = fieldType === 'Select' ? (
    <form className={classes.form} onSubmit={addItem} noValidate>
      <div className={classes.container}>
        <TextField
          className={classes.option}
          label="Option"
          error={error}
          helperText={error ? 'This option already exists' : ''}
          value={optionName}
          onChange={(e) => setOptionName(e.target.value)} />
        <Button
          className={classes.optionButton}
          variant="contained"
          color="secondary"
          disabled={error || optionName.length === 0}
          type="submit">Add</Button>
      </div>
      {list}
    </form>
  ) : null;

  const fieldTypeSelect = field.id === -1 ? (
    <FormControl className={classes.spacing}>
      <InputLabel id="field-type">Field type</InputLabel>
      <Select
        labelId="field-type"
        value={fieldType}
        onChange={(e) => setFieldType(e.target.value)}>
          <MenuItem value="Short">Short</MenuItem>
          <MenuItem value="Standard">Standard</MenuItem>
          <MenuItem value="Comment">Comment</MenuItem>
          <MenuItem value="Select">Select</MenuItem>
          <MenuItem value="Date">Date</MenuItem>
          <MenuItem value="Number">Number</MenuItem>
      </Select>
    </FormControl>
  ) : null;

  return (
    <Popover 
      className={classes.popover}
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: field.id === -1 ? 'right' : 'left'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: field.id === -1 ? 'right' : 'left'
      }}
      onClose={handleClose}
      disableRestoreFocus>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent className={classes.root}>
        <TextField
          className={classes.spacing}
          label="Field name"
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
          autoComplete="off" />
        {fieldTypeSelect}
        {selectForm}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose} 
          color="primary">Cancel</Button>
        <Button 
          onClick={saveField} 
          variant="contained" 
          color="primary"
          disabled={isDisabled}>{buttonText}</Button>
      </DialogActions>
    </Popover>
  );
}

export default Detail;
