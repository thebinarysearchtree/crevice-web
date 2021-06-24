import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  props: {
    MuiMenu: {
      getContentAnchorEl: () => null
    }
  },
  overrides: {
    MuiTableCell: {
      root: {
        whiteSpace: 'nowrap'
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
  }
});

export default theme;