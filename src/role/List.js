import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import styles from '../styles/list';
import Detail from './Detail';
import ConfirmButton from '../common/ConfirmButton';
import Progress from '../common/Progress';
import Link from '@material-ui/core/Link';
import { Link as RouterLink } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { useClient } from '../auth';
import Divider from '@material-ui/core/Divider';
import PageButtons from '../common/PageButtons';

const useStyles = makeStyles((theme) => ({
  ...styles(theme),
  colour: {
    padding: '0px',
    width: '8px'
  },
  roles: {
    display: 'flex',
    flexDirection: 'column'
  },
  role: {
    display: 'flex',
    padding: theme.spacing(2),
    width: '100%',
    justifyContent: 'space-between'
  },
  roleDetails: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    marginRight: theme.spacing(1),
    alignItems: 'flex-start'
  },
  createdAt: {
    color: theme.palette.text.secondary
  },
  settings: {
    flex: 2,
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1)
  },
  container: {
    display: 'flex'
  },
  buttons: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '4px'
  },
  count: {
    flex: 1,
    marginRight: theme.spacing(1)
  }
}));

const makeText = (hours) => {
  if (hours === 0) {
    return 'any time';
  }
  if (hours === 1) {
    return `${hours} hour`;
  }
  return `${hours} hours`;
}

function List() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [page, setPage] = useState(0);

  const classes = useStyles();
  const client = useClient();

  const rowsPerPage = 10;

  const sliceStart = page * rowsPerPage;
  const sliceEnd = sliceStart + rowsPerPage;

  const handleNewClick = () => {
    setSelectedRole({
      id: -1,
      name: '',
      colour: '',
      cancelBeforeMinutes: 60,
      bookBeforeMinutes: 60
    });
  }

  const deleteRole = async (roleId) => {
    await client.postMutation({
      url: '/roles/remove',
      data: { roleId },
      message: 'Role deleted'
    });
  }

  const loading = useFetch([{
    url: '/roles/find',
    handler: (roles) => setRoles(roles)
  }]);

  if (loading) {
    return <Progress loading={loading} />;
  }

  const currentRoles = roles.slice(sliceStart, sliceEnd);

  const roleItems = currentRoles.map((role, i) => {
    const { 
      id, 
      name, 
      colour, 
      createdAt, 
      bookBeforeMinutes, 
      cancelBeforeMinutes, 
      userCount
    } = role;
    const bookBeforeHours = bookBeforeMinutes / 60;
    const cancelBeforeHours = cancelBeforeMinutes / 60;
    let settingsText;
    if (bookBeforeHours === cancelBeforeHours) {
      if (bookBeforeHours === 0) {
        settingsText = 'Book and cancel shifts any time';
      }
      else {
        const hoursText = bookBeforeHours === 1 ? 'hour' : 'hours';
        settingsText = `Book and cancel at least ${bookBeforeHours} ${hoursText} before the shift starts`;
      }
    }
    else {
      if (cancelBeforeHours !== 0) {
        settingsText = `Book at least ${makeText(bookBeforeHours)} and cancel at least ${makeText(cancelBeforeHours)} before start`;
      }
      else {
        settingsText = `Book at least ${makeText(bookBeforeHours)} before start and cancel any time`;
      }
    }
    const count = userCount === 0 ? (
      <span>{userCount}</span>
    ) : (
      <Link to={`/users?roleId=${id}`} component={RouterLink}>{userCount} users</Link>
    );
    return (
      <React.Fragment key={id}>
        <div className={classes.container}>
          <div className={classes.colour} style={{ backgroundColor: `#${colour}`, padding: '0px' }} />
          <div className={classes.role}>
            <div className={classes.roleDetails}>
              <span className={classes.name} onClick={() => setSelectedRole({...role})}>{name}</span>
              <span className={classes.createdAt}>Created {new Date(createdAt).toLocaleDateString()}</span>
            </div>
            <div className={classes.count}>{count}</div>
            <div className={classes.settings}>{settingsText}</div>
            <ConfirmButton
              title={`Delete the ${name} role?`}
              content="Make sure there are no users with this role before deleting it."
              onClick={() => deleteRole(id)} />
          </div>
        </div>
        {i === currentRoles.length - 1 ? null : <Divider />}
      </React.Fragment>
    );
  });

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.heading}>
          <div />
          <Button 
            variant="contained"
            color="secondary"
            onClick={handleNewClick}>New role</Button>
        </div>
        <Paper className={classes.roles}>
          {roleItems}
        </Paper>
        <PageButtons 
          onBack={() => setPage(page => page - 1)}
          onForward={() => setPage(page => page + 1)}
          onBackToStart={() => setPage(0)}
          page={page}
          count={roles.length}
          itemsPerPage={10} />
        <Detail 
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole} />
      </div>
    </div>
  );
}

export default List;
