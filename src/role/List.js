import React, { useState, useEffect } from 'react';
import { useClient } from '../client';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
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

function List() {
  const [roles, setRoles] = useState(null);
  const [message, setMessage] = useMessage();

  const client = useClient();
  const classes = useStyles();

  useEffect(() => {
    const getRoles = async () => {
      const result = await client.postData('/roles/find');
      if (!result) {
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
      else {
        setRoles(result.roles);
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
        <TableRow key={r.name}>
            <TableCell component="th" scope="row">
              <Link 
                className={classes.link} 
                to={`/roles/${r.id}`}>{r.name}</Link>
            </TableCell>
            <TableCell align="right">{r.createdAt.toLocaleDateString()}</TableCell>
            <TableCell align="right">{r.userCount}</TableCell>
        </TableRow>
      );
    });

    return (
      <div className={classes.root}>
        <div className={classes.content}>
          <div className={classes.heading}>
            <SupervisorAccountIcon className={classes.icon} color="action" />
            <div className={classes.title}>
              <Typography variant="h4">Roles</Typography>
              <Typography variant="subtitle1">Assign permissions and create new roles.</Typography>
            </div>
            <div className={classes.grow} />
            <Button 
              className={classes.button}
              variant="contained"
              color="primary"
              component={Link}
              to="/roles/new">Add new role</Button>
          </div>
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="roles table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Created</TableCell>
                  <TableCell align="right">Users</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRows}
              </TableBody>
            </Table>
          </TableContainer>
          <Snackbar message={message} setMessage={setMessage} />
        </div>
      </div>
    );
  }
  return (<div></div>);
}

export default List;
