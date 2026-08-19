import type { VaultRecord } from '../useVaultStorage';

export type FrameDie = 'd4' | 'd6' | 'd8' | 'd10' | 'd12';

export interface FrameAbility {
  name: string;
  desc: string;
}

export interface FrameVaultRecord extends VaultRecord {
  name: string;
  species: string;
  order: string;
  approach: string;
  background: string;
  objective: string;
  primaryWeapon: string;
  secondaryItem: string;
  armor?: string;
  force: FrameDie;
  agility: FrameDie;
  willpower: FrameDie;
  abilities: FrameAbility[];
}

export type FrameVaultKind = 'character' | 'npc';
