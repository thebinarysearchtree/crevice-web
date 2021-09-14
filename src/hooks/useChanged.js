import { useState, useEffect } from 'react';

function useChanged(open, params) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (open) {
      if (count < 3) {
        setCount(count => count + 1);
      }
    }
    else {
      setCount(0);
    }
  }, [...params, open]);

  return count === 3;
}

export default useChanged;
