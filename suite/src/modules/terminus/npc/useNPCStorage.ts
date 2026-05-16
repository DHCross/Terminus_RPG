import { useState, useEffect } from 'react';

export interface NPCData {
  id: string;
  name: string;
  lineage: string;
  role: string;
  appearance: string;
  quirk: string;
  will: string;
  drift: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'terminus-npcs';

export function useNPCStorage() {
  const [npcs, setNpcs] = useState<NPCData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load NPCs from localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(npcs));
    } catch (error) {
      console.error('Failed to save NPCs to localStorage:', error);
    }
  }, [npcs]);

  const saveNPC = (npc: Omit<NPCData, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const generateId = () => {
      try {
        return crypto.randomUUID();
      } catch {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      }
    };
    
    const newNPC: NPCData = {
      ...npc,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setNpcs((prev) => [...prev, newNPC]);
    return newNPC;
  };

  const updateNPC = (id: string, updates: Partial<NPCData>) => {
    setNpcs((prev) =>
      prev.map((npc) =>
        npc.id === id
          ? { ...npc, ...updates, updatedAt: new Date().toISOString() }
          : npc
      )
    );
  };

  const deleteNPC = (id: string) => {
    setNpcs((prev) => prev.filter((npc) => npc.id !== id));
  };

  return {
    npcs,
    saveNPC,
    updateNPC,
    deleteNPC,
  };
}
