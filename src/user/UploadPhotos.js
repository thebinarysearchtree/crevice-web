import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import Progress from '../common/Progress';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import useFetch from '../hooks/useFetch';
import { useClient } from '../auth';
import cache from '../cache';
import FormLayout from '../FormLayout';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    paddingLeft: theme.spacing(7),
    paddingRight: theme.spacing(7),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    marginBottom: theme.spacing(40)
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
    flexDirection: 'column',
    width: '300px'
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
  },
  avatarText: {
    fontSize: '30px',
    marginLeft: '-10px'
  }
}));

function UploadPhotos() {
  const [fieldName, setFieldName] = useState('Email');
  const [overwrite, setOverwrite] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [fieldNames, setFieldNames] = useState([]);
  const [showErrors, setShowErrors] = useState(false);
  const [uploading, setUploading] = useState(false);

  const history = useHistory();
  const classes = useStyles();
  const client = useClient();

  const { setMessage } = client;

  const isDisabled = uploading || selectedFiles.length === 0;

  const fieldsHandler = (fields) => {
    const names = fields.map(f => f.name);
    setFieldNames(['Email', 'Phone', ...names]);
  }

  const loading = useFetch([{
    url: '/fields/getFilenameFields',
    handler: fieldsHandler
  }]);

  const updateImages = async (e) => {
    e.preventDefault();
    setUploading(true);
    let response = await client.uploadFiles('/files/uploadPhotos', selectedFiles);
    if (response.ok) {
      const files = await response.json();
      const storedFiles = files.filter(f => !f.error);
      const uploadErrors = files.filter(f => f.error);
      const query = {
        files: storedFiles,
        fieldName,
        overwrite
      };
      response = await client.postData('/users/updateImages', query);
      if (response.ok) {
        const updateErrors = await response.json();
        setErrors([...uploadErrors, ...updateErrors]);
        if (uploadErrors.length > 0 || updateErrors.length > 0) {
          setShowErrors(true);
        }
        else {
          cache.clear();
          history.push('/users');
          setMessage(`${storedFiles.length} photos added`);
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
      const files = Array.from(e.dataTransfer.items)
        .filter(i => i.kind === 'file')
        .map(i => i.getAsFile());
      setSelectedFiles(files);
    }
  }

  if (loading) {
    return <Progress loading={loading} />;
  }

  const tableRows = errors.map(e => {
    return (
      <TableRow key={e.originalName}>
        <TableCell align="left">{e.originalName}</TableCell>
        <TableCell align="left">{e.error}</TableCell>
      </TableRow>
    );
  });

  const fieldItems = fieldNames.map(fieldName => <MenuItem key={fieldName} value={fieldName}>{fieldName}</MenuItem>);

  const avatarText = selectedFiles.length === 0 ? null : (
    <span className={classes.avatarText}>{`+${selectedFiles.length}`}</span>
  );

  return (
    <FormLayout title="Upload photos" backTo="/users">
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
              <Avatar className={classes.avatar}>{avatarText}</Avatar>
          </IconButton>
        </Tooltip>
      </label>
      <form className={classes.form} id="form" onSubmit={updateImages} noValidate>
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
      </form>
      <Dialog 
        open={showErrors} 
        onClose={() => setShowErrors(false)} 
        aria-labelledby="dialog-title"
        scroll="paper">
        <DialogTitle id="dialog-title">Errors</DialogTitle>
        <DialogContent className={classes.root}>
          <Table aria-label="errors table">
            <TableHead>
              <TableRow>
                <TableCell align="left">Filename</TableCell>
                <TableCell align="left">Error</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableRows}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowErrors(false)} 
            color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </FormLayout>
  );
}

export default UploadPhotos;
