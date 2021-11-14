import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import InviteSingleAreas from './InviteSingleAreas';
import Tooltip from '@material-ui/core/Tooltip';
import useFetch from '../hooks/useFetch';
import Progress from '../common/Progress';
import CustomField from '../field/CustomField';
import { makeAreaDate } from '../utils/date';
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
  const [fields, setFields] = useState([]);
  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);

  const history = useHistory();
  const classes = useStyles();
  const client = useClient();

  const { setMessage } = client;

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
    fields = fields.map(field => {
      const value = field.fieldType === 'Date' ? null : '';
      return {...field, value };
    });
    setFields(fields);
  }
  const rolesHandler = (roles) => setRoles(roles);
  const locationsHandler = (locations) => setLocations(locations);

  const loading = useFetch([
    { url: '/fields/getAllFields', handler: fieldsHandler },
    { url: '/roles/getSelectListItems', handler: rolesHandler },
    { url: '/areas/getWithLocation', handler: locationsHandler }]);

  const inviteUser = async () => {
    const areas = userAreas.map(ua => {
      const timeZone = ua.area.timeZone;
      return { 
        roleId: ua.role.id, 
        areaId: ua.area.id,
        startTime: makeAreaDate(ua.startTime, timeZone),
        endTime: makeAreaDate(ua.endTime, timeZone, 1),
        isAdmin: ua.isAdmin
      }
    });
    const userFields = fields
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
      cache.clear();
      history.push('/users');
      setMessage('Invitation sent');
    }
    else {
      setMessage('Something went wrong');
    }
  }

  const handleAddAreas = (userAreas) => {
    setUserAreas(areas => [...areas, ...userAreas]);
  }

  const handleUpload = async (e) => {
    const files = e.currentTarget.files;
    if (files.length > 0) {
      const response = await client.uploadFiles('/files/uploadPhotos', files);
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
        const response = await client.uploadFiles('/files/uploadPhotos', [file]);
        const storedFiles = await response.json();
        setImageId(storedFiles[0].fileId);
      }
    }
  }

  if (loading) {
    return <Progress loading={loading} />;
  }

  const additionalFields = fields.map((field, i) => {
    const setValue = (value) => {
      setFields(fields => {
        fields[i] = {...fields[i], value };
        return [...fields];
      });
    }
    return (
      <CustomField
        key={i}
        className={classes.spacing} 
        field={field} 
        setValue={setValue} />
    );
  });

  if (showAreas) {
    return (
      <InviteSingleAreas 
        user={user} 
        setShowAreas={setShowAreas}
        userAreas={userAreas}
        setUserAreas={setUserAreas}
        inviteUser={inviteUser}
        roles={roles}
        locations={locations}
        handleAddAreas={handleAddAreas} />
    );
  }

  return (
    <FormLayout title="Invite users" backTo="/users">
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
    </FormLayout>
  );
}

export default InviteSingleDetail;
