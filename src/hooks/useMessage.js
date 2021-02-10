import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

function useMessage() {
  const [message, setMessage] = useState('');

  const history = useHistory();
  
  useEffect(() => {
    const location = history.location;
    
    if (location.state) {
      setMessage(location.state.message);
      history.replace(location.pathname);
    }
  }, [history]);

  return [message, setMessage];
}

export default useMessage;
