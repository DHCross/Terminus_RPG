import { useMemo, useState } from 'react';
import { ArrowDown, Gauge, Waves } from 'lucide-react';
import { SPECIES_LIST } from '../../../data/terminus/species';
import { THRESHOLDS } from '../../../data/terminus/thresholds';

const STONEBORN = SPECIES_LIST.find((species) => species.id === 'stoneborn');

const PRESET_DISTANCES = [10, 30, 60, 100, 200, 500];

// Physics constants (ft/s^2 and ft/s)
const GRAVITY_FT_S2 = 32.174;
const TERMINAL_VELOCITY_FT_S = 176; // ~120 mph
const DISTANCE_TO_TERMINAL =
  (TERMINAL_VELOCITY_FT_S * TERMINAL_VELOCITY_FT_S) / (2 * GRAVITY_FT_S2);

type PhysicsResult = {
  velocityFtS: number;
  velocityMph: number;
  timeSeconds: number;
  hitTerminal: boolean;
};

function computePhysics(distanceFt: number): PhysicsResult | null {
  if (distanceFt <= 0) return null;

  if (distanceFt <= DISTANCE_TO_TERMINAL) {
    const v = Math.sqrt(2 * GRAVITY_FT_S2 * distanceFt);
    const t = Math.sqrt((2 * distanceFt) / GRAVITY_FT_S2);
    return { velocityFtS: v, velocityMph: v * 0.681818, timeSeconds: t, hitTerminal: false };
  }

  const tAccel = TERMINAL_VELOCITY_FT_S / GRAVITY_FT_S2;
  const tConst = (distanceFt - DISTANCE_TO_TERMINAL) / TERMINAL_VELOCITY_FT_S;
  return {
    velocityFtS: TERMINAL_VELOCITY_FT_S,
    velocityMph: TERMINAL_VELOCITY_FT_S * 0.681818,
    timeSeconds: tAccel + tConst,
    hitTerminal: true,
  };
}

function velocityComparison(mph: number): string {
  if (mph > 70) return 'Equivalent to a severe highway car crash.';
  if (mph > 40) return 'Equivalent to a local traffic collision.';
  if (mph > 20) return 'Equivalent to an aggressive bicycle crash.';
  return 'A minor tumble.';
}

