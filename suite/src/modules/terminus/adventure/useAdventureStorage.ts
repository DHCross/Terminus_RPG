import { useState, useEffect } from 'react';
import type { AdventureOutline } from './types';

const STORAGE_KEY = 'terminus-adventures';

export function useAdventureStorage() {
  const [adventures, setAdventures] = useState<AdventureOutline[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load adventures from localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(adventures));
    } catch (error) {
      console.error('Failed to save adventures to localStorage:', error);
    }
  }, [adventures]);

  const saveAdventure = (adventureData: Omit<AdventureOutline, 'id' | 'createdAt'> & { id?: string }) => {
    const now = new Date().toISOString();
    const generateId = () => {
      try {
        return crypto.randomUUID();
      } catch {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      }
    };

    const newId = adventureData.id || generateId();
    const newAdventure: AdventureOutline = {
      ...adventureData,
      id: newId,
      createdAt: now,
    };

    setAdventures((prev) => {
      const index = prev.findIndex((a) => a.id === newId);
      if (index >= 0) {
        // Update existing
        const next = [...prev];
        next[index] = newAdventure;
        return next;
      }
      return [...prev, newAdventure];
    });

    return newAdventure;
  };

  const deleteAdventure = (id: string) => {
    setAdventures((prev) => prev.filter((a) => a.id !== id));
  };

  const clearAdventures = () => {
    setAdventures([]);
  };

  return {
    adventures,
    saveAdventure,
    deleteAdventure,
    clearAdventures,
  };
}
