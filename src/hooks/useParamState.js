import { useState } from 'react';
import { useLocation } from 'react-router-dom';

function useParamState(options) {
  const location = useLocation();

  const params = new URLSearchParams(location.search);

  const { name, extractor, defaultValue, parser, makeReviver } = options;

  const param = parser(params.get(name)) || null;

  const [state, setState] = useState(param ? param : defaultValue);

  const translator = {
    name,
    state: extractor(state),
    param,
    reviver: makeReviver(setState)
  }
  return [state, setState, translator];
}