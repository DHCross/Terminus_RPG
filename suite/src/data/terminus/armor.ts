export interface Armor {
  id: string;
  name: string;
  reduction: number;
  notes?: string;
}

export const ARMOR_TYPES: Armor[] = [
  {
    id: 'none',
    name: 'None',
    reduction: 0,
    notes: 'No armor protection',
  },
  {
    id: 'leather',
    name: 'Leather',
    reduction: 1,
    notes: 'Light armor, minimal protection',
  },
  {
    id: 'chain',
    name: 'Chain',
    reduction: 1,
    notes: 'Medium armor, flexible protection',
  },
  {
    id: 'plate',
    name: 'Plate',
    reduction: 2,
    notes: 'Heavy armor, maximum protection',
  },
];