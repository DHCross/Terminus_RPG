export type WorkingVerb = 'Seal' | 'Expose' | 'Bridge' | 'Nullify';

export interface WorkingUpgrade {
  cost: '1 Exert';
  verb?: WorkingVerb;
  text: string;
}

export interface OrderAbility {
  name: string;
  /** Search / compact one-liner. Same voice as the sheet. */
  description: string;
  shortText: string;
  /** Free licensed work. Player-facing. No Scene Card jargon. */
  standingPermission: string;
  workingUpgrades?: WorkingUpgrade[];
  tableTip?: string;
  /** Guide-only. Never print on the civic sheet. */
  guideNote?: string;
  sceneHooks?: Array<'ground' | 'will' | 'shift' | 'drift' | 'latent'>;
}

export interface OrderInfo {
  id: string;
  name: string;
  fieldFunction: string;
  identity: string;
  notThis: string;
  howToPlay: string[];
  approaches: string[];
  signatures: string[];
  signatureTips?: string[];
  abilities: OrderAbility[];
  laterAbilities?: OrderAbility[];
}

export const ORDER_STARTER_PICK = 3;

export const ORDER_DOCTRINE = {
  whatItIs:
    'An Order is a licensed field identity. It is not a job and not a class. It is the answer to one question: when the ordinary world stops working, what are you permitted to do about it?',
  whyMixed:
    'The Sixfold Accord sends mixed cells because no single warrant covers a Rupture. That is the whole reason you are standing next to these people.',
  abilitiesVsWorkings:
    'Order Abilities cost nothing. They are standing permission, the thing your warrant says you may do. Workings are different: they are exceptions to how the world runs. Casters pay Exert. The reckless pay Drift. Signatures pay with the object in your hands.',
  pickThree: `Each Order lists four starter abilities. Choose ${ORDER_STARTER_PICK} at creation.`,
  standing:
    "Every Order's warrant is worth exactly what the ward it is presented in still honors. A Warden's seal means a great deal in the courts around the Arch-Sumner's bells and almost nothing three districts out, where the last three Wardens through were selling their signatures.",
} as const;

