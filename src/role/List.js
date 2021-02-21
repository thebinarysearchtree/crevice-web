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
import { Link } from 'react-router-dom';
import useMessage from '../hooks/useMessage';
import useStyles from '../styles/list';
import ConfirmButton from '../common/ConfirmButton';
import useFetch from '../hooks/useFetch';
import Progress from '../common/Progress';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';

function List() {
  const [roles, setRoles] = useState(null);
  const [message, setMessage] = useMessage();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const classes = useStyles();

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  }

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }

  const deleteRole = async (roleId) => {
    const response = await client.postData('/roles/remove', { roleId });
    if (response.ok) {
      setRoles(roles => roles.filter(role => role.id !== roleId));
      setMessage('Role deleted');
    }
    else {
      setMessage('Something went wrong');
    }
  }

  useFetch(setLoading, '/roles/find', setRoles);

  const newButton = <Button 
    variant="contained"
    color="primary"
    component={Link}
    to="/roles/new">New role</Button>;

  const snackbar = <Snackbar message={message} setMessage={setMessage} />;

  if (roles === null) {
    return (
      <div className={classes.root}>
        <div className={classes.content}>
          <Progress loading={loading} />
        </div>
        <div className={classes.rightSection} />
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className={classes.root}>
        <div className={classes.content}>
          <div className={classes.heading}>
            <Typography variant="h5">Roles</Typography>
          </div>
          <Paper className={classes.emptyPaper}>
            <Typography>There are no roles.</Typography>
            <div className={classes.grow} />
            <div>{newButton}</div>
          </Paper>
          {snackbar}
        </div>
        <div className={classes.rightSection} />
      </div>
    );
  }

  if (roles.length > 0) {
    const tableRows = roles.map(r => {
      return (
        <TableRow key={r.name} className={classes.tableRow}>
            <TableCell component="th" scope="row">
              <Link 
                className={classes.link} 
                to={`/roles/${r.id}`}>{r.name}</Link>
            </TableCell>
            <TableCell align="right">{new Date(r.createdAt).toLocaleDateString()}</TableCell>
            <TableCell align="right">{r.userCount}</TableCell>
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
            {newButton}
          </div>
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="roles table">
              <TableHead>
                <TableRow>
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
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage} />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
          {snackbar}
        </div>
        <div className={classes.rightSection} />
      </div>
    );
  }
}

export default List;
