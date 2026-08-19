import { Link } from 'react-router-dom';
import { ArrowUp, BookOpen, Flame, Layers, Shield, Sparkles, Swords, Users } from 'lucide-react';
import { rulesSectionLabel, type RulesSection } from './rulesLinks';
import { SKILLS, CIRCLE_MAPPING } from '../../../data/terminus/skills';
import { ORDER_DOCTRINE, ORDER_STARTER_PICK, ORDERS_LIST } from '../../../data/terminus/orders';
import { SPECIES_LIST } from '../../../data/terminus/species';
import { ADVANCEMENT_COSTS, THRESHOLD_MAPPING, SKILL_DISCIPLINES, CHARACTER_BASELINE, CREATION_UPGRADES } from '../../../data/terminus/advancement';
import {
  MAGIC_MODES,
  WORKING_VERBS,
  RUPTURE_CASTING_SUBTYPES,
  HOSTILE_TRACE_PROTOCOL,
  ARCHETYPAL_CASTINGS,
  MAGIC_TERMINOLOGY_BOUNDARIES,
  MAGIC_TABLE_PROCEDURE,
} from '../../../data/terminus/magic';
import { DRIFT_DOCTRINE, DRIFT_MODES, DRIFT_TYPES, DRIFT_WRITING_RULES, SCENE_CARD_PREP } from '../../../data/terminus/drift';
import { VECTOR_DOCTRINE, VECTOR_FAMILY_LABELS, WEAPONS, WEAPON_VECTORS, type VectorFamily } from '../../../data/terminus/weapons';
import {
  ARMOR_BUILDS,
  ARMOR_DOCTRINE,
  ARMOR_INTERACTIONS,
  ARMOR_TYPES,
  genericArmorLabel,
  terminusArmorLabel,
} from '../../../data/terminus/armor';
import { SIGNATURE_COSTS, SIGNATURE_DOCTRINE, SIGNATURES, THREE_CURRENCIES } from '../../../data/terminus/signatures';
import { OLD_WORK_CIVIC, OLD_WORK_DOCTRINE, OLD_WORK_MARTIAL } from '../../../data/terminus/oldWork';
import { HOSTILE_TRACE_APPETITE, INTERESTED_PARTIES, INTERESTED_PARTY_DOCTRINE, RUPTURE_TOUCHES } from '../../../data/terminus/factions';

// ─── Table of Contents ───────────────────────────────────────────────────────

const tocSections: { section: RulesSection; icon: typeof BookOpen }[] = [
  { section: 'one-pager', icon: BookOpen },
  { section: 'core-concepts', icon: BookOpen },
  { section: 'orders', icon: Users },
  { section: 'factions', icon: Users },
  { section: 'species', icon: Users },
  { section: 'skills', icon: Swords },
  { section: 'thresholds', icon: Shield },
  { section: 'skill-disciplines', icon: BookOpen },
  { section: 'advancement', icon: Sparkles },
  { section: 'equipment', icon: Swords },
  { section: 'armor', icon: Shield },
  { section: 'signatures', icon: Sparkles },
  { section: 'vectors', icon: Swords },
  { section: 'old-work', icon: Sparkles },
  { section: 'magic-modes', icon: Flame },
  { section: 'working-verbs', icon: Sparkles },
  { section: 'rupture-casting', icon: Flame },
  { section: 'hostile-trace', icon: Shield },
  { section: 'old-office-rites', icon: BookOpen },
  { section: 'archetypal-castings', icon: Sparkles },
  { section: 'scene-cards', icon: Layers },
  { section: 'drift', icon: Layers },
  { section: 'conflict', icon: Swords },
];

function SectionHeading({ section, icon: Icon }: { section: RulesSection; icon: typeof BookOpen }) {
  return (
    <h2 id={section} className="rules-section-heading">
      <Icon size={22} />
      <span>{rulesSectionLabel(section)}</span>
      <a href={`#${section}`} className="rules-anchor" aria-label={`Permalink to ${rulesSectionLabel(section)}`}>
        #
      </a>
    </h2>
  );
}

function BackToTop() {
  return (
    <a href="#rules-top" className="rules-back-to-top" aria-label="Back to top">
      <ArrowUp size={14} /> Top
    </a>
  );
}

// ─── Rules Page ──────────────────────────────────────────────────────────────

