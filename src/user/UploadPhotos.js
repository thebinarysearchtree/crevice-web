import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Snackbar from '../common/Snackbar';
import { useHistory } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import BackButton from '../common/BackButton';
import useFetch from '../hooks/useFetch';
import Progress from '../common/Progress';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import FormHelperText from '@material-ui/core/FormHelperText';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

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
  short: {
    width: '200px'
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
    marginBottom: theme.spacing(2)
  },
  email: {
    width: '416px'
  },
  avatar: {
    width: '150px',
    height: '150px'
  },
  upload: {
    display: 'none'
  },
  mr: {
    marginRight: theme.spacing(2)
  },
  input: {
    backgroundColor: 'white'
  }
}));

function InviteSingleDetail() {
  const [fieldName, setFieldName] = useState('Email');
  const [overwrite, setOverwrite] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [storedFiles, setStoredFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [fieldNames, setFieldNames] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showErrors, setShowErrors] = useState(false);
  const [uploading, setUploading] = useState(false);

  const history = useHistory();
  const classes = useStyles();

  const isDisabled = uploading || selectedFiles.length === 0;

  const fieldsHandler = (fieldNames) => {
    setFieldNames(['Email', 'Phone', ...fieldNames]);
    setLoading(false);
  }

  useFetch('/fields/getFilenameFields', fieldsHandler);

  const updateImages = async (e) => {
    e.preventDefault();
    setUploading(true);
    let response = await client.uploadPhotos(selectedFiles);
    if (response.ok) {
      const storedFiles = await response.json();
      setStoredFiles(storedFiles);
      const query = {
        files: storedFiles,
        fieldName,
        overwrite
      };
      response = await client.postData('/users/updateImages', query);
      if (response.ok) {
        const errors = await response.json();
        setErrors(errors);
        if (errors.length > 0) {
          setShowErrors(true);
        }
        else {
          history.push('/users', { message: `${storedFiles.length} photos added` });
        }
      }
      else {
        setMessage('Something went wrong');
      }
    }
    else {
      setMessage('Something went wrong');
    }
    setUploading(false);
  }

  const handleUpload = async (e) => {
    setSelectedFiles(e.currentTarget.files);
  }

  const handleDrop = async (e) => {
    e.preventDefault();
    if (e.dataTransfer.items.length > 0) {
      const files = e.dataTransfer.items
        .filter(i => i.kind === 'file')
        .map(i => i.getAsFile());
      setSelectedFiles(files);
    }
  }

  if (loading) {
    return <Progress setLoading={setLoading} />;
  }

  const errorItems = errors.map(e => {
    return (
      <ListItem key={e}>
        <ListItemText primary={e} />
      </ListItem>
    );
  });

  const fieldItems = fieldNames.map(fieldName => <MenuItem key={fieldName} value={fieldName}>{fieldName}</MenuItem>);

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.heading}>
          <div className={classes.header}>
            <BackButton to="/users" />
            <Typography variant="h4">Upload photos</Typography>
          </div>
        </div>
        <input
          className={classes.upload}
          accept="image/jpeg, image/png"
          id="upload-photo"
          multiple
          type="file"
          onChange={handleUpload} />
        <label htmlFor="upload-photo">
          <Tooltip placement="right" title="Upload photos">
            <IconButton 
              className={classes.spacing}
              aria-label="Upload photos" 
              component="span"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}>
                <Avatar className={classes.avatar} />
            </IconButton>
          </Tooltip>
        </label>
        <form className={classes.form} onSubmit={updateImages} noValidate>
          <FormControl 
            className={`${classes.input} ${classes.spacing}`} 
            variant="outlined" 
            size="small">
              <InputLabel id="fields">Filename</InputLabel>
              <Select 
                value={fieldName} 
                onChange={(e) => setFieldName(e.target.value)} 
                label="Filename"
                labelId="fields">
                  {fieldItems}
              </Select>
          </FormControl>
          <FormControlLabel
            className={classes.spacing}
            control={<Checkbox checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} />}
            label="Overwrite existing photos?" />
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            type="submit"
            disabled={isDisabled}>{uploading ? 'Uploading...' : 'Upload'}</Button>
          <FormHelperText>{selectedFiles.length > 0 ? `${selectedFiles.length} files selected` : ''}</FormHelperText>
        </form>
        <Dialog 
          open={showErrors} 
          onClose={() => setShowErrors(false)} 
          aria-labelledby="dialog-title">
          <DialogTitle id="dialog-title">Errors</DialogTitle>
          <DialogContent className={classes.root}>
            <List>{errorItems}</List>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setShowErrors(false)} 
              color="primary">Close</Button>
          </DialogActions>
        </Dialog>
        <Snackbar message={message} setMessage={setMessage} />
      </div>
    </div>
  );
}

export default InviteSingleDetail;
