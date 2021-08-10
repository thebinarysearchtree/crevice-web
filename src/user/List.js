import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Snackbar from '../common/Snackbar';
import styles from '../styles/list';
import ConfirmButton from '../common/ConfirmButton';
import SearchBox from '../common/SearchBox';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import useFetchMany from '../hooks/useFetchMany';
import Progress from '../common/Progress';
import { Link as RouterLink, useLocation, useHistory } from 'react-router-dom';
import TableFilterCell from '../common/TableFilterCell';
import RoleChip from '../common/RoleChip';
import MorePopover from '../common/MorePopover';
import useMessage from '../hooks/useMessage';
import Button from '@material-ui/core/Button';
import { makeReviver } from '../utils/data';
import Chip from '@material-ui/core/Chip';
import Avatar from '../common/Avatar';

const useStyles = makeStyles((theme) => ({
  ...styles(theme),
  clearFilters: {
    marginRight: theme.spacing(1)
  },
  nameCell: {
    paddingLeft: '0px'
  },
  buttonMargin: {
    marginRight: theme.spacing(1)
  }
}));

const reviver = makeReviver();

function List() {
  const [users, setUsers] = useState(null);
  const [message, setMessage] = useMessage();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [areas, setAreas] = useState([]);

  const classes = useStyles();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const roleIdParam = parseInt(params.get('roleId')) || -1;
  const areaIdParam = parseInt(params.get('areaId')) || -1;
  const pageParam = parseInt(params.get('page')) || 0;
  const searchParam = params.get('search') || '';
  const countParam = parseInt(params.get('count')) || 0;

  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [activeSearchTerm, setActiveSearchTerm] = useState(searchParam);
  const [roleId, setRoleId] = useState(roleIdParam);
  const [areaId, setAreaId] = useState(areaIdParam);
  const [page, setPage] = useState(pageParam);
  const [count, setCount] = useState(countParam);
  const [activeDate, setActiveDate] = useState(null);
  const [activeState, setActiveState] = useState('All');

  const query = {
    searchTerm,
    roleId,
    areaId,
    page,
    activeDate,
    activeState
  };

  const history = useHistory();

  useEffect(() => {
    updateUrl();
    if (!loading) {
      search();
    }
  }, [areaId, roleId, page, searchTerm]);

  useEffect(() => {
    setAreaId(areaIdParam);
    setRoleId(roleIdParam);
    setPage(pageParam);
    setSearchTerm(searchParam);
    setActiveSearchTerm(searchParam);
    setCount(countParam);
  }, [areaIdParam, roleIdParam, pageParam, searchParam]);

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

  const search = async () => {
    const response = await client.postData('/users/find', query);
    if (response.ok) {
      const text = await response.text();
      const users = JSON.parse(text, reviver);
      usersHandler(users);
    }
    else {
      setMessage('Something went wrong');
    }
  }

  const updateUrl = () => {
    const url = `${location.pathname}?areaId=${areaId}&roleId=${roleId}&page=${page}&search=${searchTerm}&count=${count}`;
    if (`${location.pathname}${location.search}` !== url) {
      if (location.search === '') {
        history.replace(url);
      }
      else {
        history.push(url);
      }
    }
  }

  const handleChangePage = (e, page) => {
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

  const deleteUser = async (userId) => {
    const response = await client.postData('/users/remove', { userId });
    if (response.ok) {
      setUsers(users => users.filter(u => u.id !== userId));
      setMessage('User deleted');
    }
    else {
      setMessage('Something went wrong');
    }
  }

  const rolesHandler = (roles) => setRoles(roles);
  const areasHandler = (areas) => setAreas(areas);

  useFetchMany(setLoading, [
    { url: '/users/find', handler: usersHandler, data: query },
    { url: '/roles/getSelectListItems', handler: rolesHandler },
    { url: '/areas/getSelectListItems', handler: areasHandler }]);

  if (loading) {
    return (
      <div className={classes.root}>
        <div className={classes.content}>
          <Progress loading={loading} />
        </div>
      </div>
    );
  }
  
  const tableRows = users.map(u => {
    const role = u.roles[0];
    const url = `/users/${u.id}`;
    return (
      <TableRow key={u.id}>
          <TableCell className={classes.iconCell}>
            <Avatar className={classes.avatar} user={u} size="medium" />
          </TableCell>
          <TableCell className={classes.nameCell} component="th" scope="row">
            <RouterLink 
              className={classes.link} 
              to={url}>{u.name}</RouterLink>
          </TableCell>
          <TableCell align="left" className={classes.iconCell}><RoleChip size="small" label={role.name} colour={role.colour} /></TableCell>
          <TableCell align="left"><MorePopover items={u.areaNames} /></TableCell>
          <TableCell align="right">{u.booked}</TableCell>
          <TableCell align="right">{u.attended}</TableCell>
          <TableCell align="right">{u.attendedTime}</TableCell>
          <TableCell align="right" className={classes.iconCell}>
            <ConfirmButton
              title={`Delete ${u.name}?`}
              content="All information related to this user will be deleted."
              onClick={() => deleteUser(u.id)} />
          </TableCell>
      </TableRow>
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
        <div className={classes.heading}>
          <Typography variant="h5">Users</Typography>
        </div>
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
            color="primary"
            component={RouterLink} 
            to="/users/inviteSingle">Invite user</Button>
        </div>
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="areas table">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell className={classes.nameCell}>Name</TableCell>
                <TableFilterCell
                  menuId="role-menu"
                  items={roles}
                  selectedItemId={roleId}
                  filter={handleRoleChange}>Roles</TableFilterCell>
                <TableFilterCell
                  menuId="area-menu"
                  items={areas}
                  selectedItemId={areaId}
                  filter={handleAreaChange}>Areas</TableFilterCell>
                <TableCell align="right">Booked</TableCell>
                <TableCell align="right">Attended</TableCell>
                <TableCell align="right">Attended Time</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableRows}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[]}
                  colSpan={8}
                  count={count}
                  rowsPerPage={10}
                  page={page}
                  onChangePage={handleChangePage} />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
        <Snackbar message={message} setMessage={setMessage} />
      </div>
    </div>
  );
}

export default List;
