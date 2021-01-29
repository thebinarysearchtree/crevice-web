import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useClient } from '../client';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { Link, useParams, useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    flexDirection: 'column',
    width: '100%',
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5)
  },
  content: {
    maxWidth: '700px',
    flexDirection: 'column'
  },
  heading: {
    marginBottom: theme.spacing(3)
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
  label: {
    display: 'flex',
    justifyContent: 'space-between',
    marginLeft: '0px'
  }
}));

function Detail() {
  const [role, setRole] = useState({
    name: '',
    defaultView: '',
    canBookBefore: false,
    canBookAfter: false,
    canCancelBefore: false,
    canCancelAfter: false,
    canBookForRoleId: null,
    canCancelForRoleId: null,
    canDelete: false,
    canEditBefore: false,
    canEditAfter: false,
    canChangeCapacity: false,
    canAssignTasks: false,
    canInviteUsers: false
  });
  const [selectListItems, setSelectListItems] = useState([]);

  const { roleId } = useParams();
  const client = useClient();
  const history = useHistory();
  const classes = useStyles();

  const handleInputChange = (e) => {
    const name = e.target.name;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    setRole(r => ({ ...r, [name] : value }));
  }

  const saveRole = async () => {
    const url = roleId === 'new' ? '/roles/insert' : '/roles/update';
    const result = await client.postData(url, role);
    if (result) {
      history.push('/roles');
    }
  }

  useEffect(() => {
    const getSelectListItems = async () => {
      const result = await client.postData('/roles/getSelectListItems');
      if (result) {
        const { selectListItems } = result;
        setSelectListItems(selectListItems);
      }
    };
    getSelectListItems();
  }, [client]);

  useEffect(() => {
    const getRole = async () => {
      const result = await client.postData('/roles/getById', { roleId });
      if (result) {
        const { role } = result;
        setRole(role);
      }
    };
    if (roleId !== 'new') {
      getRole();
    }
  }, [roleId, client]);

  const title = roleId === 'new' ? 'Create a new role' : 'Edit role';

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.heading}>
          <Typography variant="h4">{title}</Typography>
        </div>
        <Paper className={classes.paper}>
          <form
            className={classes.form}
            onSubmit={saveRole} 
            noValidate>
              <TextField
                name="name"
                className={classes.fc}
                label="Role name"
                value={role.name}
                onChange={handleInputChange} />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={role.canBookBefore}
                    onChange={handleInputChange}
                    name="canBookBefore" />
                }
                label="Book shifts before they start"
                labelPlacement="start"
                classes={{ root: classes.label }} />
          </form>
        </Paper>
      </div>
    </div>
  );
}

export default Detail;
