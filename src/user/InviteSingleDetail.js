import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Snackbar from '../common/Snackbar';
import { useHistory } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import InviteSingleAreas from './InviteSingleAreas';
import Tooltip from '@material-ui/core/Tooltip';
import BackButton from '../common/BackButton';
import useFetch from '../hooks/useFetch';
import Progress from '../common/Progress';
import CustomField from '../field/CustomField';

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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pager, setPager] = useState('');
  const [imageId, setImageId] = useState(null);
  const [showAreas, setShowAreas] = useState(false);
  const [userAreas, setUserAreas] = useState([]);
  const [message, setMessage] = useState('');
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  const history = useHistory();
  const classes = useStyles();

  const isDisabled = !firstName || !lastName || !email || !email.includes('@');
  const photoSrc = imageId ? `/photos/${imageId}.jpg` : null;

  const user = {
    firstName,
    lastName,
    email,
    phone,
    pager,
    imageId
  };

  const fieldsHandler = (fields) => {
    setFields(fields);
    setLoading(false);
  }

  useFetch('/fields/getAllFields', fieldsHandler);

  const inviteUser = async () => {
    const areas = userAreas.map(ua => ({ 
      roleId: ua.role.id, 
      areaId: ua.area.id, 
      startTime: ua.startTime, 
      endTime: ua.endTime,
      isAdmin: ua.isAdmin
    }));
    const userFields = fields
      .flat()
      .filter(f => f.value)
      .map(f => {
        const { id, fieldType, value } = f;
        const fieldId = id;
        const itemId = fieldType === 'Select' ? value : null;
        const textValue = fieldType === 'Select' || fieldType === 'Date' ? null : value;
        const dateValue = fieldType === 'Date' ? value : null;
        return { fieldId, itemId, textValue, dateValue };
      });
    const response = await client.postData('/users/inviteUsers', { users: [{ ...user, userAreas: areas, userFields }] });
    if (response.ok) {
      history.push('/users', { message: 'User created and invitation sent' });
    }
    else {
      setMessage('Something went wrong');
    }
  }

  const handleUpload = async (e) => {
    const files = e.currentTarget.files;
    if (files.length > 0) {
      const response = await client.uploadPhotos(files);
      const storedFiles = await response.json();
      setImageId(storedFiles[0].fileId);
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault();
    if (e.dataTransfer.items.length > 0) {
      const item = e.dataTransfer.items[0];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        const response = await client.uploadPhotos([file]);
        const storedFiles = await response.json();
        setImageId(storedFiles[0].fileId);
      }
    }
  }

  if (loading) {
    return <Progress setLoading={setLoading} />;
  }

  const additionalFields = fields.map((field, i) => {
    const setField = (setter) => {
      setFields(fields => {
        fields[i] = setter(fields[i]);
        return [...fields];
      });
    }
    return (
      <CustomField
        key={i}
        className={classes.spacing} 
        fields={field} 
        setFields={setField} />
    );
  });

  if (showAreas) {
    return (
      <InviteSingleAreas 
        user={user} 
        setShowAreas={setShowAreas}
        userAreas={userAreas}
        setUserAreas={setUserAreas}
        inviteUser={inviteUser} />
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.heading}>
          <div className={classes.header}>
            <BackButton to="/users/invite" />
            <Typography variant="h4">Invite users</Typography>
          </div>
        </div>
        <input
          className={classes.upload}
          accept="image/jpeg, image/png"
          id="upload-photo"
          type="file"
          onChange={handleUpload} />
        <label htmlFor="upload-photo">
          <Tooltip placement="right" title="Add a profile photo">
            <IconButton 
              className={classes.spacing}
              aria-label="upload photo" 
              component="span"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}>
                <Avatar className={classes.avatar} src={photoSrc} />
            </IconButton>
          </Tooltip>
        </label>
        <form className={classes.form} onSubmit={() => setShowAreas(true)} noValidate>
          <div className={`${classes.container} ${classes.spacing}`}>
            <TextField
              InputProps={{ className: classes.input }}
              className={`${classes.short} ${classes.mr}`}
              variant="outlined"
              size="small"
              label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)} />
            <TextField
              InputProps={{ className: classes.input }}
              className={classes.short}
              variant="outlined"
              size="small"
              label="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)} />
          </div>
          <TextField
            InputProps={{ className: classes.input }}
            className={`${classes.email} ${classes.spacing}`}
            variant="outlined"
            size="small"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} />
          <TextField
            InputProps={{ className: classes.input }}
            className={`${classes.short} ${classes.spacing}`}
            variant="outlined"
            size="small"
            label="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)} />
          <TextField
            InputProps={{ className: classes.input }}
            className={`${classes.short} ${classes.spacing}`}
            variant="outlined"
            size="small"
            label="Pager (optional)"
            value={pager}
            onChange={(e) => setPager(e.target.value)} />
          {additionalFields}
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

export default InviteSingleDetail;
