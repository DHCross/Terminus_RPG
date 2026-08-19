export interface BaseEffect {
  type: 'permission' | 'information' | 'position' | 'protection' | 'leverage' | 'opening';
  text: string;
}

export interface ExertEffect {
  type: 'reliability' | 'speed' | 'scope' | 'force';
  text: string;
}

export interface OrderAbility {
  name: string;
  description: string; // kept for search compatibility
  shortText: string;
  trigger?: string;
  baseEffect?: BaseEffect;
  exertEffect?: ExertEffect;
  sceneHooks?: Array<'ground' | 'will' | 'shift' | 'drift' | 'latent'>;
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
      {
        name: 'Weak Point',
        description: 'Study a target or scene feature to name one way it can be pressured.',
        shortText: 'Study a target or scene feature to name one way it can be pressured.',
        trigger: 'You study a target, object, barrier, creature, or scene feature.',
        baseEffect: {
          type: 'information',
          text: 'Reveal one way the target or feature can be pressured, bypassed, exposed, or protected.',
        },
        exertEffect: {
          type: 'reliability',
          text: 'Spend 1 Exert to make the weakness actionable; an ally who acts on it steps up their skill die for their next roll.',
        },
        sceneHooks: ['ground', 'shift'],
      },
      {
        name: 'Trace Source',
        description: 'Examine an active pressure, residue, or anomaly to ask where it originated.',
        shortText: 'Examine an active pressure, residue, or anomaly to ask where it originated.',
        trigger: 'You examine an active pressure, wound, residue, broken ward, or abnormal effect.',
        baseEffect: {
          type: 'information',
          text: 'Reveal the origin of the pressure, identifying the person, place, office, or route it stems from.',
        },
        exertEffect: {
          type: 'reliability',
          text: 'Spend 1 Exert to identify if the source is active, latent, or escalating.',
        },
        sceneHooks: ['will', 'latent'],
      },
      {
        name: 'Bring to Light',
        description: 'Expose a hidden path, ward, person, or motive if you can reach evidence of it.',
        shortText: 'Expose a hidden path, ward, person, or motive if you can reach evidence of it.',
        trigger: 'You have direct physical or written evidence of something hidden.',
        baseEffect: {
          type: 'leverage',
          text: 'Expose the hidden thing\'s immediate presence and its direct access condition.',
        },
        exertEffect: {
          type: 'scope',
          text: 'Spend 1 Exert to open a hidden route or expose a concealed ward, bringing it into the active scene until the next Drift effect.',
        },
        sceneHooks: ['ground'],
      },
      {
        name: 'Read the Pattern',
        description: 'Observe a repeated behavior or Drift routine to prevent surprise.',
        shortText: 'Observe a repeated behavior or Drift routine to prevent surprise.',
        trigger: 'You observe a repeated behavior, civic routine, patrol, or Drift effect.',
        baseEffect: {
          type: 'information',
          text: 'Reveal the sequence of the pattern to warn one nearby ally, letting them avoid being caught off guard.',
        },
        exertEffect: {
          type: 'speed',
          text: 'Spend 1 Exert to act before the next Drift effect by predicting its immediate impact.',
        },
        sceneHooks: ['drift', 'shift'],
      },
    ],
  },
  {
    id: 'breaker',
    name: 'Breaker',
    fieldFunction: 'forces openings and ruptures',
    approaches: ['Shatter', 'Sever', 'Breach', 'Overwhelm', 'Unmake'],
    signatures: ['hammer', 'axe', 'blade', 'iron rod', 'demolition charm', 'broken standard'],
    abilities: [
      {
        name: 'Breach Point',
        description: 'Damage a barrier, lock, ward, or shield to open a temporary passage.',
        shortText: 'Damage a barrier, lock, ward, or shield to open a temporary passage.',
        trigger: 'You deal damage to or break a barrier, lock, ward, shield, or formation.',
        baseEffect: {
          type: 'opening',
          text: 'Open a passage or breach that allies can use before the next Drift effect.',
        },
        exertEffect: {
          type: 'force',
          text: 'Spend 1 Exert to hold the breach open, delaying its collapse and protecting allies passing through it.',
        },
        sceneHooks: ['ground', 'shift'],
      },
      {
        name: 'Overrun',
        description: 'Win a Force contest to drive an opponent back or break their stance.',
        shortText: 'Win a Force contest to drive an opponent back or break their stance.',
        trigger: 'You succeed on a Force roll against an opponent.',
        baseEffect: {
          type: 'position',
          text: 'Drive the target back or knock it aside, reducing its position or cover.',
        },
        exertEffect: {
          type: 'force',
          text: 'Spend 1 Exert to force hesitation; the target cannot focus its next pressure on anyone but you.',
        },
        sceneHooks: ['shift'],
      },
      {
        name: 'Break the Tool',
        description: 'Target a weapon, focus, or mechanism instead of its wielder.',
        shortText: 'Target a weapon, focus, or mechanism instead of its wielder.',
        trigger: 'A target is using or relying on a weapon, focus, mechanism, ward-anchor, brace, or chain.',
        baseEffect: {
          type: 'opening',
          text: 'Expose a vulnerability in the tool, making its next use unreliable or reducing its effectiveness.',
        },
        exertEffect: {
          type: 'force',
          text: 'Spend 1 Exert to rupture the tool and redirect the debris, reducing the wielder\'s Avoid or Endure by 1.',
        },
        sceneHooks: ['ground', 'shift'],
      },
      {
        name: 'Carry the Break',
        description: 'Redirect the force of a breaking object or barrier to compromise nearby targets.',
        shortText: 'Redirect the force of a breaking object or barrier to compromise nearby targets.',
        trigger: 'An object, barrier, or structure breaks in your presence.',
        baseEffect: {
          type: 'position',
          text: 'Redirect the debris or force to compromise an adjacent target, reducing their Avoid or Endure by 1.',
        },
        exertEffect: {
          type: 'scope',
          text: 'Spend 1 Exert to redirect the impact to up to two nearby targets, reducing their Avoid or footing.',
        },
        sceneHooks: ['shift', 'drift'],
      },
    ],
  },
  {
    id: 'warden',
    name: 'Warden',
    fieldFunction: 'holds collapse at bay',
    approaches: ['Anchor', 'Shield', 'Hold', 'Interpose', 'Contain'],
    signatures: ['shield', 'staff', 'oath-chain', 'ward-stone', 'field standard', 'iron-bound mantle'],
    abilities: [
      {
        name: 'Hold the Line',
        description: 'Interpose to absorb circle losses on behalf of a nearby ally.',
        shortText: 'Interpose to absorb circle losses on behalf of a nearby ally.',
        trigger: 'A nearby ally would lose an Endure, Avoid, or Exert circle.',
        baseEffect: {
          type: 'protection',
          text: 'Protect one nearby ally by taking their circle loss on your own matching Threshold instead.',
        },
        exertEffect: {
          type: 'force',
          text: 'Spend 1 Exert to reduce the incoming Impact by 1 before absorbing it.',
        },
        sceneHooks: ['shift'],
      },
      {
        name: 'Anchor Point',
        description: 'Secure a chokepoint or doorway to block passage and delay collapse.',
        shortText: 'Secure a chokepoint or doorway to block passage and delay collapse.',
        trigger: 'You take a defensive stance at a doorway, chokepoint, boundary, or narrow passage.',
        baseEffect: {
          type: 'position',
          text: 'Secure the passage. Force hesitation on opponents attempting to move past you, blocking their direct access.',
        },
        exertEffect: {
          type: 'reliability',
          text: 'Spend 1 Exert to hold the position against a Drift effect this round, delaying its consequence.',
        },
        sceneHooks: ['ground', 'drift'],
      },
      {
        name: 'Brace Against It',
        description: 'Extend your Endure result to cover a nearby ally or object.',
        shortText: 'Extend your Endure result to cover a nearby ally or object.',
        trigger: 'You choose Endure as your active Threshold against an incoming pressure.',
        baseEffect: {
          type: 'protection',
          text: 'Protect one nearby ally or object, letting them share your Endure result against incoming pressure.',
        },
        exertEffect: {
          type: 'scope',
          text: 'Spend 1 Exert to protect up to two nearby allies, or apply your defense to an Avoid pressure.',
        },
        sceneHooks: ['shift'],
      },
      {
        name: 'No Further',
        description: 'Force an opponent to halt or deal with you first before passing.',
        shortText: 'Force an opponent to halt or deal with you first before passing.',
        trigger: 'An opponent attempts to move past or around your current position.',
        baseEffect: {
          type: 'position',
          text: 'Force hesitation. The opponent must halt or deal with you first before they can move past.',
        },
        exertEffect: {
          type: 'force',
          text: 'Spend 1 Exert to reduce their incoming action\'s Impact by 1 if they attempt to force their way past.',
        },
        sceneHooks: ['ground', 'shift'],
      },
      {
        name: 'Absorb the Drift',
        description: 'Suffer Exert loss to delay or negate a round-end Drift increase.',
        shortText: 'Suffer Exert loss to delay or negate a round-end Drift increase.',
        trigger: 'Scene Drift is about to increase at the end of a round.',
        baseEffect: {
          type: 'protection',
          text: 'Delay the Drift increase by one round by taking 1 Exert circle of strain.',
        },
        exertEffect: {
          type: 'force',
          text: 'Spend 2 Exert circles to hold the scene, delaying the Drift increase for this round.',
        },
        sceneHooks: ['drift'],
      },
    ],
  },
  {
    id: 'rival',
    name: 'Rival',
    fieldFunction: 'wins contests of timing, leverage, and momentum',
    approaches: ['Challenge', 'Outpace', 'Answer', 'Match', 'Humiliate'],
    signatures: ['dueling blade', 'marked glove', 'racing token', 'trophy', 'challenge writ', 'mirrored charm'],
    abilities: [
      {
        name: 'Call the Contest',
        description: 'Declare formal terms of a contest that binds both sides.',
        shortText: 'Declare formal terms of a contest that binds both sides.',
        trigger: 'You declare formal terms of a contest in a scene where another party can hear and respond.',
        baseEffect: {
          type: 'leverage',
          text: 'Bind both sides to the terms. Breaking the terms shifts the scene\'s Ground against the side that breaks first.',
        },
        exertEffect: {
          type: 'reliability',
          text: 'Spend 1 Exert to make the terms witnessed, exposing any violation as a major shift in Ground.',
        },
        sceneHooks: ['ground', 'will'],
      },
      {
        name: 'Outpace',
        description: 'Force a direct contest before an opponent completes a timed action.',
        shortText: 'Force a direct contest before an opponent completes a timed action.',
        trigger: 'An opponent is completing an action where timing is the deciding factor.',
        baseEffect: {
          type: 'position',
          text: 'Interrupt and force a direct contest of timing, using Agility to act first.',
        },
        exertEffect: {
          type: 'speed',
          text: 'Spend 1 Exert to act before the next Drift effect, stepping up your Skill die for the contest.',
        },
        sceneHooks: ['shift'],
      },
      {
        name: 'Turnabout',
        description: 'Claim leverage or apply pressure immediately when an opponent fails against you.',
        shortText: 'Claim leverage or apply pressure immediately when an opponent fails against you.',
        trigger: 'An opponent fails a roll or action directed at you.',
        baseEffect: {
          type: 'leverage',
          text: 'Claim one piece of leverage or apply a named pressure on the opponent before they can act again.',
        },
        exertEffect: {
          type: 'force',
          text: 'Spend 1 Exert to force hesitation, applying both a positional shift and pressure to them.',
        },
        sceneHooks: ['shift'],
      },
      {
        name: 'Public Measure',
        description: 'Succeed or fail publicly to shift faction or witness stances.',
        shortText: 'Succeed or fail publicly to shift faction or witness stances.',
        trigger: 'You succeed or fail at a consequential action in the presence of witnesses.',
        baseEffect: {
          type: 'leverage',
          text: 'Shift the stance of a nearby crowd or witness toward or away from your position.',
        },
        exertEffect: {
          type: 'scope',
          text: 'Spend 1 Exert to direct which witness responds and how their reaction shifts the Ground.',
        },
        sceneHooks: ['ground', 'will'],
      },
    ],
  },
  {
    id: 'broker',
    name: 'Broker',
    fieldFunction: 'turns agreement, obligation, and faction pressure into action',
    approaches: ['Bind', 'Trade', 'Pressure', 'Reframe', 'Collect'],
    signatures: ['contract case', 'seal ring', 'ledger', 'marked scales', 'debt chain', 'witness token'],
    abilities: [
      {
        name: 'Call in Favor',
        description: 'Introduce a contact, owed service, or resource relevant to the scene.',
        shortText: 'Introduce a contact, owed service, or resource relevant to the scene.',
        trigger: 'You have a prior arrangement, contact, or Held Debt relevant to the current scene.',
        baseEffect: {
          type: 'leverage',
          text: 'Introduce one contact, owed service, or prior arrangement that changes what is available.',
        },
        exertEffect: {
          type: 'speed',
          text: 'Spend 1 Exert to make the contact or resource present and actionable in the current round.',
        },
        sceneHooks: ['ground'],
      },
      {
        name: 'Make Terms',
        description: 'Propose terms between opposing sides to reframe scene stakes.',
        shortText: 'Propose terms between opposing sides to reframe scene stakes.',
        trigger: 'Two or more opposing parties are present and able to hear you.',
        baseEffect: {
          type: 'permission',
          text: 'Reframe the stakes, letting both sides act on a new assessment of risk rather than the active pressure.',
        },
        exertEffect: {
          type: 'reliability',
          text: 'Spend 1 Exert to hold the terms in the scene\'s Ground, ensuring any violation incurs a clear penalty.',
        },
        sceneHooks: ['ground', 'will'],
      },
      {
        name: 'Hold the Debt',
        description: 'Mark a debtor obligation when someone accepts your assistance.',
        shortText: 'Mark a debtor obligation when someone accepts your assistance.',
        trigger: 'A character accepts your assistance, cover, or resources.',
        baseEffect: {
          type: 'leverage',
          text: 'Record the obligation. In a later scene, you gain permission to claim one plausible favor as repayment.',
        },
        exertEffect: {
          type: 'speed',
          text: 'Spend 1 Exert to invoke the debt now, calling in the favor in the current scene.',
        },
        sceneHooks: ['will', 'latent'],
      },
      {
        name: 'Turn the Room',
        description: 'Reveal leverage to shift a neutral or hesitant NPC toward action.',
        shortText: 'Reveal leverage to shift a neutral or hesitant NPC toward action.',
        trigger: 'You reveal leverage (a debt, a risk, or an exposure) to a hesitant NPC.',
        baseEffect: {
          type: 'leverage',
          text: 'Shift a hesitant NPC\'s stance toward active cooperation or swift departure.',
        },
        exertEffect: {
          type: 'scope',
          text: 'Spend 1 Exert to expand the shift to all nearby witnesses, changing how they read the Ground.',
        },
        sceneHooks: ['will', 'ground'],
      },
      {
        name: 'Foreclose',
        description: 'Apply Will pressure to attack a target\'s Exert threshold using leverage.',
        shortText: 'Apply Will pressure to attack a target\'s Exert threshold using leverage.',
        trigger: 'You have a marked debt, confirmed leverage, or a binding obligation the target has not met.',
        baseEffect: {
          type: 'leverage',
          text: 'Contest the target\'s Exert threshold using Will pressure. The target knows exactly why they must comply.',
        },
        exertEffect: {
          type: 'force',
          text: 'Spend 1 Exert to make the pressure public, forcing witnesses to acknowledge the debt.',
        },
        sceneHooks: ['will', 'shift'],
      },
    ],
  },
  {
    id: 'shade',
    name: 'Shade',
    fieldFunction: 'moves through secrecy, misdirection, and reversal',
    approaches: ['Slip', 'Veil', 'Misdirect', 'Reverse', 'Vanish'],
    signatures: ['mask', 'cloak', 'lockpick set', 'black knife', 'false papers', 'mirrored pin'],
    abilities: [
      {
        name: 'Unmarked Entry',
        description: 'Enter a point of divided attention without becoming the scene\'s focus.',
        shortText: 'Enter a point of divided attention without becoming the scene\'s focus.',
        trigger: 'You approach an entry point where attention is divided or incomplete.',
        baseEffect: {
          type: 'permission',
          text: 'Slip inside without becoming the scene\'s focus; you are unnoticed unless actively searched.',
        },
        exertEffect: {
          type: 'reliability',
          text: 'Spend 1 Exert to enter even under active observation by exploiting a brief gap in their attention.',
        },
        sceneHooks: ['ground'],
      },
      {
        name: 'False Trail',
        description: 'Leave false traces that redirect attention or delay investigators.',
        shortText: 'Leave false traces that redirect attention or delay investigators.',
        trigger: 'You leave a deliberate false trace before pursuit or suspicion begins.',
        baseEffect: {
          type: 'position',
          text: 'Redirect attention or pursuit toward a false source until a contradiction is exposed.',
        },
        exertEffect: {
          type: 'speed',
          text: 'Spend 1 Exert to delay the pursuit, holding them at the false trail for at least one scene.',
        },
        sceneHooks: ['drift', 'ground'],
      },
      {
        name: 'Slip the Boundary',
        description: 'Pass guarded or restricted spaces by naming attention gaps.',
        shortText: 'Pass guarded or restricted spaces by naming attention gaps.',
        trigger: 'A guarded or restricted space stands between you and your objective.',
        baseEffect: {
          type: 'permission',
          text: 'Pass guarded spaces by naming a specific gap, blind angle, or distraction in their attention.',
        },
        exertEffect: {
          type: 'scope',
          text: 'Spend 1 Exert to create a gap where none exists, accepting a minor consequence later in the scene.',
        },
        sceneHooks: ['ground', 'shift'],
      },
      {
        name: 'Turn It Back',
        description: 'Redirect deception or misdirection back to its source.',
        shortText: 'Redirect deception or misdirection back to its source.',
        trigger: 'An opponent uses deception, concealment, or misdirection against you.',
        baseEffect: {
          type: 'leverage',
          text: 'Redirect the confusion, choosing a false signal or belief the opponent receives.',
        },
        exertEffect: {
          type: 'force',
          text: 'Spend 1 Exert to invert the misdirection, reducing their next action\'s Impact by 1 or stepping up your Avoid.',
        },
        sceneHooks: ['shift', 'will'],
      },
    ],
  },
];

export type Order = typeof ORDERS_LIST[number]['name'];

/** The six Terminus Order ids: seeker, breaker, warden, rival, broker, shade. */
export type OrderId = typeof ORDERS_LIST[number]['id'];