export function RulesPage() {
  const diceOrder = ['d4', 'd6', 'd8', 'd10', 'd12'] as const;

  return (
    <div className="rules-page" id="rules-top">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <section className="rules-hero">
        <span className="eyebrow">Alpha 0.2 Rules Reference</span>
        <h1>Terminus RPG Rules</h1>
        <p className="rules-hero__subtitle">
          The complete Coherence System quick-reference. Armor buys an Endure answer.
          Every section links to related rules; use the table of contents below or browse by topic.
        </p>
      </section>

      {/* ── One-page core ─────────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="one-pager" icon={BookOpen} />
        <pre className="rules-callout" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.55, margin: 0 }}>
{`TERMINUS CORE

Skills:      Force / Agility / Willpower
Thresholds:  Force → Endure
             Agility → Avoid
             Willpower → Exert

Die ranks:   d4  d6  d8  d10  d12
Circles:     d4=1  d6=2  d8=3  d10=4  d12=5

Conflict:
  Acting side rolls Skill.
  Responding side chooses Threshold and rolls.
  Higher roll takes control.
  No target number. No to-hit roll. No passive defense.
  Ties favor the responder. Armored defender wins ties.

Armor:
  Named permission. Buys Endure. No reduction.
  Street clothes / Padded / Light / Medium / Heavy / Shield.
  Breaks Protection strips the permission for the scene.

Scene Card (Guide):
  Ground — what is possible?
  Will   — what pressure is active?
  Shift  — what changes when characters act?
  Drift  — what changes if they do nothing?

The map guides players. The Scene Card guides the Guide.
Currencies:    Exert (self) · Drift (world) · the object (Signature)
The goal is not chaos. It is the return of the quiet day.`}
        </pre>
        <BackToTop />
      </section>

      {/* ── Table of Contents ──────────────────────────────────────────── */}
      <nav className="rules-toc" aria-label="Rules table of contents">
        <h2 className="rules-toc__heading">Contents</h2>
        <ol className="rules-toc__list">
          {tocSections.map(({ section, icon: Icon }) => (
            <li key={section}>
              <a href={`#${section}`}>
                <Icon size={16} />
                {rulesSectionLabel(section)}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* ── Core Concepts ──────────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="core-concepts" icon={BookOpen} />

        <div className="rules-glossary">
          <dl>
            <dt>Terminus</dt>
            <dd>The title of this game, and nothing else. No one in the setting has heard the word. It is not a place, a person, a faction, or a piece of lore anyone can discover.</dd>

            <dt>Tringad</dt>
            <dd>The lived world where ordinary people work, travel, worship, trade, and survive. Rain-slicked civic dark fantasy: brass, oxblood ink, bone paper, bells, and load-bearing paperwork.</dd>

            <dt>Coherence System</dt>
            <dd>The rules engine for pressure, response, scene state, and reality failure.</dd>

            <dt>Routine</dt>
            <dd>Repeated civic, social, legal, religious, and practical patterns that hold the world quiet. Stability lives in the aggregate. A single missed bell or stuck gate is nothing.</dd>

            <dt>Quiet Day</dt>
            <dd>The goal of play: a day when ordinary people walk, eat, bargain, and sleep without testing their thresholds. The Orders exist to return this, not to chase adventure.</dd>

            <dt>Rupture</dt>
            <dd>Systemic failure from accumulated degradation across many repetitions — not one thing going wrong once. See <a href="#scene-cards">Scene Cards</a> and <a href="#rupture-casting">Rupture Casting</a>.</dd>

            <dt>Sixfold Accord</dt>
            <dd>The field-response institution that licenses mixed cells to answer Ruptures.</dd>

            <dt>Order</dt>
            <dd>A licensed field identity: what you are permitted to do when the ordinary world stops working. Not a job and not a class. See <a href="#orders">Orders</a>.</dd>

            <dt>Scene Card</dt>
            <dd>The Guide's operating surface for a scene. See <a href="#scene-cards">Scene Cards</a>.</dd>

            <dt>Ground</dt>
            <dd>What is currently reliable, legal, physical, or available in the scene. See <a href="#scene-cards">Scene Cards</a>.</dd>

            <dt>Will</dt>
            <dd>What pressure, agent, monster, faction, system, or mechanism is already acting. See <a href="#scene-cards">Scene Cards</a>.</dd>

            <dt>Shift</dt>
            <dd>What changes when characters act. See <a href="#scene-cards">Scene Cards</a>.</dd>

            <dt>Drift</dt>
            <dd>What changes if characters do nothing. See <a href="#drift">Scene Drift</a>.</dd>

            <dt>Skill</dt>
            <dd>The die a character rolls when acting: Force, Agility, or Willpower. See <a href="#skills">Skills & Die Ladder</a>.</dd>

            <dt>Threshold</dt>
            <dd>The defensive or resistance track that absorbs pressure: Endure, Avoid, or Exert. See <a href="#thresholds">Thresholds</a>.</dd>

            <dt>Endure</dt>
            <dd>Physical wear, bodily pressure, injury, exposure, and force absorbed. See <a href="#thresholds">Thresholds</a>.</dd>

            <dt>Avoid</dt>
            <dd>Position, timing, footing, cover, safe angle, and tactical room preserved or lost. See <a href="#thresholds">Thresholds</a>.</dd>

            <dt>Exert</dt>
            <dd>Inner reserve, concentration, control, fear resistance, social pressure, and magical strain. See <a href="#thresholds">Thresholds</a> and <a href="#magic-modes">Magic Modes</a>.</dd>

            <dt>Working</dt>
            <dd>A magical or civic exception that changes what reality accepts. Casters pay Exert. The reckless pay Drift. See <a href="#magic-modes">Magic Modes</a> and <a href="#signatures">Signatures</a>.</dd>

            <dt>Signature</dt>
            <dd>A thing with standing and a property. Not a bonus. Using it Commits, Marks, or Gives the object. See <a href="#signatures">Signatures</a>.</dd>

            <dt>Armor</dt>
            <dd>A named permission that buys an Endure answer. No reduction, no die, no track. Ties go to the armored defender. See <a href="#armor">Armor Permissions</a>.</dd>

            <dt>Vector</dt>
            <dd>What kind of pressure a weapon is. It takes away the answer the defender wanted to give; it does not pierce a number. One per exchange. See <a href="#vectors">Vectors</a>.</dd>

            <dt>Old Work</dt>
            <dd>A Working sealed into an object by a dead hand. Verb, anchor, and what the old hand still wants. No plus-one swords. See <a href="#old-work">Old Work</a>.</dd>

            <dt>Direct Pressure</dt>
            <dd>Harm the world inflicts with no Threshold answer: a collapsing counting-house, a fall, a room filling with river water. Never an attack. The answer is do not be standing there.</dd>

            <dt>Sanctioned Working</dt>
            <dd>A licensed Working that spends Exert and uses Seal, Expose, Bridge, or Nullify. See <a href="#magic-modes">Magic Modes</a> and <a href="#working-verbs">Working Verbs</a>.</dd>

            <dt>Rupture Casting</dt>
            <dd>An unlicensed Working that costs no Exert but increases Scene Drift and may leave a Hostile Trace. See <a href="#rupture-casting">Rupture Casting</a>.</dd>

            <dt>Hostile Trace</dt>
            <dd>A systemic signal created by Rupture Casting that may draw monsters, rival agents, or deeper architectural response. See <a href="#hostile-trace">Hostile Trace</a>.</dd>

            <dt>Corrections</dt>
            <dd>The hidden function by which the buried order attempts to repair, erase, isolate, or reassign incoherent regions. Guide-side term only; not used in-world.</dd>

            <dt>Correction Body</dt>
            <dd>Accord field classification for a manifested enforcement form. Humanoid or near-humanoid. The word a Sixfold Accord file uses; not what the dockworkers call it.</dd>

            <dt>Correction Instrument</dt>
            <dd>Accord classification for a tool-like manifested form that appears to perform a function rather than enact a will.</dd>

            <dt>Correction Writ</dt>
            <dd>A nonphysical or semi-legal manifestation: impossible notices, unsigned seals, unreceived summons, documents with no sender, redactions already performed.</dd>

            <dt>Correction Office</dt>
            <dd>A location that has begun enforcing its own reality. Not a monster in a room — a room whose Ground has become hostile law.</dd>

            <dt>Unauthorized Correction</dt>
            <dd>Accord classification for an entity acting without a traceable civic source. An admission of ignorance, not a description of behavior.</dd>
          </dl>
        </div>

        <BackToTop />
      </section>

      {/* ── Orders ─────────────────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="orders" icon={Users} />

        <p className="rules-lede">{ORDER_DOCTRINE.whatItIs}</p>
        <p>{ORDER_DOCTRINE.abilitiesVsWorkings}</p>
        <p>{ORDER_DOCTRINE.whyMixed}</p>
        <p className="rules-note">{ORDER_DOCTRINE.pickThree} Full ability text lives on the <Link to="/orders">Orders dossier</Link>, not here.</p>

        <table className="rules-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Field function</th>
              <th>Not this</th>
            </tr>
          </thead>
          <tbody>
            {ORDERS_LIST.map((order) => (
              <tr key={order.id}>
                <td>
                  <a href={`#order-${order.id}`}><strong>{order.name}</strong></a>
                </td>
                <td>{order.fieldFunction}</td>
                <td>{order.notThis}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="rules-note">{ORDER_DOCTRINE.standing}</p>

        <div className="rules-card-grid">
          {ORDERS_LIST.map((order) => (
            <article className="rules-card" key={order.id} id={`order-${order.id}`}>
              <h3>{order.name}</h3>
              <p className="rules-card__function">{order.fieldFunction}</p>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>{order.identity}</p>
              <p className="muted" style={{ fontSize: '0.85rem' }}>{order.howToPlay[0]}</p>
              <p className="rules-crosslink">
                Choose {ORDER_STARTER_PICK} of {order.abilities.length}:{' '}
                {order.abilities.map((ability) => ability.name).join(', ')}. See the{' '}
                <Link to="/orders">Orders dossier</Link>
                {' '}and <a href="#archetypal-castings">Archetypal Castings</a>.
              </p>
            </article>
          ))}
        </div>

        <BackToTop />
      </section>

      {/* ── Who profits ───────────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="factions" icon={Users} />

        <p className="rules-lede">{INTERESTED_PARTY_DOCTRINE.whyAppendix}</p>
        <p><strong>{INTERESTED_PARTY_DOCTRINE.workingRule}</strong></p>

        <div className="rules-card-grid">
          {INTERESTED_PARTIES.map((party) => (
            <article className="rules-card" key={party.id} id={`faction-${party.id}`}>
              <h3>{party.name}</h3>
              {party.body.split('\n\n').map((paragraph) => (
                <p key={paragraph.slice(0, 24)} style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>{paragraph}</p>
              ))}
              <dl>
                <dt>How it profits</dt>
                <dd>{party.howItProfits}</dd>
                <dt>At the table</dt>
                <dd>{party.atTheTable}</dd>
                <dt>Will line</dt>
                <dd><em>{party.willLine}</em></dd>
              </dl>
            </article>
          ))}
        </div>

        <h3>Who profits from what</h3>
        <table className="rules-table">
          <thead>
            <tr>
              <th>Rupture touches…</th>
              <th>Who is already there</th>
            </tr>
          </thead>
          <tbody>
            {RUPTURE_TOUCHES.map((row) => (
              <tr key={row.touches}>
                <td>{row.touches}</td>
                <td>{row.who}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Using them</h3>
        <p>{INTERESTED_PARTY_DOCTRINE.pickBeforeCard}</p>
        <p>{INTERESTED_PARTY_DOCTRINE.twoParties}</p>
        <p>{INTERESTED_PARTY_DOCTRINE.doNotFight}</p>
        <p>{INTERESTED_PARTY_DOCTRINE.quietDayCosts}</p>

        <article className="rules-card">
          <h3>{HOSTILE_TRACE_APPETITE.name}</h3>
          <p>{HOSTILE_TRACE_APPETITE.body}</p>
          <p className="rules-note">{INTERESTED_PARTY_DOCTRINE.hostileTraceOffList}</p>
        </article>

        <BackToTop />
      </section>

      {/* ── Species ────────────────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="species" icon={Users} />

        <p className="rules-lede">
          Five lineages, each with one trait that grants a situational die step-up.
          Species traits are small exceptions that do not replace Order identity.
        </p>

        <div className="rules-card-grid rules-card-grid--3col">
          {SPECIES_LIST.map((species) => (
            <article className="rules-card" key={species.id}>
              <h3>{species.name}</h3>
              <p className="rules-card__function">{species.description}</p>

              {species.homelands && species.homelands.length > 0 && (
                <div className="rules-card__detail">
                  <h4>Homelands</h4>
                  <div className="chip-row">
                    {species.homelands.map((h) => <span className="chip chip--sm" key={h}>{h}</span>)}
                  </div>
                </div>
              )}

              {species.civicRelation && (
                <div className="rules-card__detail">
                  <h4>Civic Relation</h4>
                  <p style={{ fontSize: '0.875rem' }}>{species.civicRelation}</p>
                </div>
              )}

              {species.strainMarker && (
                <div className="rules-card__detail">
                  <h4>Strain Marker</h4>
                  <p style={{ fontSize: '0.875rem', fontStyle: 'italic' }}>{species.strainMarker}</p>
                </div>
              )}

              <div className="rules-card__detail">
                <h4>{species.traitName}</h4>
                <p>{species.traitDescription}</p>
              </div>
            </article>
          ))}
        </div>

        <BackToTop />
      </section>

      {/* ── Skills & Die Ladder ─────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="skills" icon={Swords} />

        <p className="rules-lede">
          Three core skills govern every action. Acting uses the Skill side.
          Resisting uses the <a href="#thresholds">Threshold</a> side. They are the same engine.
          Skills use a <strong>die ladder</strong> from d4 to d12.
        </p>

        <div className="rules-stat-grid">
          <article className="rules-card">
            <h3>{SKILLS.FORCE}</h3>
            <p className="rules-card__function">Power, impact, endurance, physical might.</p>
            <p>Threshold: <a href="#thresholds">Endure</a></p>
          </article>
          <article className="rules-card">
            <h3>{SKILLS.AGILITY}</h3>
            <p className="rules-card__function">Speed, precision, evasion, tactical movement.</p>
            <p>Threshold: <a href="#thresholds">Avoid</a></p>
          </article>
          <article className="rules-card">
            <h3>{SKILLS.WILLPOWER}</h3>
            <p className="rules-card__function">Focus, resistance, social pressure, magical control.</p>
            <p>Threshold: <a href="#thresholds">Exert</a> | Powers <a href="#magic-modes">Magic</a></p>
          </article>
        </div>

        <h3>Die Ladder</h3>
        <div className="rules-die-ladder">
          {diceOrder.map((die, i) => (
            <div className="rules-die-step" key={die}>
              <span className="rules-die-face">{die}</span>
              <span className="rules-die-circles">Circle {CIRCLE_MAPPING[die]}</span>
              {i < diceOrder.length - 1 && <span className="rules-die-arrow">→</span>}
            </div>
          ))}
        </div>

        <p className="rules-note">
          At character creation in this suite, all three skills start at <strong>{CHARACTER_BASELINE.Force}</strong>.
          Three upgrades are applied: one to <strong>{CREATION_UPGRADES[0].targetDie}</strong> (primary),
          one to <strong>{CREATION_UPGRADES[1].targetDie}</strong> (secondary), and one to{' '}
          <strong>{CREATION_UPGRADES[2].targetDie}</strong> (fallback). Alpha Draft 0.2 §6 uses five build steps
          from d4 instead. This generator has not been rebuilt to match; treat the difference as playtest variance,
          not a silent rules change.
        </p>

        <BackToTop />
      </section>

      {/* ── Thresholds ─────────────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="thresholds" icon={Shield} />

        <p className="rules-lede">
          Thresholds absorb pressure. Acting uses the <a href="#skills">Skill</a> side;
          resisting uses the Threshold side. Each maps to a skill: the die value determines
          the number of threshold circles.
        </p>

        <table className="rules-table">
          <thead>
            <tr>
              <th>Skill Die</th>
              <th>Endure</th>
              <th>Avoid</th>
              <th>Exert</th>
            </tr>
          </thead>
          <tbody>
            {diceOrder.map((die) => (
              <tr key={die}>
                <td><strong>{die}</strong></td>
                <td>{THRESHOLD_MAPPING[die]}</td>
                <td>{THRESHOLD_MAPPING[die]}</td>
                <td>{THRESHOLD_MAPPING[die]}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="rules-stat-grid rules-stat-grid--3col">
          <article className="rules-card">
            <h3>Endure</h3>
            <p>Physical wear, bodily pressure, injury, exposure, and force absorbed.</p>
            <p className="rules-note">Derived from <a href="#skills">{SKILLS.FORCE}</a>.</p>
          </article>
          <article className="rules-card">
            <h3>Avoid</h3>
            <p>Position, timing, footing, cover, safe angle, and tactical room preserved or lost.</p>
            <p className="rules-note">Derived from <a href="#skills">{SKILLS.AGILITY}</a>.</p>
          </article>
          <article className="rules-card">
            <h3>Exert</h3>
            <p>Inner reserve, concentration, control, fear resistance, social pressure, and magical strain.</p>
            <p className="rules-note">Derived from <a href="#skills">{SKILLS.WILLPOWER}</a>. Spent for <a href="#magic-modes">Sanctioned Workings</a>.</p>
          </article>
        </div>

        <BackToTop />
      </section>

      {/* ── Skill Disciplines ──────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="skill-disciplines" icon={BookOpen} />

        <p className="rules-lede">
          Six broad categories cover all non-combat character competence. These are
          narrative permissions, not additional dice pools.
        </p>

        <div className="chip-row" style={{ justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          {SKILL_DISCIPLINES.map((d) => (
            <span className="chip" key={d} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
              {d}
            </span>
          ))}
        </div>

        <p className="rules-note">
          Skill Disciplines describe what a character knows and can attempt without rolling.
          When the outcome is contested or uncertain, roll the relevant <a href="#skills">core skill</a> instead.
        </p>

        <BackToTop />
      </section>

      {/* ── Advancement ────────────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="advancement" icon={Sparkles} />

        <p className="rules-lede">
          Characters earn <strong>Advancement Points (AP)</strong> by completing operations.
          AP is spent to step up skill dice, and the cost escalates at each tier.
        </p>

        <table className="rules-table">
          <thead>
            <tr>
              <th>Upgrade</th>
              <th>AP Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>d4 → d6</td>
              <td>{ADVANCEMENT_COSTS.d4_to_d6}</td>
            </tr>
            <tr>
              <td>d6 → d8</td>
              <td>{ADVANCEMENT_COSTS.d6_to_d8}</td>
            </tr>
            <tr>
              <td>d8 → d10</td>
              <td>{ADVANCEMENT_COSTS.d8_to_d10}</td>
            </tr>
            <tr>
              <td>d10 → d12</td>
              <td>{ADVANCEMENT_COSTS.d10_to_d12}</td>
            </tr>
          </tbody>
        </table>

        <p className="rules-note">
          d12 is the maximum. Reaching it requires 30 total AP from baseline d4.
          Each step up also increases the corresponding <a href="#thresholds">threshold</a> by one circle.
        </p>

        <BackToTop />
      </section>

      {/* ── Equipment ──────────────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="equipment" icon={Swords} />

        <h3>Weapons</h3>
        <p className="rules-lede">
          A weapon has two things. <strong>Impact</strong> (0–3) is how much pressure lands when you win.
          <strong>Vector</strong> is what kind of pressure it is, and that is where the interest lives.
          There is nothing to pierce. See <a href="#vectors">Vectors</a>.
        </p>
        <p className="rules-note">{VECTOR_DOCTRINE.impactCeiling}</p>

        <table className="rules-table">
          <thead>
            <tr>
              <th>Weapon</th>
              <th>Impact</th>
              <th>Vectors</th>
            </tr>
          </thead>
          <tbody>
            {WEAPONS.map((w) => (
              <tr key={w.id}>
                <td><strong>{w.name}</strong></td>
                <td>{w.impact}</td>
                <td>
                  <div className="chip-row">
                    {w.vectors.map((v) => (
                      <span className="chip chip--sm" key={v.id} title={v.description}>
                        {v.name}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p>
          Armor is not a second weapon table. It buys an Endure answer. Full grants live in{' '}
          <a href="#armor">Armor Permissions</a>. Armor-Piercing is retired.{' '}
          <a href="#vectors">Breaks Protection</a> strips the permission for the rest of the scene.
        </p>

        <BackToTop />
      </section>

      {/* ── Armor permissions ──────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="armor" icon={Shield} />

        <p className="rules-lede"><strong>{ARMOR_DOCTRINE.theRule}</strong></p>
        <p className="rules-note">{ARMOR_DOCTRINE.canonical}</p>
        <p>{ARMOR_DOCTRINE.how}</p>
        <p>{ARMOR_DOCTRINE.named}</p>
        <p className="rules-note">{ARMOR_DOCTRINE.portable}</p>
        <p className="rules-note">{ARMOR_DOCTRINE.engineLeftover}</p>

        <h3>Tringad offices</h3>
        <p className="rules-lede">
          Named by the work that wears them. A Warden buckles a Sworn Harness the way she swears an oath.
          A Shade would rather keep a Nightjack than ring a Gatecoat through an unmarked door.
        </p>
        <table className="rules-table">
          <thead>
            <tr>
              <th>Armor</th>
              <th>Permission</th>
              <th>You may Endure</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {ARMOR_TYPES.map((piece) => (
              <tr key={`terminus-${piece.id}`}>
                <td><strong>{terminusArmorLabel(piece)}</strong></td>
                <td>{piece.permission ? <em>{piece.permission}</em> : '—'}</td>
                <td>{piece.endure}</td>
                <td>{piece.cost || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Setting-neutral names</h3>
        <p className="rules-lede">
          Same permissions. Use these when the pack is not Tringad: a flak vest is Medium, a hardsuit is Heavy.
        </p>
        <table className="rules-table">
          <thead>
            <tr>
              <th>Armor</th>
              <th>Permission</th>
              <th>You may Endure</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {ARMOR_TYPES.map((piece) => (
              <tr key={`generic-${piece.id}`}>
                <td><strong>{genericArmorLabel(piece)}</strong></td>
                <td>{piece.permission ? <em>{piece.permission}</em> : '—'}</td>
                <td>{piece.endure}</td>
                <td>{piece.genericCost || piece.cost || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Reading the choices</h3>
        <p className="rules-lede">{ARMOR_DOCTRINE.reading}</p>
        <table className="rules-table">
          <thead>
            <tr>
              <th>Build</th>
              <th>What it gets</th>
              <th>What kills it</th>
            </tr>
          </thead>
          <tbody>
            {ARMOR_BUILDS.map((row) => (
              <tr key={row.id}>
                <td><strong>{row.build}</strong></td>
                <td>{row.gets}</td>
                <td>{row.kills}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>{ARMOR_DOCTRINE.shieldFriend}</p>
        <p>{ARMOR_DOCTRINE.mailForBreakers}</p>

        <h3>Interactions</h3>
        <table className="rules-table">
          <thead>
            <tr>
              <th>Interaction</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {ARMOR_INTERACTIONS.map((row) => (
              <tr key={row.id}>
                <td><strong>{row.name}</strong></td>
                <td>{row.result}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Guide notes</h3>
        <p>{ARMOR_DOCTRINE.mailGuide}</p>
        <p>{ARMOR_DOCTRINE.plateGuide}</p>
        <p className="rules-note">{ARMOR_DOCTRINE.noRepair}</p>

        <BackToTop />
      </section>

      {/* ── Signatures ─────────────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="signatures" icon={Sparkles} />

        <p className="rules-lede">{SIGNATURE_DOCTRINE.problem}</p>
        <p>{SIGNATURE_DOCTRINE.notABonus}</p>

        <h3>Three currencies</h3>
        <table className="rules-table">
          <thead>
            <tr>
              <th>Currency</th>
              <th>Who spends it</th>
              <th>What it costs</th>
            </tr>
          </thead>
          <tbody>
            {THREE_CURRENCIES.map((row) => (
              <tr key={row.id}>
                <td><strong>{row.currency}</strong></td>
                <td>{row.who}</td>
                <td>{row.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>The three costs</h3>
        <div className="rules-stat-grid rules-stat-grid--3col">
          {(Object.keys(SIGNATURE_COSTS) as Array<keyof typeof SIGNATURE_COSTS>).map((cost) => (
            <article className="rules-card" key={cost}>
              <h3>{cost}</h3>
              <p>{SIGNATURE_COSTS[cost]}</p>
            </article>
          ))}
        </div>
        <p className="rules-note">{SIGNATURE_DOCTRINE.giveWorthIt}</p>

        <h3>Properties by kind</h3>
        {(['force', 'position', 'office', 'sight'] as const).map((kind) => (
          <div key={kind} className="rules-subsection">
            <h4>
              {kind === 'force' && 'Arms and instruments of force'}
              {kind === 'position' && 'Tools of position and attention'}
              {kind === 'office' && 'Instruments of office'}
              {kind === 'sight' && 'Instruments of sight'}
            </h4>
            <table className="rules-table">
              <thead>
                <tr>
                  <th>Signature</th>
                  <th>Property</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {SIGNATURES.filter((signature) => signature.kind === kind).map((signature) => (
                  <tr key={signature.id}>
                    <td><strong>{signature.name}</strong></td>
                    <td>
                      <em>{signature.property}.</em> {signature.text}
                    </td>
                    <td>{signature.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <p className="rules-crosslink">
          Order lists live on the <Link to="/orders">Orders dossier</Link>. Old Work uses the same costs — see <a href="#old-work">Old Work</a>.
        </p>

        <BackToTop />
      </section>

      {/* ── Vectors ────────────────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="vectors" icon={Swords} />

        <p className="rules-lede">{VECTOR_DOCTRINE.designRule}</p>
        <p><strong>Stacking.</strong> {VECTOR_DOCTRINE.stacking}</p>
        <p className="rules-note">{VECTOR_DOCTRINE.noCrits}</p>

        {(['denial', 'punishment', 'reach', 'delay', 'structural', 'quiet'] as VectorFamily[]).map((family) => (
          <div key={family} className="rules-subsection">
            <h3>{VECTOR_FAMILY_LABELS[family].name}</h3>
            <p className="muted">{VECTOR_FAMILY_LABELS[family].summary}</p>
            <div className="rules-glossary">
              <dl>
                {WEAPON_VECTORS.filter((vector) => vector.family === family).map((vector) => (
                  <div key={vector.id}>
                    <dt>{vector.name}</dt>
                    <dd>
                      {vector.description}
                      {vector.examples ? ` (${vector.examples})` : ''}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        ))}

        <BackToTop />
      </section>

      {/* ── Old Work ───────────────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="old-work" icon={Sparkles} />

        <p className="rules-lede">{OLD_WORK_DOCTRINE.whatItIs}</p>
        <p>{OLD_WORK_DOCTRINE.threeParts}</p>
        <p>{OLD_WORK_DOCTRINE.cost}</p>
        <p className="rules-note">{OLD_WORK_DOCTRINE.inheritance}</p>

        <h3>Six pieces (martial)</h3>
        <div className="rules-card-grid">
          {OLD_WORK_MARTIAL.map((item) => (
            <article className="rules-card" key={item.id}>
              <h3>{item.name}</h3>
              <p className="muted" style={{ fontStyle: 'italic' }}>{item.appearance}</p>
              <div className="chip-row">
                <span className="chip">{item.verb}</span>
                <span className="chip">{item.property.cost}</span>
                {item.impact != null && <span className="chip">Impact {item.impact}</span>}
                {item.notAWeapon && <span className="chip">Not a weapon</span>}
              </div>
              <dl>
                <dt>Anchor / off-switch</dt>
                <dd>{item.anchor}</dd>
                <dt>The old hand wanted</dt>
                <dd>{item.oldHandWanted}</dd>
                <dt>{item.property.name}</dt>
                <dd>{item.property.text}</dd>
                {item.property.tableMeaning && (
                  <>
                    <dt>At the table</dt>
                    <dd>{item.property.tableMeaning}</dd>
                  </>
                )}
              </dl>
            </article>
          ))}
        </div>
        <p className="rules-note">{OLD_WORK_DOCTRINE.notPlusOne}</p>

        <h3>Civic examples</h3>
        <div className="rules-card-grid rules-card-grid--2col">
          {OLD_WORK_CIVIC.map((item) => (
            <article className="rules-card" key={item.id}>
              <h3>{item.name}</h3>
              <div className="chip-row">
                <span className="chip">{item.verb}</span>
                <span className="chip">{item.property.cost}</span>
              </div>
              <p>{item.property.text}</p>
              <p className="rules-note">Anchor: {item.anchor}</p>
            </article>
          ))}
        </div>

        <BackToTop />
      </section>

      {/* ── Magic Modes ────────────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="magic-modes" icon={Flame} />

        <p className="rules-lede">
          Magic changes what reality accepts. It is permission, law, oath, infrastructure,
          rite, and controlled exception before it is spectacle. Three modes are available.
        </p>

        {/* Terminology boundaries */}
        <div className="rules-callout">
          <h3>Terminology Boundaries</h3>
          {MAGIC_TERMINOLOGY_BOUNDARIES.map((b) => (
            <p key={b.title}>
              <strong>{b.title}:</strong> {b.summary}
            </p>
          ))}
        </div>

        <div className="rules-card-grid">
          {MAGIC_MODES.map((mode) => (
            <article className="rules-card" key={mode.id}>
              <h3>{mode.name}</h3>
              <p>{mode.summary}</p>
              <dl>
                <dt>Cost</dt>
                <dd>{mode.cost}</dd>
                <dt>Effect</dt>
                <dd>{mode.effect}</dd>
                <dt>Consequence</dt>
                <dd>{mode.consequence}</dd>
              </dl>
              {mode.id === 'sanctioned-working' && (
                <p className="rules-crosslink">
                  Uses <a href="#working-verbs">Working Verbs</a>.
                </p>
              )}
              {mode.id === 'rupture-casting' && (
                <p className="rules-crosslink">
                  See <a href="#rupture-casting">Rupture Casting subtypes</a> and <a href="#hostile-trace">Hostile Trace</a>.
                </p>
              )}
              {mode.id === 'old-office-rite' && (
                <p className="rules-crosslink">
                  See <a href="#old-office-rites">Old Office Rites</a>.
                </p>
              )}
            </article>
          ))}
        </div>

        <h3>At the Table: Magic Procedure</h3>
        <ol className="procedure-list">
          {MAGIC_TABLE_PROCEDURE.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <p className="rules-crosslink">
          See also: <a href="#working-verbs">Working Verbs</a> · <a href="#rupture-casting">Rupture Casting</a> · <a href="#archetypal-castings">Archetypal Castings</a>
        </p>

        <BackToTop />
      </section>

      {/* ── Working Verbs ──────────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="working-verbs" icon={Sparkles} />

        <p className="rules-lede">
          Four verbs define the controlled vocabulary of Sanctioned Workings.
          They keep the system broad without becoming a spell catalog.
        </p>

        <div className="rules-card-grid rules-card-grid--2col">
          {WORKING_VERBS.map((verb) => (
            <article className="rules-card" key={verb.id} id={`verb-${verb.id}`}>
              <h3>{verb.name}</h3>
              <p className="rules-card__function">{verb.summary}</p>

              <div className="rules-card__detail">
                <h4>Can Do</h4>
                <ul>
                  {verb.canDo.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>

              <div className="rules-card__detail">
                <h4>Cannot Do</h4>
                <ul>
                  {verb.cannotDo.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>

              <div className="rules-card__detail">
                <h4>Examples</h4>
                <div className="chip-row">
                  {verb.examples.map((ex) => <span className="chip" key={ex}>{ex}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="rules-crosslink">
          See <a href="#archetypal-castings">Archetypal Castings</a> for pre-built spells using these verbs.
        </p>

        <BackToTop />
      </section>

      {/* ── Rupture Casting ────────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="rupture-casting" icon={Flame} />

        <p className="rules-lede">
          Rupture Casting is an unlicensed method that spends Scene Drift instead of Exert.
          No spell slot, gate, or permission check stops a character from reaching for it
          if the fiction supports the act—but the cost is systemic.
        </p>

        <div className="rules-card-grid rules-card-grid--2col">
          {RUPTURE_CASTING_SUBTYPES.map((subtype) => (
            <article className="rules-card" key={subtype.id}>
              <div className="chip-row">
                <span className="chip chip--alert">{subtype.driftCost}</span>
              </div>
              <h3>{subtype.name}</h3>
              <dl>
                <dt>Definition</dt>
                <dd>{subtype.definition}</dd>
                <dt>Systemic Cost</dt>
                <dd>{subtype.systemicCost}</dd>
              </dl>
            </article>
          ))}
        </div>

        <p className="rules-crosslink">
          After any Rupture Casting, the Guide must <a href="#hostile-trace">check for Hostile Trace</a>.
        </p>

        <BackToTop />
      </section>

      {/* ── Hostile Trace ──────────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="hostile-trace" icon={Shield} />

        <div className="rules-callout rules-callout--alert">
          <h3>{HOSTILE_TRACE_PROTOCOL.title}</h3>
          <p className="rules-die-check">d10 ≤ current Drift</p>
        </div>

        <ol className="procedure-list">
          {HOSTILE_TRACE_PROTOCOL.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <div className="rules-callout">
          <h4>Probability Examples</h4>
          <div className="chip-row">
            {HOSTILE_TRACE_PROTOCOL.examples.map((ex) => (
              <span className="chip" key={ex}>{ex}</span>
            ))}
          </div>
        </div>

        <BackToTop />
      </section>

      {/* ── Old Office Rites ───────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="old-office-rites" icon={BookOpen} />

        <p className="rules-lede">
          Old Office Rites are lived religious or civic rites that call on an older
          authority recognized by the world. They are not flashy magic but formal
          actions that carry institutional weight.
        </p>

        <article className="rules-card">
          <dl>
            <dt>Cost</dt>
            <dd>Requires time, correct form, symbol, taboo, offering, witness, or location.</dd>
            <dt>Effect</dt>
            <dd>Reduce a related <a href="#magic-modes">Sanctioned Working</a> cost by 1 Exert or extend its duration beyond the scene.</dd>
            <dt>Consequence</dt>
            <dd>Creates a visible obligation, taboo, debt, omen, or institutional trace the Guide can bring back later.</dd>
          </dl>
        </article>

        <BackToTop />
      </section>

      {/* ── Archetypal Castings ────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="archetypal-castings" icon={Sparkles} />

        <p className="rules-lede">
          Pre-built, reliable <a href="#magic-modes">Sanctioned Workings</a> for each Order.
          These are concrete examples of the <a href="#working-verbs">verb engine</a>, not a
          separate spell list.
        </p>

        {ORDERS_LIST.map((order) => {
          const castings = ARCHETYPAL_CASTINGS.filter((c) => c.orderId === order.id);
          if (castings.length === 0) return null;
          return (
            <div key={order.id} className="rules-subsection">
              <h3 id={`castings-${order.id}`}>
                <a href={`#order-${order.id}`}>{order.name}</a> Castings
              </h3>
              <div className="rules-card-grid rules-card-grid--2col">
                {castings.map((casting) => (
                  <article className="rules-card" key={casting.id}>
                    <div className="chip-row">
                      <span className="chip">{casting.verb}</span>
                      <span className="chip">{casting.cost}</span>
                    </div>
                    <h4>{casting.name}</h4>
                    <dl>
                      <dt>Anchor</dt>
                      <dd>{casting.anchor}</dd>
                      <dt>Effect</dt>
                      <dd>{casting.effect}</dd>
                      <dt>Limit</dt>
                      <dd>{casting.limit}</dd>
                    </dl>
                  </article>
                ))}
              </div>
            </div>
          );
        })}

        <BackToTop />
      </section>

      {/* ── Scene Cards ────────────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="scene-cards" icon={Layers} />

        <p className="rules-lede">
          The Scene Card is the Guide's operating surface: Ground, Will, Shift, Drift.
          Four boxes is real prep. If you fill two and wing the rest, Drift — the best feature — becomes optional.
        </p>
        <div className="rules-callout">
          <h3>Minimum viable card</h3>
          <p>{SCENE_CARD_PREP.fillFirst}</p>
          <p>{SCENE_CARD_PREP.fillSecond}</p>
          <p>{SCENE_CARD_PREP.theRest}</p>
        </div>

        <div className="rules-card-grid rules-card-grid--2col">
          <article className="rules-card">
            <h3>Ground</h3>
            <p>What is currently reliable, legal, physical, or available in the scene.</p>
            <p className="rules-note">Can start as one sentence. Thickens in play.</p>
          </article>
          <article className="rules-card">
            <h3>Will</h3>
            <p>What pressure, agent, monster, faction, system, or mechanism is already acting.</p>
            <p className="rules-note">Name who profits from this Rupture staying thin. See <a href="#factions">Who Profits</a>.</p>
          </article>
          <article className="rules-card">
            <h3>Shift</h3>
            <p>What changes when characters act.</p>
            <p className="rules-note">Can start thin. Unsuccessful actions still produce Shift — just not the one intended.</p>
          </article>
          <article className="rules-card">
            <h3>Drift</h3>
            <p>What changes if characters do nothing. See <a href="#drift">Scene Drift</a>.</p>
            <p className="rules-note">Fill this first. Choose a type. Write one executable sentence. Do not wing it.</p>
          </article>
        </div>

        <BackToTop />
      </section>

      {/* ── Scene Drift ────────────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="drift" icon={Layers} />

        <p className="rules-lede">
          Drift is the single most original thing in this game. It answers one Guide question:
          <strong> what happens if they stall?</strong> Pre-answering that is the exact moment most Guides improvise badly.
        </p>

        <div className="rules-callout">
          <h3>Protect the type dial</h3>
          {DRIFT_DOCTRINE.map((d) => (
            <p key={d.title}>
              <strong>{d.title}:</strong> {d.summary}
            </p>
          ))}
        </div>

        <h3>Drift types — what advances the clock</h3>
        <p className="muted">Tringad default is Hesitation. Do not swap the type mid-scene unless the genre actually changed.</p>
        <div className="rules-card-grid rules-card-grid--2col">
          {DRIFT_TYPES.map((type) => (
            <article className="rules-card" key={type.id} id={`drift-${type.id}`}>
              <h3>{type.name}</h3>
              <p className="rules-card__function">{type.feel}</p>
              <dl>
                <dt>What drives the clock</dt>
                <dd>{type.drivesClock}</dd>
                <dt>Where</dt>
                <dd>{type.setting}</dd>
                <dt>At the table</dt>
                <dd>{type.guideUse}</dd>
              </dl>
            </article>
          ))}
        </div>

        <h3>Hazard or trap — what the tick looks like</h3>
        <p className="muted">Shape is not type. Type is why the clock moves. Shape is what you write on the card.</p>
        <div className="rules-card-grid rules-card-grid--2col">
          {DRIFT_MODES.map((mode) => (
            <article className="rules-card" key={mode.id}>
              <h3>{mode.name}</h3>
              <p className="rules-card__function">{mode.test}</p>
              <p><strong>Shape:</strong> {mode.driftShape}</p>
              <div className="rules-card__detail">
                <h4>Examples</h4>
                <ul>
                  {mode.examples.map((ex) => <li key={ex}>{ex}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <h3>Writing Rules</h3>
        <ol className="procedure-list">
          {DRIFT_WRITING_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ol>

        <BackToTop />
      </section>

      {/* ── Conflict Resolution ────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="conflict" icon={Swords} />

        <p className="rules-lede">
          There is no to-hit roll. An attack is not a request for permission to matter.
          The action matters. The question is how the target takes it. Both sides roll.
          There is no target number and no passive defense score.
        </p>

        <h3>Core Exchange</h3>
        <ol className="procedure-list">
          <li><strong>Acting side</strong> chooses Force, Agility, or Willpower.</li>
          <li><strong>Responding side</strong> chooses Endure, Avoid, or Exert.</li>
          <li><strong>Both roll.</strong></li>
          <li><strong>Higher roll</strong> takes control of the exchange.</li>
          <li>Effect, Impact, or Vector resolves.</li>
          <li>The losing side routes the consequence through the chosen Threshold.</li>
        </ol>

        <p>
          The responding side is not required to choose the matching Threshold.
          A target may answer Force with Avoid, or Agility with Exert, if the fiction supports it.
          The attacker declares one <a href="#vectors">Vector</a> before the dice, if the weapon carries any.
        </p>

        <div className="rules-stat-grid rules-stat-grid--3col">
          <article className="rules-card">
            <h3>Endure</h3>
            <p>Taking pressure directly: absorbing impact, bracing, holding the line, staying upright.</p>
            <p className="rules-note">Losing circles means being worn down or physically pressured.</p>
          </article>
          <article className="rules-card">
            <h3>Avoid</h3>
            <p>Refusing pressure by movement, timing, distance, or position.</p>
            <p className="rules-note">Losing circles means running out of clean exits, timing, or safe angles.</p>
          </article>
          <article className="rules-card">
            <h3>Exert</h3>
            <p>Spending inner force to keep control: concentration, fear, a Working, pain, hesitation.</p>
            <p className="rules-note">Losing circles means burning internal reserve. Powerful and limited.</p>
          </article>
        </div>

        <h3>Ties</h3>
        <p>
          Default alpha rule: <strong>ties favor the responding side</strong>.
          When they are answering with an <a href="#armor">armor permission</a>, ties go to the armored defender.
          Optional test rule: a tie means neither side takes full control, but scene pressure increases.
          Use one rule consistently during a playtest.
        </p>

        <h3>Impact, armor, and Threshold loss</h3>
        <p>
          When the acting side takes control of an attack, the attacker's{' '}
          <a href="#equipment">weapon Impact</a> determines how many threshold circles are threatened.
          The defender answers with a Threshold the fiction (and their <a href="#armor">armor permission</a>) still allows.
          Remaining loss is applied to that Threshold.
        </p>

        <h3>Threshold Loss</h3>
        <p>
          Threshold loss is the result of a lost exchange, not a separate attack roll.
          When a threshold reaches zero, the character is <strong>broken</strong> in that dimension:
        </p>
        <ul>
          <li><strong>Endure 0:</strong> Physically incapacitated, unable to act with Force.</li>
          <li><strong>Avoid 0:</strong> Pinned, cornered, or exposed with no tactical room.</li>
          <li><strong>Exert 0:</strong> Mentally overwhelmed, unable to concentrate or hold a Working.</li>
        </ul>

        <p className="rules-note">
          Broken thresholds recover with rest, rites, or scene resolution. The Guide determines
          recovery pacing based on the fiction.
        </p>

        <h3>Emergency checks</h3>
        <p>
          There are no separate saving throw stats. Use these only when something bypasses ordinary
          Threshold play or threatens agency directly: poison, paralysis, domination, forced sleep,
          supernatural fear, sudden entrapment, catastrophic collapse, direct possession, reality correction.
          Do not use them for normal attacks.
        </p>
        <table className="rules-table">
          <thead>
            <tr>
              <th>Check</th>
              <th>Roll</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Heroic</td>
              <td><a href="#skills">Force</a></td>
            </tr>
            <tr>
              <td>Evasive</td>
              <td><a href="#skills">Agility</a></td>
            </tr>
            <tr>
              <td>Mental</td>
              <td><a href="#skills">Willpower</a></td>
            </tr>
          </tbody>
        </table>

        <h3>Direct Pressure</h3>
        <p>
          Some things cannot be answered at all. A collapsing counting-house, a fall from the bell-yoke,
          a sealed room filling with river water: no Threshold applies, and the character loses circles
          from whichever Threshold the fiction dictates. Use this rarely, and never for an attack.
          If a player asks how to defend, the answer is <em>do not be standing there</em> — which is
          what <a href="#drift">Drift</a> was warning about two rounds ago.
        </p>

        <p className="rules-note">
          Optional: if a die rolls its maximum face, the action may trigger a Vector, Order Ability,
          or Signature effect if one applies. {VECTOR_DOCTRINE.noCrits}
        </p>

        <BackToTop />
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="rules-footer">
        <p>
          <BookOpen size={16} /> Terminus RPG Alpha Rules · Coherence System
        </p>
        <p className="muted">
          This document mirrors the live rules data used by the Character Generator,
          Magic Viewer, and Scene Card Forge. All cross-references are hyperlinked.
        </p>
      </footer>
    </div>
  );
}
