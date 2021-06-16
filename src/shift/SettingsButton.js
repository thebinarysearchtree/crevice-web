import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import SettingsIcon from '@material-ui/icons/Settings';
import SettingsPopover from './SettingsPopover';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles((theme) => ({
  button: {
    minWidth: '35px',
    paddingLeft: '0px',
    paddingRight: '0px'
  },
  activeIcon: {
    backgroundColor: theme.palette.action.hover
  },
  activeButton: {
    backgroundColor: '#d5d5d5'
  }
}));

function SettingsButton(props) {
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const classes = useStyles();

  const { settings, setSettings, iconOnly } = props;

  const button = iconOnly ? (
    <Tooltip title="Settings">
      <IconButton className={open ? classes.activeIcon : ''} onClick={(e) => setAnchorEl(e.currentTarget)}>
        <SettingsIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  ) : (
    <Button 
      className={`${classes.button} ${open ? classes.activeButton : ''}`} 
      variant="contained"
      onClick={(e) => setAnchorEl(e.currentTarget)}><SettingsIcon color="action" /></Button>
  );

  return (
    <React.Fragment>
      {button}
      <SettingsPopover 
        anchorEl={anchorEl} 
        setAnchorEl={setAnchorEl} 
        open={open} 
        settings={settings} 
        setSettings={setSettings} />
    </React.Fragment>
  );
}

export default SettingsButton;
