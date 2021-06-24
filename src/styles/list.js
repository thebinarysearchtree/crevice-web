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
    marginBottom: theme.spacing(2),
    alignItems: 'flex-end'
  },
  colour: {
    padding: '0px',
    width: '8px'
  },
  avatar: {
    width: '24px',
    height: '24px'
  },
  avatarCell: {
    paddingRight: '0px'
  },
  nameCell: {
    paddingLeft: '0px'
  },
  activeDate: {
    marginBottom: '0px',
    width: '140px'
  },
  filter: {
    width: '127px'
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
  },
  buttonMargin: {
    marginRight: theme.spacing(1)
  }
});

export default styles;
