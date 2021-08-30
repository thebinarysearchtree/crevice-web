import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { makeReviver } from '../utils/data';
import cache from '../cache';
import { useClient } from '../auth';

const defaultReviver = makeReviver();

function useFetch(setLoading, requests, params = []) {
  const [ranOnce, setRanOnce] = useState(false);

  let requestsToProcess = requests.filter(r => ranOnce ? !r.once : true);

  const history = useHistory();
  const client = useClient();

  params.push(client.mutationCount);

  useEffect(() => {
    const getState = async () => {
      const token = await client.getToken();
      const requestPromises = requestsToProcess.map(request => {
        const { url, data } = request;
        return client.postData(url, data, token);
      });
      const responses = await Promise.all(requestPromises);
      const responsePromises = responses
        .filter(r => r.ok)
        .map(r => r.text());
      if (responsePromises.length !== requestsToProcess.length) {
        if (responses.some(r => r.status === 401)) {
          history.push('/login');
        }
        else {
          history.push('/error');
        }
      }
      const states = await Promise.all(responsePromises);
      states.forEach((state, i) => {
        const { url, data, handler, reviver } = requestsToProcess[i];
        const result = JSON.parse(state, reviver ? reviver : defaultReviver);
        cache.set(url, data, result);
        handler(result);
      });
      if (setLoading) {
        setLoading(false);
      }
    };
    requestsToProcess = requestsToProcess.reduce((a, c) => {
      const { url, data, handler } = c;
      const cachedResult = cache.get(url, data);
      if (cachedResult) {
        handler(cachedResult);
        return a;
      }
      a.push(c);
      return a;
    }, []);
    if (requestsToProcess.length === 0) {
      if (setLoading) {
        setLoading(false);
      }
    }
    else {
      getState();
    }
    setRanOnce(true);
  }, params);
}

export default useFetch;
