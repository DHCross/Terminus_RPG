/* ── Aurel Story Engine & Four Verbs Reference ── */
/* Live interactive component: Ambient Drift Engine simulator + Four Verbs Reference. */

import { useState } from 'react';
import type { WorkingVerb } from './characterData';

const VERB_DESCRIPTIONS: Record<WorkingVerb, { name: string; summary: string; does: string[]; cannot: string[]; color: string; example: string }> = {
  Seal: {
    name: 'Seal',
    summary: 'Lock a state in place.',
    does: [
      'Hold a gate shut, keep a bridge standing, sustain a wound closed, fix a boundary.',
      'Prevent an active collapse or incoming change from completing.',
      'Maintain an ally\'s position against overwhelming pressure.',
    ],
    cannot: [
      'Reveal hidden information (that is Expose).',
      'Create a path where no shared authority exists.',
      'Destroy what it holds.',
    ],
    color: '#10b981',
    example: 'Seal an ancient archway against approaching behemoths while the cell extracts.',
  },
  Expose: {
    name: 'Expose',
    summary: 'Make hidden permission, pressure, or truth legible.',
    does: [
      'Reveal invisible wards, weak points, concealed routes, or ancient compacts.',
      'Turn invisible supernatural pressure into something the cell can target.',
      'Answer one precise question about what holds a barrier together.',
    ],
    cannot: [
      'Solve the revealed problem automatically.',
      'Compel obedience or force a target to yield.',
      'Manufacture evidence that does not exist.',
    ],
    color: '#06b6d4',
    example: 'Expose the glowing rune-seam on a colossus so a Vanguard can strike it.',
  },
  Bridge: {
    name: 'Bridge',
    summary: 'Connect two things sharing a lawful relation across distance or substance.',
    does: [
      'Connect matching thresholds, route marks, sworn names, or ritual positions.',
      'Let force, sound, passage, or divine fortitude cross the connection.',
      'Make separated scene elements affect one another.',
    ],
    cannot: [
      'Join unrelated things by convenience alone.',
      'Move an entire scene without an anchor.',
      'Prevent what crosses back.',
    ],
    color: '#8b5cf6',
    example: 'Bridge two spatial points to step past a canyon without traversing the ground.',
  },
  Nullify: {
    name: 'Nullify',
    summary: 'Remove an existing permission or barrier.',
    does: [
      'Cancel a ward, dispel a binding, shatter a physical lock, or dissolve hostile armor.',
      'Make a blocked change possible by destroying what forbids it.',
      'Strip an enemy of one named privilege or defensive trait.',
    ],
    cannot: [
      'Hold a state in place (that is Seal).',
      'Erase consequences already suffered.',
      'Strip every property of a complex target at once.',
    ],
    color: '#ef4444',
    example: 'Nullify the ward-matrix on an ancient vault door to force an opening.',
  },
};

const DRIFT_LADDER = [
  { level: 0, label: 'Quiet Horizon', desc: 'Sunlight over tall grass. Air is steady; magic flows clean.' },
  { level: 1, label: 'Rustling Seams', desc: 'Leaves rustle in reverse. Shadows stretch slightly out of sync.' },
  { level: 2, label: 'Thermal Glitch', desc: 'Cold flames flicker without burning. Stone arches weep liquid gold.' },
  { level: 3, label: 'Spatial Shear', desc: 'Distance doubles. A shout arrives before the mouth opens.' },
  { level: 4, label: 'Unanchored Surge', desc: 'Local spells trigger secondary flares. Wild elementals manifest.' },
  { level: 5, label: 'Rupture Cascade', desc: 'The valley begins to unspool. Extract now or be lost with the realm.' },
];

