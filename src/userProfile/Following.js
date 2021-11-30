import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import styles from '../styles/list';
import useFetch from '../hooks/useFetch';
import Progress from '../common/Progress';
import { Link as RouterLink } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Avatar from '../common/Avatar';
import { addDays } from '../utils/date';
import Shift from '../common/Shift';
import CalendarButtons from '../common/CalendarButtons';
import { useClient } from '../auth';
import { makeReviver, dateParser } from '../utils/data';
import UserSearch from '../common/UserSearch';
import Notes from './Notes';
import Divider from '@material-ui/core/Divider';

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
  },
  noUsers: {
    display: 'flex',
    height: '75px',
    alignItems: 'center',
    justifyContent: 'center'
  },
  users: {
    display: 'flex',
    flexDirection: 'column'
  },
  user: {
    display: 'flex',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    alignItems: 'center',
    height: '75px'
  },
  avatar: {
    marginRight: theme.spacing(1)
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    marginRight: theme.spacing(1)
  },
  role: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  roles: {
    display: 'flex',
    justifyContent: 'flex-end',
    flex: 1,
    marginRight: theme.spacing(1)
  },
  areas: {
    color: theme.palette.text.secondary
  },
  booked: {
    flex: 1.5,
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1)
  },
  title: {
    marginLeft: theme.spacing(2)
  }
}));

const today = new Date();
today.setHours(0, 0, 0, 0);

const formatter = new Intl.DateTimeFormat('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const reviver = makeReviver(dateParser);

function Following(props) {
  const [date, setDate] = useState(today);
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

  const loading = useFetch([{ url: '/followers/find', handler, data: query, reviver }]);

  if (loading) {
    return <Progress loading={loading} />;
  }

  const userItems = users.map((user, i) => {
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
      <React.Fragment key={id}>
        <div className={classes.user}>
          <Avatar className={classes.avatar} user={user} size="medium" />
          <div className={classes.userDetails}>
            <RouterLink 
              className={classes.link} 
              to={url}>{name}</RouterLink>
          </div>
          <div className={classes.roles}>{shiftElement}</div>
          <div className={classes.booked}><Notes user={user} onSave={handleSaveNotes} /></div>
          <Button 
            variant="contained" 
            color="primary" 
            size="small" 
            onClick={() => handleUnfollow(id)}>Unfollow</Button>
        </div>
        {i === users.length - 1 ? null : <Divider />}
      </React.Fragment>
    );
  });

  const followersList = (
    <Paper className={classes.users}>
      {userItems}
    </Paper>
  );

  const noUsers = (
    <Paper className={classes.noUsers}>
      <Typography variant="body1">No users</Typography>
    </Paper>
  );

  const content = users.length === 0 ? noUsers : followersList;

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.toolbar}>
          <Typography className={classes.title} variant="body1">{title}</Typography>
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
        {content}
      </div>
    </div>
  );
}

export default Following;
