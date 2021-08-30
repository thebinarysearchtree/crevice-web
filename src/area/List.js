import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import styles from '../styles/list';
import Detail from './Detail';
import ConfirmButton from '../common/ConfirmButton';
import SearchBox from '../common/SearchBox';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import useFetch from '../hooks/useFetch';
import Progress from '../common/Progress';
import TableSortCell from '../common/TableSortCell';
import TableFilterCell from '../common/TableFilterCell';
import Link from '@material-ui/core/Link';
import { Link as RouterLink } from 'react-router-dom';
import Avatar from '../common/Avatar';
import useParamState from '../hooks/useParamState';
import useSyncParams from '../hooks/useSyncParams';
import { useClient } from '../auth';

const useStyles = makeStyles((theme) => ({ 
  ...styles(theme),
  avatar: {
    marginRight: theme.spacing(1)
  }
}));

const rowsPerPage = 10;

function List() {
  const [areas, setAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [page, setPage, pageTranslator] = useParamState({
    name: 'page',
    defaultValue: 0,
    hideDefault: true
  });
  const [order, setOrder, orderTranslator] = useParamState({
    name: 'order',
    parser: null,
    defaultValue: 'asc',
    hideDefault: true
  });
  const [orderBy, setOrderBy, orderByTranslator] = useParamState({
    name: 'orderBy',
    parser: null,
    defaultValue: '',
    hideDefault: true
  });
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [locationId, setLocationId, locationTranslator] = useParamState({
    name: 'locationId',
    defaultValue: -1,
    hideDefault: true
  });
  const [count, setCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const open = Boolean(anchorEl);

  const classes = useStyles();
  const client = useClient();

  useSyncParams(true, [pageTranslator, orderTranslator, orderByTranslator, locationTranslator]);

  useEffect(() => {
    let filteredAreas = [...areas];
    if (locationId !== -1) {
      filteredAreas = filteredAreas.filter(a => a.locationId === locationId);
    }
    if (searchTerm !== '') {
      const pattern = new RegExp(searchTerm, 'i');
      filteredAreas = filteredAreas.filter(a => pattern.test(a.name));
    }
    if (orderBy === 'name') {
      if (order === 'asc') {
        filteredAreas.sort((a, b) => a.name.localeCompare(b.name));
      }
      else {
        filteredAreas.sort((a, b) => b.name.localeCompare(a.name));
      }
    }
    if (orderBy === 'activeUserCount') {
      if (order === 'asc') {
        filteredAreas.sort((a, b) => a.activeUserCount - b.activeUserCount);
      }
      else {
        filteredAreas.sort((a, b) => b.activeUserCount - a.activeUserCount);
      }
    }
    setCount(filteredAreas.length);

    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    filteredAreas = filteredAreas.slice(start, end);

    setFilteredAreas(filteredAreas);
  }, [areas, page, order, orderBy, locationId, searchTerm]);

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

  const makeSortHandler = (orderName) => {
    return () => {
      const isAsc = orderBy !== orderName || order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(orderName);
    }
  }

  const sortByName = makeSortHandler('name');

  const sortByActiveUserCount = makeSortHandler('activeUserCount');

  const deleteArea = async (areaId) => {
    await client.postMutation({
      url: '/areas/remove',
      data: { areaId },
      message: 'Area deleted'
    });
  }

  const areasHandler = (areas) => setAreas(areas);
  const locationsHandler = (locations) => setLocations(locations);

  useFetch(setLoading, [
    { url: '/areas/find', handler: areasHandler },
    { url: '/locations/getSelectListItems', handler: locationsHandler, once: true }]);

  if (loading) {
    return <Progress loading={loading} />;
  }
  
  const tableRows = filteredAreas.map(a => {
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
            onChange={(e) => setSearchTerm(e.target.value)} />
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
                  filter={(locationId) => setLocationId(locationId)}>Location</TableFilterCell>
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
                  count={count}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onChangePage={(e, page) => setPage(page)} />
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
          locations={locations} />
      </div>
    </div>
  );
}

export default List;
