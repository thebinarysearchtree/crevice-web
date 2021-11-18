import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import styles from '../styles/list';
import SearchBox from '../common/SearchBox';
import useFetch from '../hooks/useFetch';
import Progress from '../common/Progress';
import { Link as RouterLink } from 'react-router-dom';
import RoleChip from '../common/RoleChip';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Avatar from '../common/Avatar';
import useParamState from '../hooks/useParamState';
import useSyncParams from '../hooks/useSyncParams';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

const useStyles = makeStyles((theme) => ({
  ...styles(theme),
  clearFilters: {
    marginRight: theme.spacing(1)
  },
  nameCell: {
    paddingLeft: '0px',
    width: '160px'
  },
  buttonMargin: {
    marginRight: theme.spacing(1)
  },
  avatarCell: {
    width: '64px'
  },
  users: {
    display: 'flex',
    flexDirection: 'column'
  },
  user: {
    display: 'flex',
    padding: theme.spacing(2)
  },
  avatar: {
    marginRight: theme.spacing(1)
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    width: '200px'
  },
  role: {
    marginRight: theme.spacing(1)
  },
  areas: {
    color: theme.palette.text.secondary
  },
  booked: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end',
    color: theme.palette.text.secondary
  }
}));

function List() {
  const [users, setUsers] = useState(null);
  const [roles, setRoles] = useState([]);
  const [areas, setAreas] = useState([]);
  const [searchTerm, setSearchTerm, searchTermTranslator, searchTermParam] = useParamState({
    name: 'searchTerm',
    parser: null,
    defaultValue: '',
    hideDefault: true
  });
  const [activeSearchTerm, setActiveSearchTerm] = useState(searchTermParam ? searchTermParam : '');
  const [roleId, setRoleId, roleTranslator] = useParamState({
    name: 'roleId',
    defaultValue: -1,
    hideDefault: true
  });
  const [areaId, setAreaId, areaTranslator] = useParamState({
    name: 'areaId',
    defaultValue: -1,
    hideDefault: true
  });
  const [page, setPage, pageTranslator] = useParamState({
    name: 'page',
    defaultValue: 0,
    hideDefault: true
  });
  const [count, setCount] = useState(null);

  const query = {
    searchTerm,
    roleId,
    areaId,
    page,
    count
  };

  const classes = useStyles();

  const usersHandler = (users) => {
    setUsers(users);
    if (users.length === 0) {
      setCount(0);
    }
    else if (users[0].totalCount) {
      setCount(users[0].totalCount);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setSearchTerm(activeSearchTerm);
  }

  const handleClearFilters = () => {
    setAreaId(-1);
    setRoleId(-1);
    setPage(0);
  }

  const handlePageChange = (e, page) => {
    setPage(page);
  }

  const handleRoleChange = (roleId) => {
    setRoleId(roleId);
    setPage(0);
  }

  const handleAreaChange = (areaId) => {
    setAreaId(areaId);
    setPage(0);
  }

  useSyncParams(true, [searchTermTranslator, roleTranslator, areaTranslator, pageTranslator]);

  const rolesHandler = (roles) => setRoles(roles);
  const areasHandler = (areas) => setAreas(areas);

  const loading = useFetch([
    { url: '/users/find', handler: usersHandler, data: query, unstable: count === null },
    { url: '/roles/getSelectListItems', handler: rolesHandler },
    { url: '/areas/getSelectListItems', handler: areasHandler }]);

  if (loading) {
    return <Progress loading={loading} />;
  }
  
  const tableRows = users.map((u, i) => {
    const url = `/users/${u.id}`;
    const roles = u.roles.map(role => {
      return <RoleChip className={classes.role} size="small" label={role.name} colour={role.colour} />;
    });
    return (
      <React.Fragment>
        <div key={u.id} className={classes.user}>
          <Avatar className={classes.avatar} user={u} />
          <div className={classes.userDetails}>
            <RouterLink 
              className={classes.link} 
              to={url}>{u.name}</RouterLink>
            <span className={classes.areas}>{u.areaNames[0]}</span>
          </div>
          {roles}
          <div className={classes.booked}>{`booked ${u.booked} attended ${u.attended} attended time ${u.attendedTime}`}</div>
        </div>
        {i === users.length - 1 ? null : <Divider />}
      </React.Fragment>
    );
  });

  const clearFilters = areaId === -1 && roleId === -1 ? null : (
    <Chip 
      className={classes.clearFilters} 
      onClick={handleClearFilters} 
      onDelete={handleClearFilters} 
      label="Clear filters" />
  );

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.toolbar}>
          <SearchBox 
            variant="form"
            placeholder="Search..."
            value={activeSearchTerm}
            onChange={(e) => setActiveSearchTerm(e.target.value)}
            onSubmit={handleSearch} />
          <div className={classes.grow} />
          {clearFilters}
          <Button
            className={classes.buttonMargin}
            variant="contained"
            component={RouterLink} 
            to="/users/uploadPhotos">Upload photos</Button>
          <Button
            className={classes.buttonMargin}
            variant="contained"
            component={RouterLink} 
            to="/users/inviteMany">Invite many</Button>
          <Button
            variant="contained"
            color="secondary"
            component={RouterLink} 
            to="/users/inviteSingle">Invite user</Button>
        </div>
        <Paper className={classes.users}>{tableRows}</Paper>
      </div>
    </div>
  );
}

export default List;
