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
}
