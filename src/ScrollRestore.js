import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const map = new Map();

function ScrollRestore() {
  const location = useLocation();

  useEffect(() => {
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
  }, [location.pathname]);

  useEffect(() => {
    map.set('lastKey', location.key);
  }, [location.key]);

  return null;
}

export default ScrollRestore;
