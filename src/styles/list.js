import { makeStyles } from '@material-ui/core/styles';

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
    display: 'flex',
    marginBottom: theme.spacing(3)
  },
  grow: {
    flexGrow: 1
  },
  icon: {
    fontSize: '2.525rem',
    marginRight: theme.spacing(2)
  },
  title: {
    flexDirection: 'column'
  },
  button: {
    alignSelf: 'flex-start'
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2)
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
    fontWeight: 600
  },
  locationName: {
    color: 'inherit',
    fontWeight: 600,
    cursor: 'pointer'
  }
}));

export default useStyles;
