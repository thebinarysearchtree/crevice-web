import { useState } from 'react';
import { useLocation } from 'react-router-dom';

function useParamState(options) {
  const location = useLocation();

  const params = new URLSearchParams(location.search);

  let { name, to, from, parser, defaultValue, hideDefault } = options;

  defaultValue = defaultValue === undefined ? null : defaultValue;
  if (parser === null) {
    parser = (param) => param;
  }
  else if (parser === undefined) {
    parser = parseInt;
  }

  let param = parser(params.get(name));
  if (!param) {
    if (param !== 0 && param !== '') {
      param = null;
    }
  }

  const hydrated = from ? from(param) : param;

  const [state, setState] = useState(param ? hydrated : defaultValue);

  const translator = {
    name,
    state: to ? to(state) : state,
    defaultValue: to ? to(defaultValue) : defaultValue,
    hideDefault,
    param,
    reviver: () => setState(param ? hydrated : defaultValue)
  }
  return [state, setState, translator, param];
}

export default useParamState;
