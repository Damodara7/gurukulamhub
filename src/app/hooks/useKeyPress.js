import { useEffect } from 'react';

function useKeyPress(targetKey, callback) {
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === targetKey) {
        callback();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [targetKey, callback]);
}

export default useKeyPress;
