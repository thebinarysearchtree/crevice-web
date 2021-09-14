import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import SeriesIcon from '@material-ui/icons/LinearScale';
import CopyIcon from '@material-ui/icons/FileCopy';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    padding: theme.spacing(1),
    alignItems: 'center',
    backgroundColor: '#e1bee7',
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
  
  const { onCopy, onSeries, onEdit, onDelete, onClose, copyText, seriesText, editText, deleteText } = props;

  const copyButton = onCopy ? (
    <Tooltip title={copyText}>
      <IconButton className={classes.button} size="small" onClick={onCopy}>
        <CopyIcon fontSize="small" color="action" />
      </IconButton>
    </Tooltip>
  ) : null;

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
      {copyButton}
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
