/* ── Coherence System Character Card (Interactive Alpha 0.2) ── */
/* Fully interactive tabletop card: dynamic circle tracking, live die roller, */
/* unanchored magic casting simulator, and cinematic hero portrait. */

import { useState } from 'react';
import type { CharacterCardData, DieRank, SkillKey, ThresholdKey, WorkingVerb } from './characterData';
import { DIE_FACES, SKILL_THRESHOLD_LINK } from './characterData';

/* ── Character art registry with optimal focus positions ── */
interface CharacterArtConfig {
  src: string;
  position: string;
}

const CHARACTER_ART: Record<string, CharacterArtConfig> = {
  'Durgrim Ironvow': {
    src: '/art/durgrim-ironvow.jpg',
    position: 'center 14%',
  },
  'Sylarien Moon-Glass': {
    src: '/art/sylarien-moon-glass.jpg',
    position: 'center 10%',
  },
  'Brother Caedmon of the Iron Vow': {
    src: '/art/brother-caedmon.jpg',
    position: 'center 12%',
  },
};

const DEFAULT_ART: CharacterArtConfig = {
  src: '/art/durgrim-ironvow.jpg',
  position: 'center 12%',
};

/* ── Origin themes ── */
interface OriginTheme {
  primary: string;
  secondary: string;
  glow: string;
  badge: string;
  gradient: string;
}

const ORIGIN_THEMES: Record<string, OriginTheme> = {
  Dwarf: {
    primary: '#cd7f32',
    secondary: '#cd7f3266',
    glow: 'rgba(205,127,50,0.4)',
    badge: 'rgba(205,127,50,0.12)',
    gradient: 'linear-gradient(180deg, rgba(11,18,32,0.4) 0%, rgba(11,18,32,0) 25%, rgba(11,18,32,0) 55%, rgba(11,18,32,0.82) 85%, #0b1220 100%)',
  },
  Elf: {
    primary: '#a78bfa',
    secondary: '#a78bfa66',
    glow: 'rgba(167,139,250,0.4)',
    badge: 'rgba(167,139,250,0.12)',
    gradient: 'linear-gradient(180deg, rgba(11,18,32,0.4) 0%, rgba(11,18,32,0) 25%, rgba(11,18,32,0) 55%, rgba(11,18,32,0.82) 85%, #0b1220 100%)',
  },
  Human: {
    primary: '#f59e0b',
    secondary: '#f59e0b66',
    glow: 'rgba(245,158,11,0.4)',
    badge: 'rgba(245,158,11,0.12)',
    gradient: 'linear-gradient(180deg, rgba(11,18,32,0.4) 0%, rgba(11,18,32,0) 25%, rgba(11,18,32,0) 55%, rgba(11,18,32,0.82) 85%, #0b1220 100%)',
  },
};

const DEFAULT_THEME: OriginTheme = {
  primary: '#64748b',
  secondary: '#64748b66',
  glow: 'rgba(100,116,139,0.3)',
  badge: 'rgba(100,116,139,0.12)',
  gradient: 'linear-gradient(180deg, rgba(11,18,32,0.4) 0%, rgba(11,18,32,0) 25%, rgba(11,18,32,0) 55%, rgba(11,18,32,0.82) 85%, #0b1220 100%)',
};

const VERB_COLORS: Record<WorkingVerb, string> = {
  Seal: '#10b981',    // green
  Expose: '#06b6d4',  // cyan
  Bridge: '#8b5cf6',  // purple
  Nullify: '#ef4444', // red
};

function getTheme(origin: string): OriginTheme {
  return ORIGIN_THEMES[origin] ?? DEFAULT_THEME;
}

