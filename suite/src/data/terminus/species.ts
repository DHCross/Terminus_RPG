export interface SpeciesInfo {
  id: string;
  name: string;
  description: string;
  traitName: string;
  traitDescription: string;
  homelands?: string[];
  civicRelation?: string;
  strainMarker?: string;
  commonOldOffices?: string[];
  visualPrompt?: string;
  assetPath?: string;
}

export const SPECIES_LIST: SpeciesInfo[] = [
  {
    id: 'human',
    name: 'Human',
    description: 'The most adaptable lineage. They bend without needing to belong to older systems.',
    traitName: 'Flexible Training',
    traitDescription: 'Once per scene, step up one Skill roll by one die if the action fits your Order.',
    homelands: ['Pinder Traverse', 'Cereth March', 'Black Ward Coast', 'Glass Steppe', 'Accord Isles'],
    civicRelation: 'Adaptable builders of new institutions after old ones fail. Records, contracts, and civic offices tend to define humans before bloodline does. Where other lineages carry inherited relation to law and land, humans carry paperwork.',
    strainMarker: 'When coherence fails, human documentation is often the last system still running — and the first thing exploited by whatever fills the gap. Their forms remain legible. Their seals still stamp. The office stays open after the building has forgotten its purpose.',
    commonOldOffices: ['Sumner\'s Ward', 'Latimer Desks'],
  },
  {
    id: 'high_alfar',
    name: 'High Alfar',
    description: 'Tied to old structures, formal Orders, civic memory, and stable high magic.',
    traitName: 'Old Law',
    traitDescription: 'When acting within a formal institution, sealed place, oath-bound site, or ancient civic structure, step up one Willpower or Exert roll.',
    homelands: ['Black Ward Coast', 'Stonewake', 'Old Pinder civic sites', 'Iseth archives'],
    civicRelation: 'Old structures, lawful memory, sealed testimony, and stable high magic. High Alfar do not need to assert authority — they stand in a room and the room remembers them. Old wards recognize their witness. Old seals hold longer in their presence.',
    strainMarker: 'Old records may recognize them even when current law does not. Sealed chambers open to them without instruction. The difficulty is not that they lack standing — it is that their standing is older than anyone alive can verify or revoke.',
    commonOldOffices: ['The Black Ward Registry', 'Stonewake Seal-Court'],
  },
  {
    id: 'deep_alfar',
    name: 'Deep Alfar',
    description: 'Tied to hidden layers, buried systems, and the pressure beneath visible reality.',
    traitName: 'Under-Sight',
    traitDescription: 'Once per scene, ask the Guide what hidden pressure, ward, flaw, or instability is present.',
    homelands: ['Morrow Fens', 'Undercities', 'Cistern routes', 'Buried infrastructure districts'],
    civicRelation: 'Foundations, hidden routes, under-records, and the pressure beneath visible reality. They know what the floor has already decided. Deep Alfar communities often predate the surface institutions built above them.',
    strainMarker: 'Damp ledgers blur near them. Old foundations may answer to names no surface clerk knows. Buildings remember them without being asked. The discomfort is not hostility — it is recognition from something that was not expected to still be paying attention.',
    commonOldOffices: ['The Morrow Under-Office', 'Cistern Records'],
  },
  {
    id: 'wild_alfar',
    name: 'Wild Alfar',
    description: 'Tied to motion, fracture, edge-zones, and places where stability is already weakening.',
    traitName: 'Fracture Step',
    traitDescription: 'When the scene is unstable, step up one Agility or Avoid roll.',
    homelands: ['Wild Verge', 'Edge-zones', 'Route-clan territories', 'Moving borders'],
    civicRelation: 'Paths, return rights, shifting boundaries, and roads that remember. The road knows them even when the map does not. Wild Alfar communities are structured around route-law: who has crossed where, under what conditions, and whether the road still accepts them.',
    strainMarker: 'Paths may close behind them or open where no surveyed road exists. Crossings remember or forget them based on intent, not record. The difficulty is not that they cannot travel — it is that travel for a Wild Alfar is never administratively neutral.',
    commonOldOffices: ['The Verge Crossing Posts', 'Route-Clan Markers'],
  },
  {
    id: 'stoneborn',
    name: 'Stoneborn',
    description: 'People shaped by enduring environments and old structural memory.',
    traitName: 'Hard Memory',
    traitDescription: 'Once per scene, ignore the first lost Endure circle from environmental pressure, collapse, crushing force, or forced movement.',
    homelands: ['Skeld Holds', 'Deep Foundations', 'Khamet Vaults', 'Bridge cities'],
    civicRelation: 'Load, oath-stone law, structural memory, and weight-bearing truth. A Stoneborn knows when something has been built to last and when it has not. Their civic tradition is not written in documents but in what still stands.',
    strainMarker: 'Stone, bridgework, and old foundations may reveal stress before others notice collapse. Structural failure tends to announce itself to them first — a change in how the floor sits, a vibration in the mortar, a familiar weight becoming unfamiliar. They do not predict collapse. They feel it approaching.',
    commonOldOffices: ['Skeld Foundation Court', 'Khamet Vault Authority'],
  },
];

export type Species = typeof SPECIES_LIST[number]['name'];
