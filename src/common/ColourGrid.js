import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: '10px'
  },
  colour: {
    width: '20px',
    height: '20px',
    cursor: 'pointer'
  },
  active: {
    border: '2px solid #000'
  }
}));

const colours = [
  '4e79a7', 
  'f28e2c', 
  'e15759', 
  '76b7b2', 
  '59a14f', 
  'edc949', 
  'af7aa1', 
  'ff9da7', 
  '9c755f', 
  'bab0ab'];

function ColourGrid(props) {
  const [selectedColour, setSelectedColour] = useState('');
  const classes = useStyles();

  useEffect(() => {
    setSelectedColour(props.selectedColour);
  }, [props.selectedColour]);

  const handleClick = (colour) => {
    setSelectedColour(colour);
    props.onClick(colour);
  }

  const handleKeyPress = (e, colour) => {
    if (e.code === 'Enter') {
      handleClick(colour);
    }
  }
  
  const cells = colours.map(colour => {
    const className = selectedColour === colour ? `${classes.colour} ${classes.active}` : classes.colour;

    return (
      <span
        key={colour}
        className={className}
        tabIndex="0"
        onClick={() => handleClick(colour)}
        onKeyPress={(e) => handleKeyPress(e, colour)}
        style={{ backgroundColor: `#${colour}` }} />
    );
  });

  return (
    <div className={classes.root}>{cells}</div>
  );
}

export default ColourGrid;
