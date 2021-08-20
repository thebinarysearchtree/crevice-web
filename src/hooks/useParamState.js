import { useState } from 'react';
import { useLocation } from 'react-router-dom';

function useParamState(options) {
  const location = useLocation();

  const params = new URLSearchParams(location.search);

  let { name, to, from, parser, defaultValue } = options;

  defaultValue = defaultValue === undefined ? null : defaultValue;
  parser = parser ? parser : parseInt;

  const param = parser(params.get(name)) || null;

  const hydrated = from ? from(param) : param;

  const [state, setState] = useState(param ? hydrated : defaultValue);

  const translator = {
    name,
    state: to ? to(state) : state,
    param,
    reviver: () => setState(hydrated)
  }
  return [state, setState, translator, param];
}

export default useParamState;
