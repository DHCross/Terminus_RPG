import { ArrowUp, BookOpen, Flame, Layers, Shield, Sparkles, Swords, Users } from 'lucide-react';
import { rulesSectionLabel, type RulesSection } from './rulesLinks';
import { SKILLS, CIRCLE_MAPPING } from '../../../data/terminus/skills';
import { ORDERS_LIST } from '../../../data/terminus/orders';
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
import { DRIFT_DOCTRINE, DRIFT_MODES, DRIFT_WRITING_RULES } from '../../../data/terminus/drift';
import { WEAPONS, WEAPON_VECTORS } from '../../../data/terminus/weapons';
import { ARMOR_TYPES } from '../../../data/terminus/armor';

// ─── Scene Hook Badge Styles ────────────────────────────────────────────────

const HOOK_STYLES: Record<string, { label: string; color: string }> = {
  ground:  { label: 'Ground',  color: '#64748b' },
  will:    { label: 'Will',    color: '#991b1b' },
  shift:   { label: 'Shift',   color: '#92400e' },
  drift:   { label: 'Drift',   color: '#1e40af' },
  latent:  { label: 'Latent',  color: '#5b21b6' },
};

// ─── Table of Contents ───────────────────────────────────────────────────────

const tocSections: { section: RulesSection; icon: typeof BookOpen }[] = [
  { section: 'core-concepts', icon: BookOpen },
  { section: 'orders', icon: Users },
  { section: 'species', icon: Users },
  { section: 'skills', icon: Swords },
  { section: 'thresholds', icon: Shield },
  { section: 'skill-disciplines', icon: BookOpen },
  { section: 'advancement', icon: Sparkles },
  { section: 'equipment', icon: Swords },
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
        <span className="eyebrow">Alpha Rules Reference</span>
        <h1>Terminus RPG Rules</h1>
        <p className="rules-hero__subtitle">
          The complete Coherence System quick-reference. Every section links to
          related rules; use the table of contents below or browse by topic.
        </p>
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
            <dd>The game and the hidden architecture beneath the world of Tringad.</dd>

            <dt>Tringad</dt>
            <dd>The lived world where ordinary people work, travel, worship, trade, and survive.</dd>

            <dt>Coherence System</dt>
            <dd>The rules engine for pressure, response, scene state, and reality failure.</dd>

            <dt>Routine</dt>
            <dd>Repeated civic, social, legal, religious, and practical patterns that help reality stay stable.</dd>

            <dt>Quiet Day</dt>
            <dd>A day when civilization functions without forcing anyone to become heroic just to survive.</dd>

            <dt>Rupture</dt>
            <dd>Systemic failure that begins when routine breaks and reality loses permissions. See <a href="#scene-cards">Scene Cards</a> and <a href="#rupture-casting">Rupture Casting</a>.</dd>

            <dt>Sixfold Accord</dt>
            <dd>The field-response institution that licenses mixed cells to answer Ruptures.</dd>

            <dt>Order</dt>
            <dd>A recognized response identity. See <a href="#orders">Orders</a>.</dd>

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
            <dd>A magical or civic exception that changes what reality accepts. See <a href="#magic-modes">Magic Modes</a>.</dd>

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

        <p className="rules-lede">
          Six response identities licensed by the Sixfold Accord to answer Ruptures.
          Each Order has a <strong>field function</strong> (what they do), <strong>approaches</strong> (roleplay flavors),
          <strong>signatures</strong> (tools and relics), and <strong>starter abilities</strong>.
        </p>

        <div className="rules-card-grid">
          {ORDERS_LIST.map((order) => (
            <article className="rules-card" key={order.id} id={`order-${order.id}`}>
              <h3>{order.name}</h3>
              <p className="rules-card__function">{order.fieldFunction}</p>

              <div className="rules-card__detail">
                <h4>Approaches</h4>
                <div className="chip-row">
                  {order.approaches.map((a) => <span className="chip" key={a}>{a}</span>)}
                </div>
              </div>

              <div className="rules-card__detail">
                <h4>Signature Tools</h4>
                <div className="chip-row">
                  {order.signatures.map((s) => <span className="chip" key={s}>{s}</span>)}
                </div>
              </div>

              <div className="rules-card__detail">
                <h4>Starter Abilities</h4>
                <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {order.abilities.map((ab) => (
                    <div key={ab.name} style={{ borderLeft: '2px solid var(--color-border)', paddingLeft: '0.75rem' }}>
                      <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '0.15rem' }}>{ab.name}</strong>
                      <p style={{ margin: '0 0 0.35rem', fontSize: '0.875rem' }}>{ab.shortText}</p>
                      {ab.sceneHooks && ab.sceneHooks.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.4rem' }}>
                          {ab.sceneHooks.map((hook) => (
                            <span key={hook} style={{
                              fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.07em',
                              textTransform: 'uppercase', padding: '0.1rem 0.35rem',
                              border: `1px solid ${HOOK_STYLES[hook]?.color ?? '#475569'}`,
                              color: HOOK_STYLES[hook]?.color ?? '#475569',
                              borderRadius: '2px',
                            }}>
                              {HOOK_STYLES[hook]?.label ?? hook}
                            </span>
                          ))}
                        </div>
                      )}
                      {ab.trigger && <p style={{ margin: '0.2rem 0', fontSize: '0.8rem', color: 'var(--color-muted)' }}><em>When:</em> {ab.trigger}</p>}
                      {ab.baseEffect && <p style={{ margin: '0.2rem 0', fontSize: '0.8rem', color: 'var(--color-muted)' }}><em>Effect:</em> {ab.baseEffect}</p>}
                      {ab.exertEffect && <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--color-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '0.3rem', marginTop: '0.3rem' }}><em>Exert:</em> {ab.exertEffect}</p>}
                    </div>
                  ))}
                </div>
              </div>

              <p className="rules-crosslink">
                See <a href="#archetypal-castings">Archetypal Castings</a> for {order.name}-specific Workings.
              </p>
            </article>
          ))}
        </div>

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
          Three core skills govern every action. Each skill maps to a defensive threshold.
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
          At character creation, all three skills start at <strong>{CHARACTER_BASELINE.Force}</strong>.
          Three upgrades are applied: one to <strong>{CREATION_UPGRADES[0].targetDie}</strong> (primary),
          one to <strong>{CREATION_UPGRADES[1].targetDie}</strong> (secondary), and one to{' '}
          <strong>{CREATION_UPGRADES[2].targetDie}</strong> (fallback).
        </p>

        <BackToTop />
      </section>

      {/* ── Thresholds ─────────────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="thresholds" icon={Shield} />

        <p className="rules-lede">
          Thresholds are defensive tracks that absorb pressure. Each maps directly
          to a skill: the die value determines the number of threshold circles.
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
          Weapons have an <strong>Impact</strong> value (1–3) that determines how many
          threshold circles are threatened on a successful hit. Each weapon also has
          <strong> vectors</strong>—situational traits that modify its behavior.
        </p>

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

        <h4>Weapon Vectors</h4>
        <div className="rules-glossary">
          <dl>
            {WEAPON_VECTORS.map((v) => (
              <div key={v.id}>
                <dt>{v.name}</dt>
                <dd>{v.description}</dd>
              </div>
            ))}
          </dl>
        </div>

        <h3>Armor</h3>
        <p className="rules-lede">
          Armor provides <strong>Reduction</strong> (0–2), which subtracts from
          threshold circles lost when hit.
        </p>

        <table className="rules-table">
          <thead>
            <tr>
              <th>Armor</th>
              <th>Reduction</th>
            </tr>
          </thead>
          <tbody>
            {ARMOR_TYPES.map((a) => (
              <tr key={a.id}>
                <td><strong>{a.name}</strong></td>
                <td>{a.reduction}</td>
              </tr>
            ))}
          </tbody>
        </table>

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
          The Scene Card is the Guide's operating surface. It tracks four quadrants
          that define the state of play at every moment.
        </p>

        <div className="rules-card-grid rules-card-grid--2col">
          <article className="rules-card">
            <h3>Ground</h3>
            <p>What is currently reliable, legal, physical, or available in the scene.</p>
            <p className="rules-note">The baseline that characters can count on. When Ground changes, the scene shifts genre.</p>
          </article>
          <article className="rules-card">
            <h3>Will</h3>
            <p>What pressure, agent, monster, faction, system, or mechanism is already acting.</p>
            <p className="rules-note">Active opposition. Will has its own intent and advances independently of the characters.</p>
          </article>
          <article className="rules-card">
            <h3>Shift</h3>
            <p>What changes when characters act.</p>
            <p className="rules-note">Player-driven change. Every successful action updates Shift. Unsuccessful actions still produce Shift—just not the one intended.</p>
          </article>
          <article className="rules-card">
            <h3>Drift</h3>
            <p>What changes if characters do nothing. See <a href="#drift">Scene Drift</a>.</p>
            <p className="rules-note">The scene's autonomous forward pressure. Drift is the clock.</p>
          </article>
        </div>

        <BackToTop />
      </section>

      {/* ── Scene Drift ────────────────────────────────────────────────── */}
      <section className="rules-section">
        <SectionHeading section="drift" icon={Layers} />

        <p className="rules-lede">
          Drift is the core pacing engine. It answers one GM question:
          <strong> what changes if the players do nothing?</strong>
        </p>

        <div className="rules-callout">
          <h3>Drift Doctrine</h3>
          {DRIFT_DOCTRINE.map((d) => (
            <p key={d.title}>
              <strong>{d.title}:</strong> {d.summary}
            </p>
          ))}
        </div>

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
          All contested action uses the same engine. Roll a <a href="#skills">skill die</a>,
          compare to difficulty or opposing roll, apply consequences to <a href="#thresholds">thresholds</a>.
        </p>

        <h3>Resolution Sequence</h3>
        <ol className="procedure-list">
          <li><strong>Declare intent:</strong> What are you trying to change in the fiction?</li>
          <li><strong>Choose approach:</strong> Which skill governs the attempt? Force, Agility, or Willpower?</li>
          <li><strong>Guide sets pressure:</strong> Is this contested, static, or escalated? Apply difficulty.</li>
          <li><strong>Roll the die:</strong> Compare to opposing difficulty or contested roll.</li>
          <li><strong>Apply result:</strong> On success, the intent happens. On failure, the Guide applies pressure to a threshold.</li>
          <li><strong>Update the Scene Card:</strong> Record what changed (Shift) and what the scene does next (Drift).</li>
        </ol>

        <h3>Impact & Reduction</h3>
        <p>
          When a successful attack lands, the attacker's <a href="#equipment">weapon Impact</a> determines
          how many threshold circles are threatened. The defender's <a href="#equipment">armor Reduction</a>
          subtracts from the circles lost. Any remaining loss is applied to the relevant threshold.
        </p>

        <h3>Threshold Loss</h3>
        <p>
          When a threshold reaches zero, the character is <strong>broken</strong> in that dimension:
        </p>
        <ul>
          <li><strong>Endure 0:</strong> Physically incapacitated, unable to act with Force.</li>
          <li><strong>Avoid 0:</strong> Pinned, cornered, or exposed with no tactical room.</li>
          <li><strong>Exert 0:</strong> Mentally overwhelmed, unable to concentrate or cast.</li>
        </ul>

        <p className="rules-note">
          Broken thresholds recover with rest, rites, or scene resolution. The Guide determines
          recovery pacing based on the fiction.
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