/* ── Die-face SVG glyphs ── */
function DieFace({ die, color, isRolling }: { die: DieRank; color: string; isRolling?: boolean }) {
  const size = 36;
  const animStyle: React.CSSProperties = isRolling
    ? { transform: 'rotate(360deg) scale(1.15)', transition: 'transform 0.4s ease' }
    : { transition: 'transform 0.2s ease' };

  const shapes: Record<DieRank, React.ReactNode> = {
    d4: (
      <svg width={size} height={size} viewBox="0 0 36 36" style={animStyle}>
        <polygon points="18,4 34,32 2,32" fill={color + '20'} stroke={color} strokeWidth="1.75" />
        <text x="18" y="27" textAnchor="middle" fontSize="11" fontWeight="800" fontFamily="Inter,sans-serif" fill={color}>{die}</text>
      </svg>
    ),
    d6: (
      <svg width={size} height={size} viewBox="0 0 36 36" style={animStyle}>
        <rect x="4" y="4" width="28" height="28" rx="5" fill={color + '20'} stroke={color} strokeWidth="1.75" />
        <text x="18" y="23" textAnchor="middle" fontSize="11" fontWeight="800" fontFamily="Inter,sans-serif" fill={color}>{die}</text>
      </svg>
    ),
    d8: (
      <svg width={size} height={size} viewBox="0 0 36 36" style={animStyle}>
        <polygon points="18,3 33,18 18,33 3,18" fill={color + '20'} stroke={color} strokeWidth="1.75" />
        <text x="18" y="23" textAnchor="middle" fontSize="11" fontWeight="800" fontFamily="Inter,sans-serif" fill={color}>{die}</text>
      </svg>
    ),
    d10: (
      <svg width={size} height={size} viewBox="0 0 36 36" style={animStyle}>
        <polygon points="18,3 32,12 32,24 18,33 4,24 4,12" fill={color + '20'} stroke={color} strokeWidth="1.75" />
        <text x="18" y="23" textAnchor="middle" fontSize="10" fontWeight="800" fontFamily="Inter,sans-serif" fill={color}>{die}</text>
      </svg>
    ),
    d12: (
      <svg width={size} height={size} viewBox="0 0 36 36" style={animStyle}>
        <polygon points="18,2 28,7 34,17 30,28 20,34 16,34 6,28 2,17 8,7" fill={color + '20'} stroke={color} strokeWidth="1.75" />
        <text x="18" y="23" textAnchor="middle" fontSize="10" fontWeight="800" fontFamily="Inter,sans-serif" fill={color}>{die}</text>
      </svg>
    ),
  };
  return <span style={{ display: 'inline-flex', alignItems: 'center' }}>{shapes[die]}</span>;
}

