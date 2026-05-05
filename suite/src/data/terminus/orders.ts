export interface OrderAbility {
  name: string;
  description: string;
}

export interface OrderInfo {
  id: string;
  name: string;
  fieldFunction: string;
  approaches: string[];
  signatures: string[];
  abilities: OrderAbility[];
}

export const ORDERS_LIST: OrderInfo[] = [
  {
    id: 'seeker',
    name: 'Seeker',
    fieldFunction: 'reveals what is hidden',
    approaches: ['Reveal', 'Trace', 'Name', 'Expose', 'Interpret'],
    signatures: ['lantern', 'lens', 'grimoire', 'marked coin', 'relic key', 'archive seal'],
    abilities: [
      { name: 'Weak Point', description: 'After you study a target, object, or scene feature, name one way it can be pressured.' },
      { name: 'Trace Source', description: 'When you examine a pressure, working, wound, or relic, you may ask where it came from.' },
      { name: 'Bring to Light', description: 'You can reveal a hidden object, path, ward, person, motive, or weak point if you can reach evidence of it.' },
      { name: 'Read the Pattern', description: 'After you observe a repeated behavior or routine, your next action against it cannot be surprised by that routine.' }
    ]
  },
  {
    id: 'breaker',
    name: 'Breaker',
    fieldFunction: 'forces openings and ruptures',
    approaches: ['Shatter', 'Sever', 'Breach', 'Overwhelm', 'Unmake'],
    signatures: ['hammer', 'axe', 'blade', 'iron rod', 'demolition charm', 'broken standard'],
    abilities: [
      { name: 'Breach Point', description: 'When you damage a barrier, lock, ward, shield, or formation, you may also open a temporary passage or gap.' },
      { name: 'Overrun', description: 'When you win with Force, you may drive the target back, knock it aside, or break its position.' },
      { name: 'Break the Tool', description: 'You may target a weapon, focus, ward-anchor, brace, chain, or mechanism instead of the wielder.' },
      { name: 'Carry the Break', description: 'When something breaks, you may push part of that break into an adjacent object, target, or position.' }
    ]
  },
  {
    id: 'warden',
    name: 'Warden',
    fieldFunction: 'holds collapse at bay',
    approaches: ['Anchor', 'Shield', 'Hold', 'Interpose', 'Contain'],
    signatures: ['shield', 'staff', 'oath-chain', 'ward-stone', 'field standard', 'iron-bound mantle'],
    abilities: [
      { name: 'Hold the Line', description: 'When a nearby ally would lose a Threshold circle, you may take that loss instead if you can plausibly interpose.' },
      { name: 'Anchor Point', description: 'Choose one position, door, bridge, threshold, or boundary. Until you move, it is harder to force open, cross, or collapse.' },
      { name: 'Brace Against It', description: 'When you choose Endure, you may protect one nearby person or object from the same pressure.' },
      { name: 'No Further', description: 'When an enemy tries to pass your position, you may force them to deal with you first.' }
    ]
  },
  {
    id: 'rival',
    name: 'Rival',
    fieldFunction: 'wins contests of timing, leverage, and momentum',
    approaches: ['Challenge', 'Redirect', 'Intercept', 'Disarm'],
    signatures: ['dueling blade', 'paired knives', 'hook', 'whip', 'glove'],
    abilities: []
  },
  {
    id: 'broker',
    name: 'Broker',
    fieldFunction: 'turns agreement, obligation, and faction pressure into action',
    approaches: ['Negotiate', 'Demand', 'Bind', 'Trade'],
    signatures: ['ledger', 'seal', 'writ', 'contract', 'scale'],
    abilities: []
  },
  {
    id: 'shade',
    name: 'Shade',
    fieldFunction: 'moves through secrecy, misdirection, and reversal',
    approaches: ['Slip', 'Deceive', 'Misdirect', 'Vanish'],
    signatures: ['cloak', 'mask', 'smoke bomb', 'wire', 'poison'],
    abilities: []
  }
];

export type Order = typeof ORDERS_LIST[number]['name'];
