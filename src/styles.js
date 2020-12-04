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
  logo: {
    height: '30px'
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
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
  }
});

export default useStyles;