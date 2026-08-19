/** Pack-specific labels for the shared fillable character/NPC sheet. */

export interface SheetChrome {
  brand: string;
  motto: string;
  documentKind: string;
  documentAuthority: string;
  speciesLabel: string;
  orderLabel: string;
  abilitiesTitle: string;
  footer: string;
  stampLabel: string;
  stampCode: string;
  defaultSpecies: string;
  defaultOrder: string;
  /** Use Terminus Accord-order wax seals when the role matches a known Order. */
  terminusStamps?: boolean;
  recordNoun: string;
  recordNounPlural: string;
}

export const TERMINUS_SHEET_CHROME: SheetChrome = {
  brand: 'TERMINUS RPG',
  motto: 'GLORY IN SERVICE. ORDER IN ALL THINGS.',
  documentKind: 'CIVIC FIELD DOCUMENT –',
  documentAuthority: 'BUREAU OF STRATEGIC AFFAIRS',
  speciesLabel: 'Species / Lineage',
  orderLabel: 'Accord Order',
  abilitiesTitle: 'Order Abilities',
  footer: 'THE BUREAU SEES ALL. THE BUREAU REMEMBERS.',
  stampLabel: 'Official Stamp',
  stampCode: 'Doc 049',
  defaultSpecies: 'Human (Settled)',
  defaultOrder: 'Seeker',
  terminusStamps: true,
  recordNoun: 'responder',
  recordNounPlural: 'responders',
};

export const AUREL_SHEET_CHROME: SheetChrome = {
  brand: 'AUREL',
  motto: 'DRIFT IS THE WEATHER. THE VERBS HOLD.',
  documentKind: 'FIELD RECORD –',
  documentAuthority: 'THE AUREL PARTITION',
  speciesLabel: 'Origin',
  orderLabel: 'Legacy',
  abilitiesTitle: 'Legacy Permissions',
  footer: 'THE FIRST CANDIDATE · UNANCHORED REALM',
  stampLabel: 'Partition Seal',
  stampCode: 'AUR-01',
  defaultSpecies: 'Human',
  defaultOrder: 'The Vanguard',
  recordNoun: 'wanderer',
  recordNounPlural: 'wanderers',
};

export const BASELINE_SHEET_CHROME: SheetChrome = {
  brand: 'COHERENCE SYSTEM',
  motto: 'SKILL FACES THRESHOLD.',
  documentKind: 'CHARACTER FRAME –',
  documentAuthority: 'COHERENCE ENGINE',
  speciesLabel: 'Ancestry',
  orderLabel: 'Role',
  abilitiesTitle: 'Permissions',
  footer: 'COHERENCE BASELINE · NO SETTING FLAVOR',
  stampLabel: 'Frame Seal',
  stampCode: 'COH-00',
  defaultSpecies: 'Human',
  defaultOrder: 'Operative',
  recordNoun: 'frame',
  recordNounPlural: 'frames',
};
