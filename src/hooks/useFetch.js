import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import client from '../client';
import { makeReviver } from '../utils/data';

const defaultReviver = makeReviver();

function useFetch(url, handler, data, reviver) {
  const history = useHistory();

  useEffect(() => {
    const getState = async () => {
      const response = await client.postData(url, data);
      if (response.ok) {
        const text = await response.text();
        const result = JSON.parse(text, reviver ? reviver : defaultReviver);
        handler(result);
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
