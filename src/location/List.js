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

function List() {
  const [locations, setLocations] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [open, setOpen] = useState(false);

  const client = useClient();
  const classes = useStyles();

  const handleNameClick = (location) => {
    setSelectedLocation({ ...location });
    setOpen(true);
  }

  const handleNewClick = () => {
    setSelectedLocation({
      id: -1,
      name: '',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      address: '',
      createdAt: new Date(),
      areaCount: 0
    });
    setOpen(true);
  }

  const deleteLocation = async (locationId) => {
    const result = await client.postData('/locations/deleteLocation', { locationId });
    if (result) {
      setLocations(l => l.filter(l.id !== locationId));
      setMessage('Location deleted');
    }
    else {
      setMessage('Something went wrong');
    }
  }

  useEffect(() => {
    const getLocations = async () => {
      const result = await client.postData('/locations/find');
      if (!result) {
        setLocations([
          {
            id: 1,
            name: 'Sunshine Coast University Hospital',
            timeZone: 'Australia/Brisbane',
            createdAt: new Date(),
            areaCount: 30
          },
          {
            id: 2,
            name: 'Gold Coast University Hospital',
            timeZone: 'Australia/Brisbane',
            createdAt: new Date(),
            areaCount: 49
          }
        ]);
      }
      else {
        setLocations(result.locations);
      }
    };
    getLocations();
  }, [client]);

  if (locations === null) {
    return (
      <div></div>
    );
  }
  if (locations.length > 0) {
    const tableRows = locations.map(l => {
      return (
        <TableRow key={l.name}>
            <TableCell component="th" scope="row">
              <span 
                className={classes.locationName}
                onClick={() => handleNameClick(l)}>{l.name}</span>
            </TableCell>
            <TableCell align="right">{l.timeZone.split('/')[1].replace('_', ' ')}</TableCell>
            <TableCell align="right">{l.createdAt.toLocaleDateString()}</TableCell>
            <TableCell align="right">{l.areaCount}</TableCell>
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
  return (<div></div>);
}

export default List;
