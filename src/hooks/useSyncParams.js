import { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

function useSyncParams(ready, translators) {
  const location = useLocation();
  const history = useHistory();

  const currentUrl = `${location.pathname}${location.search}`;

  const states = translators.map(p => p.state);

  useEffect(() => {
    if (ready) {
      for (const translator of translators) {
        const { state, param, reviver } = translator;
        if (param !== null && param !== state) {
          reviver(param);
        }
      }
    }
  }, [location]);

  useEffect(() => {
    if (ready) {
      const params = new URLSearchParams();
      for (const translator of translators) {
        const { name, state } = translator;
        params.append(name, state);
      }
      const search = params.toString();
      const url = `${location.pathname}?${search}`;
      if (url !== currentUrl) {
        if (location.search === '') {
          history.replace(url);
        }
        else {
          history.push(url);
        }
      }
    }
  }, states);
}

export default useSyncParams;
