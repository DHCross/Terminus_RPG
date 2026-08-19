export type SignatureCost = 'Commit' | 'Mark' | 'Give';
export type SignatureKind = 'force' | 'position' | 'office' | 'sight';

export interface SignatureProperty {
  id: string;
  name: string;
  aliases?: string[];
  kind: SignatureKind;
  property: string;
  cost: SignatureCost;
  text: string;
}

export const THREE_CURRENCIES = [
  {
    id: 'exert',
    currency: 'Exert',
    who: 'Sanctioned Working',
    cost: 'Your own reserve. Refreshes.',
    paysWith: 'the self',
  },
  {
    id: 'drift',
    currency: 'Drift',
    who: 'Rupture Casting',
    cost: "Everyone's scene. Does not refresh.",
    paysWith: 'the world',
  },
  {
    id: 'object',
    currency: 'The object',
    who: 'Signature Property',
    cost: 'The thing in your hands.',
    paysWith: 'the object',
  },
] as const;

export const SIGNATURE_COSTS: Record<SignatureCost, string> = {
  Commit:
    'The Signature is busy doing the thing. You still hold it, but it is not available for anything else until you release it. Free, reversible, and the reason a Seeker peering through a lens cannot also be doing something with that hand.',
  Mark:
    'The Signature takes real wear: a bent tine, a cracked lens, a chain short two links, a seal with a chip in its face. A marked Signature cannot use its property again until repaired. Repair takes a Quiet Day and someone who knows the craft. Mark it three times without repair and it is finished.',
  Give:
    'The Signature is gone. Spent, broken, left wedged in the mechanism, handed over, thrown in the river. You get the effect and you do not get the object back, and picking a new Signature takes as long as the Guide says grief takes.',
};

export const SIGNATURE_DOCTRINE = {
  problem:
    'Workings let a character edit the world. Without an equivalent, a Force-heavy character only edits bodies, which is a smaller and duller job.',
  notABonus:
    'A Signature is not a bonus. It does not add to rolls. It is a thing with standing (what the world recognizes it as) and a property (what it lets you do), and using the property spends the object.',
  giveWorthIt:
    'Guides: let Give be worth it. A player who gives up their Signature should get something the scene will remember. If Give ever feels like a bad trade, players will stop reaching for the best moments in the game.',
} as const;

