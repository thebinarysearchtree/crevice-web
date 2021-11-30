import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import styles from '../styles/list';
import Detail from './Detail';
import ConfirmButton from '../common/ConfirmButton';
import Progress from '../common/Progress';
import Link from '@material-ui/core/Link';
import { Link as RouterLink } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { useClient } from '../auth';
import PageButtons from '../common/PageButtons';
import Divider from '@material-ui/core/Divider';

const useStyles = makeStyles((theme) => ({
  ...styles(theme),
  locations: {
    display: 'flex',
    flexDirection: 'column'
  },
  location: {
    display: 'flex',
    padding: theme.spacing(2),
    justifyContent: 'space-between'
  },
  locationDetails: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    marginRight: theme.spacing(1),
    alignItems: 'flex-start'
  },
  count: {
    flex: 1,
    marginRight: theme.spacing(1)
  },
  timeZone: {
    color: theme.palette.text.secondary
  },
  address: {
    flex: 2,
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1)
  }
}));

function List() {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [page, setPage] = useState(0);

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

  const deleteLocation = async (locationId) => {
    await client.postMutation({
      url: '/locations/remove',
      data: { locationId },
      message: 'Location deleted'
    });
  }

  const loading = useFetch([{
    url: '/locations/find',
    handler: (locations) => setLocations(locations)
  }]);

  if (loading) {
    return <Progress loading={loading} />;
  }

  const currentLocations = locations.slice(sliceStart, sliceEnd);

  const locationItems = currentLocations.map((location, i) => {
    const { id, name, timeZone, address, areaCount } = location;
    const count = areaCount === 0 ? (
      <span>{areaCount} areas</span>
    ) : (
      <Link to={`/areas?locationId=${id}`} component={RouterLink}>{areaCount} areas</Link>
    );
    return (
      <React.Fragment key={id}>
        <div className={classes.location}>
          <div className={classes.locationDetails}>
            <span className={classes.name} onClick={() => setSelectedLocation({...location})}>{name}</span>
            <span className={classes.timeZone}>{timeZone}</span>
          </div>
          <div className={classes.count}>{count}</div>
          <div className={classes.address}>{address}</div>
          <ConfirmButton
              title={`Delete ${name}?`}
              content="Make sure this location has no areas before deleting it."
              onClick={() => deleteLocation(id)} />
        </div>
        {i === currentLocations.length - 1 ? null : <Divider />}
      </React.Fragment>
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
            onClick={handleNewClick}>New location</Button>
        </div>
        <Paper className={classes.locations}>
          {locationItems}
        </Paper>
        <PageButtons 
          onBack={() => setPage(page => page - 1)}
          onForward={() => setPage(page => page + 1)}
          onBackToStart={() => setPage(0)}
          page={page}
          count={locations.length}
          itemsPerPage={10} />
        <Detail 
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation} />
      </div>
    </div>
  );
}

export default List;
