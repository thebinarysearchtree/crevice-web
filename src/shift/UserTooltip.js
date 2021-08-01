import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '0px'
  },
  paper: {
    padding: theme.spacing(2)
  },
  roleName: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2)
  }
}));

function UserTooltip(props) {
  const classes = useStyles();

  const { name, roleName, onCancel } = props;

  const content = (
    <Paper className={classes.paper} elevation={3}>
      <Typography variant="body1">{name}</Typography>
      <Typography className={classes.roleName} variant="body1">{roleName}</Typography>
      <Button 
        variant="contained" 
        color="secondary" 
        onClick={onCancel}>Cancel booking</Button>
    </Paper>
  );

  return (
    <Tooltip 
      classes={{ tooltip: classes.root }} 
      title={content} 
      enterNextDelay={400}
      interactive>
        <div>{props.children}</div>
    </Tooltip>
  );
}

export default UserTooltip;
