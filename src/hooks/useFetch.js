import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import client from '../client';
import { makeReviver } from '../utils/data';
import cache from '../cache';

const defaultReviver = makeReviver();

function useFetch(url, handler, data, reviver, params = []) {
  const history = useHistory();

  useEffect(() => {
    const getState = async () => {
      const response = await client.postData(url, data);
      if (response.ok) {
        const text = await response.text();
        const result = JSON.parse(text, reviver ? reviver : defaultReviver);
        cache.set(url, data, result);
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
    const cachedResult = cache.get(url, data);
    if (cachedResult) {
      handler(cachedResult);
    }
    else {
      getState();
    }
  }, params);
}

export default useFetch;
