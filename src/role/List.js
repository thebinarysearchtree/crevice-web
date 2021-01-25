import React, { useState, useEffect } from 'react';
import { useClient } from '../client';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

function List() {
  const [roles, setRoles] = useState(null);

  const client = useClient();

  useEffect(() => {
    const getRoles = async () => {
      const roles = await client.postData('/roles/find');
      if (!roles) {
        setRoles([]);
      }
      else {
        setRoles(roles);
      }
    };
    getRoles();
  }, [client]);

  if (roles === null) {
    return (
      <div></div>
    );
  }
  if (roles.length === 0) {
    return (
      <div>
        <Paper>
          <Typography variant="h3">Roles</Typography>
          <Typography variant="body1">There are no roles.</Typography>
        </Paper>
      </div>
    );
  }
  return (<div>{roles}</div>);
}

export default List;