export const ORDERS_LIST: OrderInfo[] = [
  {
    id: 'seeker',
    name: 'Seeker',
    fieldFunction: 'Reveals what is hidden, buried, misremembered, false, sealed, or waiting.',
    identity:
      'Seekers read unstable truth in the field, in the rain, with a crowd pressing in. They notice what Seekers notice: the misspelled name, the stair that should not be there, the loop about to close.',
    notThis: 'Seekers are not scholars. A Seeker behind a desk is already too late.',
    howToPlay: [
      'Play this if you want to name the fault and let the cell push it.',
      'Study the thing. Say what you found out loud. Once named, that way is open to everyone.',
      'Ask whose hand made this, and what goes wrong next. You cannot stop the pattern. You get to act into it with your eyes open.',
      'Your lens, lantern, and seal hold Workings open. They are not bonuses.',
    ],
    approaches: ['Reveal', 'Trace', 'Name', 'Expose', 'Interpret'],
    signatures: ['lens', 'lantern', 'grimoire', 'marked coin', 'relic key', 'archive seal'],
    signatureTips: [
      'The lens. What you have revealed stays revealed while you are looking at it. Look away and it closes.',
      'The lantern. Light is a boundary. Inside it you can hold a small thing still or force a hidden way to show itself. When the oil goes, so does the anchor, and the room goes back to what it was.',
      'The archive seal or relic key. Standing, in lead. Press it to a door and the door is shut under an authority the door still recognizes. This works exactly as well as that authority is still worth anything.',
    ],
    abilities: [
      {
        name: 'Weak Point',
        description: 'Study a thing long enough to see how it gives, then name that way for the whole cell.',
        shortText: 'Study a thing long enough to see how it gives. Once named, that way is open to the whole cell.',
        standingPermission:
          'You study a thing long enough to see how it gives. Say what you found: rust in the latch, a joint set wrong, a name misspelled in the writ, an oath sworn to an office that no longer exists.\n\nOnce named, that way is open to the whole cell. Everyone knows where to push.',
        tableTip: 'Requires that you can actually study the thing. Name the fault in fiction, not as a modifier.',
        sceneHooks: ['ground', 'will'],
      },
      {
        name: 'Trace Source',
        description: 'Ask whose hand made the wound, residue, forged seal, or broken ward.',
        shortText: 'Every wound, residue, forged seal, and broken ward was made by a hand. Ask whose.',
        standingPermission:
          'Every wound, residue, forged seal, and broken ward was made by a hand. Ask whose.\n\nYou learn where it came from: route, office, person, or older thing. Not always a name. Sometimes only a direction and the smell of where it has been.',
        workingUpgrades: [
          {
            cost: '1 Exert',
            text: 'Hold the trace open long enough to learn whether the hand is still working, resting, or reaching for something else.',
          },
        ],
        tableTip: 'Ask the Guide whose hand, which office, which route. Accept a direction and a smell if a name is not there.',
        sceneHooks: ['will', 'latent'],
      },
      {
        name: 'Bring to Light',
        description: 'If evidence of a thing exists, you can find the thing.',
        shortText: 'If evidence of a thing exists, you can find it: a stair, a trap, a motive, an old ward.',
        standingPermission:
          'If evidence of a thing exists, you can find the thing: a concealed stair, a trap set into a floor, a motive, a ward laid down so long ago nobody living remembers laying it.',
        workingUpgrades: [
          {
            cost: '1 Exert',
            verb: 'Expose',
            text: 'Pay where something was built specifically to stop you seeing: a sealed boundary, a warded gap, a lie with a signature on it. That is an Expose Working, and it needs your lens, lantern, or seal to hold.',
          },
        ],
        tableTip: 'Free where evidence exists. The Working is for doors that were built to keep you out.',
        sceneHooks: ['ground', 'latent'],
      },
      {
        name: 'Read the Pattern',
        description: 'Watch a thing repeat. Ask the Guide what goes wrong next, and the Guide tells you plainly.',
        shortText: 'Watch the thing repeat. Two turns of it and you know the third. Ask what fails next.',
        standingPermission:
          'You watch the thing repeat. Two turns of it and you know the third.\n\nAsk the Guide what goes wrong next, and the Guide tells you plainly: which gate opens out of order, which line of people steps into the loop, which bell doubles.\n\nYou cannot stop it. You get to act into it with your eyes open.',
        tableTip: 'Ask for the actual next failure, not a hint. Then act. Standing still is not the reward.',
        guideNote:
          'Do not freeze Drift. Drift ticking on hesitation is the pacing engine. Foreknowledge is the stronger version: it rewards the Seeker without rewarding delay.',
        sceneHooks: ['drift', 'shift'],
      },
    ],
  },
  {
    id: 'breaker',
    name: 'Breaker',
    fieldFunction: 'Forces openings.',
    identity:
      'Breach-makers, saboteurs, duelists, siege minds, and liberators. When containment fails, a Breaker is the tool the Accord reaches for and then regrets reaching for.',
    notThis: 'A Breaker is not a wrecking crew. The trained question is whether the thing merely breaks, or whether it opens.',
    howToPlay: [
      'Play this if you want to open what was closed, not just smash it.',
      'When you break a barrier, decide whether it merely breaks or whether it opens — a way through that was not there before.',
      'Go for the thing instead of the hand. Most problems are held up by one object.',
      'Breakage travels. Push the giving into what it was attached to.',
    ],
    approaches: ['Shatter', 'Sever', 'Breach', 'Overwhelm', 'Unmake'],
    signatures: ['hammer', 'axe', 'blade', 'iron rod', 'breaking-charm', 'a broken standard'],
    signatureTips: [
      'The hammer, axe, blade, or iron rod is how you decide a break. It is not a damage bonus.',
      'The breaking-charm holds a Working open on something that should not give.',
      'A broken standard is proof you have already opened something the Accord would rather stay shut.',
    ],
    abilities: [
      {
        name: 'Breach Point',
        description: 'When you break a barrier, lock, ward, shield, or formation, decide whether it merely breaks or opens.',
        shortText: 'When you break a barrier, decide whether it merely breaks or whether it opens.',
        standingPermission:
          'When you break a barrier, lock, ward, shield, or formation, you decide whether it merely breaks or whether it opens. Make a way through that was not there before.',
        tableTip: 'Say the opening in the fiction: a door that now leads, a formation that now has a gap.',
        sceneHooks: ['ground', 'shift'],
      },
      {
        name: 'Overrun',
        description: 'Win with Force and drive them back. Take the ground they were standing on.',
        shortText: 'Win with Force and you do not simply hurt them. Drive them back and take the ground.',
        standingPermission:
          'Win with Force and you do not simply hurt them. Drive them back, put them through the railing, take the ground they were standing on.',
        tableTip: 'Use this when the contest is Force and you want position, not just injury.',
        sceneHooks: ['will', 'shift'],
      },
      {
        name: 'Break the Tool',
        description: 'Go for the thing instead of the hand: the weapon, the focus, the ward-anchor, the brace.',
        shortText: 'Go for the thing instead of the hand. Most problems are held up by one object.',
        standingPermission:
          'Go for the thing instead of the hand: the weapon, the focus, the ward-anchor, the brace, the chain, the mechanism holding it all together.\n\nMost problems are held up by one object. Breakers are trained to find which.',
        tableTip: 'Name the object. If you cannot name it, you are not there yet — study, or ask a Seeker.',
        sceneHooks: ['ground', 'will'],
      },
      {
        name: 'Carry the Break',
        description: 'When something gives, push part of that giving into what it was attached to.',
        shortText: 'Breakage travels. Push part of that giving into the next hinge, beam, or neighboring seal.',
        standingPermission:
          'Breakage travels. When something gives, push part of that giving into what it was attached to: the next hinge along, the beam above, the neighboring seal.',
        workingUpgrades: [
          {
            cost: '1 Exert',
            verb: 'Bridge',
            text: 'Free for one adjacent thing where the connection is visible. Pay 1 Exert to carry it into something joined by law rather than by timber: two doors stamped by the same dead office, two seals sworn on the same day. That is a Bridge Working.',
          },
        ],
        tableTip: 'Visible join is free. A join that exists only on paper costs Exert.',
        sceneHooks: ['ground', 'shift'],
      },
    ],
  },
  {
    id: 'warden',
    name: 'Warden',
    fieldFunction: 'Holds collapse at bay.',
    identity:
      'A Warden is sent where the thing is already coming down, and their job is to still be standing in front of it when it does.',
    notThis: 'Not guards. Guards stand where nothing is happening.',
    howToPlay: [
      'Play this if you want to still be standing in front of the thing that is coming down.',
      'When someone near you is about to lose a Threshold circle, take it yourself instead — if you can get in front of it, and if you are willing.',
      'Name the door, bridge, or boundary you will not leave. Move, and it is just a door again.',
      'Anything trying to get past you deals with you first. That is a fact about where you are standing.',
    ],
    approaches: ['Anchor', 'Shield', 'Hold', 'Interpose', 'Contain'],
    signatures: ['shield', 'staff', 'oath-chain', 'ward-stone', 'field standard', 'iron-bound mantle'],
    signatureTips: [
      'The shield and iron-bound mantle are how you take a blow meant for someone else.',
      'The oath-chain, ward-stone, and field standard are what a Seal Working hangs on when you are not in the doorway.',
      'A staff marks the line. People can see where you have said no further.',
    ],
    abilities: [
      {
        name: 'Hold the Line',
        description: 'When someone near you is about to lose a Threshold circle, take it yourself instead.',
        shortText: 'When someone near you is about to lose a Threshold circle, take it yourself instead.',
        standingPermission:
          'When someone near you is about to lose a Threshold circle, take it yourself instead. You need to be able to get in front of it, and you need to be willing.',
        tableTip: 'Interpose in the fiction first. The circle moves because you stepped in, not because you spent a point.',
        sceneHooks: ['will', 'ground'],
      },
      {
        name: 'Anchor Point',
        description: 'Name one position, door, bridge, or boundary. While you stay, it is harder to force, cross, or bring down.',
        shortText: 'Name one position. While you stay, it is harder to force, cross, or bring down.',
        standingPermission:
          'Name one position, door, bridge, or boundary. While you stay, it is harder to force, cross, or bring down.\n\nMove and it is just a door again.',
        tableTip: 'Say the named place out loud. If you leave it, say that too.',
        sceneHooks: ['ground'],
      },
      {
        name: 'Brace Against It',
        description: 'When you choose Endure, put one person or object behind you. The same pressure does not reach them.',
        shortText: 'When you choose Endure, put one person or object behind you. The same pressure does not reach them.',
        standingPermission:
          'When you choose Endure, you are not only saving yourself. Put one person or object behind you and the same pressure does not reach them.',
        tableTip: 'This fires when you answer with Endure. Name who or what is behind you.',
        sceneHooks: ['will', 'ground'],
      },
      {
        name: 'No Further',
        description: 'Anything trying to get past you deals with you first.',
        shortText: 'Anything trying to get past you deals with you first. Not a threat. A fact about where you are standing.',
        standingPermission:
          'Anything trying to get past you deals with you first. Not a threat. A fact about where you are standing.',
        workingUpgrades: [
          {
            cost: '1 Exert',
            verb: 'Seal',
            text: 'Pay 1 Exert to make it hold when you are not there: a chalk line, a shut gate, a doorway sworn closed until the scene ends or the anchor breaks. That is a Seal Working, and Wardens are the best in the city at it.',
          },
        ],
        tableTip: 'Standing in the way is free. Leaving a closed gate behind you is a Working.',
        sceneHooks: ['ground', 'will'],
      },
    ],
    laterAbilities: [
      {
        name: 'Absorb the Drift',
        description: 'Take the next blow that would have fallen on the room or on someone you are holding.',
        shortText: 'Take the next blow that would have fallen on the room or on someone you are holding.',
        standingPermission:
          'When the room is starting to go, you can take the next blow that would have fallen on someone else or on the thing you are holding. Mark it on Endure. You stay standing; that thing does not get worse this exchange.',
        tableTip: 'Playtest extra. Not on the 0.2 warrant. Do not pause the scene to use this; take the hit and keep moving.',
        guideNote: 'Do not freeze Drift. This is taking a hit so the cell can act, not a pause button.',
        sceneHooks: ['drift', 'will'],
      },
    ],
  },
  {
    id: 'rival',
    name: 'Rival',
    fieldFunction: 'Wins contests of timing, leverage, and momentum.',
    identity:
      'Rivals live inside contests. Races, duels, wagers, chases, comparisons, public humiliation. Where another Order sees a crisis, a Rival sees terms that have not been agreed yet.',
    notThis: 'A Rival is not a duelist-for-hire. The contest is the tool. Winning without terms is just violence.',
    howToPlay: [
      'Play this if you see terms that have not been agreed yet.',
      'Name the contest out loud. Breaking it in front of witnesses costs more than losing would have.',
      'When timing decides it, force the contest before they finish what they were doing.',
      'With an audience, nothing you win or lose is private.',
    ],
    approaches: ['Challenge', 'Outpace', 'Answer', 'Match', 'Humiliate'],
    signatures: ['dueling blade', 'marked glove', 'wager token', 'trophy', 'challenge writ', 'mirrored charm'],
    signatureTips: [
      'The marked glove, wager token, and challenge writ are how terms become visible.',
      'The dueling blade is for a contest you named, not for a brawl you wandered into.',
      'A trophy or mirrored charm is proof the last measure was public. People remember.',
    ],
    abilities: [
      {
        name: 'Call the Contest',
        description: 'Name the terms out loud. If they answer or accept, both of you are bound until someone breaks them.',
        shortText: 'Name the terms out loud. If the other side answers, both of you are bound to them.',
        standingPermission:
          'Name the terms out loud. If the other side answers or accepts, both of you are bound to them until someone breaks them, and breaking them in front of witnesses costs more than losing would have.',
        tableTip: 'Say the terms in a sentence the table can repeat. If nobody answers, there is no contest yet.',
        sceneHooks: ['will', 'shift'],
      },
      {
        name: 'Outpace',
        description: 'When timing decides it, force the contest before they finish what they were doing.',
        shortText: 'When timing decides it, force the contest before they finish what they were doing.',
        standingPermission:
          'When timing decides it, force the contest before they finish what they were doing.',
        tableTip: 'Use this to interrupt a Working, a flight, a signal, or a closing door — anything that needed another moment.',
        sceneHooks: ['shift', 'will'],
      },
      {
        name: 'Turnabout',
        description: 'When someone fails against you, take better ground, better leverage, or their footing.',
        shortText: 'When someone fails against you, take something for it: better ground, leverage, or their footing.',
        standingPermission:
          'When someone fails against you, take something for it: better ground, better leverage, or their footing.',
        tableTip: 'Name what you took. Position is the usual prize; humiliation is for when there is an audience.',
        sceneHooks: ['shift', 'ground'],
      },
      {
        name: 'Public Measure',
        description: 'With an audience, your win or your loss is not private.',
        shortText: 'With an audience, your win or your loss is not private. The rest of the scene treats it differently now.',
        standingPermission:
          'With an audience, your win or your loss is not private. The crowd, the faction, the witness in the doorway: all of them treat the rest of the scene differently now.',
        workingUpgrades: [
          {
            cost: '1 Exert',
            verb: 'Seal',
            text: 'Pay 1 Exert to make agreed terms actually hold, so that stepping outside them is visible to everyone present. That is a Seal Working, and it is the most civilized thing a Rival ever does.',
          },
        ],
        tableTip: 'Need witnesses. A empty alley cannot hold a public measure.',
        sceneHooks: ['will', 'shift'],
      },
    ],
  },
  {
    id: 'broker',
    name: 'Broker',
    fieldFunction: 'Turns agreement, obligation, and faction pressure into action.',
    identity:
      'A Broker works where the agreement is coming apart and the leverage has to be applied now, in the street, in front of the wrong people.',
    notThis: 'Not diplomats. Diplomats work in rooms where everyone intends to keep their word.',
    howToPlay: [
      'Play this if the agreement is coming apart and the leverage has to be applied now.',
      'You do not invent contacts. You remember them, and they are already nearby.',
      'When someone takes your help, mark it. Later, in a scene where it matters, ask to be paid.',
      'A bargain only holds on someone who accepted, owed, signed, witnessed, or profited.',
    ],
    approaches: ['Bind', 'Trade', 'Pressure', 'Reframe', 'Collect'],
    signatures: ['contract case', 'seal ring', 'ledger', 'marked scales', 'debt chain', 'witness token'],
    signatureTips: [
      'The contract case, ledger, and seal ring are how an accepted bargain becomes visible.',
      'Marked scales and a debt chain show what is owed before anyone has to say it.',
      'A witness token means someone else saw the terms. That is often the whole Working.',
    ],
    abilities: [
      {
        name: 'Call in Favor',
        description: 'Bring in one plausible contact, owed service, small resource, or old arrangement already nearby.',
        shortText: 'Bring in one plausible contact, owed service, or old arrangement. You remember them; they are already nearby.',
        standingPermission:
          'Bring in one plausible contact, owed service, small resource, or old arrangement. You do not invent them; you remember them, and they are already nearby.',
        tableTip: 'Ask the Guide who in this ward still owes you, or name someone the fiction already placed.',
        sceneHooks: ['will', 'ground'],
      },
      {
        name: 'Make Terms',
        description: 'Where two sides can hear you, put something on the table that changes what each is willing to risk.',
        shortText: 'Where two sides can hear you, put something on the table that changes what each will risk.',
        standingPermission:
          'Where two sides can hear you, put something on the table that changes what each of them is willing to risk.',
        tableTip: 'Both sides must be able to hear you. Name the offer. If nobody bites, the room has not moved yet.',
        sceneHooks: ['will', 'shift'],
      },
      {
        name: 'Hold the Debt',
        description: 'When someone takes your help, mark it. Later, ask to be paid.',
        shortText: 'When someone takes your help, mark it. Later, in a scene where it matters, ask to be paid.',
        standingPermission:
          'When someone takes your help, mark it. Later, in a scene where it matters, ask to be paid.',
        tableTip: 'Write the name down. Collecting in the same scene is cheap; collecting three scenes later is the point.',
        sceneHooks: ['will', 'latent'],
      },
      {
        name: 'Turn the Room',
        description: 'Show the leverage and watch a hesitant person decide they have a stake after all.',
        shortText: 'Show the leverage and watch one hesitant, neutral, or self-interested person decide they have a stake.',
        standingPermission:
          'Show the leverage and watch one hesitant, neutral, or self-interested person decide they have a stake after all.',
        workingUpgrades: [
          {
            cost: '1 Exert',
            verb: 'Seal',
            text: 'Pay 1 Exert to make an accepted bargain hold as fact: a passage right, a debt, an obligation that stands until the scene ends. That is a Seal Working, and it only works on someone who accepted, owed, signed, witnessed, or profited.',
          },
          {
            cost: '1 Exert',
            verb: 'Nullify',
            text: 'Pay 1 Exert to strip a false claim: a forged permission, an invalid debt, an order given by someone with no standing to give it. That is a Nullify Working. It removes the claim. It does not hand you the authority instead.',
          },
        ],
        tableTip: 'Seal holds a true bargain. Nullify strips a false one. Neither invents standing you do not have.',
        sceneHooks: ['will', 'shift'],
      },
    ],
    laterAbilities: [
      {
        name: 'Foreclose',
        description: 'Name a debt, claim, or bargain already on the table. Until the scene ends, nobody collects except through you.',
        shortText: 'Name a debt already on the table. Until the scene ends, nobody collects except through you.',
        standingPermission:
          'Name a debt, claim, or bargain already on the table. Until the scene ends, nobody collects on it except through you.',
        workingUpgrades: [
          {
            cost: '1 Exert',
            verb: 'Seal',
            text: 'Pay 1 Exert to make that freeze hold as fact until the scene ends.',
          },
        ],
        tableTip: 'Playtest extra. Not on the 0.2 warrant. There must already be a debt; you cannot Foreclose a rumor.',
        sceneHooks: ['will', 'latent'],
      },
    ],
  },
  {
    id: 'shade',
    name: 'Shade',
    fieldFunction: 'Moves through secrecy, misdirection, and reversal.',
    identity:
      'A Shade goes through the places where attention fails: the service stair, the shift change, the clerk who never looks up, the name nobody checks.',
    notThis: 'Shades do not hide. Hiding is what you do when someone is looking.',
    howToPlay: [
      'Play this if you go through where attention fails, not where people hide.',
      'If nobody is watching the way in, you come in without becoming the thing the room is about.',
      'Name the gap in attention out loud. No gap, no passage.',
      'When someone works deception on you, send part of the confusion back at them.',
    ],
    approaches: ['Slip', 'Veil', 'Misdirect', 'Reverse', 'Vanish'],
    signatures: ['mask', 'cloak', 'lockpick set', 'black knife', 'false papers', 'mirrored pin'],
    signatureTips: [
      'False papers and a mask are how you pass a name nobody checks.',
      'The lockpick set and cloak are for the service stair and the shift change — gaps, not invisibility.',
      'A mirrored pin turns their looking back on them. The black knife is for when the gap closes.',
    ],
    abilities: [
      {
        name: 'Unmarked Entry',
        description: 'If nobody is watching the way in, you come in without becoming the thing the room is about.',
        shortText: 'If nobody is watching the way in, you come in without becoming the thing the room is about.',
        standingPermission:
          'If nobody is watching the way in, you come in without becoming the thing the room is about.',
        tableTip: 'If someone is watching, this is not the ability. Find the unwatched way, or use Slip the Boundary.',
        sceneHooks: ['ground', 'shift'],
      },
      {
        name: 'False Trail',
        description: 'Leave something behind that points attention, suspicion, or pursuit somewhere you are not.',
        shortText: 'Leave something behind that points attention, suspicion, or pursuit somewhere you are not.',
        standingPermission:
          'Leave something behind that points attention, suspicion, or pursuit somewhere you are not.',
        tableTip: 'Name what you left and where it points. The Guide plays the pursuit toward that lie.',
        sceneHooks: ['will', 'shift'],
      },
      {
        name: 'Slip the Boundary',
        description: 'Pass a guarded, watched, or socially closed space if you can name the gap in attention.',
        shortText: 'Guarded, watched, or socially closed: you can pass, so long as you can name the gap in attention.',
        standingPermission:
          'Guarded, watched, or socially closed: you can pass, so long as you can name the gap in attention out loud. No gap, no passage.',
        tableTip: 'Say the gap: the clerk who never looks up, the shift change, the name nobody checks. If you cannot name it, you cannot pass.',
        sceneHooks: ['ground', 'will'],
      },
      {
        name: 'Turn It Back',
        description: 'When someone works deception or misdirection on you, send part of the confusion back at them.',
        shortText: 'When someone works deception or misdirection on you, send part of the confusion back at them.',
        standingPermission:
          'When someone works deception or misdirection on you, send part of the confusion back at them.',
        workingUpgrades: [
          {
            cost: '1 Exert',
            verb: 'Nullify',
            text: 'Pay 1 Exert to take away one permission to notice or to bar you: a lock, a watcher, a ward, a rule about who is allowed in this corridor. That is a Nullify Working, and it works on one named thing, not on every pair of eyes in the room.',
          },
        ],
        tableTip: 'The free ability needs someone already working deception on you. The Working names one bar and takes it away.',
        sceneHooks: ['will', 'shift'],
      },
    ],
  },
];

export type OrderId = (typeof ORDERS_LIST)[number]['id'];

export function findOrder(idOrName: string): OrderInfo | undefined {
  const key = idOrName.trim().toLowerCase();
  return ORDERS_LIST.find(
    (order) => order.id === key || order.name.toLowerCase() === key,
  );
}

/** First three starter abilities for the civic sheet. Player voice only. */
export function sheetAbilitiesForOrder(
  idOrName: string,
  count = ORDER_STARTER_PICK,
): Array<{ name: string; desc: string }> {
  const order = findOrder(idOrName);
  if (!order) return [];
  return order.abilities.slice(0, count).map((ability) => ({
    name: ability.name,
    desc: ability.shortText,
  }));
}
