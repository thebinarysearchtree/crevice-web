import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import styles from '../styles/list';
import Detail from './Detail';
import ConfirmButton from '../common/ConfirmButton';
import Progress from '../common/Progress';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import Link from '@material-ui/core/Link';
import { Link as RouterLink } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { useClient } from '../auth';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles((theme) => ({
  ...styles(theme),
  colour: {
    padding: '0px',
    width: '8px'
  }
}));

function List() {
  const [roles, setRoles] = useState(null);
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
      bookBeforeMinutes: 60,
      canBookAndCancel: true
    });
  }

  const handlePageChange = (e, newPage) => {
    setPage(newPage);
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

  const tableRows = roles.slice(sliceStart, sliceEnd).map(r => {
    const userCount = r.userCount === 0 ? (
      <span>{r.userCount}</span>
    ) : (
      <Link to={`/users?roleId=${r.id}`} component={RouterLink}>{r.userCount}</Link>
    );
    return (
      <TableRow key={r.id}>
        <TableCell style={{ backgroundColor: `#${r.colour}`, padding: '0px' }}></TableCell>
        <TableCell component="th" scope="row">
          <span className={classes.name}>{r.name}</span>
        </TableCell>
        <TableCell align="right">{new Date(r.createdAt).toLocaleDateString()}</TableCell>
        <TableCell align="right">
          {userCount}
        </TableCell>
        <TableCell align="right" className={classes.iconCell}>
          <Tooltip title="Edit">
            <IconButton onClick={() => setSelectedRole({...r})}>
              <EditIcon color="action" fontSize="small" />
            </IconButton>
          </Tooltip>
          <ConfirmButton
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
          <div />
          <Button 
            variant="contained"
            color="secondary"
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
                  onPageChange={handlePageChange} />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
        <Detail 
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole} />
      </div>
    </div>
  );
}

export default List;
