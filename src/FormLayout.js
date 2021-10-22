import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useClient } from './auth';
import Snackbar from './common/Snackbar';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import ClearIcon from '@material-ui/icons/Clear';
import { Link as RouterLink } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    width: '100%'
  },
  toolbar: theme.mixins.toolbar,
  main: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    flexGrow: 1,
    backgroundColor: theme.palette.background.default
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    paddingLeft: theme.spacing(7),
    paddingRight: theme.spacing(7),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  },
  content: {
    flexDirection: 'column'
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2)
  },
  container: {
    display: 'flex'
  },
  button: {
    marginTop: theme.spacing(2),
    alignSelf: 'flex-start'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  spacing: {
    marginBottom: theme.spacing(2)
  },
  mr: {
    marginRight: theme.spacing(2)
  },
  input: {
    backgroundColor: 'white'
  },
  appBar: {
    backgroundColor: theme.palette.grey[600],
    boxShadow: 'none',
    zIndex: theme.zIndex.drawer + 1
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  title: {
    fontWeight: 600,
    color: 'white',
    marginBottom: '2px'
  },
  link: {
    textDecoration: 'none'
  },
  backButton: {
    marginRight: theme.spacing(1),
    width: '40px',
    height: '40px'
  }
}));

function FormLayout(props) {
  const classes = useStyles();
  const client = useClient();

  const { message, setMessage, ref } = client;

  const { title, backTo, onClose } = props;

  const backButton = backTo ? (
    <IconButton className={classes.backButton} component={RouterLink} to={backTo}>
      <ClearIcon htmlColor="white" />
    </IconButton>
  ) : (
    <IconButton className={classes.backButton} onClick={onClose}>
      <ClearIcon htmlColor="white" />
    </IconButton>
  );

  return (
    <div className={classes.root} ref={ref}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <div className={classes.titleContainer}>
            {backButton}
            <Typography variant="h5" className={classes.title}>{title}</Typography>
          </div>
        </Toolbar>
      </AppBar>
      <main className={classes.main}>
        <div className={classes.toolbar} />
        <div className={classes.contentContainer}>
          <div className={classes.content}>{props.children}</div>
        </div>
      </main>
      <Snackbar message={message} setMessage={setMessage} />
    </div>
  );
}

export default FormLayout;