export function CoherenceCharacterCard({ character: c }: { character: CharacterCardData }) {
  const theme = getTheme(c.origin);

  // ── State: Interactive Threshold Circles (depletion tracking)
  const [circles, setCircles] = useState<Record<ThresholdKey, number>>({
    endure: c.thresholds.endure,
    avoid: c.thresholds.avoid,
    exert: c.thresholds.exert,
  });

  // ── State: Interactive Live Die Roller
  const [rollResult, setRollResult] = useState<{ skill: string; die: DieRank; value: number } | null>(null);
  const [rollingSkill, setRollingSkill] = useState<string | null>(null);

  // ── State: Unanchored Drift Tracker simulation
  const [driftSurge, setDriftSurge] = useState<number | null>(null);
  const [lastCastingMessage, setLastCastingMessage] = useState<string | null>(null);

  const skillKeys: SkillKey[] = ['force', 'agility', 'willpower'];
  const thresholdKeys: ThresholdKey[] = ['endure', 'avoid', 'exert'];

  const SKILL_LABELS: Record<SkillKey, string> = { force: 'Force', agility: 'Agility', willpower: 'Willpower' };
  const THRESHOLD_LABELS: Record<ThresholdKey, string> = { endure: 'Endure', avoid: 'Avoid', exert: 'Exert' };
  const THRESHOLD_HINTS: Record<ThresholdKey, string> = {
    endure: 'absorbs impact · linked to Force',
    avoid: 'refuses pressure via position · linked to Agility',
    exert: 'inner reserve & magic fuel · linked to Willpower',
  };

  // Toggle a single circle pip on/off
  const toggleCircle = (threshold: ThresholdKey, index: number) => {
    setCircles((prev) => {
      const current = prev[threshold];
      // If clicking on active circle, reduce to index; if clicking inactive, increase to index + 1
      const next = index < current ? index : index + 1;
      return { ...prev, [threshold]: next };
    });
  };

  const resetAllCircles = () => {
    setCircles({
      endure: c.thresholds.endure,
      avoid: c.thresholds.avoid,
      exert: c.thresholds.exert,
    });
    setLastCastingMessage('✨ All Threshold circles restored to full.');
  };

  // Roll a skill die live with animation
  const handleRollSkill = (sk: SkillKey) => {
    const die = c.skills[sk].die;
    const maxFaces = DIE_FACES[die];
    setRollingSkill(sk);

    setTimeout(() => {
      const val = Math.floor(Math.random() * maxFaces) + 1;
      setRollResult({ skill: SKILL_LABELS[sk], die, value: val });
      setRollingSkill(null);
    }, 250);
  };

  // Simulate casting a working (Sanctioned vs Unanchored)
  const handleCastWorking = (workingName: string, unanchored: boolean) => {
    if (unanchored) {
      const surge = Math.random() > 0.5 ? 2 : 1;
      setDriftSurge(surge);
      setLastCastingMessage(`⚡ ${c.name} cast "${workingName}" UNANCHORED! 0 Exert spent. Scene Drift climbed +${surge}!`);
    } else {
      if (circles.exert > 0) {
        setCircles((prev) => ({ ...prev, exert: prev.exert - 1 }));
        setDriftSurge(null);
        setLastCastingMessage(`🔮 ${c.name} cast "${workingName}" as a Sanctioned Working. Marked 1 Exert circle (Drift holds quiet at +0).`);
      } else {
        setLastCastingMessage(`⚠️ Cannot cast Sanctioned: Exert is exhausted! Must cast Unanchored or recover.`);
      }
    }
  };

  const artConfig = CHARACTER_ART[c.name] ?? DEFAULT_ART;

  return (
    <div
      style={{
        maxWidth: 740,
        margin: '0 auto',
        background: 'linear-gradient(180deg,#0b1220 0%, #0f172a 100%)',
        border: `1px solid ${theme.secondary}`,
        borderRadius: 16,
        color: '#e2e8f0',
        fontFamily: "'EB Garamond', serif",
        boxShadow: `0 22px 70px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)`,
        overflow: 'hidden',
      }}
    >
      {/* ── Cinematic Portrait Band ── */}
      <div style={{ position: 'relative', height: 380, overflow: 'hidden' }}>
        <img
          src={artConfig.src}
          alt={c.name}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: artConfig.position,
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: theme.gradient }} />
        
        {/* Top badges */}
        <div style={{ position: 'absolute', top: 16, left: 20, display: 'flex', gap: 8, zIndex: 2 }}>
          <span
            style={{
              fontSize: 10,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: theme.primary,
              fontWeight: 800,
              fontFamily: 'Inter, sans-serif',
              background: 'rgba(11,18,32,0.85)',
              border: `1px solid ${theme.secondary}`,
              borderRadius: 6,
              padding: '4px 10px',
              backdropFilter: 'blur(6px)',
            }}
          >
            {c.legacy}
          </span>
          <span
            style={{
              fontSize: 10,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#94a3b8',
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              background: 'rgba(11,18,32,0.8)',
              border: '1px solid #1e293b',
              borderRadius: 6,
              padding: '4px 10px',
              backdropFilter: 'blur(6px)',
            }}
          >
            {c.approach}
          </span>
        </div>

        {/* Level badge */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 20,
            background: 'rgba(11,18,32,0.85)',
            border: `1px solid ${theme.secondary}`,
            borderRadius: 10,
            padding: '6px 14px',
            backdropFilter: 'blur(6px)',
            textAlign: 'center',
            zIndex: 2,
          }}
        >
          <div style={{ fontSize: 9, letterSpacing: '2px', color: theme.primary, fontWeight: 800, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}>Level</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: theme.primary, lineHeight: 1, fontFamily: 'Inter, sans-serif' }}>{c.level}</div>
        </div>

        {/* Character Title at bottom of banner */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 24px 20px', zIndex: 2 }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#f8fafc', lineHeight: 1.1, textShadow: '0 3px 15px rgba(0,0,0,0.9)' }}>
            {c.name}
          </div>
          <div style={{ fontSize: 13.5, color: '#cbd5e1', marginTop: 4, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            <span style={{ color: theme.primary, fontWeight: 600 }}>{c.origin}</span>
            <span style={{ margin: '0 6px', color: '#475569' }}>·</span>
            <span style={{ color: '#e2e8f0' }}>{c.legacyRole.fieldFunction}</span>
          </div>
        </div>
      </div>

      {/* ── Interactive Card Body ── */}
      <div style={{ padding: 24, display: 'grid', gap: 22 }}>

        {/* Origin Trait Banner */}
        <div
          style={{
            border: `1px solid ${theme.secondary}`,
            borderRadius: 10,
            padding: '12px 16px',
            background: theme.badge,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 9.5, letterSpacing: '2px', textTransform: 'uppercase', color: theme.primary, fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>
              Origin Trait — {c.origin}
            </div>
            <div style={{ color: '#f8fafc', fontSize: 14.5, fontWeight: 700, marginTop: 2 }}>{c.originTrait.name}</div>
            <div style={{ fontSize: 12.5, color: '#94a3b8', lineHeight: 1.5, marginTop: 2 }}>{c.originTrait.effect}</div>
          </div>
          <div
            style={{
              fontSize: 11,
              color: theme.primary,
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              background: 'rgba(11,18,32,0.6)',
              border: `1px solid ${theme.secondary}`,
              borderRadius: 6,
              padding: '6px 12px',
              whiteSpace: 'nowrap',
            }}
          >
            {c.originTrait.mechanical}
          </div>
        </div>

        {/* ── Live Interactive Resolution Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* Action Skills (Click to Roll) */}
          <div style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid #1e293b', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>
                Action Skills
              </span>
              <span style={{ fontSize: 10, color: theme.primary, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                (Click die to roll)
              </span>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              {skillKeys.map((sk) => {
                const skill = c.skills[sk];
                const isRolling = rollingSkill === sk;
                return (
                  <div
                    key={sk}
                    onClick={() => handleRollSkill(sk)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: 'rgba(11,18,32,0.7)',
                      border: '1px solid #1e293b',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = theme.primary)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1e293b')}
                  >
                    <div>
                      <div style={{ color: '#f8fafc', fontSize: 14, fontWeight: 700 }}>{SKILL_LABELS[sk]}</div>
                      <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
                        Linked → {SKILL_THRESHOLD_LINK[sk]}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <DieFace die={skill.die} color={theme.primary} isRolling={isRolling} />
                      <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>🎲</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resisting Thresholds (Click to Mark/Unmark Circles) */}
          <div style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid #1e293b', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>
                Resisting Thresholds
              </span>
              <button
                onClick={resetAllCircles}
                style={{
                  fontSize: 10,
                  color: '#94a3b8',
                  background: 'transparent',
                  border: '1px solid #334155',
                  borderRadius: 4,
                  padding: '2px 6px',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Reset All
              </button>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {thresholdKeys.map((tk) => {
                const max = c.thresholds[tk];
                const current = circles[tk];
                return (
                  <div key={tk} style={{ background: 'rgba(11,18,32,0.7)', border: '1px solid #1e293b', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ color: '#f8fafc', fontSize: 14, fontWeight: 700 }}>{THRESHOLD_LABELS[tk]}</span>
                      <span style={{ fontSize: 11, color: current > 0 ? theme.primary : '#ef4444', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>
                        {current} / {max} Circles
                      </span>
                    </div>

                    {/* Interactive Circles */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      {Array.from({ length: max }, (_, i) => {
                        const filled = i < current;
                        return (
                          <button
                            key={i}
                            onClick={() => toggleCircle(tk, i)}
                            title={filled ? `Click to mark circle ${i + 1}` : `Click to restore circle ${i + 1}`}
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              background: filled ? theme.primary + '33' : 'transparent',
                              border: `2px solid ${filled ? theme.primary : '#475569'}`,
                              boxShadow: filled ? `0 0 8px ${theme.glow}, inset 0 0 4px ${theme.glow}` : 'none',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0,
                            }}
                          >
                            {filled && (
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: theme.primary }} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ fontSize: 10.5, color: '#64748b', fontFamily: 'Inter, sans-serif', marginTop: 4, fontStyle: 'italic' }}>
                      {THRESHOLD_HINTS[tk]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Roll Result HUD (if rolled) */}
        {rollResult && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              background: 'linear-gradient(90deg, rgba(245,158,11,0.15), rgba(11,18,32,0.8))',
              border: '1px solid #f59e0b55',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 22 }}>🎲</span>
              <div>
                <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
                  Live Core Exchange Roll
                </div>
                <div style={{ fontSize: 14, color: '#f8fafc', fontWeight: 600 }}>
                  {rollResult.skill} ({rollResult.die}) result: <strong style={{ color: '#f59e0b', fontSize: 18 }}>{rollResult.value}</strong>
                </div>
              </div>
            </div>
            <button
              onClick={() => setRollResult(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Live Action/Casting Status Banner */}
        {lastCastingMessage && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: driftSurge ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
              border: `1px solid ${driftSurge ? '#ef444455' : '#10b98155'}`,
              fontSize: 12.5,
              color: driftSurge ? '#fca5a5' : '#6ee7b7',
              fontFamily: 'Inter, sans-serif',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{lastCastingMessage}</span>
            <button
              onClick={() => setLastCastingMessage(null)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Armament & Protection (Impact & Vector) ── */}
        <div>
          <div style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800, fontFamily: 'Inter, sans-serif', marginBottom: 10, borderBottom: '1px solid #1e293b', paddingBottom: 6 }}>
            Armament &amp; Protection — Impact &amp; Vectors
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {/* Primary Weapon */}
            <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid #1e293b', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color: '#f8fafc', fontSize: 14, fontWeight: 700 }}>{c.primaryWeapon.name}</span>
                <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>
                  Impact {c.primaryWeapon.impact}
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: theme.primary, fontFamily: 'Inter, sans-serif', marginTop: 2 }}>
                Vector: <strong>{c.primaryWeapon.vector}</strong>
              </div>
              {c.primaryWeapon.note && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{c.primaryWeapon.note}</div>}
            </div>

            {/* Secondary Weapon */}
            {c.secondaryWeapon && (
              <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid #1e293b', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: '#f8fafc', fontSize: 14, fontWeight: 700 }}>{c.secondaryWeapon.name}</span>
                  <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>
                    Impact {c.secondaryWeapon.impact}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: theme.primary, fontFamily: 'Inter, sans-serif', marginTop: 2 }}>
                  Vector: <strong>{c.secondaryWeapon.vector}</strong>
                </div>
              </div>
            )}

            {/* Armor */}
            <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid #1e293b', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color: '#f8fafc', fontSize: 14, fontWeight: 700 }}>{c.armor.name}</span>
                <span style={{ fontSize: 11, color: '#10b981', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>
                  Reduction −{c.armor.reduction}
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                {c.armor.note || 'Absorbs incoming impact directly into Endure'}
              </div>
            </div>

            {/* Shield */}
            {c.shield && (
              <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid #1e293b', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: '#f8fafc', fontSize: 14, fontWeight: 700 }}>{c.shield.name}</span>
                  <span style={{ fontSize: 11, color: '#10b981', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>
                    Reduction −{c.shield.reduction}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{c.shield.note}</div>
              </div>
            )}
          </div>
        </div>

        {/* ── Legacy Abilities ── */}
        <div>
          <div style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800, fontFamily: 'Inter, sans-serif', marginBottom: 10, borderBottom: '1px solid #1e293b', paddingBottom: 6 }}>
            Legacy Permissions — {c.legacyRole.name}
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {c.abilities.map((ab) => (
              <div key={ab.name} style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid #1e293b', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ color: '#f8fafc', fontSize: 14.5, fontWeight: 700 }}>{ab.name}</span>
                  {ab.trigger && (
                    <span style={{ fontSize: 10, color: theme.primary, fontFamily: 'Inter, sans-serif', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
                      {ab.trigger}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 4, lineHeight: 1.55 }}>{ab.effect}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Workings & Castings (Interactive) ── */}
        {c.workings && c.workings.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottom: '1px solid #1e293b', paddingBottom: 6 }}>
              <span style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>
                Workings &amp; Castings (Four Verbs Engine)
              </span>
              <span style={{ fontSize: 10, color: '#8b5cf6', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                (Click buttons to trigger casting)
              </span>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              {c.workings.map((w) => {
                const verbColor = VERB_COLORS[w.verb] || '#8b5cf6';
                return (
                  <div
                    key={w.name}
                    style={{
                      background: 'rgba(15,23,42,0.5)',
                      border: '1px solid #1e293b',
                      borderRadius: 10,
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#f8fafc', fontSize: 15, fontWeight: 700 }}>{w.name}</span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            fontFamily: 'Inter, sans-serif',
                            color: verbColor,
                            background: verbColor + '15',
                            border: `1px solid ${verbColor}44`,
                            borderRadius: 4,
                            padding: '2px 6px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {w.verb}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
                        {w.cost}
                      </span>
                    </div>

                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                      <strong style={{ color: '#94a3b8' }}>Anchor:</strong> {w.anchor}
                    </div>

                    <div style={{ fontSize: 12.5, color: '#cbd5e1', lineHeight: 1.5, marginBottom: 8 }}>
                      {w.effect}
                    </div>

                    {/* Live Cast Buttons */}
                    <div style={{ display: 'flex', gap: 8, paddingTop: 6, borderTop: '1px solid #1e293b' }}>
                      <button
                        onClick={() => handleCastWorking(w.name, false)}
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          fontFamily: 'Inter, sans-serif',
                          color: '#6ee7b7',
                          background: 'rgba(16,185,129,0.12)',
                          border: '1px solid rgba(16,185,129,0.3)',
                          borderRadius: 6,
                          padding: '4px 10px',
                          cursor: 'pointer',
                        }}
                      >
                        🔮 Cast Sanctioned (1 Exert)
                      </button>
                      <button
                        onClick={() => handleCastWorking(w.name, true)}
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          fontFamily: 'Inter, sans-serif',
                          color: '#fca5a5',
                          background: 'rgba(239,68,68,0.12)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          borderRadius: 6,
                          padding: '4px 10px',
                          cursor: 'pointer',
                        }}
                      >
                        ⚡ Cast Unanchored (0 Exert / +Drift)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Design Note */}
        {c.notes && (
          <div
            style={{
              padding: '12px 14px',
              border: '1px dashed #1e293b',
              borderRadius: 8,
              fontSize: 12,
              color: '#64748b',
              fontFamily: 'Inter, sans-serif',
              fontStyle: 'italic',
              lineHeight: 1.6,
            }}
          >
            <span style={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', fontSize: 9.5, letterSpacing: '1px' }}>Tactical Note: </span>
            {c.notes}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div
        style={{
          padding: '10px 24px',
          borderTop: `1px solid ${theme.secondary}`,
          fontSize: 9,
          color: '#475569',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          fontFamily: 'Inter, sans-serif',
          textAlign: 'center',
        }}
      >
        Coherence System · Aurel Partition · Paired Skills &amp; Thresholds · Four Verbs
      </div>
    </div>
  );
}
