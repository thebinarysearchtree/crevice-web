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
import useMessage from '../hooks/useMessage';
import styles from '../styles/list';
import Detail from './Detail';
import ConfirmButton from '../common/ConfirmButton';
import Progress from '../common/Progress';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import useFetch from '../hooks/useFetch';
import Link from '@material-ui/core/Link';
import { Link as RouterLink } from 'react-router-dom';

const useStyles = makeStyles(styles);

function List() {
  const [roles, setRoles] = useState(null);
  const [message, setMessage] = useMessage();
  const [selectedRole, setSelectedRole] = useState(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const classes = useStyles();

  const rowsPerPage = 10;

  const sliceStart = page * rowsPerPage;
  const sliceEnd = sliceStart + rowsPerPage;

  const handleNameClick = (role) => {
    setSelectedRole({ ...role });
    setOpen(true);
  }

  const handleNewClick = () => {
    setSelectedRole({
      id: -1,
      name: '',
      colour: '',
      createdAt: new Date().toISOString(),
      userCount: 0
    });
    setOpen(true);
  }

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  }

  const deleteRole = async (roleId) => {
    const response = await client.postData('/roles/remove', { roleId });
    if (response.ok) {
      setRoles(roles.filter(r => r.id !== roleId));
      setMessage('Role deleted');
    }
    else {
      setMessage('Something went wrong');
    }
  }

  const rolesHandler = (roles) => {
    setRoles(roles);
    setLoading(false);
  }

  useFetch('/roles/find', rolesHandler);

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

  const tableRows = roles.slice(sliceStart, sliceEnd).map(r => {
    return (
      <TableRow key={r.id} className={classes.tableRow}>
        <TableCell style={{ backgroundColor: `#${r.colour}`, padding: '0px' }}></TableCell>
        <TableCell component="th" scope="row">
          <span 
            className={classes.locationName}
            onClick={() => handleNameClick(r)}>{r.name}</span>
        </TableCell>
        <TableCell align="right">{new Date(r.createdAt).toLocaleDateString()}</TableCell>
        <TableCell align="right">
          <Link to={`/users?roleId=${r.id}`} component={RouterLink}>{r.userCount}</Link>
        </TableCell>
        <TableCell align="right">
          <ConfirmButton
            className={classes.deleteButton}
            title={`Delete the ${r.name} role?`}
            content="Make sure there are no users with this role before deleting it."
            onClick={() => deleteRole(r.id)} />
        </TableCell>
      </TableRow>
    );
  });

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.heading}>
          <Typography variant="h5">Roles</Typography>
          <Button 
            variant="contained"
            color="primary"
            onClick={handleNewClick}>New role</Button>
        </div>
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="roles table">
            <TableHead>
              <TableRow>
                <TableCell className={classes.colour}></TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="right">Created</TableCell>
                <TableCell align="right">Users</TableCell>
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
                  count={roles.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onChangePage={handleChangePage} />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
        <Detail 
          open={open}
          setOpen={setOpen}
          selectedRole={selectedRole}
          setRoles={setRoles}
          setMessage={setMessage} />
        <Snackbar message={message} setMessage={setMessage} />
      </div>
      <div className={classes.rightSection} />
    </div>
  );
}

export default List;
