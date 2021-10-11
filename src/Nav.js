import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from './AppBar';
import { useClient } from './auth';
import Snackbar from './common/Snackbar';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    width: '100%'
  },
  toolbar: theme.mixins.toolbar,
  content: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    flexGrow: 1,
    backgroundColor: theme.palette.background.default
  }
}));

function Nav(props) {
  const classes = useStyles();
  const client = useClient();

  const { message, setMessage, ref } = client;

  const { drawer } = props;
  
  return (
    <div className={classes.root} ref={ref}>
      <AppBar />
      {drawer}
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {props.children}
      </main>
      <Snackbar message={message} setMessage={setMessage} />
    </div>
  );
}

export default Nav;
