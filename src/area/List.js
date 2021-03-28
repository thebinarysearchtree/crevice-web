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
import styles from '../styles/list';
import Detail from './Detail';
import ConfirmButton from '../common/ConfirmButton';
import SearchBox from '../common/SearchBox';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import useFetchMany from '../hooks/useFetchMany';
import Progress from '../common/Progress';
import TableSortCell from '../common/TableSortCell';
import { useLocation } from 'react-router-dom';
import TableFilterCell from '../common/TableFilterCell';
import Link from '@material-ui/core/Link';
import { Link as RouterLink } from 'react-router-dom';

const useStyles = makeStyles(styles);

function List() {
  const [areas, setAreas] = useState(null);
  const [filteredAreas, setFilteredAreas] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);

  const classes = useStyles();
  const params = new URLSearchParams(useLocation().search);

  const locationIdParam = parseInt(params.get('locationId'), 10);

  const [locationId, setLocationId] = useState(locationIdParam ? locationIdParam : -1);

  const rowsPerPage = 10;

  const sliceStart = page * rowsPerPage;
  const sliceEnd = sliceStart + rowsPerPage;

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

  const handleSearch = (e) => {
    const term = e.target.value;
    if (!term) {
      setFilteredAreas(areas);
    }
    else {
      const pattern = new RegExp(term, 'i');
      setFilteredAreas(areas.filter(a => pattern.test(`${a.abbreviation} ${a.name}`)));
    }
  }

  const handleLocationChange = (locationId) => {
    setLocationId(locationId);
    if (locationId === -1) {
      setFilteredAreas(areas);
    }
    else {
      setFilteredAreas(areas.filter(a => a.locationId === locationId));
    }
  }

  const makeSortHandler = (orderName, comparitor) => {
    return () => {
      const isAsc = orderBy === orderName && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(orderName);
      if (orderBy === orderName) {
        setFilteredAreas(a => [ ...a].reverse());
      }
      else {
        setFilteredAreas(a => [ ...a].sort(comparitor));
      }
    }
  }

  const sortByName = makeSortHandler(
    'name',
    (a, b) => a.abbreviation.localeCompare(b.abbreviation)
  );

  const sortByCreatedAt = makeSortHandler(
    'createdAt',
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const sortByActiveUserCount = makeSortHandler(
    'activeUserCount',
    (a, b) => a.activeUserCount - b.activeUserCount);

  const deleteArea = async (areaId) => {
    const response = await client.postData('/areas/remove', { areaId });
    if (response.ok) {
      const updatedAreas = areas.filter(a => a.id !== areaId);
      setAreas(updatedAreas);
      setFilteredAreas(updatedAreas);
      setMessage('Area deleted');
    }
    else {
      setMessage('Something went wrong');
    }
  }

  const areasHandler = (areas) => {
    setAreas(areas);
    if (locationId !== -1) {
      setFilteredAreas(areas.filter(a => a.locationId === locationId));
    }
    else {
      setFilteredAreas(areas);
    }
  }

  const locationsHandler = (locations) => setLocations(locations);

  useFetchMany(setLoading, [
    { url: '/areas/find', handler: areasHandler },
    { url: '/locations/getSelectListItems', handler: locationsHandler }]);

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
  
  const tableRows = filteredAreas.slice(sliceStart, sliceEnd).map(a => {
    const name = a.abbreviation === a.name ? a.name : `${a.abbreviation} ${a.name}`;
    return (
      <TableRow key={a.id}>
          <TableCell component="th" scope="row">
            <span 
              className={classes.locationName}
              onClick={() => handleNameClick(a)}>{name}</span>
          </TableCell>
          <TableCell align="right">{a.locationName}</TableCell>
          <TableCell align="right">{new Date(a.createdAt).toLocaleDateString()}</TableCell>
          <TableCell align="right">
            <Link to={`/users?areaId=${a.id}`} component={RouterLink}>{a.activeUserCount}</Link>
          </TableCell>
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
          <Button 
            variant="contained"
            color="primary"
            onClick={handleNewClick}>New area</Button>
        </div>
        <div className={classes.toolbar}>
          <SearchBox 
            placeholder="Search by name..."
            onChange={handleSearch} />
          <div className={classes.grow} />
        </div>
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="areas table">
            <TableHead>
              <TableRow>
                <TableSortCell
                  name="name"
                  orderBy={orderBy}
                  order={order}
                  onClick={sortByName}>Name</TableSortCell>
                <TableFilterCell
                  menuId="location-menu"
                  items={locations}
                  selectedItemId={locationId}
                  filter={handleLocationChange}>Location</TableFilterCell>
                <TableSortCell
                  align="right"
                  name="createdAt"
                  orderBy={orderBy}
                  order={order}
                  onClick={sortByCreatedAt}>Created</TableSortCell>
                <TableSortCell
                  align="right"
                  name="activeUserCount"
                  orderBy={orderBy}
                  order={order}
                  onClick={sortByActiveUserCount}>Users</TableSortCell>
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
                  onChangePage={handleChangePage} />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
        <Detail 
          open={open}
          setOpen={setOpen}
          selectedArea={selectedArea}
          setAreas={setAreas}
          setFilteredAreas={setFilteredAreas}
          setMessage={setMessage}
          locations={locations} />
        <Snackbar message={message} setMessage={setMessage} />
      </div>
      <div className={classes.rightSection} />
    </div>
  );
}

export default List;
