import React from 'react';
import Chip from '@material-ui/core/Chip';

function RoleChip(props) {
  const { label, colour, size } = props;

  const r = parseInt(colour.substring(0, 2), 16);
  const g = parseInt(colour.substring(2, 4), 16);
  const b = parseInt(colour.substring(4, 6), 16);

  const isDark = (r * 0.299 + g * 0.587 + b * 0.114) <= 186;

  const fontColour = isDark ? 'white' : 'rgba(0, 0, 0, 0.87)';
  
  return (
    <Chip 
      size={size}
      label={label}
      style={{ backgroundColor: `#${colour}`, color: fontColour }} />
  );
}

export default RoleChip;
