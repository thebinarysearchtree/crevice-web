import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  props: {
    MuiButton: {
      disableElevation: true
    },
    MuiDialog: {
      PaperProps: {
        style: {
          boxShadow: '0 12px 28px 0 rgb(0 0 0 / 20%), 0 2px 4px 0 rgb(0 0 0 / 10%), inset 0 0 0 1px rgb(255 255 255 / 50%)'
        }
      }
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
  },
  overrides: {
    MuiBackdrop: {
      root: {
        backgroundColor: 'rgba(244, 244, 244, 0.8)'
      }
    }
  }
});

export default theme;