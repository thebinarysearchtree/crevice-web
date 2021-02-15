import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  props: {
    MuiButton: {
      disableElevation: true
    }
  },
  typography: {
    button: {
      textTransform: 'none'
    },
    fontFamily: [
      'system-ui', 
      '-apple-system', 
      'BlinkMacSystemFont', 
      '"Segoe UI"', 
      'Roboto', 
      'Ubuntu', 
      '"Helvetica Neue"', 
      'sans-serif']
  }
});

export default theme;