import { createCharacter, type Character, type DieSize } from '../../coherence-engine/src/index';
import { toEngineArmor } from '../../../data/terminus/armor';
import { ORIGINS } from '../../../data/terminus/archetypes';
import { ORDERS_LIST, sheetAbilitiesForOrder } from '../../../data/terminus/orders';
import type { CharacterSheetPatch } from '../../gwsd-cards/components/CharacterSheetPreview';
import type { CharacterData } from './useCharacterStorage';
import type { NPCData } from '../npc/useNPCStorage';
import type { Die } from '../../../data/terminus/skills';

function dieFromString(value?: string): DieSize {
  const parsed = parseInt((value || 'd6').replace('d', ''), 10);
  if (parsed === 4 || parsed === 6 || parsed === 8 || parsed === 10 || parsed === 12) {
    return parsed;
  }
  return 6;
}

export function displaySpecies(raw?: string): string {
  if (!raw) return 'Unknown Lineage';
  return ORIGINS.find((origin) => origin.id === raw)?.name || raw;
}

export function displayOrder(raw?: string): string {
  if (!raw) return 'Unknown Order';
  const match = ORDERS_LIST.find(
    (order) => order.id === raw.toLowerCase() || order.name.toLowerCase() === raw.toLowerCase(),
  );
  return match?.name || raw;
}

export function vaultAbilities(record: CharacterData): Array<{ name: string; desc: string }> {
  if (record.abilities && record.abilities.length > 0) return record.abilities;
  return sheetAbilitiesForOrder(record.order || '');
}

export function vaultCharacterToEngine(record: CharacterData): Character {
  const background =
    record.background ||
    record.frame ||
    'A denizen of Tringad, searching for fault lines in the quiet day.';
  const approach =
    record.approach ||
    record.signature ||
    'Name how you work in the field.';

  return createCharacter({
    id: record.id,
    name: record.name || 'Unnamed Responder',
    identity: {
      background,
      immediateWant: approach,
      species: displaySpecies(record.species),
      order: displayOrder(record.order),
      subtitle: record.frame,
      frame: record.frame,
      edge: record.edge,
      signature: record.signature,
    } as any,
    actions: {
      force: dieFromString(record.skills?.Force),
      agility: dieFromString(record.skills?.Agility),
      willpower: dieFromString(record.skills?.Willpower),
    },
    defenses: {
      endure: dieFromString(record.skills?.Force),
      avoid: dieFromString(record.skills?.Agility),
      exert: dieFromString(record.skills?.Willpower),
    },
    armor: toEngineArmor(record.armor),
    weapons: {
      primary: { name: record.primaryWeapon || 'Work blade', impact: 1, vectors: [] },
      secondary: { name: record.secondaryWeapon || 'Backup tool', impact: 1, vectors: [] },
    },
    notes: [record.objective || record.edge || 'Hold the quiet day.'],
  });
}

export function npcToEngine(npc: NPCData): Character {
  const approach = [npc.appearance, npc.quirk].filter(Boolean).join(' ').trim();

  return createCharacter({
    id: npc.id,
    name: npc.name || 'Unnamed NPC',
    identity: {
      background: npc.will || 'A denizen of Tringad with unfinished business.',
      immediateWant: approach || npc.will || 'Hold their place in the scene.',
      species: npc.lineage || 'Unknown Lineage',
      order: npc.role || 'Civilian',
    } as any,
    actions: { force: 6, agility: 6, willpower: 6 },
    defenses: { endure: 6, avoid: 6, exert: 6 },
    armor: 'none',
    weapons: {
      primary: { name: 'Unarmed', impact: 1, vectors: [] },
      secondary: { name: 'Personal effects', impact: 1, vectors: [] },
    },
    notes: [npc.drift || 'If ignored, their pressure becomes the scene.'],
  });
}

export function applySheetPatchToCharacter(
  record: CharacterData,
  patch: CharacterSheetPatch,
): Partial<CharacterData> {
  const skills = { ...(record.skills || {}) };
  if (patch.force) skills.Force = `d${patch.force}` as Die;
  if (patch.agility) skills.Agility = `d${patch.agility}` as Die;
  if (patch.willpower) skills.Willpower = `d${patch.willpower}` as Die;

  return {
    name: patch.name ?? record.name,
    species: patch.species ?? record.species,
    order: patch.order ?? record.order,
    approach: patch.approach ?? record.approach,
    background: patch.background ?? record.background,
    frame: patch.background ?? record.frame,
    objective: patch.objective ?? record.objective,
    edge: patch.objective ?? record.edge,
    primaryWeapon: patch.primaryWeapon ?? record.primaryWeapon,
    secondaryWeapon: patch.secondaryItem ?? record.secondaryWeapon,
    armor: patch.armor ?? record.armor,
    skills,
    abilities: patch.abilities ?? record.abilities,
  };
}

export function applySheetPatchToNpc(npc: NPCData, patch: CharacterSheetPatch): Partial<NPCData> {
  return {
    name: patch.name ?? npc.name,
    lineage: patch.species ?? npc.lineage,
    role: patch.order ?? npc.role,
    appearance: patch.approach ?? npc.appearance,
    will: patch.background ?? npc.will,
    drift: patch.objective ?? npc.drift,
  };
}
