import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function useAnchorState(initialState) {
  const [state, setState] = useState(initialState);

  const location = useLocation();

  useEffect(() => {
    setState(null);
  }, [location]);

  return [state, setState];
}

export default useAnchorState;
