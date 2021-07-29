import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MuiAvatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import { Link as RouterLink } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3)
  },
  medium: {
    width: theme.spacing(4),
    height: theme.spacing(4)
  }
}));

function Avatar(props) {
  const classes = useStyles();

  const { className, user, size, tooltip, noLink } = props;

  const { id, name, imageId } = user;
  const photoSrc = imageId ? `/photos/${imageId}.jpg` : null;
  const url = `/users/${id}`;
  const avatarClassName = `${size ? classes[size] : ''} ${className ? className : ''}`;

  const avatar = <MuiAvatar className={avatarClassName} src={photoSrc} alt={name} />;

  if (!tooltip && noLink) {
    return avatar;
  }
  if (!tooltip && !noLink) {
    return (
      <RouterLink to={url}>{avatar}</RouterLink>
    );
  }
  return (
    <RouterLink to={url}>
      <Tooltip title={name} placement="top">
        {avatar}
      </Tooltip>
    </RouterLink>
  );
}

export default Avatar;
