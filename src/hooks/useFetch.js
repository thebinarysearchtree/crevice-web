import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import client from '../client';

function useFetch(url, handler, data) {
  const history = useHistory();

  useEffect(() => {
    const getState = async () => {
      const response = await client.postData(url, data);
      if (response.ok) {
        const state = await response.json();
        handler(state);
      }
      else {
        if (response.status === 401) {
          history.push('/login');
        }
        else {
          history.push('/error');
        }
      }
    };
    getState();
  }, []);
}

export default useFetch;
