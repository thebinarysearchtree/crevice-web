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
import RoleChip from '../common/RoleChip';

const useStyles = makeStyles((theme) => ({
  toolbar: {
    display: 'flex',
    marginBottom: theme.spacing(2),
    alignItems: 'flex-end'
  },
  grow: {
    display: 'flex',
    flexGrow: 1
  },
  table: {
    marginBottom: theme.spacing(4)
  },
  deleteButton: {
    cursor: 'pointer',
    fontWeight: 600,
    color: theme.palette.action.active
  }
}));

function AreasTable(props) {
  const classes = useStyles();

  const { userAreas, setUserAreas, setShowAddArea } = props;

  const remove = (index) => {
    setUserAreas(userAreas => userAreas.filter((ua, i) => i !== index));
  }

  const tableRows = userAreas.map((a, i) => {
    return (
      <TableRow key={i}>
          <TableCell component="th" scope="row"><RoleChip label={a.role.name} colour={a.role.colour} size="small" /></TableCell>
          <TableCell align="left">{a.area.name}</TableCell>
          <TableCell align="right">{a.startTime.toLocaleDateString()}</TableCell>
          <TableCell align="right">{a.endTime ? a.endTime.toLocaleDateString() : ''}</TableCell>
          <TableCell align="left">{a.isAdmin ? 'Yes' : ''}</TableCell>
          <TableCell align="right">
            <span 
              className={classes.deleteButton}
              onClick={() => remove(i)}>delete</span>
          </TableCell>
      </TableRow>
    );
  });

  return (
    <React.Fragment>
      <div className={classes.toolbar}>
        <div className={classes.grow} />
        <Button 
          variant="contained"
          color="secondary"
          onClick={() => setShowAddArea(true)}>Add areas</Button>
      </div>
      <TableContainer className={classes.table} component={Paper}>
        <Table aria-label="areas table">
          <TableHead>
            <TableRow>
              <TableCell>Role</TableCell>
              <TableCell align="left">Area</TableCell>
              <TableCell align="right">Start date</TableCell>
              <TableCell align="right">End date</TableCell>
              <TableCell align="left">Admin</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableRows}
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
  );
}

export default AreasTable;
