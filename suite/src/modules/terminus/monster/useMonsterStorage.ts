import { useState, useEffect } from 'react';

export interface MonsterData {
  id: string;
  name: string;
  threatLevel: string; // Minor, Standard, Elite, Boss
  category: string; // Beast, Cultist, Rupture Entity, Automaton
  appearance: string;
  will: string; // Motivation/Behavior
  drift: string; // What happens if ignored/not dealt with
  skills: {
    Force: string; // d4, d6, d8, d10, d12
    Agility: string;
    Willpower: string;
  };
  thresholds: {
    Endure: number;
    Avoid: number;
    Exert: number;
  };
  primaryAttack: {
    name: string;
    impact: number;
    vectors: string;
  };
  specialAbility: string;
  armor: number; // 0-2
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'terminus-monsters';

export function useMonsterStorage() {
  const [monsters, setMonsters] = useState<MonsterData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load monsters from localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(monsters));
    } catch (error) {
      console.error('Failed to save monsters to localStorage:', error);
    }
  }, [monsters]);

  const saveMonster = (monster: Omit<MonsterData, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const generateId = () => {
      try {
        return crypto.randomUUID();
      } catch {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      }
    };
    
    const newMonster: MonsterData = {
      ...monster,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setMonsters((prev) => [...prev, newMonster]);
    return newMonster;
  };

  const deleteMonster = (id: string) => {
    setMonsters((prev) => prev.filter((monster) => monster.id !== id));
  };

  return {
    monsters,
    saveMonster,
    deleteMonster,
  };
}
