/**
 * Canonical Appendix H (Alpha 0.2).
 * Every Rupture has at least one interested party besides the cell.
 * Decide who, before you decide what the anomaly does.
 */

export interface InterestedParty {
  id: string;
  name: string;
  howItProfits: string;
  atTheTable: string;
  willLine: string;
  body: string;
}

export const INTERESTED_PARTY_DOCTRINE = {
  whyAppendix:
    '"Licensed responders are dispatched to an anomaly and fix it" is a procedure, not a campaign. A procedural needs parties with conflicting interests, or every scene is the cell versus physics. A Rupture is a catastrophe and an opportunity, and in a city this bureaucratic, somebody has already filed paperwork about it.',
  workingRule:
    'Every Rupture has at least one interested party besides the cell. Decide who, before you decide what the anomaly does.',
  pickBeforeCard:
    'Pick one before you write the Scene Card. Their interest becomes your Will box, which is the box Guides most often leave thin. "The crossing wants to preserve routine" is fine. "A clerk from the Third House is already counting the bodies" is a scene.',
  twoParties:
    'Two parties with opposed interests turns a scene into a campaign. Speculators want the ward restored on a schedule; scavengers want the drawer emptied first; both are helpful, and they are helpful in incompatible directions.',
  doNotFight:
    'Interested parties should not fight the cell. They file, delay, buy, arrive early, offer things, and remember what you owe them. Violence is what happens when a faction has run out of better instruments, and in this city there are a great many better instruments.',
  quietDayCosts:
    'Let a Quiet Day cost somebody. Every time the cell restores routine, someone\'s position got worse. Name them, once, on the way out. That is how a procedural becomes a setting.',
  hostileTraceOffList:
    'What answers on a Hostile Trace is not a faction. It is an appetite. Keep it off the interested-parties list in play. It does not negotiate, hold property, or file anything. When a player tries to treat it as a faction, that mistake should cost them.',
} as const;

