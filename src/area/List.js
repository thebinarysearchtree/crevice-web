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
import Avatar from '../common/Avatar';
import useScrollRestore from '../hooks/useScrollRestore';

const useStyles = makeStyles((theme) => ({ 
  ...styles(theme),
  avatar: {
    marginRight: theme.spacing(1)
  }
}));

function List() {
  const [areas, setAreas] = useState(null);
  const [filteredAreas, setFilteredAreas] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const classes = useStyles();

  useScrollRestore();

  const params = new URLSearchParams(useLocation().search);
  const locationIdParam = parseInt(params.get('locationId'), 10);

  const [locationId, setLocationId] = useState(locationIdParam ? locationIdParam : -1);

  const rowsPerPage = 10;

  const sliceStart = page * rowsPerPage;
  const sliceEnd = sliceStart + rowsPerPage;

  const handleNameClick = (e, area) => {
    setSelectedArea({ ...area });
    setAnchorEl(e.currentTarget.closest('th'));
  }

  const handleNewClick = (e) => {
    setSelectedArea({
      id: -1,
      name: '',
      locationId: -1,
      locationName: '',
      notes: '',
      createdAt: new Date().toISOString(),
      activeUserCount: 0
    });
    setAnchorEl(e.currentTarget);
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
      setFilteredAreas(areas.filter(a => pattern.test(a.name)));
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
    (a, b) => a.name.localeCompare(b.name)
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
    return <Progress loading={loading} />;
  }
  
  const tableRows = filteredAreas.slice(sliceStart, sliceEnd).map(a => {
    const administrators = a.administrators.map(user => {
      return (
        <Avatar 
          key={user.id} 
          className={classes.avatar} 
          user={user} 
          size="medium" 
          tooltip />
      );
    });
    const rowClassName = selectedArea && selectedArea.id === a.id ? classes.selectedRow : '';
    const cellClassName = selectedArea && selectedArea.id !== a.id ? classes.disabledRow : '';
    const activeUserCount = a.userCount === 0 ? (
      <span className={cellClassName}>{a.activeUserCount}</span>
    ) : (
      <Link className={cellClassName} to={`/users?areaId=${a.id}`} component={RouterLink}>{a.activeUserCount}</Link>
    );
    return (
      <TableRow key={a.id} className={rowClassName}>
          <TableCell component="th" scope="row">
            <span 
              className={`${classes.locationName} ${cellClassName}`}
              onClick={(e) => handleNameClick(e, a)}>{a.name}</span>
          </TableCell>
          <TableCell align="left" className={cellClassName}>{a.locationName}</TableCell>
          <TableCell align="left" className={`${cellClassName} ${classes.iconCell}`}>{administrators}</TableCell>
          <TableCell align="right">
            {activeUserCount}
          </TableCell>
          <TableCell align="right" className={classes.iconCell}>
            <ConfirmButton
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
            placeholder="Search..."
            onChange={handleSearch} />
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
                <TableCell align="left">Administrators</TableCell>
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
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          selectedArea={selectedArea}
          setSelectedArea={setSelectedArea}
          setAreas={setAreas}
          setFilteredAreas={setFilteredAreas}
          setMessage={setMessage}
          locations={locations} />
        <Snackbar message={message} setMessage={setMessage} />
      </div>
    </div>
  );
}

export default List;
