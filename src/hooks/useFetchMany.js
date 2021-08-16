import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import client from '../client';
import { makeReviver } from '../utils/data';

const defaultReviver = makeReviver();

function useFetchMany(setLoading, requests, params = []) {
  const history = useHistory();

  useEffect(() => {
    const getState = async () => {
      const token = await client.getToken();
      const requestPromises = requests.map(request => {
        const { url, data } = request;
        return client.postData(url, data, token);
      });
      const responses = await Promise.all(requestPromises);
      const responsePromises = responses
        .filter(r => r.ok)
        .map(r => r.text());
      if (responsePromises.length !== requests.length) {
        if (responses.some(r => r.status === 401)) {
          history.push('/login');
        }
        else {
          history.push('/error');
        }
      }
      const states = await Promise.all(responsePromises);
      states.forEach((state, i) => {
        const { handler, reviver } = requests[i];
        const result = JSON.parse(state, reviver ? reviver : defaultReviver);
        handler(result);
      });
      if (setLoading) {
        setLoading(false);
      }
    };
    getState();
  }, params);
}

export default useFetchMany;
