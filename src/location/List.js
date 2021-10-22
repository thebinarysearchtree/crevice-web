import React, { useState } from 'react';
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
import Progress from '../common/Progress';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import Link from '@material-ui/core/Link';
import { Link as RouterLink } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { useClient } from '../auth';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles(styles);

function List() {
  const [locations, setLocations] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const classes = useStyles();
  const client = useClient();

  const rowsPerPage = 10;

  const sliceStart = page * rowsPerPage;
  const sliceEnd = sliceStart + rowsPerPage;

  const handleNewClick = () => {
    setSelectedLocation({
      id: -1,
      name: '',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      address: ''
    });
  }

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  }

  const deleteLocation = async (locationId) => {
    await client.postMutation({
      url: '/locations/remove',
      data: { locationId },
      message: 'Location deleted'
    });
  }

  useFetch(setLoading, [{
    url: '/locations/find',
    handler: (locations) => setLocations(locations)
  }]);

  if (loading) {
    return <Progress loading={loading} />;
  }

  const tableRows = locations.slice(sliceStart, sliceEnd).map(l => {
    const areaCount = l.areaCount === 0 ? (
      <span>{l.areaCount}</span>
    ) : (
      <Link to={`/areas?locationId=${l.id}`} component={RouterLink}>{l.areaCount}</Link>
    );
    return (
      <TableRow key={l.id}>
          <TableCell component="th" scope="row">
            <span className={classes.clickableName}>{l.name}</span>
          </TableCell>
          <TableCell align="left">{l.timeZone.split('/')[1].replace('_', ' ')}</TableCell>
          <TableCell align="right">
            {areaCount}
          </TableCell>
          <TableCell align="right" className={classes.iconCell}>
            <Tooltip title="Edit">
              <IconButton onClick={() => setSelectedLocation({...l})}>
                <EditIcon color="action" fontSize="small" />
              </IconButton>
            </Tooltip>
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
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation} />
      </div>
    </div>
  );
}

export default List;
