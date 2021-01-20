import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  fc: {
    marginBottom: '10px'
  },
  signUp: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    paddingTop: '30px',
    color: '#262626'
  },
  paper: {
    marginBottom: '20px'
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '370px',
    padding: '40px',
    paddingTop: '10px',
    marginBottom: '10px'
  },
  question: {
    paddingBottom: '10px',
    alignItems: 'center'
  },
  heading: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  button: {
    marginTop: '30px'
  },
  link: {
    color: '#3897f0',
    marginLeft: '5px',
    textDecoration: 'none'
  },
  verify: {
    paddingTop: '40px',
    width: '400px',
    flexDirection: 'column',
    color: '#262626',
    lineHeight: '1.5em',
  }
});

export default useStyles;