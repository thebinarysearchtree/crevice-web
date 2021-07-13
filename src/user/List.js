import React, { useState } from 'react';
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
import Avatar from '@material-ui/core/Avatar';
import TableFilterCell from '../common/TableFilterCell';
import RoleChip from '../common/RoleChip';
import MorePopover from '../common/MorePopover';
import useMessage from '../hooks/useMessage';
import Button from '@material-ui/core/Button';
import { makeReviver } from '../utils/data';

const useStyles = makeStyles(styles);

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
  const roleIdParam = parseInt(params.get('roleId'));
  const areaIdParam = parseInt(params.get('areaId'));
  const pageParam = parseInt(params.get('page'));
  const countParam = parseInt(params.get('count'));
  const searchParam = params.get('search');

  const [searchTerm, setSearchTerm] = useState(searchParam ? searchParam : '');
  const [roleId, setRoleId] = useState(roleIdParam ? roleIdParam : -1);
  const [areaId, setAreaId] = useState(areaIdParam ? areaIdParam : -1);
  const [page, setPage] = useState(pageParam ? pageParam : 0);
  const [count, setCount] = useState(countParam ? countParam : 0);
  const [activeDate, setActiveDate] = useState(null);
  const [activeState, setActiveState] = useState('All');

  const roleMap = new Map();
  for (const role of roles) {
    roleMap.set(role.id, role);
  }

  const query = {
    searchTerm,
    roleId,
    areaId,
    page,
    activeDate,
    activeState
  };

  const history = useHistory();

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
    updateUrl(areaId, roleId, 0, count);
    search({ ...query, page: 0 });
  }

  const search = async (query) => {
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

  const updateUrl = (areaId, roleId, page, count) => {
    const url = `${location.pathname}?areaId=${areaId}&roleId=${roleId}&page=${page}&count=${count}&search=${searchTerm}`;
    history.replace(url, null);
  }

  const handleChangePage = (e, page) => {
    setPage(page);
    search({ ...query, page });
    updateUrl(areaId, roleId, page, count);
  }

  const handleRoleChange = (roleId) => {
    setRoleId(roleId);
    setPage(0);
    search({ ...query, roleId, page: 0 });
    updateUrl(areaId, roleId, 0, count);
  }

  const handleAreaChange = (areaId) => {
    setAreaId(areaId);
    setPage(0);
    search({ ...query, areaId, page: 0 });
    updateUrl(areaId, roleId, 0, count);
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
    const role = roleMap.get(u.roleIds[0]);
    return (
      <TableRow key={u.id}>
          <TableCell><Avatar className={classes.avatar} alt={u.name} src={u.imageId ? `/photos/${u.imageId}.jpg` : null} /></TableCell>
          <TableCell className={classes.nameCell} component="th" scope="row">
            <RouterLink 
              className={classes.link} 
              to={`/users/${u.id}`}>{u.name}</RouterLink>
          </TableCell>
          <TableCell align="left"><RoleChip size="small" label={role.name} colour={role.colour} /></TableCell>
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSubmit={handleSearch} />
          <div className={classes.grow} />
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
