import { useState } from 'react';
import { useToast } from '../../../components/Toast';
import { SKILLS, DIE_LADDER, type Die } from '../../../data/terminus/skills';
import { THRESHOLDS, SKILL_TO_THRESHOLD_MAP } from '../../../data/terminus/thresholds';

interface RollResult {
  value: number;
  isMax: boolean;
}

export function ConflictResolver() {
  const { addToast } = useToast();

  const [attackerSkill, setAttackerSkill] = useState<Die>('d6');
  const [defenderThreshold, setDefenderThreshold] = useState<Die>('d6');
  const [attackerRoll, setAttackerRoll] = useState<RollResult | null>(null);
  const [defenderRoll, setDefenderRoll] = useState<RollResult | null>(null);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState<Array<{
    attackerSkill: Die;
    defenderThreshold: Die;
    attackerRoll: number;
    defenderRoll: number;
    winner: 'attacker' | 'defender' | 'tie';
    timestamp: number;
  }>>([]);

  const rollDie = (die: Die): RollResult => {
    const size = parseInt(die.replace('d', ''));
    const value = Math.floor(Math.random() * size) + 1;
    return { value, isMax: value === size };
  };

  const handleRoll = () => {
    setRolling(true);
    setAttackerRoll(null);
    setDefenderRoll(null);

    // Simulate rolling animation
    setTimeout(() => {
      const aRoll = rollDie(attackerSkill);
      const dRoll = rollDie(defenderThreshold);
      setAttackerRoll(aRoll);
      setDefenderRoll(dRoll);
      setRolling(false);

      const winner = aRoll.value > dRoll.value ? 'attacker' : dRoll.value > aRoll.value ? 'defender' : 'tie';

      setHistory((prev) => [
        {
          attackerSkill,
          defenderThreshold,
          attackerRoll: aRoll.value,
          defenderRoll: dRoll.value,
          winner,
          timestamp: Date.now(),
        },
        ...prev,
      ]);

      if (winner === 'attacker') {
        addToast('success', `Attacker wins! ${aRoll.value} vs ${dRoll.value}`);
      } else if (winner === 'defender') {
        addToast('info', `Defender wins! ${dRoll.value} vs ${aRoll.value}`);
      } else {
        addToast('warning', `Tie! Both rolled ${aRoll.value} (Defender wins ties by default)`);
      }
    }, 600);
  };

  const getWinner = () => {
    if (!attackerRoll || !defenderRoll) return null;
    if (attackerRoll.value > defenderRoll.value) return 'attacker';
    if (defenderRoll.value > attackerRoll.value) return 'defender';
    return 'tie';
  };

  const winner = getWinner();

  return (
    <div style={{
      backgroundColor: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '0.75rem',
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
    }}>
      <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: 700 }}>
        Conflict Resolution
      </h2>
      <p style={{ color: '#94a3b8', margin: '0 0 2rem 0', lineHeight: 1.6 }}>
        Terminus uses paired Skill/Threshold dice. The acting side rolls their Skill die.
        The responding side chooses their Threshold die and rolls. Higher roll takes control.
        <strong> No target numbers. No to-hit rolls.</strong>
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Attacker */}
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '0.5rem',
          padding: '1.5rem',
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', color: '#3b82f6' }}>
            Acting Side
          </h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              Skill Die
            </label>
            <select
              value={attackerSkill}
              onChange={(e) => setAttackerSkill(e.target.value as Die)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#f8fafc',
                fontSize: '1rem',
              }}
            >
              {DIE_LADDER.map((die) => (
                <option key={die} value={die}>{die}</option>
              ))}
            </select>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: '#1e293b',
            borderRadius: '0.5rem',
            minHeight: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {attackerRoll ? (
              <div>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: 800,
                  color: attackerRoll.isMax ? '#fbbf24' : '#f8fafc',
                }}>
                  {attackerRoll.value}
                </div>
                {attackerRoll.isMax && (
                  <div style={{ fontSize: '0.875rem', color: '#fbbf24' }}>MAX!</div>
                )}
              </div>
            ) : rolling ? (
              <div style={{ fontSize: '2rem', color: '#94a3b8' }}>...</div>
            ) : (
              <div style={{ fontSize: '1.5rem', color: '#64748b' }}>?</div>
            )}
          </div>
        </div>

        {/* Defender */}
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '0.5rem',
          padding: '1.5rem',
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', color: '#8b5cf6' }}>
            Responding Side
          </h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              Threshold Die
            </label>
            <select
              value={defenderThreshold}
              onChange={(e) => setDefenderThreshold(e.target.value as Die)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#f8fafc',
                fontSize: '1rem',
              }}
            >
              {DIE_LADDER.map((die) => (
                <option key={die} value={die}>{die}</option>
              ))}
            </select>
          </div>
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: '#1e293b',
            borderRadius: '0.5rem',
            minHeight: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {defenderRoll ? (
              <div>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: 800,
                  color: defenderRoll.isMax ? '#fbbf24' : '#f8fafc',
                }}>
                  {defenderRoll.value}
                </div>
                {defenderRoll.isMax && (
                  <div style={{ fontSize: '0.875rem', color: '#fbbf24' }}>MAX!</div>
                )}
              </div>
            ) : rolling ? (
              <div style={{ fontSize: '2rem', color: '#94a3b8' }}>...</div>
            ) : (
              <div style={{ fontSize: '1.5rem', color: '#64748b' }}>?</div>
            )}
          </div>
        </div>
      </div>

      {/* Result */}
      {winner && (
        <div style={{
          textAlign: 'center',
          padding: '1.5rem',
          backgroundColor: winner === 'attacker' ? '#064e3b' : winner === 'defender' ? '#1e3a8a' : '#78350f',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          border: `2px solid ${winner === 'attacker' ? '#10b981' : winner === 'defender' ? '#3b82f6' : '#f59e0b'}`,
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
            {winner === 'attacker' ? '🎯 Acting Side Takes Control' : winner === 'defender' ? '🛡️ Responding Side Holds' : '⚖️ Tie (Defender Wins)'}
          </div>
          <div style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.5rem' }}>
            {attackerRoll?.value} vs {defenderRoll?.value}
          </div>
        </div>
      )}

      {/* Roll Button */}
      <button
        onClick={handleRoll}
        disabled={rolling}
        style={{
          width: '100%',
          padding: '1rem',
          backgroundColor: rolling ? '#4b5563' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: rolling ? 'not-allowed' : 'pointer',
          fontWeight: 700,
          fontSize: '1.125rem',
        }}
      >
        {rolling ? 'Rolling...' : '🎲 Roll Conflict'}
      </button>

      {/* History */}
      {history.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#94a3b8' }}>
            Roll History
          </h3>
          <div style={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            maxHeight: '200px',
            overflowY: 'auto',
          }}>
            {history.map((roll, idx) => (
              <div
                key={roll.timestamp}
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: idx < history.length - 1 ? '1px solid #1e293b' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>{roll.attackerSkill}</span>
                  <span style={{ color: '#64748b', margin: '0 0.5rem' }}>vs</span>
                  <span style={{ color: '#94a3b8' }}>{roll.defenderThreshold}</span>
                </div>
                <div style={{ fontSize: '0.875rem' }}>
                  <span style={{
                    color: roll.winner === 'attacker' ? '#10b981' : roll.winner === 'defender' ? '#3b82f6' : '#f59e0b',
                    fontWeight: 600,
                  }}>
                    {roll.attackerRoll} vs {roll.defenderRoll}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}