import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useClient } from '../client';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIos from '@material-ui/icons/ArrowBackIos';
import Button from '@material-ui/core/Button';
import Snackbar from '../common/Snackbar';
import { Link, useParams, useHistory } from 'react-router-dom';

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
  deleteButton: {
    alignSelf: 'center'
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2)
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  formControl: {
    display: 'flex',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    justifyContent: 'space-between'
  },
  label: {
    display: 'flex',
    flexDirection: 'column'
  },
  description: {
    color: theme.palette.text.secondary
  },
  iconButton: {
    paddingLeft: '18px',
    paddingRight: '6px'
  },
  permissions: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(2)
  },
  roleName: {
    marginLeft: theme.spacing(2),
    maxWidth: '240px'
  },
  button: {
    marginTop: theme.spacing(2)
  },
  labelHeading: {
    cursor: 'pointer'
  }
}));

function Detail() {
  const [role, setRole] = useState({
    name: '',
    defaultView: '',
    canEditBookingBefore: false,
    canEditBookingAfter: false,
    canRequestEdit: false,
    canApproveEdit: false,
    canBookAndCancelForOthers: false,
    canEditShift: false,
    canViewProfiles: false,
    canViewAnswers: false
  });
  const [message, setMessage] = useState('');

  const { roleId } = useParams();
  const client = useClient();
  const history = useHistory();
  const classes = useStyles();

  const handleInputChange = (e) => {
    const name = e.target.name;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    setRole(r => ({ ...r, [name] : value }));
  }

  const saveRole = async (e) => {
    e.preventDefault();
    const url = roleId === 'new' ? '/roles/insert' : '/roles/update';
    const message = roleId === 'new' ? 'Role created' : 'Role updated';
    const response = await client.postData(url, { roleId, ...role });
    if (response.ok) {
      history.push('/roles', { message });
    }
    else {
      setMessage('Something went wrong');
    }
  }

  useEffect(() => {
    const getRole = async () => {
      const response = await client.postData('/roles/getById', { roleId });
      if (response.ok) {
        const role = await response.json();
        setRole(role);
      }
    };
    if (roleId !== 'new') {
      getRole();
    }
  }, [roleId, client]);

  const title = roleId === 'new' ? 'Create a new role' : 'Edit role';

  function Permission(props) {
    const { name, label, description } = props;

    const handleLabelClick = (name) => {
      const value = !role[name];

      setRole(r => ({ ...r, [name] : value }));
    }

    return (
      <div className={classes.formControl}>
        <div className={classes.label}>
          <Typography 
            id={name}
            className={classes.labelHeading}
            onClick={() => handleLabelClick(name)}>{label}</Typography>
          <Typography className={classes.description} variant="body2">{description}</Typography>
        </div>
        <div className={classes.checkbox}>
          <Checkbox
            checked={role[name]}
            onChange={handleInputChange}
            name={name}
            inputProps={{ 'aria-labelledby': name }} />
        </div>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.heading}>
          <div className={classes.header}>
            <IconButton className={classes.iconButton} component={Link} to="/roles">
              <ArrowBackIos fontSize="large" />
            </IconButton>
            <Typography variant="h4">{title}</Typography>
          </div>
        </div>
        <form className={classes.form} onSubmit={saveRole} noValidate>
          <TextField
            className={classes.roleName}
            name="name"
            label="Role name"
            value={role.name}
            onChange={handleInputChange} />
          <div className={classes.permissions}>
            <Typography variant="h5">Permissions</Typography>
            <Typography variant="subtitle1">Permissions only apply to the areas the user is assigned</Typography>
          </div>
          <Paper className={classes.paper}>
            <Permission 
              name="canEditBookingBefore"
              label="Book shifts"
              description="Book shifts and cancel bookings before the shift starts" />
            <Divider />
            <Permission 
              name="canEditBookingAfter"
              label="Book shifts retroactively"
              description="Book shifts and cancel bookings after the shift starts" />
            <Divider />
            <Permission
              name="canRequestEdit"
              label="Request the change of a booking"
              description="Request to cancel a booking, or report a shift worked" />
            <Divider />
            <Permission
              name="canApproveEdit"
              label="Approve the change of a booking"
              description="Approve requests to cancel bookings, or validate shifts worked" />
            <Divider />
            <Permission
              name="canBookAndCancelForOthers"
              label="Book for other users"
              description="Book shifts and cancel bookings for other users" />
            <Divider />
            <Permission
              name="canEditShift"
              label="Edit shifts"
              description="Create, delete, and edit shifts and shift capacities" />
            <Divider />
            <Permission
              name="canViewProfiles"
              label="View profiles"
              description="Search for users and view their profiles and shifts" />
            <Divider />
            <Permission
              name="canViewAnswers"
              label="View survey answers"
              description="View the answers of other users to any questions asked at the end of shifts" />
            <Snackbar message={message} setMessage={setMessage} />
          </Paper>
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            type="submit">Save</Button>
        </form>
      </div>
    </div>
  );
}

export default Detail;
