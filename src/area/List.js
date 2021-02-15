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
import useStyles from '../styles/list';
import Detail from './Detail';
import ConfirmButton from '../common/ConfirmButton';
import SearchBox from '../common/SearchBox';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

function List() {
  const [areas, setAreas] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const [open, setOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [locationId, setLocationId] = useState(null);

  const client = useClient();
  const classes = useStyles();

  const handleNameClick = (area) => {
    setSelectedArea({ ...area });
    setOpen(true);
  }

  const handleNewClick = () => {
    setSelectedArea({
      id: -1,
      name: '',
      locationId: -1,
      locationName: '',
      notes: '',
      createdAt: new Date(),
      activeUserCount: 0
    });
    setOpen(true);
  }

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  }

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }

  const handleLocationIdChange = (e) => {
    setLocationId(e.target.value);
  }

  const sortByLocationName = () => {
    const isAsc = orderBy === 'locationName' && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy('locationName');
    setAreas(a => [ ...a].reverse());
  }

  const deleteArea = async (areaId) => {
    const result = await client.postData('/areas/deleteArea', { areaId });
    if (result) {
      setAreas(a => a.filter(a.id !== areaId));
      setMessage('Area deleted');
    }
    else {
      setMessage('Something went wrong');
    }
  }

  useEffect(() => {
    const getAreas = async () => {
      const result = await client.postData('/areas/find');
      if (!result) {
        setAreas([
          {
            id: 1,
            name: '10B',
            locationId: 1,
            locationName: 'Sunshine Coast University Hospital',
            notes: '',
            createdAt: new Date(),
            activeUserCount: 17
          },
          {
            id: 2,
            name: 'ICU',
            locationId: 2,
            locationName: 'Gold Coast University Hospital',
            notes: '',
            createdAt: new Date(),
            activeUserCount: 32
          }
        ]);
      }
      else {
        setAreas(result.areas);
      }
    };
    getAreas();
  }, [client]);

  if (areas === null) {
    return (
      <div></div>
    );
  }
  if (areas.length > 0) {
    const tableRows = areas.map(a => {
      return (
        <TableRow key={a.name}>
            <TableCell component="th" scope="row">
              <span 
                className={classes.locationName}
                onClick={() => handleNameClick(a)}>{a.name}</span>
            </TableCell>
            <TableCell align="right">{a.locationName}</TableCell>
            <TableCell align="right">{a.createdAt.toLocaleDateString()}</TableCell>
            <TableCell align="right">{a.activeUserCount}</TableCell>
            <TableCell align="right">
              <ConfirmButton
                className={classes.deleteButton}
                title={`Delete ${a.name}?`}
                content="Make sure this areas has no users before deleting it."
                onClick={() => deleteArea(a.id)} />
            </TableCell>
        </TableRow>
      );
    });

    return (
      <div className={classes.root}>
        <div className={classes.content}>
          <div className={classes.heading}>
            <Typography variant="h5">Areas</Typography>
          </div>
          <div className={classes.toolbar}>
            <SearchBox placeholder="Search by name..." />
            <Button 
              variant="outlined" 
              endIcon={<ArrowDropDownIcon />}>Location</Button>
            <div className={classes.grow} />
            <Button 
              variant="contained"
              color="primary"
              onClick={handleNewClick}>New area</Button>
          </div>
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="areas table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell 
                    align="right"
                    sortDirection={orderBy === 'locationName' ? order : false}>
                      <TableSortLabel
                        active={orderBy === 'locationName'}
                        direction={orderBy === 'locationName' ? order : 'asc'}
                        onClick={sortByLocationName}>Location</TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Created</TableCell>
                  <TableCell align="right">Active users</TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRows}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[10, 20]}
                    colSpan={5}
                    count={areas.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage} />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
          <Detail 
            open={open}
            setOpen={setOpen}
            selectedArea={selectedArea}
            setAreas={setAreas}
            setMessage={setMessage} />
          <Snackbar message={message} setMessage={setMessage} />
        </div>
        <div className={classes.rightSection} />
      </div>
    );
  }
  return (<div></div>);
}

export default List;
