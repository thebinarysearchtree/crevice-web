import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from './AppBar';

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

  const { drawer } = props;
  
  return (
    <div className={classes.root}>
      <AppBar />
      {drawer}
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {props.children}
      </main>
    </div>
  );
}

export default Nav;
