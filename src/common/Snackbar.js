import React from 'react';
import MuiSnackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

function Snackbar(props) {
  const { message, setMessage } = props;

  const handleClose = (e, r) => r !== 'clickaway' ? setMessage('') : null;

  return (
    <MuiSnackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left'
      }}
      open={Boolean(message)}
      autoHideDuration={6000}
      onClose={handleClose}
      message={message}
      action={
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={handleClose}>
            <CloseIcon fontSize="small" />
        </IconButton>} />
  );
}

export default Snackbar;
