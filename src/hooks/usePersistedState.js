import { useEffect, useRef, useState } from 'react';
import { loadJSON, saveJSON } from '../utils/storage';

export function usePersistedState(key, initialValue, { migrate } = {}) {
  const [value, setValue] = useState(() => {
    const loaded = loadJSON(key, initialValue);
    return migrate ? migrate(loaded) : loaded;
  });

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveJSON(key, value);
  }, [key, value]);

  return [value, setValue];
}
