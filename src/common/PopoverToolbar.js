import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import SeriesIcon from '@material-ui/icons/LinearScale';

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
  
  const { onSeries, onEdit, onDelete, onClose, seriesText, editText, deleteText } = props;

  const seriesButton = onSeries ? (
    <Tooltip title={seriesText}>
      <IconButton className={classes.button} size="small" onClick={onSeries}>
        <SeriesIcon fontSize="small" color="action" />
      </IconButton>
    </Tooltip>
  ) : null;

  const editButton = onEdit ? (
    <Tooltip title={editText}>
      <IconButton className={classes.button} size="small" onClick={onEdit}>
        <EditIcon fontSize="small" color="action" />
      </IconButton>
    </Tooltip>
  ) : null;

  const deleteButton = onDelete ? (
    <Tooltip title={deleteText}>
      <IconButton className={classes.button} size="small" onClick={onDelete}>
        <DeleteIcon fontSize="small" color="action" />
      </IconButton>
    </Tooltip>
  ) : null;

  return (
    <div className={classes.root}>
      <div className={classes.grow} />
      {seriesButton}
      {editButton}
      {deleteButton}
      <Tooltip title="Close">
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" color="action" />
        </IconButton>
      </Tooltip>
    </div>
  );
}

export default PopoverToolbar;
