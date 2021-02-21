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
import useStyles from '../styles/list';
import Detail from './Detail';
import ConfirmButton from '../common/ConfirmButton';
import SearchBox from '../common/SearchBox';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import useFetchMany from '../hooks/useFetchMany';
import Progress from '../common/Progress';
import TableSortCell from '../common/TableSortCell';
import FilterButton from '../common/FilterButton';

function List() {
  const [areas, setAreas] = useState(null);
  const [filteredAreas, setFilteredAreas] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const [open, setOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);

  const classes = useStyles();

  const handleNameClick = (area) => {
    setSelectedArea({ ...area });
    setOpen(true);
  }

  const handleNewClick = () => {
    setSelectedArea({
      id: -1,
      name: '',
      abbreviation: '',
      locationId: -1,
      locationName: '',
      notes: '',
      createdAt: new Date().toISOString(),
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

  const handleSearch = (e) => {
    const term = e.target.value;
    if (!term) {
      setFilteredAreas(areas);
    }
    else {
      setFilteredAreas(a => a.filter(a => a.abbreviation.startsWith(term)));
    }
  }

  const filterByLocationId = (locationId) => {
    if (locationId === -1) {
      setFilteredAreas(areas);
    }
    else {
      setFilteredAreas(areas.filter(a => a.locationId === locationId));
    }
  }

  const sortByLocationName = () => {
    const isAsc = orderBy === 'locationName' && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy('locationName');
    setAreas(a => [ ...a].reverse());
  }

  const deleteArea = async (areaId) => {
    const result = await client.postData('/areas/remove', { areaId });
    if (result) {
      setAreas(areas => {
        const filteredAreas = areas.filter(area => area.id !== areaId);
        setFilteredAreas(filteredAreas);
        return filteredAreas;
      });
      setMessage('Area deleted');
    }
    else {
      setMessage('Something went wrong');
    }
  }

  const areasHandler = (areas) => {
    setAreas(areas);
    setFilteredAreas(areas);
  }

  const locationsHandler = (locations) => setLocations(locations);

  useFetchMany(setLoading, [
    { url: '/areas/find', handler: areasHandler },
    { url: '/locations/getSelectListItems', handler: locationsHandler }]);

  const newButton = <Button 
    variant="contained"
    color="primary"
    onClick={handleNewClick}>New area</Button>;

  const dialog = <Detail 
    open={open}
    setOpen={setOpen}
    selectedArea={selectedArea}
    setAreas={setAreas}
    setFilteredAreas={setFilteredAreas}
    setMessage={setMessage}
    locations={locations} />;

  const snackbar = <Snackbar message={message} setMessage={setMessage} />;

  if (filteredAreas === null) {
    return (
      <div className={classes.root}>
        <div className={classes.content}>
          <Progress loading={loading} />
        </div>
        <div className={classes.rightSection} />
      </div>
    );
  }

  if (areas.length === 0) {
    return (
      <div className={classes.root}>
        <div className={classes.content}>
          <div className={classes.heading}>
            <Typography variant="h5">Areas</Typography>
          </div>
          <Paper className={classes.emptyPaper}>
            <Typography>There are no areas.</Typography>
            <div className={classes.grow} />
            <div>{newButton}</div>
          </Paper>
          {dialog}
          {snackbar}
        </div>
        <div className={classes.rightSection} />
      </div>
    );
  }
  
  if (areas.length > 0) {
    const tableRows = filteredAreas.map(a => {
      return (
        <TableRow key={a.name}>
            <TableCell component="th" scope="row">
              <span 
                className={classes.locationName}
                onClick={() => handleNameClick(a)}>{a.abbreviation}</span>
            </TableCell>
            <TableCell align="right">{a.locationName}</TableCell>
            <TableCell align="right">{new Date(a.createdAt).toLocaleDateString()}</TableCell>
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
            <SearchBox 
              placeholder="Search by name..."
              onChange={handleSearch} />
            <FilterButton
              id="location-filter"
              items={locations}
              filterBy={filterByLocationId}>Location</FilterButton>
            <div className={classes.grow} />
            {newButton}
          </div>
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="areas table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableSortCell
                    align="right"
                    name="locationName"
                    orderBy={orderBy}
                    order={order}
                    onClick={sortByLocationName}>Location</TableSortCell>
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
                    rowsPerPageOptions={[]}
                    colSpan={5}
                    count={filteredAreas.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage} />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
          {dialog}
          {snackbar}
        </div>
        <div className={classes.rightSection} />
      </div>
    );
  }
}

export default List;
