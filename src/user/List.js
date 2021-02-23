import React, { useState } from 'react';
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
import useStyles from '../styles/list';
import ConfirmButton from '../common/ConfirmButton';
import SearchBox from '../common/SearchBox';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import useFetchMany from '../hooks/useFetchMany';
import Progress from '../common/Progress';
import FilterButton from '../common/FilterButton';
import { useLocation } from 'react-router-dom';

function List() {
  const [users, setUsers] = useState(null);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [areas, setAreas] = useState([]);
  const [count, setCount] = useState(0);

  const classes = useStyles();
  const params = new URLSearchParams(useLocation().search);

  const roleId = parseInt(params.get('roleId'), 10);
  const areaId = parseInt(params.get('areaId'), 10);

  const usersHandler = (result) => {
    const { users, count } = result;
    setUsers(users);
    setCount(count);
  }

  const search = async () => {
    const response = await client.postData('/areas/find', query);
    if (response.ok) {
      const result = await response.json();
      usersHandler(result);
    }
    else {
      setMessage('Something went wrong');
    }
  }

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  }

  const handleSearch = (e) => {
    const term = e.target.value;
    if (!term) {
      setUsers([]);
    }
  }

  const filterByRoleId = (roleId) => {
    if (roleId === -1) {
      setUsers([]);
    }
  }

  const filterByAreaId = (areaId) => {
    if (areaId === -1) {
      setUsers([]);
    }
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
    { url: '/users/find', handler: usersHandler, data: { roleId, areaId } },
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
          <TableCell component="th" scope="row">
            <Link 
              className={classes.link} 
              to={`/users/${u.id}`}>{u.name}</Link>
          </TableCell>
          <TableCell align="right">{u.roles.join(', ')}</TableCell>
          <TableCell align="right">{u.areas.join(', ')}</TableCell>
          <TableCell align="right">{u.shiftCount}</TableCell>
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
        </div>
        <div className={classes.toolbar}>
          <SearchBox 
            placeholder="Search by name..."
            onChange={handleSearch} />
          <FilterButton
            id="role-filter"
            items={roles}
            selectedItemId={roleId}
            filterBy={filterByRoleId}>Role</FilterButton>
          <FilterButton
            id="area-filter"
            items={areas}
            selectedItemId={areaId}
            filterBy={filterByAreaId}>Area</FilterButton>
          <div className={classes.grow} />
          <Button 
            variant="contained"
            color="primary"
            onClick={handleNewClick}>New user</Button>
        </div>
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="areas table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Roles</TableCell>
                <TableCell align="right">Areas</TableCell>
                <TableCell align="right">Shifts Booked</TableCell>
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
                  colSpan={5}
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
