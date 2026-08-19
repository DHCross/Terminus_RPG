import { useState, useEffect } from 'react';

export interface CharacterData {
  id: string;
  name: string;
  species?: string;
  order?: string;
  approach?: string;
  signature?: string;
  frame?: string;
  edge?: string;
  orderAbilities?: string;
  region?: string;
  localOrigin?: string;
  oldOffice?: string;
  localRite?: string;
  accordRelationship?: string;
  skills: Record<string, string>;
  primaryWeapon?: string;
  secondaryWeapon?: string;
  armor?: string;
  background?: string;
  objective?: string;
  abilities?: Array<{ name: string; desc: string }>;
  advancementPoints?: number;
  completedOperations?: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'terminus-characters';

export function useCharacterStorage() {
  const [characters, setCharacters] = useState<CharacterData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load characters from localStorage:', error);
      return [];
    }
  });

  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('terminus-selected-character');
      return saved;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
    } catch (error) {
      console.error('Failed to save characters to localStorage:', error);
    }
  }, [characters]);

  useEffect(() => {
    try {
      if (selectedCharacterId) {
        localStorage.setItem('terminus-selected-character', selectedCharacterId);
      } else {
        localStorage.removeItem('terminus-selected-character');
      }
    } catch (error) {
      console.error('Failed to save selected character:', error);
    }
  }, [selectedCharacterId]);

  const saveCharacter = (character: Omit<CharacterData, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const generateId = () => {
      try {
        return crypto.randomUUID();
      } catch {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      }
    };
    
    const newCharacter: CharacterData = {
      ...character,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setCharacters((prev) => [...prev, newCharacter]);
    setSelectedCharacterId(newCharacter.id);
    return newCharacter;
  };

  const updateCharacter = (id: string, updates: Partial<CharacterData>) => {
    setCharacters((prev) =>
      prev.map((char) =>
        char.id === id
          ? { ...char, ...updates, updatedAt: new Date().toISOString() }
          : char
      )
    );
  };

  const deleteCharacter = (id: string) => {
    setCharacters((prev) => prev.filter((char) => char.id !== id));
    if (selectedCharacterId === id) {
      setSelectedCharacterId(null);
    }
  };

  const selectedCharacter = characters.find((char) => char.id === selectedCharacterId) || null;

  return {
    characters,
    selectedCharacter,
    selectedCharacterId,
    setSelectedCharacterId,
    saveCharacter,
    updateCharacter,
    deleteCharacter,
  };
}