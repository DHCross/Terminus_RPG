import type { OrderInfo } from './orders';

export interface WorkingVerb {
  id: string;
  name: string;
  summary: string;
  canDo: string[];
  cannotDo: string[];
  examples: string[];
}

export interface MagicMode {
  id: string;
  name: string;
  summary: string;
  cost: string;
  effect: string;
  consequence: string;
}

export interface OrderExpression {
  orderId: OrderInfo['id'];
  expression: string;
}

export interface MagicTerminologyBoundary {
  title: string;
  summary: string;
}

export interface ArchetypalCasting {
  id: string;
  orderId: OrderInfo['id'];
  name: string;
  verb: 'Seal' | 'Expose' | 'Bridge' | 'Nullify';
  cost: string;
  anchor: string;
  effect: string;
  limit: string;
}

export const MAGIC_TERMINOLOGY_BOUNDARIES: MagicTerminologyBoundary[] = [
  {
    title: 'Four Working Verbs',
    summary: 'Seal, Expose, Bridge, and Nullify are the controlled vocabulary of Sanctioned Workings.',
  },
  {
    title: 'Rupture Is Not A Verb',
    summary: 'Rupture is a condition state: systemic failure when Routine no longer holds.',
  },
  {
    title: 'Rupture Casting',
    summary: 'Rupture Casting is an unlicensed method that spends Scene Drift instead of Exert.',
  },
];

export const MAGIC_MODES: MagicMode[] = [
  {
    id: 'sanctioned-working',
    name: 'Sanctioned Working',
    summary: 'A licensed exception enforced through seals, oaths, rites, and recognized authority.',
    cost: 'Spend 1 or more Exert circles. The Working lasts until the scene ends, its anchor breaks, or the caster reclaims the Exert.',
    effect: 'Choose one Working verb and state the permission you are changing in the fiction.',
    consequence: 'The caster becomes more vulnerable to Will pressure while the Working holds.',
  },
  {
    id: 'rupture-casting',
    name: 'Rupture Casting',
    summary: 'A desperate override that breaks permission structure instead of asking for it.',
    cost: 'Spend 0 Exert. No spell slot, gate, or permission check stops a character from reaching for it if the fiction supports the act.',
    effect: 'Force an immediate violent change, comparable to overwhelming Impact or impossible access.',
    consequence: 'Increase Scene Drift by +1 for a localized effect, or +2 for multiple targets, infrastructure damage, or reality-wide disruption.',
  },
  {
    id: 'old-office-rite',
    name: 'Old Office Rite',
    summary: 'A lived religious or civic rite that calls on an older authority recognized by the world.',
    cost: 'Requires time, correct form, symbol, taboo, offering, witness, or location.',
    effect: 'Reduce a related Working cost by 1 Exert or extend its duration beyond the scene.',
    consequence: 'Creates a visible obligation, taboo, debt, omen, or institutional trace the Guide can bring back later.',
  },
];

