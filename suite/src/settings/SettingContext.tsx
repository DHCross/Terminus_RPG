/* ── Setting Pack context, hook, and registry ── */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { SettingPackUI } from './types';
import { TERMINUS_PACK } from './packs/terminus/pack';
import { DEFAULT_PACK_UI } from './packs/default/pack';
import { GENERIC_FANTASY_PACK_UI } from './packs/generic-fantasy/pack';

const STORAGE_KEY = 'coherence.activePackId';

const REGISTRY: Record<string, SettingPackUI> = {
  [TERMINUS_PACK.id]: TERMINUS_PACK,
  [DEFAULT_PACK_UI.id]: DEFAULT_PACK_UI,
  [GENERIC_FANTASY_PACK_UI.id]: GENERIC_FANTASY_PACK_UI,
};

export const ALL_PACKS: SettingPackUI[] = Object.values(REGISTRY);

export function getPack(id: string | undefined): SettingPackUI {
  if (id && REGISTRY[id]) return REGISTRY[id];
  return TERMINUS_PACK;
}

interface SettingContextValue {
  packId: string;
  pack: SettingPackUI;
  setPackId: (id: string) => void;
}

const SettingContext = createContext<SettingContextValue | null>(null);

export function SettingProvider({ children }: { children: ReactNode }) {
  const [packId, setPackIdState] = useState<string>(() => {
    if (typeof window === 'undefined') return TERMINUS_PACK.id;
    return window.localStorage.getItem(STORAGE_KEY) || TERMINUS_PACK.id;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, packId);
    }
  }, [packId]);

  const setPackId = useCallback((id: string) => {
    setPackIdState(id);
  }, []);

  const value = useMemo<SettingContextValue>(() => {
    const pack = getPack(packId);
    return { packId, pack, setPackId };
  }, [packId, setPackId]);

  return <SettingContext.Provider value={value}>{children}</SettingContext.Provider>;
}

export function useSettingPack(): SettingContextValue {
  const ctx = useContext(SettingContext);
  if (!ctx) {
    throw new Error('useSettingPack must be used within a SettingProvider');
  }
  return ctx;
}