export const SIGNATURES: SignatureProperty[] = [
  // Arms and instruments of force
  {
    id: 'hammer',
    name: 'Hammer, maul',
    aliases: ['hammer', 'maul'],
    kind: 'force',
    property: 'Sounding',
    cost: 'Commit',
    text: 'Strike a structure and hear where it is hollow, false, filled, or load-bearing. You learn the building\'s secret without opening it.',
  },
  {
    id: 'axe',
    name: 'Axe, cleaver',
    aliases: ['axe', 'cleaver'],
    kind: 'force',
    property: 'Wedge',
    cost: 'Give',
    text: 'Leave it buried in the thing you cut so the cut cannot close: a door that will not shut, a gate held open, a mechanism stopped mid-turn.',
  },
  {
    id: 'iron-rod',
    name: 'Iron rod, pry bar',
    aliases: ['iron rod', 'pry bar'],
    kind: 'force',
    property: 'Purchase',
    cost: 'Mark',
    text: 'Turn a thing that was never meant to turn, and do it quietly, with no roll and no noise. Hinges, grates, capstans, jaws.',
  },
  {
    id: 'blade',
    name: 'Longsword, blade',
    aliases: ['blade', 'longsword', 'dueling blade'],
    kind: 'force',
    property: 'Standing at Arms',
    cost: 'Commit',
    text: 'Draw it and every person present must decide, out loud, whether this is now a fight. Nobody gets to stay uncommitted.',
  },
  {
    id: 'spear',
    name: 'Spear, halberd',
    aliases: ['spear', 'halberd'],
    kind: 'force',
    property: 'Held Ground',
    cost: 'Commit',
    text: 'Plant it. The distance between you and them stops being negotiable while it stands.',
  },
  {
    id: 'shield',
    name: 'Shield',
    aliases: ['shield'],
    kind: 'force',
    property: 'Given Cover',
    cost: 'Mark',
    text: 'Put it over someone else and take their next consequence in full. The shield takes the wear. This is a bonus. Hold the Spot is why you carry a Board.',
  },
  {
    id: 'broken-standard',
    name: 'Broken standard',
    aliases: ['a broken standard', 'broken standard'],
    kind: 'force',
    property: 'Muster',
    cost: 'Give',
    text: 'Raise it and frightened people who recognize the colors move where you point, once.',
  },
  {
    id: 'breaking-charm',
    name: 'Breaking-charm',
    aliases: ['breaking-charm', 'breaking charm', 'demolition charm'],
    kind: 'force',
    property: 'Held Open',
    cost: 'Commit',
    text: 'Hold a Working open on something that should not give. While committed, the charm is the only thing keeping the break from closing.',
  },

  // Tools of position and attention
  {
    id: 'lockpick-set',
    name: 'Lockpick set',
    aliases: ['lockpick set'],
    kind: 'position',
    property: 'Unhurried',
    cost: 'Commit',
    text: 'Any ordinary lock opens without a roll, given time. The only question the Guide asks is what arrives while you work.',
  },
  {
    id: 'mask',
    name: 'Mask',
    aliases: ['mask'],
    kind: 'position',
    property: 'Not Yourself',
    cost: 'Commit',
    text: 'For as long as it is on, you are whoever the room needs you to be. Coming off is an event.',
  },
  {
    id: 'cloak',
    name: 'Cloak',
    aliases: ['cloak'],
    kind: 'position',
    property: 'Unaccounted',
    cost: 'Commit',
    text: 'Step out of the scene\'s attention entirely. You are not hidden; you are simply not being counted, until you do something that requires counting.',
  },
  {
    id: 'false-papers',
    name: 'False papers',
    aliases: ['false papers'],
    kind: 'position',
    property: 'Standing on Demand',
    cost: 'Give',
    text: 'Produce the exact document this office wants. It works once, and afterward it exists in their ledger with your face beside it.',
  },
  {
    id: 'black-knife',
    name: 'Black knife',
    aliases: ['black knife'],
    kind: 'position',
    property: 'Quiet Work',
    cost: 'Mark',
    text: 'One act of violence makes no sound and leaves no witness who understands what they saw.',
  },
  {
    id: 'mirrored-pin',
    name: 'Mirrored pin',
    aliases: ['mirrored pin', 'mirrored charm'],
    kind: 'position',
    property: 'Turned Eye',
    cost: 'Give',
    text: 'Send someone\'s attention to the wrong person in the room. Often the person next to you.',
  },

  // Instruments of office
  {
    id: 'archive-seal',
    name: 'Archive seal',
    aliases: ['archive seal'],
    kind: 'office',
    property: 'Under Authority',
    cost: 'Mark',
    text: 'Press it and the thing is shut, opened, or claimed under an office that still exists. Worth exactly what that office is still worth in this ward.',
  },
  {
    id: 'ledger',
    name: 'Ledger',
    aliases: ['ledger'],
    kind: 'office',
    property: 'Entered',
    cost: 'Commit',
    text: 'Write it down and it becomes a fact the courts will have to argue with. Wrong facts included.',
  },
  {
    id: 'seal-ring',
    name: 'Seal ring',
    aliases: ['seal ring'],
    kind: 'office',
    property: 'My Word',
    cost: 'Commit',
    text: 'Bind yourself publicly to a promise. Anyone present may hold you to it, and while you keep it, people who should not trust you do.',
  },
  {
    id: 'debt-chain',
    name: 'Debt chain',
    aliases: ['debt chain'],
    kind: 'office',
    property: 'Called In',
    cost: 'Give',
    text: 'Name the debt out loud in front of witnesses. The debtor acts, or everyone watching learns what they are.',
  },
  {
    id: 'marked-scales',
    name: 'Marked scales',
    aliases: ['marked scales'],
    kind: 'office',
    property: 'Weighed',
    cost: 'Mark',
    text: 'Two claims, one answer: the scales show which is the heavier, and bystanders believe them.',
  },
  {
    id: 'witness-token',
    name: 'Witness token',
    aliases: ['witness token'],
    kind: 'office',
    property: 'Testimony',
    cost: 'Give',
    text: 'What you say happened, happened, for one official purpose.',
  },
  {
    id: 'oath-chain',
    name: 'Oath-chain',
    aliases: ['oath-chain', 'oath chain'],
    kind: 'office',
    property: 'Sworn Post',
    cost: 'Commit',
    text: 'Chain yourself to the place you are holding. You cannot leave. Nothing moves you either.',
  },
  {
    id: 'ward-stone',
    name: 'Ward-stone',
    aliases: ['ward-stone', 'ward stone'],
    kind: 'office',
    property: 'Set Down',
    cost: 'Give',
    text: 'Leave it and the boundary keeps holding after you walk away. You will have to come back for it.',
  },
  {
    id: 'contract-case',
    name: 'Contract case',
    aliases: ['contract case'],
    kind: 'office',
    property: 'On the Table',
    cost: 'Commit',
    text: 'Open it and the terms are in front of everyone who can read. While it is open you cannot pretend the bargain was never offered.',
  },
  {
    id: 'field-standard',
    name: 'Field standard',
    aliases: ['field standard'],
    kind: 'office',
    property: 'Posted',
    cost: 'Commit',
    text: 'Plant the colors. People who still honor the warrant treat this ground as held until you take them down.',
  },
  {
    id: 'iron-bound-mantle',
    name: 'Iron-bound mantle',
    aliases: ['iron-bound mantle'],
    kind: 'office',
    property: 'Taken Blow',
    cost: 'Mark',
    text: 'Wear it and take the next consequence meant for someone standing in your shadow. The mantle takes the wear.',
  },
  {
    id: 'marked-glove',
    name: 'Marked glove',
    aliases: ['marked glove'],
    kind: 'office',
    property: 'Terms Shown',
    cost: 'Commit',
    text: 'Put it on and the contest is visible. Nobody present can claim they did not hear the terms.',
  },
  {
    id: 'wager-token',
    name: 'Wager token',
    aliases: ['wager token', 'racing token'],
    kind: 'office',
    property: 'Stakes Laid',
    cost: 'Give',
    text: 'Put it down and the wager is now a fact. Collecting or paying happens in front of whoever is watching.',
  },
  {
    id: 'trophy',
    name: 'Trophy',
    aliases: ['trophy'],
    kind: 'office',
    property: 'Last Measure',
    cost: 'Commit',
    text: 'Show it and the last public win or loss still counts in this room. People remember whose colors those were.',
  },
  {
    id: 'challenge-writ',
    name: 'Challenge writ',
    aliases: ['challenge writ'],
    kind: 'office',
    property: 'On the Books',
    cost: 'Give',
    text: 'Hand it over and the contest is entered. Breaking it later is breaking a record, not a mood.',
  },

  // Instruments of sight
  {
    id: 'lens',
    name: 'Lens',
    aliases: ['lens'],
    kind: 'sight',
    property: 'Held Open',
    cost: 'Commit',
    text: 'What you have revealed stays revealed while you look at it. Look away and it closes.',
  },
  {
    id: 'lantern',
    name: 'Lantern',
    aliases: ['lantern'],
    kind: 'sight',
    property: 'Bounded Light',
    cost: 'Commit',
    text: 'Its circle is a real boundary. When the oil goes, so does the boundary.',
  },
  {
    id: 'grimoire',
    name: 'Grimoire',
    aliases: ['grimoire'],
    kind: 'sight',
    property: 'Precedent',
    cost: 'Mark',
    text: 'Someone wrote this down before. Ask what they did about it and learn one true thing.',
  },
  {
    id: 'marked-coin',
    name: 'Marked coin',
    aliases: ['marked coin'],
    kind: 'sight',
    property: 'Passage',
    cost: 'Give',
    text: 'One tollgate, ferry, gate-warden, or clerk takes it and asks nothing.',
  },
  {
    id: 'relic-key',
    name: 'Relic key',
    aliases: ['relic key'],
    kind: 'sight',
    property: 'Older Right',
    cost: 'Give',
    text: 'Opens what was closed by an authority nobody living remembers. Once.',
  },
  {
    id: 'staff',
    name: 'Staff',
    aliases: ['staff'],
    kind: 'sight',
    property: 'Reach and Warding',
    cost: 'Commit',
    text: 'Keep a thing at arm\'s length and off the person behind you at the same time.',
  },
];

export const SIGNATURE_ITEMS = SIGNATURES.map((signature) => signature.name);

function normalizeSignatureKey(value: string): string {
  return value.trim().toLowerCase().replace(/^a\s+/, '');
}

export function findSignature(idOrName: string): SignatureProperty | undefined {
  const key = normalizeSignatureKey(idOrName);
  return SIGNATURES.find((signature) => {
    if (signature.id === key || normalizeSignatureKey(signature.name) === key) return true;
    return (signature.aliases ?? []).some((alias) => normalizeSignatureKey(alias) === key);
  });
}
