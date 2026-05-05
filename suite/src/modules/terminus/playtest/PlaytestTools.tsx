import { useState } from 'react';
import { DIE_LADDER, type Die } from '../../../data/terminus/skills';

type RollResult = {
  attacker: number;
  defender: number;
  winner: 'attacker' | 'defender' | 'tie';
  message: string;
};

export function PlaytestTools() {
  const [attackerDie, setAttackerDie] = useState<Die>('d8');
  const [defenderDie, setDefenderDie] = useState<Die>('d8');
  const [tieRule, setTieRule] = useState<'favor_responder' | 'increase_pressure'>('favor_responder');
  const [scenePressure, setScenePressure] = useState<number>(0);
  const [lastRoll, setLastRoll] = useState<RollResult | null>(null);

  const rollDie = (die: Die) => {
    const sides = parseInt(die.substring(1), 10);
    return Math.floor(Math.random() * sides) + 1;
  };

  const handleRoll = () => {
    const aRoll = rollDie(attackerDie);
    const dRoll = rollDie(defenderDie);
    
    let winner: 'attacker' | 'defender' | 'tie';
    let message = '';
    
    if (aRoll > dRoll) {
      winner = 'attacker';
      message = 'Acting side takes control. Effect, Impact, or Vector resolves.';
    } else if (dRoll > aRoll) {
      winner = 'defender';
      message = 'Responding side takes control. The pressure is routed or avoided.';
    } else {
      winner = 'tie';
      if (tieRule === 'favor_responder') {
        winner = 'defender';
        message = 'Tie favors the responding side. Defender takes control.';
      } else {
        message = 'Tie! Neither side takes full control. Scene pressure increases.';
        setScenePressure(p => p + 1);
      }
    }
    
    setLastRoll({ attacker: aRoll, defender: dRoll, winner, message });
  };

  const resetPressure = () => setScenePressure(0);

  return (
    <div className="playtest-tools" style={{ padding: '2rem', maxWidth: '800px' }}>
      <h2 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Playtest Tools</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        Test the core conflict loop: Paired Skill / Threshold dice without passive target numbers or to-hit rolls.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--color-text)' }}>Acting Side (Skill)</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Force, Agility, or Willpower</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {DIE_LADDER.map(d => (
              <button
                key={`a-${d}`}
                onClick={() => setAttackerDie(d)}
                style={{
                  padding: '0.5rem 1rem',
                  background: attackerDie === d ? 'var(--color-primary)' : 'var(--color-background)',
                  color: attackerDie === d ? '#fff' : 'var(--color-text)',
                  border: `1px solid ${attackerDie === d ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--color-text)' }}>Responding Side (Threshold)</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Endure, Avoid, or Exert</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {DIE_LADDER.map(d => (
              <button
                key={`d-${d}`}
                onClick={() => setDefenderDie(d)}
                style={{
                  padding: '0.5rem 1rem',
                  background: defenderDie === d ? 'var(--color-primary)' : 'var(--color-background)',
                  color: defenderDie === d ? '#fff' : 'var(--color-text)',
                  border: `1px solid ${defenderDie === d ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--color-text)', fontWeight: 'bold' }}>Tie Handling:</span>
          <select 
            value={tieRule} 
            onChange={e => setTieRule(e.target.value as any)}
            style={{ 
              padding: '0.5rem', 
              background: 'var(--color-surface)', 
              color: 'var(--color-text)', 
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            <option value="favor_responder">Ties favor responding side</option>
            <option value="increase_pressure">Neither takes control, pressure increases</option>
          </select>
        </div>

        <button 
          onClick={handleRoll}
          style={{
            padding: '0.75rem 2rem',
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
          }}
        >
          ROLL CONFLICT
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div style={{ background: 'var(--color-background)', padding: '1.5rem', borderRadius: '8px', border: '1px dashed var(--color-border)', minHeight: '150px' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-text)' }}>Exchange Result</h3>
          {lastRoll ? (
            <div>
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Acting ({attackerDie})</div>
                  <div style={{ fontSize: '3rem', fontWeight: 'bold', color: lastRoll.winner === 'attacker' ? 'var(--color-primary)' : 'var(--color-text)' }}>
                    {lastRoll.attacker}
                  </div>
                </div>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.5rem', color: 'var(--color-text-muted)' }}>vs</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Responding ({defenderDie})</div>
                  <div style={{ fontSize: '3rem', fontWeight: 'bold', color: lastRoll.winner === 'defender' ? 'var(--color-primary)' : 'var(--color-text)' }}>
                    {lastRoll.defender}
                  </div>
                </div>
              </div>
              <div style={{ 
                padding: '1rem', 
                background: lastRoll.winner === 'attacker' ? 'rgba(99, 102, 241, 0.1)' : 'var(--color-surface)',
                borderLeft: `4px solid ${lastRoll.winner === 'attacker' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: '0 4px 4px 0'
              }}>
                <strong style={{ color: 'var(--color-text)' }}>{lastRoll.message}</strong>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px' }}>
              Roll the dice to see the outcome...
            </div>
          )}
        </div>

        <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-text)' }}>Scene Pressure</h3>
          <div style={{ fontSize: '4rem', fontWeight: 'bold', color: scenePressure > 0 ? '#ef4444' : 'var(--color-text-muted)', lineHeight: '1' }}>
            {scenePressure}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Escalation level
          </div>
          <button 
            onClick={resetPressure}
            disabled={scenePressure === 0}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              color: scenePressure === 0 ? 'var(--color-text-muted)' : 'var(--color-text)',
              border: `1px solid ${scenePressure === 0 ? 'var(--color-border)' : '#ef4444'}`,
              borderRadius: '4px',
              cursor: scenePressure === 0 ? 'not-allowed' : 'pointer',
              width: '100%'
            }}
          >
            Reset Pressure
          </button>
        </div>
      </div>
    </div>
  );
}
