import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
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
import { useClient } from '../auth';
import useChanged from '../hooks/useChanged';
import FormLayout from '../FormLayout';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '330px'
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
    marginLeft: theme.spacing(1)
  },
  secondaryAction: {
    paddingRight: '0px'
  },
  spacing: {
    marginBottom: theme.spacing(2)
  },
  input: {
    backgroundColor: 'white'
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2)
  },
  cancel: {
    marginRight: theme.spacing(1)
  },
  options: {
    marginTop: theme.spacing(1)
  },
  form: {
    marginTop: theme.spacing(3)
  },
  iconButton: {
    width: '40px',
    height: '40px',
    marginRight: '4px'
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
  const hasChanged = useChanged(props.selectedField, [fieldName, fieldType, selectItems]);

  const isDisabled = !fieldName || !fieldType || (fieldType === 'Select' && selectItems.length < 2) || !hasChanged;

  const error = optionName !== '' && selectItems.some(i => i.name === optionName);

  const { selectedField, setSelectedField } = props;
  const classes = useStyles();
  const client = useClient();

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

  const isUpdate = field.id !== -1;

  const saveField = async (e) => {
    e.preventDefault();
    setSelectedField(null);
    if (isUpdate) {
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
      await client.postMutation({
        url: '/fields/update',
        data: { fieldId: field.id, name: fieldName, existingName: selectedField.name, itemsToDelete, itemsToAdd, itemsToUpdate },
        message: 'Field updated'
      });
    }
    else {
      const items = selectItems.map((item, i) => ({ name: item.name, itemNumber: i + 1 }));
      await client.postMutation({
        url: '/fields/insert',
        data: { name: fieldName, fieldType, selectItems: items },
        message: 'Field created'
      });
    }
  }

  const title = isUpdate ? 'Update field' : 'Create a field';

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
      <ListItem key={item.id} classes={{ secondaryAction: classes.secondaryAction }} ContainerProps={{ className: classes.item }}>
        {itemText}
        <ListItemSecondaryAction className={classes.actions}>
          <Tooltip title="Move up">
            <IconButton className={classes.iconButton} onClick={() => moveUp(i)}>
              <ArrowUpwardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton className={classes.iconButton} onClick={() => removeItem(i)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </ListItemSecondaryAction>
      </ListItem>
    );
  });

  const list = selectItems.length === 0 ? null : (
    <List className={classes.options} component={Paper}>{items}</List>
  );

  const selectForm = fieldType === 'Select' ? (
    <form className={classes.form} onSubmit={addItem} noValidate>
      <div className={classes.container}>
        <TextField
          InputProps={{ className: classes.input }}
          className={classes.option}
          label="Option"
          variant="outlined"
          size="small"
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

  return (
    <Dialog 
      open={Boolean(selectedField)}
      onClose={handleClose}
      fullScreen
      transitionDuration={0}>
        <FormLayout title={title} onClose={handleClose}>
          <div className={classes.root}>
            <TextField
              InputProps={{ className: classes.input }}
              className={classes.spacing}
              label="Field name"
              variant="outlined"
              size="small"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              autoComplete="off" />
            <FormControl 
              className={classes.input} 
              variant="outlined" 
              size="small"
              disabled={isUpdate}>
                <InputLabel id="field-type">Field type</InputLabel>
                <Select
                  labelId="field-type"
                  label="Field type"
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
            {selectForm}
            <div className={classes.buttons}>
              <Button 
                className={classes.cancel}
                onClick={handleClose} 
                color="primary">Cancel</Button>
              <Button 
                onClick={saveField} 
                variant="contained" 
                color="primary"
                disabled={isDisabled}>{isUpdate ? 'Update' : 'Save'}</Button>
            </div>
          </div>
        </FormLayout>
    </Dialog>
  );
}

export default Detail;
