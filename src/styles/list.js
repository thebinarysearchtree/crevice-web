import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6)
  },
  rightSection: {
    width: '240px',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    marginLeft: theme.spacing(2)
  },
  heading: {
    display: 'flex',
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  grow: {
    display: 'flex',
    flexGrow: 1
  },
  icon: {
    fontSize: '2.525rem',
    marginRight: theme.spacing(2)
  },
  title: {
    display: 'flex',
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
  },
  deleteButton: {
    cursor: 'pointer',
    fontWeight: 600,
    color: theme.palette.action.active
  },
  toolbar: {
    display: 'flex',
    marginBottom: theme.spacing(2)
  },
  colour: {
    padding: '0px',
    width: '8px'
  }
}));

export default useStyles;
