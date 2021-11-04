import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { makeReviver } from '../utils/data';
import cache from '../cache';
import { useClient } from '../auth';
import usePrevious from './usePrevious';
import { paramsHaveChanged } from '../utils/data';

const defaultReviver = makeReviver();

const hasChanged = (request, previousRequest) => {
  if (!request.data) {
    return false;
  }
  const params = Object.values(request.data);
  const previousParams = Object.values(previousRequest.data);

  return paramsHaveChanged(params, previousParams);
}

function useFetch(requests) {
  const [loading, setLoading] = useState(true);

  const history = useHistory();
  const client = useClient();
  const previousRequests = usePrevious(requests);
  const previousCount = usePrevious(client.mutationCount);

  const hasMutated = client.mutationCount > previousCount;
  const wasUnstable = previousRequests && previousRequests.some(r => r.unstable);

  useEffect(() => {
    if (wasUnstable) {
      const index = previousRequests.findIndex(r => r.unstable);
      const current = requests[index];
      const previous = previousRequests[index];
      cache.set(current.url, current.data, cache.get(previous.url, previous.data));
      return;
    }
    const getState = async (requests) => {
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
        const { url, data, handler, reviver } = requests[i];
        const result = JSON.parse(state, reviver ? reviver : defaultReviver);
        cache.set(url, data, result);
        handler(result);
      });
      setLoading(false);
    };
    let fromCache = 0;
    const requestsToProcess = requests
      .filter((r, i) => previousRequests && !hasMutated ? hasChanged(r, previousRequests[i]) : true)
      .reduce((a, c) => {
        const { url, data, handler } = c;
        const cachedResult = cache.get(url, data);
        if (cachedResult) {
          handler(cachedResult);
          fromCache++;
          return a;
        }
        a.push(c);
        return a;
      }, []);
    if (fromCache === requests.length) {
      setLoading(false);
    }
    if (requestsToProcess.length > 0) {
      getState(requestsToProcess);
    }
  }, [client, history, previousRequests, requests, hasMutated, wasUnstable]);

  return loading;
}

export default useFetch;
