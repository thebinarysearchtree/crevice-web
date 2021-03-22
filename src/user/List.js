import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
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
import { Link, useLocation } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';
import Chip from '@material-ui/core/Chip';
import TableFilterCell from '../common/TableFilterCell';

const useStyles = makeStyles(styles);

function List() {
  const [users, setUsers] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [areas, setAreas] = useState([]);
  const [count, setCount] = useState(0);
  const [searchTimeout, setSearchTimeout] = useState(0);

  const classes = useStyles();
  const params = new URLSearchParams(useLocation().search);
  const roleIdParam = parseInt(params.get('roleId'));
  const areaIdParam = parseInt(params.get('areaId'));

  const [searchTerm, setSearchTerm] = useState('');
  const [roleId, setRoleId] = useState(roleIdParam ? roleIdParam : -1);
  const [areaId, setAreaId] = useState(areaIdParam ? areaIdParam : -1);
  const [lastUserId, setLastUserId] = useState(-1);
  const [page, setPage] = useState(0);
  const [activeDate, setActiveDate] = useState(null);

  const query = {
    searchTerm,
    roleId,
    areaId,
    lastUserId,
    activeDate
  };

  const usersHandler = (result) => {
    const { users, count } = result;
    setUsers(users);
    if (users.length > 0) {
      setLastUserId(users[users.length - 1].id);
    }
    else {
      setLastUserId(-1);
    }
    if (count !== -1) {
      setCount(count);
    }
  }

  const search = async (query, pageChange) => {
    if (!pageChange) {
      query.lastUserId = -1;
    }
    const response = await client.postData('/users/find', query);
    if (response.ok) {
      const result = await response.json();
      usersHandler(result);
    }
    else {
      setMessage('Something went wrong');
    }
  }

  const handleChangePage = (e, page) => {
    setPage(page);
    search(query, true);
  }

  const handleSearch = (e) => {
    clearTimeout(searchTimeout);
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);
    setSearchTimeout(setTimeout(() => search({ ...query, searchTerm }), 200));
  }

  const handleRoleChange = (roleId) => {
    setRoleId(roleId);
    search({ ...query, roleId });
  }

  const handleAreaChange = (areaId) => {
    setAreaId(areaId);
    search({ ...query, areaId });
  }

  const handleChangeDate = (activeDate) => {
    setActiveDate(activeDate);
    search({ ...query, activeDate });
  }

  const deleteUser = async (userId) => {
    const result = await client.postData('/users/remove', { userId });
    if (result) {
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
        <div className={classes.rightSection} />
      </div>
    );
  }
  
  const tableRows = users.map(u => {
    return (
      <TableRow key={u.id}>
          <TableCell><Avatar className={classes.avatar} alt={u.name} /></TableCell>
          <TableCell className={classes.nameCell} component="th" scope="row">
            <Link 
              className={classes.link} 
              to={`/users/${u.id}`}>{u.name}</Link>
          </TableCell>
          <TableCell align="right"><Chip size="small" label="Student" /></TableCell>
          <TableCell align="right">{u.areas.join(', ')}</TableCell>
          <TableCell align="right">{u.booked}</TableCell>
          <TableCell align="right">{u.attended}</TableCell>
          <TableCell align="right">
            <ConfirmButton
              className={classes.deleteButton}
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
          <Button 
            variant="contained"
            color="primary"
            component={Link}
            to="/users/invite">Invite users</Button>
        </div>
        <div className={classes.toolbar}>
          <SearchBox 
            placeholder="Search by name..."
            onChange={handleSearch} />
          <div className={classes.grow} />
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              className={classes.activeDate}
              disableToolbar
              variant="inline"
              format="dd/MM/yyyy"
              margin="normal"
              id="date-picker"
              label="Active on"
              value={activeDate}
              onChange={handleChangeDate}
              KeyboardButtonProps={{ 'aria-label': 'change area active date' }} />
          </MuiPickersUtilsProvider>
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
                  colSpan={7}
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
      <div className={classes.rightSection} />
    </div>
  );
}

export default List;
