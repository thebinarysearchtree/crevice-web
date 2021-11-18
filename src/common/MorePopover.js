import React, { useState } from 'react';
import Popover from '@material-ui/core/Popover';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  link: {
    textDecoration: 'none',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'none'
    }
  },
  popover: {
    pointerEvents: 'none'
  },
  list: {
    listStyleType: 'none',
    padding: '0px',
    margin: '0px'
  },
  item: {
    padding: '2px'
  },
  paper: {
    padding: theme.spacing(2)
  }
}));

function MorePopover(props) {
  const [anchorEl, setAnchorEl] = useState(null);

  const classes = useStyles();

  const open = Boolean(anchorEl);

  const { className, items } = props;

  if (items.length === 0) {
    return null;
  }
  if (items.length === 1) {
    return <span className={className}>{items[0]}</span>;
  }
  const listItems = items.slice(1).map(item => <li key={item} className={classes.item}>{item}</li>);
  return (
    <React.Fragment>
      <span className={className}>{items[0]} and </span>
      <Link 
        className={classes.link} 
        to="#"
        onMouseEnter={(e) => setAnchorEl(e.currentTarget)}
        onMouseLeave={() => setAnchorEl(null)}>{items.length - 1} more</Link>
      <Popover
        className={classes.popover}
        classes={{ paper: classes.paper }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        onClose={() => setAnchorEl(null)}
        disableRestoreFocus><div><ul className={classes.list}>{listItems}</ul></div></Popover>
    </React.Fragment>
  );
}

export default MorePopover;
