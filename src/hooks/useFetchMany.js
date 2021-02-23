import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import client from '../client';

function useFetchMany(setLoading, requests) {
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
        .map(r => r.json());
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
        const { handler } = requests[i];
        handler(state);
      });
      setLoading(false);
    };
    getState();
  }, []);
}

export default useFetchMany;
