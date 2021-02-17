import React, { useState, useEffect } from 'react';
import { useClient } from '../client';
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

function List() {
  const [roles, setRoles] = useState(null);
  const [message, setMessage] = useMessage();

  const client = useClient();
  const classes = useStyles();

  const deleteRole = async (roleId) => {
    const response = await client.postData('/roles/deleteRole', { roleId });
    if (response.ok) {
      setRoles(r => r.filter(r.id !== roleId));
      setMessage('Role deleted');
    }
    else {
      setMessage('Something went wrong');
    }
  }

  useEffect(() => {
    const getRoles = async () => {
      const response = await client.postData('/roles/find');
      if (response.ok) {
        const roles = await response.json();
        setRoles(roles);
      }
      else {
        setRoles([
          {
            id: 1,
            name: 'Student',
            createdAt: new Date(),
            userCount: 100
          },
          {
            id: 2,
            name: 'Supervisor',
            createdAt: new Date(),
            userCount: 3
          }
        ]);
      }
    };
    getRoles();
  }, [client]);

  if (roles === null) {
    return (
      <div></div>
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
            <TableCell align="right">{r.createdAt.toLocaleDateString()}</TableCell>
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
            <Button 
              variant="contained"
              color="primary"
              component={Link}
              to="/roles/new">New role</Button>
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
            </Table>
          </TableContainer>
          <Snackbar message={message} setMessage={setMessage} />
        </div>
        <div className={classes.rightSection} />
      </div>
    );
  }
  return (<div></div>);
}

export default List;
