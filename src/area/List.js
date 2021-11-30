import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import styles from '../styles/list';
import Detail from './Detail';
import ConfirmButton from '../common/ConfirmButton';
import SearchBox from '../common/SearchBox';
import useFetch from '../hooks/useFetch';
import Progress from '../common/Progress';
import Link from '@material-ui/core/Link';
import { Link as RouterLink } from 'react-router-dom';
import Avatar from '../common/Avatar';
import useParamState from '../hooks/useParamState';
import useSyncParams from '../hooks/useSyncParams';
import { useClient } from '../auth';
import PageButtons from '../common/PageButtons';
import Divider from '@material-ui/core/Divider';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme) => ({ 
  ...styles(theme),
  avatar: {
    marginRight: theme.spacing(1)
  },
  areas: {
    display: 'flex',
    flexDirection: 'column'
  },
  area: {
    display: 'flex',
    padding: theme.spacing(2),
    justifyContent: 'space-between'
  },
  areaDetails: {
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
  location: {
    color: theme.palette.text.secondary
  },
  administrators: {
    flex: 2,
    marginRight: theme.spacing(1)
  },
  locationSelect: {
    width: '200px',
    marginRight: theme.spacing(2)
  },
  noAreas: {
    display: 'flex',
    height: '72px',
    alignItems: 'center',
    justifyContent: 'center'
  },
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
  const [locations, setLocations] = useState([]);
  const [locationId, setLocationId, locationTranslator] = useParamState({
    name: 'locationId',
    defaultValue: -1,
    hideDefault: true
  });
  const [count, setCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleNewClick = () => {
    setSelectedArea({
      id: -1,
      name: '',
      locationId: -1,
      notes: ''
    });
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

  const loading = useFetch([
    { url: '/areas/find', handler: areasHandler },
    { url: '/locations/getSelectListItems', handler: locationsHandler }]);

  if (loading) {
    return <Progress loading={loading} />;
  }
  
  const areaItems = filteredAreas.map((area, i) => {
    const { id, name, locationName, administrators, activeUserCount } = area;
    const avatars = administrators.map(user => {
      return (
        <Avatar 
          key={user.id} 
          className={classes.avatar} 
          user={user} 
          size="medium" 
          tooltip />
      );
    });
    const count = activeUserCount === 0 ? (
      <span>{activeUserCount}</span>
    ) : (
      <Link to={`/users?areaId=${id}`} component={RouterLink}>{activeUserCount} active users</Link>
    );
    return (
      <React.Fragment key={id}>
        <div className={classes.area}>
          <div className={classes.areaDetails}>
            <span className={classes.name} onClick={() => setSelectedArea({...area})}>{name}</span>
            <span className={classes.location}>{locationName}</span>
          </div>
          <div className={classes.count}>{count}</div>
          <div className={classes.administrators}>{avatars}</div>
          <ConfirmButton
              title={`Delete ${name}?`}
              content="Make sure this areas has no users before deleting it."
              onClick={() => deleteArea(id)} />
        </div>
        {i === filteredAreas.length - 1 ? null : <Divider />}
      </React.Fragment>
    );
  });

  const menuItems = locations.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>);

  const noAreas = (
    <Paper className={classes.noAreas}>No areas</Paper>
  );

  const areasList = (
    <Paper className={classes.areas}>
      {areaItems}
    </Paper>
  );

  const content = filteredAreas.length === 0 ? noAreas : areasList;

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.toolbar}>
          <SearchBox 
            placeholder="Search..."
            onChange={(e) => setSearchTerm(e.target.value)} />
          <div className={classes.grow} />
          <FormControl className={classes.locationSelect}>
            <InputLabel id="location">Location</InputLabel>
            <Select
              labelId="location"
              label="Location"
              value={locationId === -1 ? '' : locationId}
              onChange={(e) => setLocationId(e.target.value)}>
                <MenuItem key={-1} value={-1}>All</MenuItem>
                {menuItems}
            </Select>
          </FormControl>
          <Button 
            variant="contained"
            color="secondary"
            onClick={handleNewClick}>New area</Button>
        </div>
        {content}
        <PageButtons 
          onBack={() => setPage(page => page - 1)}
          onForward={() => setPage(page => page + 1)}
          onBackToStart={() => setPage(0)}
          page={page}
          count={filteredAreas.length}
          itemsPerPage={10} />
        <Detail 
          selectedArea={selectedArea}
          setSelectedArea={setSelectedArea}
          locations={locations} />
      </div>
    </div>
  );
}

export default List;