export const WORKING_VERBS: WorkingVerb[] = [
  {
    id: 'seal',
    name: 'Seal',
    summary: 'Lock a state in place.',
    canDo: [
      'Keep a door shut, a bridge standing, a wound closed, a verdict fixed, or a route stable.',
      'Hold a boundary long enough for the cell to act.',
      'Prevent a known change from completing.',
    ],
    cannotDo: [
      'Reveal hidden information.',
      'Create a new path where no shared authority exists.',
      'Destroy the thing being held.',
    ],
    examples: [
      'Seal a collapsing stairwell until the evacuation clears it.',
      'Seal a witness name into a ledger so the court cannot forget them.',
      'Seal a monster behind a chalk line while the anchor remains intact.',
    ],
  },
  {
    id: 'expose',
    name: 'Expose',
    summary: 'Make hidden permission, pressure, or falsehood legible.',
    canDo: [
      'Reveal a ward, weak point, forged authority, concealed route, or buried obligation.',
      'Make the scene answer one precise question about what is really holding.',
      'Turn invisible structure into something the cell can target.',
    ],
    cannotDo: [
      'Automatically solve the revealed problem.',
      'Force a target to obey.',
      'Create evidence that does not exist.',
    ],
    examples: [
      'Expose the seal that lets a dead transit line keep accepting passengers.',
      'Expose the hidden debt binding a magistrate to a forbidden verdict.',
      'Expose the structural flaw in a warded gate before a Breaker acts.',
    ],
  },
  {
    id: 'bridge',
    name: 'Bridge',
    summary: 'Connect two things that share a lawful relation.',
    canDo: [
      'Join matching seals, sworn names, route marks, ledgers, thresholds, or ritual positions.',
      'Let force, sound, passage, evidence, or obligation cross the connection.',
      'Make separated scene elements affect one another.',
    ],
    cannotDo: [
      'Connect unrelated things by convenience alone.',
      'Move an entire scene without an anchor.',
      'Ignore the consequences of what crosses.',
    ],
    examples: [
      'Bridge two doors stamped by the same dead office.',
      'Bridge a victim and their stolen name so a Seeker can trace it.',
      'Bridge a bell tower to the square so one warning reaches the whole crowd.',
    ],
  },
  {
    id: 'nullify',
    name: 'Nullify',
    summary: 'Remove a permission that currently exists.',
    canDo: [
      'Cancel a ward permission, false legal authority, compelled action, active charm, or hostile access.',
      'Make a blocked change possible by removing what forbids it.',
      'Strip a scene element of one named privilege.',
    ],
    cannotDo: [
      'Hold a state in place. That is Seal.',
      'Erase consequences already suffered.',
      'Remove every property of a complex target with one action.',
    ],
    examples: [
      'Nullify a door permission that admits only the dead.',
      'Nullify a contract clause letting a Broker command the room.',
      'Nullify a monster trait that lets it cross consecrated thresholds.',
    ],
  },
];

export const ORDER_MAGIC_EXPRESSIONS: OrderExpression[] = [
  { orderId: 'seeker', expression: 'Seekers use Workings to expose hidden structure, trace source pressure, and name what the scene is trying to conceal.' },
  { orderId: 'breaker', expression: 'Breakers use Workings to nullify barriers, bridge force into sealed systems, and open gaps that ordinary violence cannot reach.' },
  { orderId: 'warden', expression: 'Wardens use Workings to seal boundaries, preserve positions, and buy one more minute before collapse reaches civilians.' },
  { orderId: 'rival', expression: 'Rivals use Workings to formalize contests, expose cheating, bridge terms between challengers, and seal the agreed field.' },
  { orderId: 'broker', expression: 'Brokers use Workings to bind obligations, expose debts, nullify false authority, and bridge factions through terms.' },
  { orderId: 'shade', expression: 'Shades use Workings to expose attention gaps, nullify locks and permissions, and bridge hidden routes through overlooked thresholds.' },
];

