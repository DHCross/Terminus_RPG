export interface SpeciesInfo {
  id: string;
  name: string;
  description: string;
  traitName: string;
  traitDescription: string;
}

export const SPECIES_LIST: SpeciesInfo[] = [
  { id: 'human', name: 'Human', description: 'The most adaptable lineage. They bend without needing to belong to older systems.', traitName: 'Flexible Training', traitDescription: 'Once per scene, step up one Skill roll by one die if the action fits your Order.' },
  { id: 'high_alfar', name: 'High Alfar', description: 'Tied to old structures, formal Orders, civic memory, and stable high magic.', traitName: 'Old Law', traitDescription: 'When acting within a formal institution, sealed place, oath-bound site, or ancient civic structure, step up one Willpower or Exert roll.' },
  { id: 'deep_alfar', name: 'Deep Alfar', description: 'Tied to hidden layers, buried systems, and the pressure beneath visible reality.', traitName: 'Under-Sight', traitDescription: 'Once per scene, ask the Guide what hidden pressure, ward, flaw, or instability is present.' },
  { id: 'wild_alfar', name: 'Wild Alfar', description: 'Tied to motion, fracture, edge-zones, and places where stability is already weakening.', traitName: 'Fracture Step', traitDescription: 'When the scene is unstable, step up one Agility or Avoid roll.' },
  { id: 'stoneborn', name: 'Stoneborn', description: 'People shaped by enduring environments and old structural memory.', traitName: 'Hard Memory', traitDescription: 'Once per scene, ignore the first lost Endure circle from environmental pressure, collapse, crushing force, or forced movement.' }
];

export type Species = typeof SPECIES_LIST[number]['name'];
