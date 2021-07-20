import React from 'react';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import InputAdornment from '@material-ui/core/InputAdornment';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '258px'
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.grey[300],
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 'auto'
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
  clear: {
    marginRight: '4px'
  },
}));

function SearchBox(props) {
  const classes = useStyles();

  const { value, placeholder, onChange, onClear, onSubmit, variant } = props;

  const clearButton = value ? (
    <InputAdornment position="end">
      <IconButton 
        className={classes.clear} 
        onClick={onClear} 
        size="small"><ClearIcon /></IconButton>
    </InputAdornment>
  ) : null;

  const content = (
    <React.Fragment>
      <div className={classes.searchIcon}>
        <SearchIcon color="action" />
      </div>
      <InputBase
        className={classes.root}
        placeholder={placeholder}
        classes={{
          root: classes.inputRoot,
          input: classes.inputInput,
        }}
        inputProps={{ 'aria-label': 'search' }}
        value={value}
        onChange={onChange}
        endAdornment={clearButton} />
    </React.Fragment>
  );

  if (variant === 'form') {
    return (
      <form className={classes.search} onSubmit={onSubmit}>
        {content}
      </form>
    );
  }
  return (
    <div className={classes.search}>
      {content}
    </div>
  );
}

export default SearchBox;
