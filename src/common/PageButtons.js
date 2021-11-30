import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2)
  },
  spacing: {
    marginRight: '5px'
  },
  chevron: {
    paddingLeft: '0px',
    paddingRight: '0px',
    minWidth: '35px'
  },
  count: {
    lineHeight: '100%',
    alignSelf: 'center',
    marginRight: theme.spacing(1)
  }
}));

function PageButtons(props) {
  const classes = useStyles();

  const { onBack, onForward, onBackToStart, page, count, itemsPerPage } = props;

  const countText = count === 1 ? '1 result' : `${count} results`;

  return (
    <div className={classes.root}>
      <Typography className={classes.count} variant="body2">{countText}</Typography>
      <Button 
        className={`${classes.chevron} ${classes.spacing}`}
        variant="contained"
        onClick={onBackToStart}
        disabled={page === 0}>
          <SkipPreviousIcon />
      </Button>
      <Button 
        className={`${classes.chevron} ${classes.spacing}`}
        variant="contained"
        onClick={onBack}
        disabled={page === 0}>
          <ChevronLeftIcon />
      </Button>
      <Button 
        className={classes.chevron}
        variant="contained"
        onClick={onForward}
        disabled={itemsPerPage * (page + 1) >= count}>
          <ChevronRightIcon />
      </Button>
    </div>
  );
}

export default PageButtons;
