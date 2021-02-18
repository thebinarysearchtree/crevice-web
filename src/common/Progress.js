import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fade from '@material-ui/core/Fade';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center'
  }
}));

function Progress(props) {
  const { loading } = props;

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Fade
        in={loading}
        style={{
          transitionDelay: loading ? '800ms' : '0ms'
        }}
        unmountOnExit>
          <CircularProgress />
      </Fade>
    </div>
  );
}

export default Progress;