export function AurelStoryEngine() {
  const [activeVerb, setActiveVerb] = useState<WorkingVerb>('Seal');
  const [driftLevel, setDriftLevel] = useState<number>(1);
  const [driftLog, setDriftLog] = useState<string[]>([
    'Scene entered: Aurel valley at baseline Drift 1.',
  ]);

  const currentVerb = VERB_DESCRIPTIONS[activeVerb];

  const advanceDrift = (amount: number, reason: string) => {
    setDriftLevel((prev) => {
      const next = Math.min(prev + amount, DRIFT_LADDER.length - 1);
      setDriftLog((logs) => [
        `[+${amount} Drift] ${reason} → Drift now ${next} (${DRIFT_LADDER[next].label})`,
        ...logs.slice(0, 4),
      ]);
      return next;
    });
  };

  const resetDrift = () => {
    setDriftLevel(0);
    setDriftLog(['✨ Drift reset to 0 (Quiet Horizon).']);
  };

  return (
    <div
      style={{
        maxWidth: 740,
        margin: '0 auto',
        background: 'linear-gradient(180deg,#0b1220,#0f172a)',
        border: '1px solid #1e293b',
        borderRadius: 14,
        color: '#e2e8f0',
        fontFamily: "'EB Garamond', serif",
        boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e293b', background: 'linear-gradient(90deg,#111827,#0b1220)' }}>
        <div style={{ fontSize: 10, letterSpacing: '3px', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>
          Coherence System · Aurel Story Engine
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: '#f8fafc' }}>
          The Four Verbs &amp; The Ambient Drift Engine
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', marginTop: 2 }}>
          In Aurel, magic runs on the Four Controlled Verbs, and Drift is the ambient weather.
        </div>
      </div>

      <div style={{ padding: 24, display: 'grid', gap: 24 }}>

        {/* ── Interactive Live Drift Clock (The Weather) ── */}
        <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid #1e293b', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#f59e0b', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>
                Ambient Drift Clock (The Weather)
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>
                In Aurel, Drift climbs on its own every round:
              </div>
            </div>
            <button
              onClick={resetDrift}
              style={{
                fontSize: 10,
                color: '#94a3b8',
                background: 'transparent',
                border: '1px solid #334155',
                borderRadius: 4,
                padding: '3px 8px',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Reset Clock
            </button>
          </div>

          {/* Drift Meter */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {DRIFT_LADDER.map((step) => {
              const active = step.level <= driftLevel;
              const isCurrent = step.level === driftLevel;
              return (
                <div
                  key={step.level}
                  style={{
                    flex: 1,
                    height: 28,
                    borderRadius: 6,
                    background: active
                      ? step.level >= 4
                        ? '#ef444433'
                        : step.level >= 2
                        ? '#f59e0b33'
                        : '#10b98133'
                      : 'rgba(11,18,32,0.6)',
                    border: `1.5px solid ${
                      isCurrent
                        ? '#f8fafc'
                        : active
                        ? step.level >= 4
                          ? '#ef4444'
                          : step.level >= 2
                          ? '#f59e0b'
                          : '#10b981'
                        : '#334155'
                    }`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 800,
                    fontFamily: 'Inter, sans-serif',
                    color: active ? '#f8fafc' : '#475569',
                    boxShadow: isCurrent ? '0 0 10px rgba(245,158,11,0.5)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {step.level}
                </div>
              );
            })}
          </div>

          {/* Current Stage Description */}
          <div style={{ padding: '10px 12px', background: 'rgba(11,18,32,0.8)', border: '1px solid #1e293b', borderRadius: 8, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: driftLevel >= 4 ? '#f87171' : driftLevel >= 2 ? '#fcd34d' : '#6ee7b7' }}>
              Level {driftLevel}: {DRIFT_LADDER[driftLevel].label}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              {DRIFT_LADDER[driftLevel].desc}
            </div>
          </div>

          {/* Drift Simulation Triggers */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => advanceDrift(1, 'Round ended (Ambient Weather)')}
              style={{
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
                color: '#fcd34d',
                background: 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(245,158,11,0.35)',
                borderRadius: 6,
                padding: '6px 12px',
                cursor: 'pointer',
              }}
            >
              ⏳ Advance Round (+1 Ambient Drift)
            </button>
            <button
              onClick={() => advanceDrift(2, 'Local Mage cast Unanchored Fireball')}
              style={{
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
                color: '#fca5a5',
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.35)',
                borderRadius: 6,
                padding: '6px 12px',
                cursor: 'pointer',
              }}
            >
              ⚡ Local Unanchored Casting (+2 Drift)
            </button>
          </div>

          {/* Event Log */}
          {driftLog.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 11, color: '#64748b', fontFamily: 'Inter, sans-serif', borderTop: '1px solid #1e293b', paddingTop: 8 }}>
              {driftLog[0]}
            </div>
          )}
        </div>

        {/* ── The Four Verbs Reference ── */}
        <div>
          <div style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800, fontFamily: 'Inter, sans-serif', marginBottom: 10, borderBottom: '1px solid #1e293b', paddingBottom: 6 }}>
            The Four Controlled Verbs (Alpha 0.2 Canonical §12)
          </div>

          {/* Verb Selector Tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {(['Seal', 'Expose', 'Bridge', 'Nullify'] as WorkingVerb[]).map((v) => {
              const isActive = activeVerb === v;
              const verbColor = VERB_DESCRIPTIONS[v].color;
              return (
                <button
                  key={v}
                  onClick={() => setActiveVerb(v)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: `1.5px solid ${isActive ? verbColor : '#1e293b'}`,
                    background: isActive ? verbColor + '18' : 'rgba(15,23,42,0.5)',
                    color: isActive ? '#f8fafc' : '#94a3b8',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    fontWeight: 700,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {v}
                </button>
              );
            })}
          </div>

          {/* Active Verb Detail Card */}
          <div
            style={{
              background: 'rgba(15,23,42,0.6)',
              border: `1px solid ${currentVerb.color}44`,
              borderRadius: 10,
              padding: '16px 18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: currentVerb.color }}>
                {currentVerb.name}
              </div>
              <div style={{ fontSize: 13, color: '#cbd5e1', fontStyle: 'italic' }}>
                {currentVerb.summary}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', color: '#10b981', fontWeight: 800, fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>
                  ✓ What It Does
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: '#cbd5e1', lineHeight: 1.5 }}>
                  {currentVerb.does.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div style={{ fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', color: '#ef4444', fontWeight: 800, fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>
                  ✗ What It Cannot Do
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: '#94a3b8', lineHeight: 1.5 }}>
                  {currentVerb.cannot.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #1e293b', fontSize: 12, color: '#94a3b8' }}>
              <strong style={{ color: currentVerb.color, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', fontSize: 10, letterSpacing: '1px' }}>Aurel Example: </strong>
              {currentVerb.example}
            </div>
          </div>
        </div>

      </div>

      <div style={{ padding: '10px 24px', borderTop: '1px solid #1e293b', fontSize: 9, color: '#475569', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
        Terminus RPG · Alpha 0.2 Magic &amp; Drift Architecture
      </div>
    </div>
  );
}
