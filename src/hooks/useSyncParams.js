import { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import usePrevious from './usePrevious';
import { paramsHaveChanged } from '../utils/data';

function useSyncParams(ready, translators) {
  const [initialRun, setInitialRun] = useState(true);
  const [syncFromParam, setSyncFromParam] = useState(false);

  const location = useLocation();
  const history = useHistory();
  const prevTranslators = usePrevious(translators);

  const currentUrl = `${location.pathname}${location.search}`;

  const states = translators.map(p => p.state);
  let statesHaveChanged = true;
  if (prevTranslators) {
    const prevStates = prevTranslators.map(p => p.state);
    statesHaveChanged = paramsHaveChanged(states, prevStates);
  }

  useEffect(() => {
    if (!statesHaveChanged) {
      return;
    }
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
  }, [location, ready, translators, statesHaveChanged]);

  useEffect(() => {
    if (!statesHaveChanged) {
      return;
    }
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
  }, [currentUrl, history, initialRun, location, ready, statesHaveChanged, syncFromParam, translators]);
}

export default useSyncParams;
