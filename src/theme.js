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
    }
  }
});

export default theme;