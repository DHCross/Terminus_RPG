/* ── Shared vault storage hook (setting-agnostic) ── */

import { useCallback, useEffect, useState } from 'react';

/**
 * A vault record is any entity the engine/UI persists with an id and timestamp.
 * Setting packs define their own record shapes extending this.
 */
export interface VaultRecord {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

function generateId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

export interface UseVaultStorageOptions<T> {
  /**
   * Optional dedup predicate. Returning true skips saving `incoming` because an
   * equivalent `existing` record is already in the vault.
   */
  dedup?: (existing: T, incoming: Omit<T, 'id' | 'createdAt'>) => boolean;
  /** Extra localStorage keys to keep in sync with the selected record id. */
  selectedKey?: string;
}

export interface VaultStorage<T extends VaultRecord> {
  records: T[];
  selectedId: string | null;
  selected: T | null;
  setSelectedId: (id: string | null) => void;
  /** Insert a new record. Returns the created record, or null if deduped. */
  save: (data: Omit<T, 'id' | 'createdAt'>) => T | null;
  /** Patch an existing record by id. */
  update: (id: string, updates: Partial<T>) => void;
  /** Remove a record by id. */
  remove: (id: string) => void;
  /** Clear the entire vault. */
  clear: () => void;
}

/**
 * Generic localStorage-backed vault for any record type. Setting packs compose
 * this with their own record shapes and dedup rules.
 */
export function useVaultStorage<T extends VaultRecord>(
  storageKey: string,
  options: UseVaultStorageOptions<T> = {},
): VaultStorage<T> {
  const { dedup, selectedKey } = options;

  const [records, setRecords] = useState<T[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? (JSON.parse(saved) as T[]) : [];
    } catch (error) {
      console.error(`Failed to load vault "${storageKey}":`, error);
      return [];
    }
  });

  const [selectedId, setSelectedIdState] = useState<string | null>(() => {
    if (!selectedKey) return null;
    try {
      return localStorage.getItem(selectedKey);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(records));
    } catch (error) {
      console.error(`Failed to save vault "${storageKey}":`, error);
    }
  }, [records, storageKey]);

  useEffect(() => {
    if (!selectedKey) return;
    try {
      if (selectedId) {
        localStorage.setItem(selectedKey, selectedId);
      } else {
        localStorage.removeItem(selectedKey);
      }
    } catch (error) {
      console.error(`Failed to save selection "${selectedKey}":`, error);
    }
  }, [selectedId, selectedKey]);

  const setSelectedId = useCallback((id: string | null) => setSelectedIdState(id), []);

  const save = useCallback(
    (data: Omit<T, 'id' | 'createdAt'>): T | null => {
      const now = new Date().toISOString();
      const newRecord = {
        ...(data as object),
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      } as T;

      let created: T | null = newRecord;
      setRecords((prev) => {
        if (dedup && prev.some((existing) => dedup(existing, data))) {
          created = null;
          return prev;
        }
        return [...prev, newRecord];
      });
      return created;
    },
    [dedup],
  );

  const update = useCallback((id: string, updates: Partial<T>) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id === id ? { ...record, ...updates, updatedAt: new Date().toISOString() } : record,
      ),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
    setSelectedIdState((current) => (current === id ? null : current));
  }, []);

  const clear = useCallback(() => {
    setRecords([]);
    setSelectedIdState(null);
  }, []);

  const selected = records.find((record) => record.id === selectedId) ?? null;

  return { records, selectedId, selected, setSelectedId, save, update, remove, clear };
}
