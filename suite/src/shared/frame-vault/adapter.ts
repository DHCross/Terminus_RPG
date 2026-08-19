import { createCharacter, type Character, type DieSize } from '../../modules/coherence-engine/src/index';
import { toEngineArmor } from '../../data/terminus/armor';
import type { CharacterSheetPatch } from '../../modules/gwsd-cards/components/CharacterSheetPreview';
import type { SheetChrome } from '../../settings/sheetChrome';
import type { FrameAbility, FrameDie, FrameVaultRecord } from './types';

function dieFromString(value?: string): DieSize {
  const parsed = parseInt((value || 'd6').replace('d', ''), 10);
  if (parsed === 4 || parsed === 6 || parsed === 8 || parsed === 10 || parsed === 12) {
    return parsed;
  }
  return 6;
}

export function blankAbilities(): FrameAbility[] {
  return [
    { name: 'Permission I', desc: '' },
    { name: 'Permission II', desc: '' },
    { name: 'Permission III', desc: '' },
  ];
}

export function blankFrame(chrome: SheetChrome, kind: 'character' | 'npc'): Omit<FrameVaultRecord, 'id' | 'createdAt'> {
  const isNpc = kind === 'npc';
  return {
    name: isNpc ? 'Unnamed Denizen' : 'Unnamed Frame',
    species: chrome.defaultSpecies,
    order: isNpc ? 'Civilian' : chrome.defaultOrder,
    approach: '',
    background: '',
    objective: '',
    primaryWeapon: isNpc ? 'Unarmed (1 Impact)' : 'Field blade (1 Impact, No vectors)',
    secondaryItem: isNpc ? 'Personal effects (1 Impact)' : 'Backup tool (1 Impact)',
    armor: 'none',
    force: 'd6',
    agility: 'd6',
    willpower: 'd6',
    abilities: blankAbilities(),
  };
}

export function frameToEngine(record: FrameVaultRecord, chrome: SheetChrome): Character {
  return createCharacter({
    id: record.id,
    name: record.name || 'Unnamed Frame',
    identity: {
      background: record.background || 'No background entered.',
      immediateWant: record.approach || '',
      species: record.species || chrome.defaultSpecies,
      order: record.order || chrome.defaultOrder,
    } as any,
    actions: {
      force: dieFromString(record.force),
      agility: dieFromString(record.agility),
      willpower: dieFromString(record.willpower),
    },
    defenses: {
      endure: dieFromString(record.force),
      avoid: dieFromString(record.agility),
      exert: dieFromString(record.willpower),
    },
    armor: toEngineArmor(record.armor),
    weapons: {
      primary: { name: record.primaryWeapon || 'Unarmed', impact: 1, vectors: [] },
      secondary: { name: record.secondaryItem || 'Backup tool', impact: 1, vectors: [] },
    },
    notes: [record.objective || ''],
  });
}

export function applySheetPatchToFrame(
  record: FrameVaultRecord,
  patch: CharacterSheetPatch,
): Partial<FrameVaultRecord> {
  return {
    name: patch.name ?? record.name,
    species: patch.species ?? record.species,
    order: patch.order ?? record.order,
    approach: patch.approach ?? record.approach,
    background: patch.background ?? record.background,
    objective: patch.objective ?? record.objective,
    primaryWeapon: patch.primaryWeapon ?? record.primaryWeapon,
    secondaryItem: patch.secondaryItem ?? record.secondaryItem,
    armor: patch.armor ?? record.armor,
    force: patch.force ? (`d${patch.force}` as FrameDie) : record.force,
    agility: patch.agility ? (`d${patch.agility}` as FrameDie) : record.agility,
    willpower: patch.willpower ? (`d${patch.willpower}` as FrameDie) : record.willpower,
    abilities: patch.abilities ?? record.abilities,
  };
}
