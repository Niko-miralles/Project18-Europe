import { useEffect } from 'react';

const useMobileScrollLock = () => {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('is-locked-mobile');
    return () => root.classList.remove('is-locked-mobile');
  }, []);
};

export default useMobileScrollLock;
