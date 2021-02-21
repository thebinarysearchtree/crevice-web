const makeInputHandler = (setState, setIsDisabled, validator) => {
  return (e) => {
    const name = e.target.name;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    setState(s => {
      const updatedState = { ...s, [name] : value };
      const isValid = validator(updatedState);
      if (!isValid) {
        setIsDisabled(true);
      }
      else {
        setIsDisabled(false);
      }
      return updatedState;
    });
  }
}

export default makeInputHandler;
