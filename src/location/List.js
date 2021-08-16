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
import Progress from '../common/Progress';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import useFetch from '../hooks/useFetch';
import Link from '@material-ui/core/Link';
import { Link as RouterLink } from 'react-router-dom';
import useScrollRestore from '../hooks/useScrollRestore';

const useStyles = makeStyles(styles);

function List() {
  const [locations, setLocations] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const classes = useStyles();

  useScrollRestore();

  const rowsPerPage = 10;

  const sliceStart = page * rowsPerPage;
  const sliceEnd = sliceStart + rowsPerPage;

  const handleNameClick = (e, location) => {
    setSelectedLocation({ ...location });
    setAnchorEl(e.currentTarget.closest('th'));
  }

  const handleNewClick = (e) => {
    setSelectedLocation({
      id: -1,
      name: '',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      address: '',
      createdAt: new Date().toISOString(),
      areaCount: 0
    });
    setAnchorEl(e.currentTarget);
  }

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  }

  const deleteLocation = async (locationId) => {
    const response = await client.postData('/locations/remove', { locationId });
    if (response.ok) {
      setLocations(locations.filter(l => l.id !== locationId));
      setMessage('Location deleted');
    }
    else {
      setMessage('Something went wrong');
    }
  }

  const locationsHandler = (locations) => {
    setLocations(locations);
    setLoading(false);
  }

  useFetch('/locations/find', locationsHandler);

  if (loading) {
    return <Progress loading={loading} />;
  }

  const tableRows = locations.slice(sliceStart, sliceEnd).map(l => {
    const rowClassName = selectedLocation && selectedLocation.id === l.id ? classes.selectedRow : '';
    const cellClassName = selectedLocation && selectedLocation.id !== l.id ? classes.disabledRow : '';
    const areaCount = l.areaCount === 0 ? (
      <span className={cellClassName}>{l.areaCount}</span>
    ) : (
      <Link className={cellClassName} to={`/areas?locationId=${l.id}`} component={RouterLink}>{l.areaCount}</Link>
    );
    return (
      <TableRow key={l.id} className={rowClassName}>
          <TableCell component="th" scope="row">
            <span 
              className={`${classes.locationName} ${cellClassName}`}
              onClick={(e) => handleNameClick(e, l)}>{l.name}</span>
          </TableCell>
          <TableCell align="left" className={cellClassName}>{l.timeZone.split('/')[1].replace('_', ' ')}</TableCell>
          <TableCell align="right">
            {areaCount}
          </TableCell>
          <TableCell align="right" className={classes.iconCell}>
            <ConfirmButton
              title={`Delete ${l.name}?`}
              content="Make sure this location has no areas before deleting it."
              onClick={() => deleteLocation(l.id)} />
          </TableCell>
      </TableRow>
    );
  });

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.heading}>
          <Typography variant="h5">Locations</Typography>
          <Button 
            variant="contained"
            color="primary"
            onClick={handleNewClick}>New location</Button>
        </div>
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="locations table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="left">Time zone</TableCell>
                <TableCell align="right">Areas</TableCell>
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
                  count={locations.length}
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
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          setLocations={setLocations}
          setMessage={setMessage} />
        <Snackbar message={message} setMessage={setMessage} />
      </div>
    </div>
  );
}

export default List;
