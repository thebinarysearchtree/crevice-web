import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Tooltip from '@material-ui/core/Tooltip';
import { Link } from 'react-router-dom';

function BackButton(props) {
  const { to, onClick } = props;

  if (to) {
    return (
      <Tooltip title="Back">
        <IconButton component={Link} to={to}>
          <ArrowBackIcon fontSize="large" />
        </IconButton>
      </Tooltip>
    );
  }
  return (
    <Tooltip title="Back">
      <IconButton onClick={onClick}>
        <ArrowBackIcon fontSize="large" />
      </IconButton>
    </Tooltip>
  );
}

export default BackButton;
