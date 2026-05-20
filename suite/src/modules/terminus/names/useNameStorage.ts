import { useState, useEffect } from 'react';
import type { GeneratedName } from '../../../data/terminus/names';

const STORAGE_KEY = 'terminus-names';

export function useNameStorage() {
  const [names, setNames] = useState<GeneratedName[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load names from localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
    } catch (error) {
      console.error('Failed to save names to localStorage:', error);
    }
  }, [names]);

  const saveName = (nameData: Omit<GeneratedName, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString();
    const generateId = () => {
      try {
        return crypto.randomUUID();
      } catch {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      }
    };

    const newName: GeneratedName = {
      ...nameData,
      id: generateId(),
      createdAt: now,
    };
    
    setNames((prev) => {
      // Prevent duplicates by name and culture
      const exists = prev.some(
        (n) => n.name.toLowerCase() === nameData.name.toLowerCase() && n.cultureProfile === nameData.cultureProfile
      );
      if (exists) return prev;
      return [...prev, newName];
    });
    
    return newName;
  };

  const deleteName = (id: string) => {
    setNames((prev) => prev.filter((name) => name.id !== id));
  };

  const clearVault = () => {
    setNames([]);
  };

  return {
    names,
    saveName,
    deleteName,
    clearVault,
  };
}
