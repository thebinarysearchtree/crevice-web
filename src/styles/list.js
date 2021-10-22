const styles = (theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    marginBottom: theme.spacing(40)
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6)
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
  name: {
    color: 'inherit',
    fontWeight: 600
  },
  clickableName: {
    color: 'inherit',
    fontWeight: 600,
    cursor: 'pointer'
  },
  toolbar: {
    display: 'flex',
    marginBottom: theme.spacing(2),
    alignItems: 'flex-end'
  },
  iconCell: {
    paddingTop: '2px',
    paddingBottom: '2px'
  },
  selectedRow: {
    backgroundColor: 'rgb(0, 0, 0, 0.04)'
  },
  disabledRow: {
    color: theme.palette.text.disabled
  }
});

export default styles;
