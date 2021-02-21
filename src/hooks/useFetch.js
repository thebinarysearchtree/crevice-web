import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import client from '../client';

function useFetch(setLoading, url, setState) {
  const history = useHistory();

  useEffect(() => {
    const getState = async () => {
      const token = await client.getToken();
      const response = await client.postData(url, null, token);
      if (response.ok) {
        const state = await response.json();
        setState(state);
        setLoading(false);
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
