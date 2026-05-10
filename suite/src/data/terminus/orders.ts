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
      { name: 'No Further', description: 'When an enemy tries to pass your position, you may force them to deal with you first.' },
      { name: 'Absorb the Drift', description: 'When the Scene Drift increases due to a monster\'s passive escalation, you may suffer a loss to your Exert Threshold to delay or negate the increase for this round. You are holding the room together with your will.' }
    ]
  },
  {
    id: 'rival',
    name: 'Rival',
    fieldFunction: 'wins contests of timing, leverage, and momentum',
    approaches: ['Challenge', 'Outpace', 'Answer', 'Match', 'Humiliate'],
    signatures: ['dueling blade', 'marked glove', 'racing token', 'trophy', 'challenge writ', 'mirrored charm'],
    abilities: [
      { name: 'Call the Contest', description: 'Name the terms of a contest clearly. If the other side accepts or answers, both sides are bound to those terms until someone breaks them.' },
      { name: 'Outpace', description: 'When timing matters, you may force a direct contest before the other side completes its move.' },
      { name: 'Turnabout', description: 'When an opponent fails against you, you may immediately change position, claim leverage, or put them under pressure.' },
      { name: 'Public Measure', description: 'When others are watching, your victory or failure changes how the crowd, faction, or witness treats the scene.' }
    ]
  },
  {
    id: 'broker',
    name: 'Broker',
    fieldFunction: 'turns agreement, obligation, and faction pressure into action',
    approaches: ['Bind', 'Trade', 'Pressure', 'Reframe', 'Collect'],
    signatures: ['contract case', 'seal ring', 'ledger', 'marked scales', 'debt chain', 'witness token'],
    abilities: [
      { name: 'Call in Favor', description: 'Introduce one plausible contact, owed service, minor resource, or old arrangement into the scene.' },
      { name: 'Make Terms', description: 'When two sides can hear you, you may propose terms that change what each side is willing to risk.' },
      { name: 'Hold the Debt', description: 'When someone accepts your help, mark the obligation. Later, you may ask for repayment in a related scene.' },
      { name: 'Turn the Room', description: 'When you reveal leverage, you may shift one neutral, hesitant, or self-interested NPC toward action.' },
      { name: 'Foreclose', description: 'You may apply Will pressure outward to attack a target\'s Exert Threshold by explicitly calling in a debt, presenting irrefutable leverage, or invoking a binding obligation.' }
    ]
  },
  {
    id: 'shade',
    name: 'Shade',
    fieldFunction: 'moves through secrecy, misdirection, and reversal',
    approaches: ['Slip', 'Veil', 'Misdirect', 'Reverse', 'Vanish'],
    signatures: ['mask', 'cloak', 'lockpick set', 'black knife', 'false papers', 'mirrored pin'],
    abilities: [
      { name: 'Unmarked Entry', description: 'If no one is directly watching the point of entry, you may enter without immediately becoming the scene\'s focus.' },
      { name: 'False Trail', description: 'Leave evidence that points attention, suspicion, or pursuit somewhere else.' },
      { name: 'Slip the Boundary', description: 'You may pass through a guarded, watched, or socially restricted space if you can name the gap in attention.' },
      { name: 'Turn It Back', description: 'When someone uses deception, concealment, or misdirection against you, you may redirect part of that confusion toward them.' }
    ]
  }
];

export type Order = typeof ORDERS_LIST[number]['name'];
