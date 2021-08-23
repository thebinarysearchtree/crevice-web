import { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

function useSyncParams(ready, translators) {
  const [initialRun, setInitialRun] = useState(true);
  const [syncFromParam, setSyncFromParam] = useState(false);

  const location = useLocation();
  const history = useHistory();

  const currentUrl = `${location.pathname}${location.search}`;

  const states = translators.map(p => p.state);

  useEffect(() => {
    if (ready) {
      for (const translator of translators) {
        const { state, defaultValue, param, reviver } = translator;
        if (param !== null && param !== state) {
          setSyncFromParam(true);
          reviver(param);
        }
        if (param === null && state !== defaultValue) {
          setSyncFromParam(true);
          reviver(defaultValue);
        }
      }
    }
  }, [location]);

  useEffect(() => {
    if (ready && !initialRun && !syncFromParam) {
      const params = new URLSearchParams();
      for (const translator of translators) {
        const { name, state, defaultValue, hideDefault } = translator;
        if (hideDefault && state === defaultValue) {
          continue;
        }
        params.append(name, state);
      }
      const search = params.toString();
      const url = `${location.pathname}?${search}`;
      if (url !== currentUrl) {
        history.push(url);
      }
    }
    if (ready && !initialRun && syncFromParam) {
      setSyncFromParam(false);
    }
    if (ready) {
      setInitialRun(false);
    }
  }, states);
}

export default useSyncParams;
