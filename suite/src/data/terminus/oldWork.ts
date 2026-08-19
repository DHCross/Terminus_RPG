import type { WorkingVerb } from './orders';
import type { SignatureCost } from './signatures';

export interface OldWorkItem {
  id: string;
  name: string;
  appearance: string;
  verb: WorkingVerb;
  anchor: string;
  oldHandWanted: string;
  impact?: number;
  vectors?: string[];
  notAWeapon?: boolean;
  property: {
    name: string;
    cost: SignatureCost;
    text: string;
    tableMeaning?: string;
    whileCommitted?: string;
  };
  civic?: boolean;
}

export const OLD_WORK_DOCTRINE = {
  whatItIs:
    'There are no plus-one swords. An enchanted object is Old Work: a Working already sealed into it by a hand long dead. It holds without a caster because someone paid the Exert centuries ago and anchored it permanently.',
  threeParts:
    'Every piece has three parts: the verb sealed into it, what it is anchored to (which is also how to switch it off), and what the old hand wanted. The purpose is still running. It does not care what you want.',
  cost:
    'Old Work uses Signature Property costs: Commit, Mark, or Give. It is not free, and Marking a relic that has held for four hundred years should feel like vandalism.',
  inheritance:
    'None of these were made for you. Every one of them belonged to somebody, and the best version of each is the one with a name in your family attached. Write that name on the card.',
  notPlusOne:
    'None of them grants a bonus. Every one either removes an answer, removes a thing, changes the ground, changes what you know, or turns your own loss into pressure. That is the same category of power a Working has, bought with the object instead of the self.',
} as const;

/** Civic examples from Appendix F.4 — Guide texture, not a martial kit. */
export const OLD_WORK_CIVIC: OldWorkItem[] = [
  {
    id: 'fourth-water-stave',
    name: 'The Fourth Water Stave',
    appearance: 'A stave still damp where no water has touched it.',
    verb: 'Seal',
    anchor: 'An order that no longer has a house. Fails inside any building the order was expelled from.',
    oldHandWanted: 'Wounds closed for good, so the house would not have to keep watching them.',
    civic: true,
    property: {
      name: 'Stay Closed',
      cost: 'Commit',
      text: 'Wounds closed with it stay closed, permanently, no Exert.',
    },
  },
  {
    id: 'gate-warden-rod',
    name: "A gate-warden's rod",
    appearance: 'Municipal brass, the office still stamped in the head.',
    verb: 'Nullify',
    anchor: 'The office of a gate-warden. Only works while you are lawfully holding that post, and it knows.',
    oldHandWanted: 'Every lock installed under municipal authority to open for the person on duty.',
    civic: true,
    property: {
      name: 'Municipal Open',
      cost: 'Commit',
      text: 'Any lock installed under municipal authority opens at a touch.',
    },
  },
  {
    id: 'twinned-seals',
    name: 'The Twinned Seals',
    appearance: 'Two lead seals. What is said over one is heard at the other, across the city.',
    verb: 'Bridge',
    anchor: 'The pair. Separate them far enough and something else can also cross.',
    oldHandWanted: 'A clerk in two wards at once.',
    civic: true,
    property: {
      name: 'Heard Across',
      cost: 'Commit',
      text: 'What is said over one is heard at the other. Anything else can also cross. Something has been listening at the far seal for a long time.',
    },
  },
  {
    id: 'summoners-ledger',
    name: "A summoner's ledger",
    appearance: 'Names written in it reveal where their owner is standing.',
    verb: 'Expose',
    anchor: 'The page. Writing a name enters you in the ledger too. It is a two-way document.',
    oldHandWanted: 'To find people who had made themselves unreachable.',
    civic: true,
    property: {
      name: 'Named Place',
      cost: 'Mark',
      text: 'Names written in it reveal where their owner is standing. Writing a name enters you too.',
    },
  },
];

