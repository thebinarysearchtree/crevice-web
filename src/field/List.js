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
import IconButton from '@material-ui/core/IconButton';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import Tooltip from '@material-ui/core/Tooltip';
import EditField from './EditField';

const useStyles = makeStyles(styles);

function List() {
  const [fields, setFields] = useState(null);
  const [message, setMessage] = useMessage();
  const [selectedField, setSelectedField] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [moving, setMoving] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const classes = useStyles();

  const rowsPerPage = 10;

  const sliceStart = page * rowsPerPage;
  const sliceEnd = sliceStart + rowsPerPage;

  const handleNameClick = (e, field) => {
    setSelectedField({ ...field });
    setAnchorEl(e.currentTarget.closest('th'));
  }

  const handleNewClick = (e) => {
    setSelectedField({
      id: -1,
      name: '',
      fieldType: '',
      selectItems: [],
      createdAt: new Date().toISOString(),
      userCount: 0
    });
    setAnchorEl(e.currentTarget);
  }

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  }

  const moveUp = async (index) => {
    if (index !== 0) {
      const updatedFields = [...fields];
      const fieldAbove = updatedFields[index - 1];
      const selectedField = updatedFields[index];
      setMoving(true);
      const response = await client.postData('/fields/moveUp', { fieldId: selectedField.id });
      if (response.ok) {
        updatedFields[index] = fieldAbove;
        updatedFields[index - 1] = selectedField;
        setFields(updatedFields);
      }
      else {
        setMessage('Something went wrong');
      }
      setMoving(false);
    }
  }

  const deleteField = async (field) => {
    const { id: fieldId, fieldType } = field;
    const response = await client.postData('/fields/remove', { fieldId, fieldType });
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

  const tableRows = fields.slice(sliceStart, sliceEnd).map((f, i) => {
    const rowClassName = selectedField && selectedField.id === f.id ? classes.selectedRow : '';
    const cellClassName = selectedField && selectedField.id !== f.id ? classes.disabledRow : '';
    return (
      <TableRow key={f.id} className={rowClassName}>
        <TableCell component="th" scope="row">
          <span 
            className={`${classes.locationName} ${cellClassName}`}
            onClick={(e) => handleNameClick(e, f)}>{f.name}</span>
        </TableCell>
        <TableCell align="right" className={cellClassName}>{f.fieldType}</TableCell>
        <TableCell align="right" className={cellClassName}>{f.userCount}</TableCell>
        <TableCell align="right" className={classes.iconCell}>
          <Tooltip title="Move up">
            <IconButton
              onClick={() => moveUp(i + sliceStart)}
              disabled={moving}>
                <ArrowUpwardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <ConfirmButton
            title={`Delete the ${f.name} field?`}
            content="This field will no long be visible on user's profiles or when creating new users."
            onClick={() => deleteField(f)} />
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
            onClick={handleNewClick}>New field</Button>
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
                  colSpan={5}
                  count={fields.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onChangePage={handleChangePage} />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
        <EditField 
          open={open}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          selectedField={selectedField}
          setSelectedField={setSelectedField}
          setFields={setFields}
          setMessage={setMessage} />
        <Snackbar message={message} setMessage={setMessage} />
      </div>
      <div className={classes.rightSection} />
    </div>
  );
}

export default List;