export const ARCHETYPAL_CASTINGS: ArchetypalCasting[] = [
  {
    id: 'seeker-ward-sight',
    orderId: 'seeker',
    name: 'Ward Sight',
    verb: 'Expose',
    cost: '1 Exert',
    anchor: 'lens, lantern, archive seal, marked coin, or written question',
    effect: 'Ask the Guide what hidden ward, pressure, false authority, or structural flaw is active in reach.',
    limit: 'It reveals the pressure; it does not disable it.',
  },
  {
    id: 'seeker-source-thread',
    orderId: 'seeker',
    name: 'Source Thread',
    verb: 'Bridge',
    cost: '1 Exert',
    anchor: 'sample, name, wound, residue, route mark, or signed record',
    effect: 'Connect a visible effect to its source long enough to follow direction, relation, or responsible office.',
    limit: 'The bridge points toward the source; it does not guarantee safe passage.',
  },
  {
    id: 'breaker-breach-writ',
    orderId: 'breaker',
    name: 'Breach Writ',
    verb: 'Nullify',
    cost: '1 Exert',
    anchor: 'weapon, demolition charm, broken seal, iron rod, or formal breach phrase',
    effect: 'Remove one named permission protecting a barrier, lock, ward, formation, or mechanism.',
    limit: 'The target can still resist with ordinary strength, guards, mass, or damage thresholds.',
  },
  {
    id: 'breaker-force-carried',
    orderId: 'breaker',
    name: 'Force Carried',
    verb: 'Bridge',
    cost: '1 Exert',
    anchor: 'weapon impact, chain, brace, crack, hinge, or linked support',
    effect: 'Carry the force of one break into one adjacent connected object, position, or ward-anchor.',
    limit: 'The connection must be physically or legally legible in the scene.',
  },
  {
    id: 'warden-threshold-seal',
    orderId: 'warden',
    name: 'Threshold Seal',
    verb: 'Seal',
    cost: '1 Exert',
    anchor: 'shield, oath-chain, ward-stone, chalk line, doorway, or held position',
    effect: 'Hold one boundary closed or stable until the end of the scene or until the anchor breaks.',
    limit: 'The Warden must remain able to maintain the boundary through presence, oath, or line of sight.',
  },
  {
    id: 'warden-civilian-cover',
    orderId: 'warden',
    name: 'Civilian Cover',
    verb: 'Seal',
    cost: '1 Exert',
    anchor: 'field standard, shield, shouted order, marked refuge, or official route sign',
    effect: 'Protect one nearby group from the next environmental Drift consequence that would hit them.',
    limit: 'It delays or redirects the consequence; it does not remove the Drift source.',
  },
  {
    id: 'rival-measured-field',
    orderId: 'rival',
    name: 'Measured Field',
    verb: 'Seal',
    cost: '1 Exert',
    anchor: 'challenge writ, marked glove, trophy, boundary line, or witnessed terms',
    effect: 'Lock a contest into declared terms so both sides know what counts as victory, retreat, or breach.',
    limit: 'A side may still break the terms, but doing so becomes obvious and actionable.',
  },
  {
    id: 'rival-false-start',
    orderId: 'rival',
    name: 'False Start',
    verb: 'Expose',
    cost: '1 Exert',
    anchor: 'starter bell, mirrored charm, racing token, public witness, or named rule',
    effect: 'Reveal cheating, hidden advantage, premature movement, or manipulated timing in a contest.',
    limit: 'It exposes the violation; it does not automatically reverse the result.',
  },
  {
    id: 'broker-binding-term',
    orderId: 'broker',
    name: 'Binding Term',
    verb: 'Seal',
    cost: '1 Exert',
    anchor: 'contract case, seal ring, ledger, witness token, debt chain, or spoken terms',
    effect: 'Make one accepted bargain, debt, passage right, or obligation hold until the scene ends.',
    limit: 'The target must have accepted, owed, signed, witnessed, or materially benefited from the term.',
  },
  {
    id: 'broker-void-authority',
    orderId: 'broker',
    name: 'Void Authority',
    verb: 'Nullify',
    cost: '1 Exert',
    anchor: 'ledger contradiction, seal flaw, unpaid debt, rival writ, or named jurisdiction',
    effect: 'Cancel one false claim of authority, forged permission, invalid debt, or illegal command.',
    limit: 'It removes the claim; it does not create a replacement authority.',
  },
  {
    id: 'shade-unmarked-way',
    orderId: 'shade',
    name: 'Unmarked Way',
    verb: 'Bridge',
    cost: '1 Exert',
    anchor: 'shadowed threshold, false paper, lockpick, mask, overlooked service route, or blind spot',
    effect: 'Connect two overlooked points of access so one person can cross without becoming the scene focus.',
    limit: 'Direct attention, bright scrutiny, or a broken anchor ends the bridge.',
  },
  {
    id: 'shade-dead-permission',
    orderId: 'shade',
    name: 'Dead Permission',
    verb: 'Nullify',
    cost: '1 Exert',
    anchor: 'mask, false name, black knife, mirrored pin, erased mark, or stolen credential',
    effect: 'Remove one lock, watcher, ward, or social rule permission to notice or bar the Shade.',
    limit: 'It affects one named permission, not every observer in the scene.',
  },
];

export const MAGIC_TABLE_PROCEDURE = [
  'Name the intended change in ordinary language.',
  'If the player wants a button to press, choose an Archetypal Casting.',
  'Choose Sanctioned Working, Rupture Casting, or Old Office Rite.',
  'If it is a Sanctioned Working, choose one verb: Seal, Expose, Bridge, or Nullify.',
  'Identify the anchor: seal, oath, tool, body, route mark, rite, ledger, witness, or physical boundary.',
  'Pay the cost, then resolve any contested pressure with the normal Skill and Threshold engine.',
  'Update the Scene Card: what changed, what now holds, and what Drift consequence follows.',
];