/** Six martial pieces — Appendix G. */
export const OLD_WORK_MARTIAL: OldWorkItem[] = [
  {
    id: 'border-cutter',
    name: 'The Border-Cutter',
    appearance: 'A longsword with a blade that will not hold a reflection.',
    verb: 'Bridge',
    anchor: 'The edge itself, which is why it cannot be sharpened. Grind it and the Working is gone.',
    oldHandWanted: 'To serve a summons on somebody who had made themselves unreachable. It still thinks every cut is a delivery.',
    impact: 2,
    vectors: ['Quick', 'Carried'],
    property: {
      name: 'Served in Person',
      cost: 'Commit',
      text: 'Commit the blade and it stops treating cover as real. Shields, doors, a body in the way, a held position: none of them are between you and the target anymore, because the blade is bridging the gap rather than crossing it.',
      tableMeaning: 'The target may not answer with Endure. They cannot brace against something that was never on the way in. Avoid and Exert are still open.',
      whileCommitted: 'The sword will not do mundane work. It slides off rope, bread, and knots.',
    },
  },
  {
    id: 'kells-sledge',
    name: "Kell's Sledge",
    appearance: "Your grandfather's, and his mother's before that. Third haft. The head has never been replaced.",
    verb: 'Nullify',
    anchor: 'The head, and the family. It works for anyone who can name the last three people who swung it.',
    oldHandWanted: 'To open a foundry gate during a strike, once, in the rain. It has been looking for that gate ever since.',
    impact: 3,
    vectors: ['Breaks Protection', 'Sundering'],
    property: {
      name: 'Nothing Between',
      cost: 'Mark',
      text: 'Mark the sledge (a split in the haft, the iron bent a little further out of true) and whatever the target was protected by is gone, not degraded. The shield is in pieces, the brace is off, the ward-anchor is cracked through.',
      tableMeaning: 'They are not worse at defending. They have lost the thing they were defending with: the permission is gone outright, and the armor is on the floor. Three Marks and the haft is finished. The head is fine. The head is always fine.',
    },
  },
  {
    id: 'blind-scribe-darts',
    name: "The Blind Scribe's Darts",
    appearance: 'Three needles, black-feathered, in a case meant for pens.',
    verb: 'Nullify',
    anchor: 'Each dart individually. Three uses exist and no more.',
    oldHandWanted: 'To stop a clerk from reading a name aloud in court. It works best on anyone whose power runs through their attention.',
    impact: 1,
    vectors: ['Quiet', 'Bleeding'],
    property: {
      name: 'Struck From Nowhere',
      cost: 'Give',
      text: "Give a dart and take away the target's account of what just happened. They do not know where it came from, who threw it, or where you are now.",
      tableMeaning: 'The target may not answer with Avoid for the rest of the exchange, and cannot act against you next round until somebody tells them where you are. They are not blinded. They are unable to locate the problem, which in a crowd is worse.',
    },
  },
  {
    id: 'wedge-fourth-gate',
    name: 'The Wedge of the Fourth Gate',
    appearance: "A hand's-length of engraved iron, warped along one face.",
    verb: 'Seal',
    anchor: 'The floor, the ground, the stone. It needs somewhere to go in.',
    oldHandWanted: 'To hold a gate shut against a crowd. It does not distinguish between crowds.',
    notAWeapon: true,
    property: {
      name: 'This Far',
      cost: 'Give',
      text: 'Drive it into the floor as a reaction when something is coming at you. The ground it is in stops being passable: buckled, seized, folded, wrong.',
      tableMeaning: 'Anything already in motion toward you arrives into that instead of into you. Impact 3, Carried, and it lands as ordinary pressure through their own chosen Threshold. The wedge stays where you put it, ruined, and the floor stays ruined with it.',
    },
  },
  {
    id: 'brass-rings',
    name: 'The Brass Rings of the Understair',
    appearance: 'Two heavy arm-rings, worn smooth on the inner face.',
    verb: 'Expose',
    anchor: 'Contact with stone, brick, timber, iron. They are useless in open air.',
    oldHandWanted: 'To find people walled up alive. That is what it is still looking for.',
    notAWeapon: true,
    property: {
      name: 'Sounding',
      cost: 'Commit',
      text: 'Commit the rings, put your forearms against a structure, and the building tells you what it is: which wall is hollow, which floor is filled, which beam is carrying everything, where the void is, and whether anything in the void is moving.',
      tableMeaning: 'Then, while committed, your strikes against structures carry Sundering. You are not stronger. You know exactly where the thing wants to fail.',
      whileCommitted: 'While committed you cannot pick a lock, write, or hold anything delicately. Your arms are listening.',
    },
  },
  {
    id: 'threshers-jack',
    name: "Thresher's Jack",
    appearance: 'Boiled leather, a jagged collar, rivets someone replaced badly.',
    verb: 'Bridge',
    anchor: 'The rivets. Each one is a use. Count them before a fight.',
    oldHandWanted: 'To make grappling a mistake. It is indifferent to who is grappling whom.',
    notAWeapon: true,
    property: {
      name: 'Thorn Return',
      cost: 'Mark',
      text: 'This is the only property in the game that triggers on their success. When an enemy wins a close exchange against your Endure, Mark the jack (a rivet pops, the leather tears open) and the collar takes them on the way in.',
      tableMeaning: 'Impact 1, routed through whichever Threshold they have left, before they can press the advantage. Being beaten in close quarters becomes something you can spend. Every Mark makes the jack worse at its actual job.',
    },
  },
];

export const OLD_WORK_LIST = [...OLD_WORK_MARTIAL, ...OLD_WORK_CIVIC];
