import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import styles from '../styles/list';
import SearchBox from '../common/SearchBox';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import useFetch from '../hooks/useFetch';
import Progress from '../common/Progress';
import { Link as RouterLink } from 'react-router-dom';
import TableFilterCell from '../common/TableFilterCell';
import RoleChip from '../common/RoleChip';
import MorePopover from '../common/MorePopover';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Avatar from '../common/Avatar';
import { makePgDate, addDays } from '../utils/date';
import Shift from '../common/Shift';
import CalendarButtons from '../common/CalendarButtons';
import { useClient } from '../auth';
import { makeReviver, dateParser } from '../utils/data';
import UserSearch from '../common/UserSearch';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Notes from './Notes';

const useStyles = makeStyles((theme) => ({
  ...styles(theme),
  clearFilters: {
    marginRight: theme.spacing(1)
  },
  nameCell: {
    paddingLeft: '0px',
    width: '160px'
  },
  button: {
    marginRight: theme.spacing(1)
  },
  search: {
    width: '270px'
  },
  shift: {
    display: 'inline-flex'
  },
  areaName: {
    marginRight: theme.spacing(1)
  },
  avatarCell: {
    width: '64px'
  },
  shiftTime: {
    marginBottom: '0px'
  },
  shiftCell: {
    width: '250px'
  },
  buttonCell: {
    width: '107px'
  },
  notes: {
    display: 'flex',
    alignItems: 'center'
  }
}));

const today = new Date();
today.setHours(0, 0, 0, 0);

const formatter = new Intl.DateTimeFormat('default', { weekday: 'long' });
const reviver = makeReviver(dateParser);

function Following(props) {
  const [date, setDate] = useState(today);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  const userId = parseInt(props.userId, 10);

  const startTime = addDays(date, -1);
  const endTime = addDays(date, 2);

  const query = {
    userId,
    startTime,
    endTime
  };

  const title = formatter.format(date);

  const classes = useStyles();
  const client = useClient();

  const handleUnfollow = async (followingId) => {
    await client.postMutation({
      url: '/followers/remove',
      data: { userId, followingId },
      message: 'User unfollowed'
    });
  }

  const handleUserClick = async (user) => {
    const { id: followingId } = user;
    await client.postMutation({
      url: '/followers/insert',
      data: { userId, followingId },
      message: 'User added'
    });
  }

  const handleSaveNotes = async (user, notes) => {
    const bookingId = user.shift.bookingId;
    const url = user.notes ? '/followerNotes/update' : '/followerNotes/insert';
    await client.postMutation({
      url,
      data: { bookingId, notes }
    });
  }

  const search = async (searchTerm) => {
    const response = await client.postData('/users/findByName', { searchTerm });
    if (response.ok) {
      const text = await response.text();
      return JSON.parse(text, reviver);
    }
    return [];
  }

  const handler = (suppliedUsers) => {
    const users = new Map();
    for (const user of suppliedUsers) {
      if (user.shift) {
        const { startTime } = user.shift;
        if (startTime.getMonth() !== date.getMonth() || startTime.getDate() !== date.getDate()) {
          user.shift = null;
        }
      }
      const key = `${user.id} ${user.shift?.startTime.getTime()}`;
      users.set(key, user);
    }
    setUsers(Array.from(users.values()));
  }

  useFetch(setLoading, [
    { url: '/followers/find', handler, data: query, reviver }],
    [date]);

  if (loading) {
    return <Progress loading={loading} />;
  }

  const tableRows = users.map((user, i) => {
    const { id, name, shift } = user;
    const url = `/users/${id}`;

    let shiftElement;
    if (shift) {
      const { areaName, startTime, endTime } = shift;
      shiftElement = (
        <div className={classes.shift}>
          <Typography className={classes.areaName} variant="body1">{areaName}</Typography>
          <Shift className={classes.shiftTime} startTime={startTime} endTime={endTime} />
        </div>
      );
    }

    return (
      <TableRow key={id}>
          <TableCell className={classes.iconCell}>
            <Avatar className={classes.avatar} user={user} size="medium" />
          </TableCell>
          <TableCell className={classes.nameCell} component="th" scope="row">
            <RouterLink 
              className={classes.link} 
              to={url}>{name}</RouterLink>
          </TableCell>
          <TableCell align="right">{shiftElement}</TableCell>
          <TableCell className={classes.iconCell} align="left">
            <Notes user={user} onSave={handleSaveNotes} />
          </TableCell>
          <TableCell align="right">
            <Button 
              variant="contained" 
              color="primary" 
              size="small" 
              onClick={() => handleUnfollow(id)}>Unfollow</Button>
          </TableCell>
      </TableRow>
    );
  });

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.toolbar}>
          <Typography variant="h4">{title}</Typography>
          <div className={classes.grow} />
          <UserSearch
            className={classes.search}
            placeholder="Add a user..."
            onClick={handleUserClick}
            onSearch={search} />
          <CalendarButtons
            onBack={() => setDate(date => addDays(date, -1))}
            onToday={() => setDate(today)}
            onForward={() => setDate(date => addDays(date, 1))} />
        </div>
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="areas table">
            <TableHead>
              <TableRow>
                <TableCell className={classes.avatarCell}></TableCell>
                <TableCell className={classes.nameCell}>Name</TableCell>
                <TableCell className={classes.shiftCell} align="right">Shift</TableCell>
                <TableCell align="left">Notes</TableCell>
                <TableCell className={classes.buttonCell} align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableRows}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

export default Following;
