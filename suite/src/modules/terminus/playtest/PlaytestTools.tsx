import { useState } from 'react';
import { DIE_LADDER, type Die } from '../../../data/terminus/skills';
import { getSecureRandom } from '../../../utils/crypto';
import { ConflictResolver } from '../conflict/ConflictResolver';

type RollResult = {
  attacker: number;
  defender: number;
  winner: 'attacker' | 'defender' | 'tie';
  message: string;
};

type Tool = 'conflict' | 'dice' | 'drift' | 'questionnaire';

export function PlaytestTools() {
  const [activeTool, setActiveTool] = useState<Tool>('conflict');

  const rollDie = (die: Die) => {
    const sides = parseInt(die.substring(1), 10);
    return Math.floor(getSecureRandom() * sides) + 1;
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
    <div className="playtest-tools" style={{ padding: '2rem', maxWidth: '1000px' }}>
      <h2 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Playtest Tools</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        Tools for testing the Terminus RPG alpha rules
      </p>

      {/* Tool selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTool('conflict')}
          style={{
            padding: '0.5rem 1rem',
            background: activeTool === 'conflict' ? '#3b82f6' : '#1e293b',
            color: activeTool === 'conflict' ? '#fff' : '#94a3b8',
            border: `1px solid ${activeTool === 'conflict' ? '#3b82f6' : '#334155'}`,
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          ⚔️ Conflict Resolution
        </button>
        <button
          onClick={() => setActiveTool('dice')}
          style={{
            padding: '0.5rem 1rem',
            background: activeTool === 'dice' ? '#3b82f6' : '#1e293b',
            color: activeTool === 'dice' ? '#fff' : '#94a3b8',
            border: `1px solid ${activeTool === 'dice' ? '#3b82f6' : '#334155'}`,
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          🎲 Dice Roller
        </button>
        <button
          onClick={() => setActiveTool('drift')}
          style={{
            padding: '0.5rem 1rem',
            background: activeTool === 'drift' ? '#3b82f6' : '#1e293b',
            color: activeTool === 'drift' ? '#fff' : '#94a3b8',
            border: `1px solid ${activeTool === 'drift' ? '#3b82f6' : '#334155'}`,
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          🌊 Drift Resolver
        </button>
        <button
          onClick={() => setActiveTool('questionnaire')}
          style={{
            padding: '0.5rem 1rem',
            background: activeTool === 'questionnaire' ? '#3b82f6' : '#1e293b',
            color: activeTool === 'questionnaire' ? '#fff' : '#94a3b8',
            border: `1px solid ${activeTool === 'questionnaire' ? '#3b82f6' : '#334155'}`,
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          📋 Questionnaire
        </button>
      </div>

      {/* Tool content */}
      {activeTool === 'conflict' && <ConflictResolver />}
      {activeTool === 'dice' && <DiceRoller />}
      {activeTool === 'drift' && <DriftResolver />}
      {activeTool === 'questionnaire' && <PlaytestQuestionnaire />}
    </div>
  );
}

