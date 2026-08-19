import { useState } from 'react';
import { ClipboardList, Dices, Gauge, Waves, ArrowDown } from 'lucide-react';
import { DIE_LADDER, type Die } from '../../../data/terminus/skills';
import { getSecureRandom } from '../../../utils/crypto';
import { ConflictResolver } from '../conflict/ConflictResolver';
import { DRIFT_DOCTRINE, DRIFT_MODES, DRIFT_TYPES, DRIFT_WRITING_RULES, type DriftMode, type DriftTypeId } from '../../../data/terminus/drift';
import { FallCalculator } from './FallCalculator';

type Tool = 'conflict' | 'dice' | 'drift' | 'questionnaire' | 'fall';

const toolTabs = [
  { id: 'conflict' as const, label: 'Conflict', icon: Gauge },
  { id: 'dice' as const, label: 'Dice Roller', icon: Dices },
  { id: 'drift' as const, label: 'Drift Resolver', icon: Waves },
  { id: 'fall' as const, label: 'Fall Damage', icon: ArrowDown },
  { id: 'questionnaire' as const, label: 'Questionnaire', icon: ClipboardList },
];

export function PlaytestTools() {
  const [activeTool, setActiveTool] = useState<Tool>('conflict');

  return (
    <div className="playtest-tools" style={{ padding: '2rem', maxWidth: '1040px' }}>
      <div className="page-header">
        <h2>Playtest Tools</h2>
        <p>Live table utilities for testing the Terminus RPG alpha rules.</p>
      </div>

      <div className="tab-bar" style={{ marginBottom: '1.5rem', padding: 0 }}>
        {toolTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTool(id)}
            className={activeTool === id ? 'tab-button active' : 'tab-button'}
          >
            <Icon size={18} /> {label}
          </button>
        ))}
      </div>

      {/* Tool content */}
      {activeTool === 'conflict' && <ConflictResolver onTriggerDrift={() => setActiveTool('drift')} />}
      {activeTool === 'dice' && <DiceRoller />}
      {activeTool === 'drift' && <DriftResolver />}
      {activeTool === 'fall' && <FallCalculator />}
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
          {rolling ? 'Rolling...' : 'Roll'}
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
  const [driftType, setDriftType] = useState<DriftTypeId>('hesitation');
  const [driftMode, setDriftMode] = useState<DriftMode>('hazard');
  const selectedType = DRIFT_TYPES.find((type) => type.id === driftType) || DRIFT_TYPES[0];
  const driftOptions = DRIFT_MODES.find((mode) => mode.id === driftMode)?.examples || DRIFT_MODES[0].examples;
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const [customDraft, setCustomDraft] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const handleRoll = () => {
    const allOptions = [...driftOptions, ...customOptions];
    const randomIndex = Math.floor(getSecureRandom() * allOptions.length);
    setResult(allOptions[randomIndex]);
  };

  const handleAddCustom = () => {
    if (customDraft.trim()) {
      setCustomOptions([...customOptions, customDraft.trim()]);
      setCustomDraft('');
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
        Drift is the fill-in-the-blank: what happens if they stall? Choose the type first.
        That dial is the genre. Do not skip it.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.5rem',
      }}>
        {DRIFT_DOCTRINE.map((point) => (
          <div
            key={point.title}
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '0.5rem',
              padding: '0.85rem',
            }}
          >
            <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
              {point.title}
            </strong>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.45 }}>
              {point.summary}
            </span>
          </div>
        ))}
      </div>

      <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Type — what advances the clock
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {DRIFT_TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => {
              setDriftType(type.id);
              setResult(null);
            }}
            style={{
              padding: '0.65rem 1rem',
              backgroundColor: driftType === type.id ? '#3b82f6' : '#0f172a',
              color: driftType === type.id ? '#fff' : '#94a3b8',
              border: `1px solid ${driftType === type.id ? '#3b82f6' : '#334155'}`,
              borderRadius: '0.375rem',
              cursor: 'pointer',
            }}
          >
            {type.name}
          </button>
        ))}
      </div>
      <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
        {selectedType.guideUse} {selectedType.setting}
      </p>

      <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Shape — what the tick looks like
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {DRIFT_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => {
              setDriftMode(mode.id);
              setResult(null);
            }}
            style={{
              padding: '0.65rem 1rem',
              backgroundColor: driftMode === mode.id ? '#3b82f6' : '#0f172a',
              color: driftMode === mode.id ? '#fff' : '#94a3b8',
              border: `1px solid ${driftMode === mode.id ? '#3b82f6' : '#334155'}`,
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            {mode.name}
          </button>
        ))}
      </div>

      {DRIFT_MODES.filter((mode) => mode.id === driftMode).map((mode) => (
        <div
          key={mode.id}
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <strong style={{ color: '#f8fafc' }}>{mode.test}</strong>
          <p style={{ color: '#94a3b8', margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
            {mode.driftShape}
          </p>
        </div>
      ))}

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', color: '#94a3b8' }}>
          Executable Drift Options
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
          disabled={!customDraft.trim()}
          style={{
            marginTop: '0.75rem',
            padding: '0.5rem 1rem',
            backgroundColor: customDraft.trim() ? '#334155' : '#1e293b',
            color: '#f8fafc',
            border: '1px solid #475569',
            borderRadius: '0.375rem',
            cursor: customDraft.trim() ? 'pointer' : 'not-allowed',
            fontSize: '0.875rem',
          }}
        >
          Add Custom Option
        </button>
        <input
          value={customDraft}
          onChange={(event) => setCustomDraft(event.target.value)}
          placeholder="At the end of each round, ..."
          style={{
            width: '100%',
            marginTop: '0.75rem',
            padding: '0.65rem 0.75rem',
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '0.375rem',
            color: '#f8fafc',
          }}
        />
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
        Roll Drift
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
            End-of-round Drift:
          </div>
          <div style={{ fontSize: '1.125rem', color: '#f8fafc', fontWeight: 600 }}>
            {result}
          </div>
        </div>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#94a3b8' }}>
          Writing Rules
        </h4>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
          {DRIFT_WRITING_RULES.map((rule) => <li key={rule}>{rule}</li>)}
        </ul>
      </div>
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
    "Did the defender's response choice matter?",
    'Did Order Abilities feel like permissions rather than bonuses?',
    'Did Species matter enough, too much, or not at all?',
    'Did the Scene Card help the Guide?',
    'Did the battle map and Scene Card conflict?',
    'Did the world feel resilient before it felt fragile?',
    'Did any rule create dead space?',
    'Did armor feel like a permission (what you may Endure) rather than a soak number?',
    "Did mail's Take the Room matter in corridors, doorways, or crowds?",
    "Did plate's No Avoid, ever feel like a real cost?",
    'Did Breaks Protection stripping the permission for the scene feel fair?',
    'What confused the table first?',
    'Did non-casters feel as able to change the situation as casters?',
    'Did anyone spend a Signature on Give, and did it feel worth it?',
    'Did Mark create interesting downtime pressure or just bookkeeping?',
    'Did you fill all four Scene Card boxes before the scene, or did two get winged?',
    'If you winged boxes, did Drift become optional?',
    'Did you choose a Drift type (hesitation / ambient / alert / entropy) before play?',
    'Who profited from the Rupture staying thin? Did that matter?',
    'Did the cell encounter anyone whose interests differed from theirs?',
    'Did restoring the Quiet Day cost anybody anything?',
    'Did the players ask who benefited?',
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
        Copy to Clipboard
      </button>
    </div>
  );
}
