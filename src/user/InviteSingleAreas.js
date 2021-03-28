import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import client from '../client';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIos from '@material-ui/icons/ArrowBackIos';
import Button from '@material-ui/core/Button';
import Snackbar from '../common/Snackbar';
import { Link, useHistory } from 'react-router-dom';
import useFetchMany from '../hooks/useFetchMany';
import Avatar from '@material-ui/core/Avatar';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import AreaDialog from './AreaDialog';
import RoleChip from '../common/RoleChip';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
    alignItems: 'center'
  },
  content: {
    maxWidth: '700px',
    width: '100%',
    flexDirection: 'column'
  },
  heading: {
    display: 'flex',
    marginBottom: theme.spacing(3),
    justifyContent: 'space-between'
  },
  header: {
    display: 'flex',
    alignItems: 'center'
  },
  paper: {
    display: 'flex',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(4),
    alignItems: 'center'
  },
  container: {
    display: 'flex'
  },
  button: {
    marginTop: theme.spacing(2),
    width: '200px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  spacing: {
    marginBottom: theme.spacing(2)
  },
  email: {
    width: '416px'
  },
  avatar: {
    width: '70px',
    height: '70px',
    marginRight: theme.spacing(1)
  },
  mr: {
    marginRight: theme.spacing(2)
  },
  toolbar: {
    display: 'flex',
    marginBottom: theme.spacing(2),
    alignItems: 'flex-end'
  },
  grow: {
    display: 'flex',
    flexGrow: 1
  },
  backButton: {
    marginRight: theme.spacing(1)
  },
  table: {
    marginBottom: theme.spacing(4)
  },
  label: {
    marginRight: '4px'
  },
  fieldContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: theme.spacing(4)
  }
}));

function InviteSingleAreas(props) {
  const [roles, setRoles] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const history = useHistory();
  const classes = useStyles();

  const { userAreas, setUserAreas, user } = props;

  const handleAddArea = () => {
    setOpen(true);
  }

  const inviteUser = () => {
    const areas = userAreas.map(ua => ({ 
      roleId: ua.role.id, 
      areaId: ua.area.id, 
      startDate: ua.startDate, 
      endDate: ua.endDate 
    }));
  }

  function DisplayField(props) {
    const { label, value } = props;
    return value ? (
      <div className={classes.container}>
        <Typography className={classes.label} variant="subtitle2">{label}:</Typography>
        <Typography variant="body2" color="textSecondary">{value}</Typography>
      </div>
    ) : null;
  }

  const rolesHandler = (roles) => setRoles(roles);
  const areasHandler = (areas) => setAreas(areas);

  useFetchMany(setLoading, [
    { url: '/roles/getSelectListItems', handler: rolesHandler },
    { url: '/areas/getSelectListItems', handler: areasHandler }]);

  if (loading) {
    return null;
  }

  const tableRows = userAreas.map((a, i) => {
    return (
      <TableRow key={i}>
          <TableCell component="th" scope="row"><RoleChip label={a.role.name} colour={a.role.colour} /></TableCell>
          <TableCell align="right">{a.area.name}</TableCell>
          <TableCell align="right">{a.startDate.toLocaleDateString()}</TableCell>
          <TableCell align="right">{a.endDate ? a.endDate.toLocaleDateString() : ''}</TableCell>
          <TableCell align="right"></TableCell>
      </TableRow>
    );
  });

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.heading}>
          <div className={classes.header}>
            <IconButton 
              className={classes.iconButton} 
              component={Link} 
              to="/users">
                <ArrowBackIos fontSize="large" />
            </IconButton>
            <Typography variant="h4">Invite users</Typography>
          </div>
        </div>
        <Paper className={classes.paper}>
          <Avatar className={classes.avatar} />
          <div className={classes.container}>
            <div className={classes.form}>
              <Typography variant="subtitle2">{`${user.firstName} ${user.lastName}`}</Typography>
              <Typography variant="body2" color="textSecondary">{user.email}</Typography>
            </div>
            <div className={classes.fieldContainer}>
              <DisplayField label="Phone" value={user.phone} />
              <DisplayField label="Pager" value={user.pager} />
            </div>
          </div>
        </Paper>
        <div className={classes.toolbar}>
          <div className={classes.grow} />
          <Button 
            variant="contained"
            color="secondary"
            onClick={handleAddArea}>Add area</Button>
        </div>
        <TableContainer className={classes.table} component={Paper}>
          <Table aria-label="areas table">
            <TableHead>
              <TableRow>
                <TableCell>Role</TableCell>
                <TableCell align="right">Area</TableCell>
                <TableCell align="right">Start date</TableCell>
                <TableCell align="right">End date</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableRows}
            </TableBody>
          </Table>
        </TableContainer>
        <Button
          className={classes.backButton}
          onClick={() => props.setShowAreas(false)}
          color="primary">Back</Button>
        <Button
          onClick={inviteUser}
          variant="contained"
          color="primary"
          disabled={userAreas.length === 0}>Invite user</Button>
        <AreaDialog 
          open={open} 
          setOpen={setOpen} 
          setUserAreas={setUserAreas} 
          roles={roles} 
          areas={areas} />
        <Snackbar message={message} setMessage={setMessage} />
      </div>
    </div>
  );
}

export default InviteSingleAreas;