function DiceRoller() {
  const [selectedDie, setSelectedDie] = useState<Die>('d6');
  const [rolls, setRolls] = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);

  const rollDie = (die: Die) => {
    const size = parseInt(die.replace('d', ''));
    return Math.floor(getSecureRandom() * size) + 1;
  };

  const handleRoll = () => {
    setRolling(true);
    setTimeout(() => {
      const result = rollDie(selectedDie);
      setRolls([result, ...rolls]);
      setRolling(false);
    }, 300);
  };

  const clearHistory = () => setRolls([]);

  return (
    <div style={{
      backgroundColor: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '0.75rem',
      padding: '2rem',
      maxWidth: '600px',
      margin: '0 auto',
    }}>
      <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 700 }}>
        Dice Roller
      </h3>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
          Select Die
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {DIE_LADDER.map((die) => (
            <button
              key={die}
              onClick={() => setSelectedDie(die)}
              style={{
                padding: '0.75rem 1.25rem',
                backgroundColor: selectedDie === die ? '#3b82f6' : '#0f172a',
                color: selectedDie === die ? '#fff' : '#94a3b8',
                border: `1px solid ${selectedDie === die ? '#3b82f6' : '#334155'}`,
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              {die}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        padding: '3rem',
        backgroundColor: '#0f172a',
        borderRadius: '0.5rem',
        marginBottom: '1.5rem',
        minHeight: '150px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {rolling ? (
          <div style={{ fontSize: '2rem', color: '#94a3b8' }}>...</div>
        ) : rolls.length > 0 ? (
          <div style={{ fontSize: '4rem', fontWeight: 800, color: '#f8fafc' }}>
            {rolls[0]}
          </div>
        ) : (
          <div style={{ fontSize: '2rem', color: '#64748b' }}>?</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={handleRoll}
          disabled={rolling}
          style={{
            flex: 1,
            padding: '1rem',
            backgroundColor: rolling ? '#4b5563' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: rolling ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: '1rem',
          }}
        >
          {rolling ? 'Rolling...' : '🎲 Roll'}
        </button>
        <button
          onClick={clearHistory}
          disabled={rolls.length === 0}
          style={{
            padding: '1rem',
            backgroundColor: '#334155',
            color: '#f8fafc',
            border: '1px solid #475569',
            borderRadius: '0.5rem',
            cursor: rolls.length === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          Clear
        </button>
      </div>

      {rolls.length > 1 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#94a3b8' }}>
            Recent Rolls
          </h4>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}>
            {rolls.slice(1).map((roll, idx) => (
              <span
                key={idx}
                style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#0f172a',
                  color: '#94a3b8',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                }}
              >
                {roll}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DriftResolver() {
  const [driftOptions, setDriftOptions] = useState<string[]>([
    'Another pedestrian repeats an action',
    'A signal changes out of sequence',
    'The duplicate tram becomes more solid',
    'The crowd compresses toward the center',
    'A vendor stall appears in two places',
    'The bell rings twice, and one character loses track',
  ]);
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);

  const handleRoll = () => {
    const allOptions = [...driftOptions, ...customOptions];
    const randomIndex = Math.floor(getSecureRandom() * allOptions.length);
    setResult(allOptions[randomIndex]);
  };

  const handleAddCustom = () => {
    const newOption = prompt('Enter a custom drift option:');
    if (newOption && newOption.trim()) {
      setCustomOptions([...customOptions, newOption.trim()]);
    }
  };

  const handleRemoveCustom = (index: number) => {
    setCustomOptions(customOptions.filter((_, i) => i !== index));
  };

  return (
    <div style={{
      backgroundColor: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '0.75rem',
      padding: '2rem',
      maxWidth: '700px',
      margin: '0 auto',
    }}>
      <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 700 }}>
        Drift Resolver
      </h3>
      <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        At the end of each round, roll or choose what changes if characters do nothing.
      </p>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', color: '#94a3b8' }}>
          Drift Options
        </label>
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '0.5rem',
          padding: '1rem',
        }}>
          {driftOptions.map((option, idx) => (
            <div
              key={idx}
              style={{
                padding: '0.5rem',
                borderBottom: idx < driftOptions.length - 1 ? '1px solid #1e293b' : 'none',
                color: '#f8fafc',
                fontSize: '0.9375rem',
              }}
            >
              {idx + 1}. {option}
            </div>
          ))}
          {customOptions.map((option, idx) => (
            <div
              key={`custom-${idx}`}
              style={{
                padding: '0.5rem',
                borderBottom: idx < customOptions.length - 1 ? '1px solid #1e293b' : 'none',
                color: '#f8fafc',
                fontSize: '0.9375rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{driftOptions.length + idx + 1}. {option}</span>
              <button
                onClick={() => handleRemoveCustom(idx)}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={handleAddCustom}
          style={{
            marginTop: '0.75rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#334155',
            color: '#f8fafc',
            border: '1px solid #475569',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          + Add Custom Option
        </button>
      </div>

      <button
        onClick={handleRoll}
        style={{
          width: '100%',
          padding: '1rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        🎲 Roll Drift
      </button>

      {result && (
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#0f172a',
          border: '2px solid #3b82f6',
          borderRadius: '0.5rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
            This round's drift:
          </div>
          <div style={{ fontSize: '1.125rem', color: '#f8fafc', fontWeight: 600 }}>
            {result}
          </div>
        </div>
      )}
    </div>
  );
}

function PlaytestQuestionnaire() {
  const questions = [
    'Did the character card make sense?',
    'Did Force / Agility / Willpower feel broad enough?',
    'Did Endure / Avoid / Exert create real choices?',
    'Did anyone miss separate saving throws?',
    'Did the no-to-hit exchange feel active?',
    'Did the defender\'s response choice matter?',
    'Did Order Abilities feel like permissions rather than bonuses?',
    'Did Species matter enough, too much, or not at all?',
    'Did the Scene Card help the Guide?',
    'Did the battle map and Scene Card conflict?',
    'Did any rule create dead space?',
    'What confused the table first?',
  ];

  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleAnswerChange = (idx: number, value: string) => {
    setAnswers({ ...answers, [idx]: value });
  };

  const handleExport = () => {
    const text = questions
      .map((q, idx) => `${idx + 1}. ${q}\n   ${answers[idx] || 'No answer'}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    alert('Questionnaire copied to clipboard!');
  };

  return (
    <div style={{
      backgroundColor: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '0.75rem',
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
    }}>
      <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 700 }}>
        Playtest Questionnaire
      </h3>
      <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.6 }}>
        After a session, ask these questions to gather feedback on the alpha rules.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {questions.map((question, idx) => (
          <div key={idx}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9375rem', color: '#f8fafc', fontWeight: 600 }}>
              {idx + 1}. {question}
            </label>
            <textarea
              value={answers[idx] || ''}
              onChange={(e) => handleAnswerChange(idx, e.target.value)}
              placeholder="Enter your notes..."
              rows={2}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#f8fafc',
                fontSize: '0.9375rem',
                resize: 'vertical',
              }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleExport}
        style={{
          marginTop: '2rem',
          width: '100%',
          padding: '1rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '1rem',
        }}
      >
        📋 Copy to Clipboard
      </button>
    </div>
  );

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
