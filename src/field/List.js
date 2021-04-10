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
import ConfirmButton from '../common/ConfirmButton';
import Progress from '../common/Progress';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import useFetch from '../hooks/useFetch';
import { Link as RouterLink } from 'react-router-dom';
import Demo from './Demo';

const useStyles = makeStyles(styles);

function List() {
  const [fields, setFields] = useState(null);
  const [message, setMessage] = useMessage();
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState(null);

  const classes = useStyles();

  const rowsPerPage = 10;

  const sliceStart = page * rowsPerPage;
  const sliceEnd = sliceStart + rowsPerPage;

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  }

  const deleteField = async (fieldId) => {
    const response = await client.postData('/fields/remove', { fieldId });
    if (response.ok) {
      setFields(fields.filter(f => f.id !== fieldId));
      setMessage('Field deleted');
    }
    else {
      setMessage('Something went wrong');
    }
  }

  const fieldsHandler = (fields) => {
    setFields(fields);
    setLoading(false);
  }

  useFetch('/fields/find', fieldsHandler);

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

  const tableRows = fields.slice(sliceStart, sliceEnd).map(f => {
    return (
      <TableRow key={f.id} className={classes.tableRow}>
        <TableCell component="th" scope="row">
          <span className={classes.locationName} onClick={() => setSelectedField(f)}>{f.name}</span>
        </TableCell>
        <TableCell align="right">{f.fieldType}</TableCell>
        <TableCell align="right">{f.userCount}</TableCell>
        <TableCell align="right">
          <ConfirmButton
            className={classes.deleteButton}
            title={`Delete the ${f.name} field?`}
            content="Make sure there are no users with this field before deleting it."
            onClick={() => deleteField(f.id)} />
        </TableCell>
      </TableRow>
    );
  });

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.heading}>
          <Typography variant="h5">Fields</Typography>
          <Button 
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/fields/create">New field</Button>
        </div>
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="fields table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Type</TableCell>
                <TableCell align="right">Used by</TableCell>
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
                  colSpan={4}
                  count={fields.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onChangePage={handleChangePage} />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
        <Demo selectedField={selectedField} setSelectedField={setSelectedField} />
        <Snackbar message={message} setMessage={setMessage} />
      </div>
      <div className={classes.rightSection} />
    </div>
  );
}

export default List;
