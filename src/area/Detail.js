import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

const useStyles = makeStyles((theme) => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '330px'
  },
  formControl: {
    marginBottom: '10px'
  }
}));

function Detail(props) {
  const [area, setArea] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    setArea(props.selectedArea);
    setIsDisabled(true);
  }, [props.selectedArea]);

  const { setAreas, open, setOpen, setMessage } = props;
  const classes = useStyles();

  const handleInputChange = (e) => {
    const name = e.target.name;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    setArea(a => {
      const updatedArea = { ...a, [name] : value };
      const isValid = updatedArea.name;
      if (!isValid) {
        setIsDisabled(true);
      }
      else {
        setIsDisabled(false);
      }
      return updatedArea;
    });
  }

  const saveArea = async (e) => {
    e.preventDefault();
    setOpen(false);
    if (area.id !== -1) {
      const response = await client.postData('/areas/update', { area });
      if (response.ok) {
        setAreas(areas => areas.map(a => {
          if (a.id === area.id) {
            return { ...area };
          }
          return a;
        }));
        setMessage('Area updated');
      }
      else {
        setMessage('Something went wrong');
      }
    }
    else {
      const response = await client.postData('/areas/insert', { area });
      if (response.ok) {
        const result = await response.json();
        const { areaId } = result;
        const savedArea = { ...area, id: areaId };
        setAreas(areas => [savedArea, ...areas]);
        setMessage('Area created');
      }
      else {
        setMessage('Something went wrong');
      }
    }
  }

  if (!area) {
    return null;
  }

  const title = area.id !== -1 ? 'Edit area' : 'Create a new area';

  return (
    <Dialog 
      open={open} 
      onClose={() => setOpen(false)} 
      aria-labelledby="dialog-title">
      <DialogTitle id="dialog-title">{title}</DialogTitle>
      <DialogContent className={classes.form}>
        <TextField
          className={classes.formControl}
          name="name"
          label="Area name"
          value={area.name}
          onChange={handleInputChange}
          autoComplete="off" />
        <TextField
          className={classes.formControl}
          name="abbreviation"
          label="Abbreviation"
          value={area.abbreviation}
          onChange={handleInputChange}
          autoComplete="off" />
        <TextField
          className={classes.formControl}
          name="notes"
          label="Notes (optional)"
          value={area.notes}
          onChange={handleInputChange}
          multiline
          rows={4} />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => setOpen(false)} 
          color="primary">Cancel</Button>
        <Button 
          onClick={saveArea} 
          variant="contained" 
          color="primary"
          disabled={isDisabled}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default Detail;