export function FallCalculator() {
  const [distance, setDistance] = useState(30);
  const [stoneborn, setStoneborn] = useState(false);
  const [realism, setRealism] = useState(false);

  const { pressure, notes } = useMemo(() => {
    let pressureValue = Math.floor(distance / 10);
    const rulesNotes: string[] = [];

    if (stoneborn && pressureValue > 0) {
      pressureValue = Math.max(0, pressureValue - 1);
      rulesNotes.push(
        `Stoneborn — ${STONEBORN?.traitName ?? 'Hard Memory'} ignored the first lost ${THRESHOLDS.ENDURE} circle.`,
      );
    }

    if (distance >= 10) {
      rulesNotes.push(
        `System Response: the fall generates Environmental Pressure. Resolve by routing the consequence through the ${THRESHOLDS.ENDURE} threshold and marking ${THRESHOLDS.ENDURE} circles.`,
      );
    } else if (distance > 0) {
      rulesNotes.push('Distance insufficient to generate structural Rupture or Pressure.');
    }

    if (distance >= 60) {
      rulesNotes.push(
        'Rupture Warning: a fall of this severity implies a failure in Tringad\u2019s routine or crossing synchronization.',
      );
    }

    return { pressure: pressureValue, notes: rulesNotes };
  }, [distance, stoneborn]);

  const physics = useMemo(() => (realism ? computePhysics(distance) : null), [distance, realism]);

  const panelStyle: React.CSSProperties = {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '0.75rem',
    padding: '2rem',
    maxWidth: '640px',
    margin: '0 auto',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    color: '#94a3b8',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '0.375rem',
    color: '#f8fafc',
    fontSize: '1.25rem',
    fontWeight: 700,
  };

  const presetButtonBase: React.CSSProperties = {
    padding: '0.4rem 0.85rem',
    backgroundColor: '#0f172a',
    color: '#94a3b8',
    border: '1px solid #334155',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
  };

  return (
    <div style={panelStyle}>
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowDown size={20} /> Fall Damage
      </h3>
      <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Converts a fall distance into Terminus Environmental Pressure, routed through the{' '}
        {THRESHOLDS.ENDURE} threshold. Falls are not rolled; they generate flat pressure measured in
        lost {THRESHOLDS.ENDURE} circles.
      </p>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle} htmlFor="fall-distance">Fall Distance (Feet)</label>
        <input
          id="fall-distance"
          type="number"
          min={0}
          value={distance}
          onChange={(event) => setDistance(Math.max(0, Number(event.target.value) || 0))}
          style={inputStyle}
        />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
          {PRESET_DISTANCES.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setDistance(preset)}
              style={{
                ...presetButtonBase,
                backgroundColor: distance === preset ? '#3b82f6' : '#0f172a',
                color: distance === preset ? '#fff' : '#94a3b8',
                borderColor: distance === preset ? '#3b82f6' : '#334155',
              }}
            >
              {preset} ft
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Situational Modifiers
        </h4>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={stoneborn}
            onChange={(event) => setStoneborn(event.target.checked)}
            style={{ marginTop: '0.2rem', width: '1rem', height: '1rem', accentColor: '#3b82f6' }}
          />
          <span>
            <span style={{ color: '#f8fafc', fontSize: '0.9375rem', fontWeight: 600 }}>
              Stoneborn Ancestry: {STONEBORN?.traitName ?? 'Hard Memory'}
            </span>
            <span style={{ display: 'block', color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic', marginTop: '0.15rem' }}>
              {STONEBORN?.traitDescription ??
                'Ignore the first lost Endure circle from environmental pressure/crushing force.'}
            </span>
          </span>
        </label>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
        }}
      >
        <label htmlFor="fall-realism" style={{ fontSize: '0.9rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Gauge size={16} /> Enable Realism (Physics Estimate)
        </label>
        <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            id="fall-realism"
            type="checkbox"
            checked={realism}
            onChange={(event) => setRealism(event.target.checked)}
            style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
          />
          <span
            style={{
              width: '2.75rem',
              height: '1.5rem',
              backgroundColor: realism ? '#3b82f6' : '#475569',
              borderRadius: '9999px',
              position: 'relative',
              transition: 'background-color 0.2s',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '0.125rem',
                left: '0.125rem',
                width: '1.25rem',
                height: '1.25rem',
                backgroundColor: '#e2e8f0',
                borderRadius: '9999px',
                transition: 'transform 0.2s',
                transform: realism ? 'translateX(1.25rem)' : 'translateX(0)',
              }}
            />
          </span>
        </label>
      </div>

      <div
        style={{
          textAlign: 'center',
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          Environmental Pressure
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '0.5rem' }}>
          <span style={{ fontSize: '3.5rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{pressure}</span>
          <span style={{ fontSize: '1rem', color: '#64748b', marginBottom: '0.5rem' }}>
            {THRESHOLDS.ENDURE} circles
          </span>
        </div>
        <div style={{ marginTop: '0.5rem', color: '#60a5fa', fontSize: '0.9rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem' }}>
          <Waves size={14} /> Crushing Force / Environmental Pressure
        </div>
      </div>

      {realism && physics && (
        <div
          style={{
            textAlign: 'center',
            backgroundColor: '#020617',
            border: '1px solid #1e293b',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
            Kinematic Physics Estimate
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase' }}>Impact Velocity</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#60a5fa' }}>
                {physics.velocityMph.toFixed(1)} <span style={{ fontSize: '0.75rem', color: '#475569' }}>mph</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569' }}>{physics.velocityFtS.toFixed(1)} ft/s</div>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase' }}>Fall Time</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#60a5fa' }}>
                {physics.timeSeconds.toFixed(2)} <span style={{ fontSize: '0.75rem', color: '#475569' }}>s</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.7rem', fontStyle: 'italic', color: physics.hitTerminal ? '#f87171' : '#64748b' }}>
            {physics.hitTerminal
              ? 'Terminal velocity (~120 mph) reached!'
              : velocityComparison(physics.velocityMph)}
          </div>
        </div>
      )}

      <div>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#94a3b8' }}>Rules &amp; Notes</h4>
        <ul
          style={{
            margin: 0,
            paddingLeft: '1.25rem',
            color: '#cbd5e1',
            fontSize: '0.875rem',
            lineHeight: 1.6,
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem 0.75rem 2rem',
          }}
        >
          {notes.length === 0 ? (
            <li>Enter a distance to see specific rulings.</li>
          ) : (
            notes.map((note) => <li key={note}>{note}</li>)
          )}
        </ul>
      </div>
    </div>
  );
}
