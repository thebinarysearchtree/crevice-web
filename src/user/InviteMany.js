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
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import AreasTable from './AreasTable';
import AddArea from './AddArea';
import Paper from '@material-ui/core/Paper';

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
    maxWidth: '700px',
    width: '100%',
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
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4)
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
  icon: {
    width: '100%',
    height: '100px',
    borderStyle: 'dashed'
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
  selectedFilename: {
    alignSelf: 'center',
    marginLeft: theme.spacing(1)
  },
  fieldName: {
    fontWeight: 600
  },
  guideHeading: {
    marginBottom: theme.spacing(2)
  },
  guideBody: {
    marginBottom: theme.spacing(2)
  }
}));

function InviteMany() {
  const [updateUsers, setUpdateUsers] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showErrors, setShowErrors] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userAreas, setUserAreas] = useState([]);
  const [showAddArea, setShowAddArea] = useState(false);
  const [fields, setFields] = useState([]);

  const history = useHistory();
  const classes = useStyles();

  const isDisabled = uploading || selectedFiles.length === 0 || userAreas.length === 0;

  const inviteUsers = async (e) => {
    e.preventDefault();
    setUploading(true);
    let response = await client.uploadFiles('/files/uploadFiles', selectedFiles);
    if (response.ok) {
      const files = await response.json();
      const fileInfo = files[0];
      const areas = userAreas.map(ua => ({ 
        roleId: ua.role.id, 
        areaId: ua.area.id, 
        startTime: ua.startTime, 
        endTime: ua.endTime,
        isAdmin: ua.isAdmin
      }));
      response = await client.postData('/users/inviteUsers', { fileInfo, userAreas: areas });
      if (response.ok) {
        const errors = await response.json();
        setErrors(errors);
        if (errors.length > 0) {
          setShowErrors(true);
        }
        else {
          history.push('/users', { message: 'Users added' });
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

  const fieldsHandler = (fields) => {
    setFields(fields);
    setLoading(false);
  }

  useFetch('/fields/getCsvFields', fieldsHandler);

  if (loading) {
    return <Progress loading={loading} />;
  }

  if (showAddArea) {
    return <AddArea setShowAddArea={setShowAddArea} setUserAreas={setUserAreas} userAreas={userAreas} />;
  }

  const selectedFilename = selectedFiles.length == 0 ? null : (
    <Typography className={classes.selectedFilename} variant="body1">{selectedFiles[0].name}</Typography>
  );

  let fieldsText;
  if (fields.length === 0) {
    fieldsText = null;
  }
  else if (fields.length === 1) {
    fieldsText = <span>You can also include <span className={classes.fieldName}>{fields[0].name}</span> if needed.</span>
  }
  else {
    const fieldNames = fields
      .slice(0, fields.length - 1)
      .map(f => <span key={f.name}><span className={classes.fieldName}>{f.name}</span>, </span>);
    fieldsText = <span>You can also include {fieldNames} and <span className={classes.fieldName}>{fields[fields.length - 1].name}</span> if needed.</span>;
  }

  const tableRows = errors.map((e, i) => {
    return (
      <TableRow key={i}>
        <TableCell align="left">{e.type}</TableCell>
        <TableCell align="left">{e.message}</TableCell>
      </TableRow>
    );
  });

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.heading}>
          <div className={classes.header}>
            <BackButton to="/users" />
            <Typography variant="h4">Invite users</Typography>
          </div>
        </div>
        <Paper className={classes.paper}>
          <Typography className={classes.guideHeading} variant="h5">Guidelines</Typography>
          <Typography className={classes.guideBody} variant="body1">
            To add many users at once, you can upload a csv file. The 
            first row of the csv file should include 
            <span className={classes.fieldName}> First name</span>, 
            <span className={classes.fieldName}> Last name</span>, 
            <span className={classes.fieldName}> Email</span>, and optionally 
            <span className={classes.fieldName}> Phone</span> and 
            <span className={classes.fieldName}> Pager</span>. {fieldsText}
          </Typography>
          <input
            className={classes.upload}
            accept="text/csv"
            id="upload-csv"
            type="file"
            onChange={handleUpload} />
          <div className={classes.container}>
            <label htmlFor="upload-csv">
              <Button
                variant="contained"
                color="primary"
                component="span">Upload</Button>
            </label>
            {selectedFilename}
          </div>
        </Paper>
        <form className={classes.form} onSubmit={inviteUsers} noValidate>
          <AreasTable setShowAddArea={setShowAddArea} userAreas={userAreas} setUserAreas={setUserAreas} />
          <div>
            <FormControlLabel
              className={classes.spacing}
              control={<Checkbox checked={updateUsers} onChange={(e) => setUpdateUsers(e.target.checked)} />}
              label="Update existing users?" />
          </div>
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            type="submit"
            disabled={isDisabled}>{uploading ? 'Uploading...' : 'Invite'}</Button>
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
                  <TableCell align="left">Type</TableCell>
                  <TableCell align="left">Message</TableCell>
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
        <Snackbar message={message} setMessage={setMessage} />
      </div>
    </div>
  );
}

export default InviteMany;