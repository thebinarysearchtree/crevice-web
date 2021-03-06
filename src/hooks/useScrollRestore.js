import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function useScrollRestore() {
  const location = useLocation();

  useEffect(() => {
    const scrollY = window.scrollY;
    const restoredScrollY = sessionStorage.getItem(location.key);
    if (restoredScrollY !== null) {
      window.scrollTo(0, restoredScrollY);
      sessionStorage.removeItem(location.key);
    }
    else {
      window.scrollTo(0, 0);
    }
    const lastKey = sessionStorage.getItem('lastKey');
    if (lastKey) {
      sessionStorage.setItem(lastKey, scrollY);
    }
  }, [location.pathname]);

  useEffect(() => {
    sessionStorage.setItem('lastKey', location.key);
  }, [location.key]);
}

export default useScrollRestore;
