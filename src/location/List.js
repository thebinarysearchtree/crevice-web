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
import Progress from '../common/Progress';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import useFetch from '../hooks/useFetch';
import Link from '@material-ui/core/Link';
import { Link as RouterLink } from 'react-router-dom';

function List() {
  const [locations, setLocations] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const classes = useStyles();

  const rowsPerPage = 10;

  const sliceStart = page * rowsPerPage;
  const sliceEnd = sliceStart + rowsPerPage;

  const handleNameClick = (location) => {
    setSelectedLocation({ ...location });
    setOpen(true);
  }

  const handleNewClick = () => {
    setSelectedLocation({
      id: -1,
      name: '',
      abbreviation: '',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      address: '',
      createdAt: new Date().toISOString(),
      areaCount: 0
    });
    setOpen(true);
  }

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  }

  const deleteLocation = async (locationId) => {
    const response = await client.postData('/locations/remove', { locationId });
    if (response.ok) {
      setLocations(l => l.filter(l.id !== locationId));
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
    return (
      <div className={classes.root}>
        <div className={classes.content}>
          <Progress loading={loading} />
        </div>
        <div className={classes.rightSection} />
      </div>
    );
  }

  const tableRows = locations.slice(sliceStart, sliceEnd).map(l => {
    return (
      <TableRow key={l.id}>
          <TableCell component="th" scope="row">
            <span 
              className={classes.locationName}
              onClick={() => handleNameClick(l)}>{l.name}</span>
          </TableCell>
          <TableCell align="right">{l.timeZone.split('/')[1].replace('_', ' ')}</TableCell>
          <TableCell align="right">{new Date(l.createdAt).toLocaleDateString()}</TableCell>
          <TableCell align="right">
            <Link to={`/areas?locationId=${l.id}`} component={RouterLink}>{l.areaCount}</Link>
          </TableCell>
          <TableCell align="right">
            <ConfirmButton
              className={classes.deleteButton}
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
                <TableCell align="right">Time zone</TableCell>
                <TableCell align="right">Created</TableCell>
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
                  colSpan={5}
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
          setOpen={setOpen}
          selectedLocation={selectedLocation}
          setLocations={setLocations}
          setMessage={setMessage} />
        <Snackbar message={message} setMessage={setMessage} />
      </div>
      <div className={classes.rightSection} />
    </div>
  );
}

export default List;
