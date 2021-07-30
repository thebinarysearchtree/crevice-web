import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(1),
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.palette.grey[300],
    marginBottom: theme.spacing(1)
  },
  grow: {
    flexGrow: 1
  },
  button: {
    marginRight: theme.spacing(1)
  }
}));

function PopoverToolbar(props) {
  const classes = useStyles();
  
  const { itemName, onEdit, onDelete, onClose } = props;

  return (
    <div className={classes.root}>
      <div className={classes.grow} />
      <Tooltip title={`Edit ${itemName}`}>
        <IconButton className={classes.button} size="small" onClick={onEdit}>
          <EditIcon fontSize="small" color="action" />
        </IconButton>
      </Tooltip>
      <Tooltip title={`Delete ${itemName}`}>
        <IconButton className={classes.button} size="small" onClick={onDelete}>
          <DeleteIcon fontSize="small" color="action" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Close">
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" color="action" />
        </IconButton>
      </Tooltip>
    </div>
  );
}

export default PopoverToolbar;
