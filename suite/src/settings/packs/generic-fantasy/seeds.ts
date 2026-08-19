import type { FrameVaultRecord } from '../../../shared/frame-vault/types';
import type { CharacterCardData } from './characterData';
import { DIVINE_THEURGIST, DWARVEN_FIGHTER, ELVEN_WIZARD } from './characterData';

type Seed = Omit<FrameVaultRecord, 'id' | 'createdAt'>;

function fromCard(card: CharacterCardData): Seed {
  const abilities = card.abilities.slice(0, 3).map((ability) => ({
    name: ability.name,
    desc: [ability.trigger, ability.effect].filter(Boolean).join(' — '),
  }));

  while (abilities.length < 3) {
    abilities.push({ name: '', desc: '' });
  }

  return {
    name: card.name,
    species: card.origin,
    order: card.legacy,
    approach: `${card.approach}. Signature: ${card.signature}. ${card.legacyRole.fieldFunction}.`,
    background: card.originTrait.effect,
    objective: card.notes || '',
    primaryWeapon: `${card.primaryWeapon.name} (${card.primaryWeapon.impact} Impact, ${card.primaryWeapon.vector})`,
    secondaryItem: card.secondaryWeapon
      ? `${card.secondaryWeapon.name} (${card.secondaryWeapon.impact} Impact)`
      : 'None listed (1 Impact)',
    force: card.skills.force.die,
    agility: card.skills.agility.die,
    willpower: card.skills.willpower.die,
    abilities,
  };
}

export const AUREL_CHARACTER_SEEDS: Seed[] = [
  fromCard(DWARVEN_FIGHTER),
  fromCard(ELVEN_WIZARD),
  fromCard(DIVINE_THEURGIST),
];

export const AUREL_NPC_SEEDS: Seed[] = [
  {
    name: 'Mira of the Long Grass',
    species: 'Human',
    order: 'Village Reeve',
    approach: 'Keeps the well-path swept and the harvest tally honest. Speaks softly until a count is wrong.',
    background: 'A reeve who inherited the bell-rope and the duty to name when the weather turns wrong.',
    objective: 'If ignored, she locks the granary and sends riders for a wandering cell.',
    primaryWeapon: 'Tally staff (1 Impact, No vectors)',
    secondaryItem: 'Harvest ledger (1 Impact)',
    force: 'd6',
    agility: 'd6',
    willpower: 'd8',
    abilities: [
      { name: 'Name the Shortage', desc: 'Expose one missing supply, delayed wagon, or falsified count in the scene.' },
      { name: 'Ring the Bound Bell', desc: 'Call nearby civilians to a known threshold; they will not cross until released.' },
      { name: 'Hold the Tally', desc: 'Force an NPC to pause a transaction or departure until the count is witnessed.' },
    ],
  },
  {
    name: 'Ash-Eye Calden',
    species: 'Elf',
    order: 'Hedge Binder',
    approach: 'Sits upwind of campfires. Trades charms for stories, never for coin first.',
    background: 'A binder who learned Workings from river-stone and wind rather than a sanctioned hall.',
    objective: 'If ignored, they unanchor a small Working and let Drift climb around the party.',
    primaryWeapon: 'River-stone focus (1 Impact, reach / warding)',
    secondaryItem: 'Knotted grass charms (1 Impact)',
    force: 'd4',
    agility: 'd8',
    willpower: 'd8',
    abilities: [
      { name: 'Read the Weather', desc: 'Expose whether the scene Drift is latent, rising, or already spent.' },
      { name: 'Borrow a Verb', desc: 'Offer a one-use Seal or Expose if given a true name or a true debt.' },
      { name: 'Step the Seam', desc: 'Slip one person past a mundane watch by using an unobserved gap in attention.' },
    ],
  },
];
