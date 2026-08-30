import { useCallback, useState } from 'react';
import type { Settings } from '../../types';
import { loadSettings, saveSettings } from './storage';

export function useSettings(): {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
} {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  return { settings, update };
}