export const INTERESTED_PARTIES: InterestedParty[] = [
  {
    id: 'accord',
    name: 'The Accord Itself',
    body:
      'The Sixfold Accord licenses the Orders, dispatches the cells, and exists because Ruptures do. A quiet century would dissolve it.\n\nNobody in the Accord wants disaster. Plenty of people in the Accord want a steady, manageable supply of small failures that justify next year\'s warrants, and there is a difference between wanting Ruptures and needing them to keep happening that the Accord has never had to examine out loud.',
    howItProfits:
      'Budget, standing, jurisdiction. A ward that reports no anomalies gets no funding and loses its bells to a wealthier district.',
    atTheTable:
      'The cell is sent late. Or sent to the third-worst problem. Or told to write the report a particular way. A Seeker who traces a Rupture back to an Accord office that delayed a repair order has found the campaign.',
    willLine: 'The office wants this closed by the end of the week, and closed means filed, not fixed.',
  },
  {
    id: 'indemnity-houses',
    name: 'The Indemnity Houses',
    body:
      'Merchants insure cargo, ferries, stalls, and buildings against civic failure. To price that, the houses keep the best records in the city of which wards are drifting, updated faster than the Accord\'s.\n\nThey are also, unavoidably, in the business of betting on failure. A house that has written enough policy against a district\'s collapse profits when the district holds. A house that has bet the other way does not.',
    howItProfits: 'Premiums, and information. They knew the bells had run wide since midwinter. They have known for months.',
    atTheTable:
      'The fastest way to learn a ward is failing is to ask what it now costs to insure. A house will trade that ledger for something. They always want something.',
    willLine: 'A clerk from the Third House is already here, counting, and she got here before you did.',
  },
  {
    id: 'bell-founders',
    name: 'The Bell-Founders and Gate-Wrights',
    body:
      'Somebody casts the bells. Somebody hangs the tollgates, cuts the ledger paper, keeps the ferry chains. These guilds hold the city\'s routine in their hands, and the city cannot fire them.\n\nA guild that repairs quickly is a guild with less work next quarter. Nobody sabotages anything. Orders simply sit in a queue, and the queue is theirs.',
    howItProfits: 'Maintenance contracts, and the pace of them. A ward whose bells need constant attention is an annuity.',
    atTheTable:
      'The repair that would fix everything was ordered in spring and has not been scheduled. Ask why and you will get an answer about materials.',
    willLine: 'The founders will not touch the yoke without a writ, and the writ takes nine days.',
  },
  {
    id: 'speculators',
    name: 'The Speculators',
    body:
      'A ward that ruptures loses value. Rents collapse, tenants leave, and the ground goes cheap. Then it gets re-blessed, the bells get recast, the sequence is restored, and the ward is worth more than it was.\n\nSomebody buys in the gap. Some of them buy just before it.',
    howItProfits: 'The difference between a ruptured ward and a Quiet Day ward, which is enormous.',
    atTheTable:
      'The most dangerous interested party, because their interest is served by the cell succeeding — just not immediately, and not before the papers are signed. They will help you. They will help you slowly.',
    willLine: 'Two consignment halls on this street changed hands last month. The buyer\'s name is on both.',
  },
  {
    id: 'ledger-trade',
    name: 'The Ledger Trade',
    body:
      'A Rupture that touches a court can rewrite what happened. Debts vanish. Debts appear. Verdicts arrive before their hearings. Names enter registers that nobody wrote them into.\n\nThere are people who arrange to be standing near that.',
    howItProfits: 'Obligations erased or manufactured, contracts voided, custody of records nobody can now verify.',
    atTheTable:
      "This is the Broker's nightmare and the Broker's business, and no cell with a Broker in it will ever be fully trusted at a rupture in a counting-house. The Guide should lean on that.",
    willLine: 'The ledger in the hall has the same passage tallied twice in the same hand, and someone came back for the page.',
  },
  {
    id: 'scavengers',
    name: 'The Scavengers',
    body:
      'Old Work only surfaces in Ruptures. Nothing else brings it up. Sealed, forgotten, anchored things become visible and reachable exactly when the pattern fails, and then the pattern gets repaired and they are gone again.\n\nSo there is a trade. Unlicensed, competent, and always three minutes ahead of the cell.',
    howItProfits: 'Relics. Every piece of Old Work reached its owner through somebody like this.',
    atTheTable:
      'The best rival cell in the game. Not villains. Competitors with the same skills, no warrant, and a much better sense of what is worth taking. Restoring the Quiet Day is what destroys their payday.',
    willLine: 'Somebody has already been in the summons office. The drawer is open and the dust is disturbed in a straight line.',
  },
  {
    id: 'unbelled',
    name: 'The Unbelled',
    body:
      'A political faction, and the only one with a case.\n\nTheir argument: routine is not physics, it is obedience dressed as physics. Tollgates on the second, ledgers in unison, the bells telling forty thousand people when to move. They say the Accord has never once tested whether reality needs the bells, or whether the bells need the reality.\n\nSome of them are scholars. Some of them are Rupture Casting in the ferry district on purpose, to see what happens, and what happens is that people die.',
    howItProfits: 'Every Rupture is evidence, and every Accord failure is a recruiting poster.',
    atTheTable:
      'The faction most likely to be right about something while doing damage. Never write them as fanatics. Write them as people who noticed the same thing the players are starting to notice.',
    willLine: 'Somebody has been chalking the same line on the tollgates for a week. Nobody has scrubbed it off.',
  },
  {
    id: 'dead-offices',
    name: 'The Dead Offices',
    body:
      'Here is the strange one.\n\nDuring a Rupture, old permissions resurface. Offices that were dissolved, orders expelled, authorities nobody living remembers begin to work again, briefly, because the pattern that overwrote them has stopped resolving.\n\nSo relic keys open things. Seals from defunct houses bind again. A summons signed two centuries ago finds a hand to serve it.\n\nAnd there are people who maintain those old offices in the dark, keeping the forms and the ledgers current for authorities that have no standing at all, waiting for the next failure to give them back their teeth.',
    howItProfits: 'Standing. Actual power, for as long as the Rupture lasts.',
    atTheTable:
      'An NPC who is legally nobody, holding a writ that is suddenly enforceable. Anchors that only work while things are broken. The oldest game in the city.',
    willLine: 'The seal on that door belongs to a house that was expelled from the ward in the last century, and this morning it is holding.',
  },
];

export const HOSTILE_TRACE_APPETITE = {
  name: 'What Answers on a Hostile Trace',
  body:
    'Not a faction. An appetite. Rupture Casting is loud and something comes. It profits from Ruptures the way weather profits from open ground: it does not want anything from the city, it simply has somewhere to be now that a door has stopped being a door.',
} as const;

export const RUPTURE_TOUCHES = [
  { touches: 'Bells, timing, sequence', who: 'Bell-founders, the Unbelled' },
  { touches: 'A court, a ledger, a register', who: 'The ledger trade, dead offices' },
  { touches: 'Property, a hall, a whole street', who: 'Speculators, indemnity houses' },
  { touches: 'Something sealed or forgotten', who: 'Scavengers, dead offices' },
  { touches: 'Anything at all, reported upward', who: 'The Accord' },
  { touches: 'Anything caused by Rupture Casting', who: 'The thing that answers' },
] as const;

/** @deprecated Use INTERESTED_PARTIES. Kept so older imports still typecheck during the rename. */
export const FACTIONS = INTERESTED_PARTIES;
export const FACTION_DOCTRINE = INTERESTED_PARTY_DOCTRINE;
