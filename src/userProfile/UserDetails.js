import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import Avatar from '@material-ui/core/Avatar';
import { useHistory, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import Progress from '../common/Progress';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Divider from '@material-ui/core/Divider';
import Areas from './Areas';
import Shifts from './Shifts';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    minHeight: '100vh',
    backgroundColor: 'white'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },
  avatar: {
    width: '150px',
    height: '150px',
    fontSize: '70px'
  },
  avatarContainer: {
    paddingBottom: theme.spacing(3)
  },
  nameContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: theme.spacing(3)
  },
  fieldContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: theme.spacing(2)
  },
  fieldName: {
    fontWeight: 600
  },
  tabs: {
    backgroundColor: 'white'
  }
}));

function UserDetails(props) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const classes = useStyles();

  const { userId } = useParams();

  const handler = (user) => {
    setUser(user);
    setLoading(false);
  }

  useFetch('/users/getUserDetails', handler, { userId });

  if (loading) {
    return <Progress loading={loading} />;
  }

  const photoSrc = user.imageId ? `/photos/${user.imageId}.jpg` : null;

  const phone = user.phone ? (
    <div className={classes.fieldContainer}>
      <Typography className={classes.fieldName} variant="subtitle2">Phone</Typography>
      <Link href={`tel:${user.phone}`}>{user.phone}</Link>
    </div>
  ) : null;

  const pager = user.pager ? (
    <div className={classes.fieldContainer}>
      <Typography className={classes.fieldName} variant="subtitle2">Pager</Typography>
      <Typography variant="body2">{user.pager}</Typography>
    </div>
  ) : null;

  const roles = user.roles.length > 0 ? (
    <div className={classes.fieldContainer}>
      <Typography className={classes.fieldName} variant="subtitle2">Roles</Typography>
      <Typography variant="body2">{user.roles.join(', ')}</Typography>
    </div>
  ) : null;

  const areas = user.areas.length > 0 ? (
    <div className={classes.fieldContainer}>
      <Typography className={classes.fieldName} variant="subtitle2">Areas</Typography>
      <Typography variant="body2">{user.areas.join(', ')}</Typography>
    </div>
  ) : null;

  const fields = user.fields.map(field => {
    const { fieldName, itemName, textValue, dateValue } = field;
    let value;
    if (dateValue) {
      value = new Date(dateValue).toLocaleDateString();
    }
    else {
      value = itemName ? itemName : textValue;
    }
    return (
      <div key={fieldName} className={classes.fieldContainer}>
        <Typography className={classes.fieldName} variant="subtitle2">{fieldName}</Typography>
        <Typography variant="body2">{value}</Typography>
      </div>
    );
  });

  return (
    <div className={classes.root}>
      <div className={classes.userDetails}>
        <div className={classes.avatarContainer}>
          <Avatar className={classes.avatar} src={photoSrc} alt={user.name} />
        </div>
        <div className={classes.nameContainer}>
          <Typography variant="h5">{user.name}</Typography>
          <Link href={`mailto:${user.email}`}>{user.email}</Link>
        </div>
        {phone}
        {pager}
        {fields}
        {roles}
        {areas}
      </div>
      <div className={classes.content}>
        <Tabs className={classes.tabs} value={activeTab} onChange={(e, i) => setActiveTab(i)}>
          <Tab label="Shifts" />
          <Tab label="Areas" />
        </Tabs>
        <Divider />
        <div hidden={activeTab !== 0}>
          <Shifts userId={userId} />
        </div>
        <div hidden={activeTab !== 1}>
          <Areas userId={userId} />
        </div>
      </div>
    </div>
  );
}

export default UserDetails;
