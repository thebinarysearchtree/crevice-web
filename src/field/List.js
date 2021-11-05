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
import ConfirmButton from '../common/ConfirmButton';
import Progress from '../common/Progress';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import IconButton from '@material-ui/core/IconButton';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import Tooltip from '@material-ui/core/Tooltip';
import EditField from './EditField';
import { useClient } from '../auth';
import useFetch from '../hooks/useFetch';
import EditIcon from '@material-ui/icons/Edit';

const useStyles = makeStyles(styles);

function List() {
  const [fields, setFields] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [page, setPage] = useState(0);

  const classes = useStyles();
  const client = useClient();

  const { processing } = client;

  const rowsPerPage = 10;

  const sliceStart = page * rowsPerPage;
  const sliceEnd = sliceStart + rowsPerPage;

  const handleNewClick = (e) => {
    setSelectedField({
      id: -1,
      name: '',
      fieldType: '',
      selectItems: [],
      createdAt: new Date().toISOString(),
      userCount: 0
    });
  }

  const handlePageChange = (e, newPage) => {
    setPage(newPage);
  }

  const moveUp = async (index) => {
    if (index !== 0) {
      await client.postMutation({
        url: '/fields/moveUp',
        data: { fieldId: fields[index].id }
      });
    }
  }

  const deleteField = async (field) => {
    const { id: fieldId, fieldType } = field;
    await client.postMutation({
      url: '/fields/remove',
      data: { fieldId, fieldType },
      message: 'Field deleted'
    });
  }

  const loading = useFetch([{
    url: '/fields/find',
    handler: (fields) => setFields(fields)
  }]);

  if (loading) {
    return <Progress loading={loading} />;
  }

  const tableRows = fields.slice(sliceStart, sliceEnd).map((f, i) => {
    return (
      <TableRow key={f.id}>
        <TableCell component="th" scope="row">
          <span className={classes.name}>{f.name}</span>
        </TableCell>
        <TableCell align="right">{f.fieldType}</TableCell>
        <TableCell align="right">{f.userCount}</TableCell>
        <TableCell align="right" className={classes.iconCell}>
          <Tooltip title="Move up">
            <IconButton
              onClick={() => moveUp(i + sliceStart)}
              disabled={processing}>
                <ArrowUpwardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton onClick={() => setSelectedField({...f})}>
              <EditIcon color="action" fontSize="small" />
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
          <div />
          <Button 
            variant="contained"
            color="secondary"
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
                  onPageChange={handlePageChange} />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
        <EditField 
          selectedField={selectedField}
          setSelectedField={setSelectedField} />
      </div>
    </div>
  );
}

export default List;
