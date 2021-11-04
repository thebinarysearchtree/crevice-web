import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import usePrevious from './hooks/usePrevious';

const map = new Map();

function ScrollRestore() {
  const location = useLocation();
  const previousLocation = usePrevious(location);

  useEffect(() => {
    if (previousLocation && location.pathname === previousLocation.pathname) {
      return;
    }
    const scrollY = window.scrollY;
    const restoredScrollY = map.get(location.key);
    if (restoredScrollY !== null) {
      window.scrollTo(0, restoredScrollY);
      map.delete(location.key);
    }
    else {
      window.scrollTo(0, 0);
    }
    const lastKey = map.get('lastKey');
    if (lastKey) {
      map.set(lastKey, scrollY);
    }
  }, [location, previousLocation]);

  useEffect(() => {
    map.set('lastKey', location.key);
  }, [location.key]);

  return null;
}

export default ScrollRestore;
