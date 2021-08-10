import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import Typography from '@material-ui/core/Typography';
import PopoverToolbar from '../common/PopoverToolbar';
import ScheduleIcon from '@material-ui/icons/Schedule';
import DialogContent from '@material-ui/core/DialogContent';
import Tooltip from '@material-ui/core/Tooltip';
import VpnKeyIcon from '@material-ui/icons/VpnKey';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '375px',
    marginBottom: theme.spacing(1)
  },
  detail: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1)
  },
  icon: {
    marginRight: theme.spacing(1)
  }
}));

function PeriodDetails(props) {
  const classes = useStyles();

  const { roleName, startTime, endTime, isAdmin, onEdit, onDelete, onClose } = props;

  const time = `${startTime.toLocaleDateString()} ${endTime ? `to ${endTime.toLocaleDateString()}` : 'onwards'}`;

  const administrator = isAdmin ? (
    <div className={classes.detail}>
      <Tooltip title="Permissions" placement="top">
        <VpnKeyIcon className={classes.icon} fontSize="small" color="action" />
      </Tooltip>
      <Typography variant="body1">Administrator</Typography>
    </div>
  ) : null;

  return (
    <React.Fragment>
      <PopoverToolbar
        onEdit={onEdit}
        onDelete={onDelete}
        onClose={onClose}
        editText="Edit period"
        deleteText="Delete period" />
      <DialogContent className={classes.root}>
        <div className={classes.detail}>
          <Tooltip title="Role" placement="top">
            <SupervisorAccountIcon className={classes.icon} fontSize="small" color="action" />
          </Tooltip>
          <Typography variant="body1">{roleName}</Typography>
        </div>
        <div className={classes.detail}>
          <Tooltip title="Time" placement="top">
            <ScheduleIcon className={classes.icon} fontSize="small" color="action" />
          </Tooltip>
          <Typography variant="body1">{time}</Typography>
        </div>
        {administrator}
      </DialogContent>
    </React.Fragment>
  );
}

export default PeriodDetails;
