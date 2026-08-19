import { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, Gauge, History, Keyboard, RotateCcw, Zap } from 'lucide-react';
import { useToast } from '../../../components/Toast';
import { DIE_LADDER, type Die } from '../../../data/terminus/skills';
import { getSecureRandom } from '../../../utils/crypto';

interface RollResult {
  value: number;
  isMax: boolean;
}

type Winner = 'skill' | 'threshold' | 'tie';

interface HistoryEntry {
  skillDie: Die;
  thresholdDie: Die;
  skillRoll: number;
  thresholdRoll: number;
  winner: Winner;
  timestamp: number;
}

interface ConflictResolverProps {
  onTriggerDrift?: () => void;
}

function rollDie(die: Die): RollResult {
  const size = Number(die.replace('d', ''));
  const value = Math.floor(getSecureRandom() * size) + 1;
  return { value, isMax: value === size };
}

function resultCopy(winner: Winner | null) {
  if (winner === 'skill') {
    return {
      title: 'Skill Dominates',
      detail: 'The acting side takes control and changes the scene.',
      color: '#22d3ee',
      bg: 'rgba(8, 145, 178, 0.18)',
      border: 'rgba(34, 211, 238, 0.55)',
    };
  }
  if (winner === 'threshold') {
    return {
      title: 'Threshold Holds',
      detail: 'The obstacle, defender, or pressure absorbs the action.',
      color: '#a78bfa',
      bg: 'rgba(109, 40, 217, 0.2)',
      border: 'rgba(167, 139, 250, 0.55)',
    };
  }
  if (winner === 'tie') {
    return {
      title: 'Pressure Locks',
      detail: 'Tie. Ties favor the responding side. If they answered with an armor permission, ties go to the armored defender.',
      color: '#fbbf24',
      bg: 'rgba(180, 83, 9, 0.22)',
      border: 'rgba(251, 191, 36, 0.6)',
    };
  }
  return {
    title: 'Ready',
    detail: 'Choose dice, then roll the exchange.',
    color: '#94a3b8',
    bg: 'rgba(15, 23, 42, 0.72)',
    border: 'rgba(51, 65, 85, 1)',
  };
}

export function ConflictResolver({ onTriggerDrift }: ConflictResolverProps) {
  const { addToast } = useToast();

  const [skillDie, setSkillDie] = useState<Die>('d8');
  const [thresholdDie, setThresholdDie] = useState<Die>('d6');
  const [skillRoll, setSkillRoll] = useState<RollResult | null>(null);
  const [thresholdRoll, setThresholdRoll] = useState<RollResult | null>(null);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const winner = useMemo<Winner | null>(() => {
    if (!skillRoll || !thresholdRoll) return null;
    if (skillRoll.value > thresholdRoll.value) return 'skill';
    if (thresholdRoll.value > skillRoll.value) return 'threshold';
    return 'tie';
  }, [skillRoll, thresholdRoll]);

  const copy = resultCopy(winner);
  const canTriggerDrift = !!winner && (winner === 'tie' || skillRoll?.isMax || thresholdRoll?.isMax);

  const handleRoll = () => {
    if (rolling) return;
    setRolling(true);
    setSkillRoll(null);
    setThresholdRoll(null);

    window.setTimeout(() => {
      const nextSkillRoll = rollDie(skillDie);
      const nextThresholdRoll = rollDie(thresholdDie);
      const nextWinner: Winner =
        nextSkillRoll.value > nextThresholdRoll.value
          ? 'skill'
          : nextThresholdRoll.value > nextSkillRoll.value
            ? 'threshold'
            : 'tie';

      setSkillRoll(nextSkillRoll);
      setThresholdRoll(nextThresholdRoll);
      setRolling(false);
      setHistory((prev) => [
        {
          skillDie,
          thresholdDie,
          skillRoll: nextSkillRoll.value,
          thresholdRoll: nextThresholdRoll.value,
          winner: nextWinner,
          timestamp: Date.now(),
        },
        ...prev,
      ].slice(0, 5));

      const nextCopy = resultCopy(nextWinner);
      addToast(nextWinner === 'skill' ? 'success' : nextWinner === 'threshold' ? 'info' : 'warning', `${nextCopy.title}: ${nextSkillRoll.value} vs ${nextThresholdRoll.value}`);
    }, 360);
  };

  const handleSwapDice = () => {
    setSkillDie(thresholdDie);
    setThresholdDie(skillDie);
    setSkillRoll(null);
    setThresholdRoll(null);
  };

  const handleReset = () => {
    setSkillRoll(null);
    setThresholdRoll(null);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT';
      if (isTyping) return;
      if (event.code === 'Space' || event.key === 'Enter') {
        event.preventDefault();
        handleRoll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div style={{
      maxWidth: '1100px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 280px',
      gap: '1rem',
    }}>
      <section className="panel" style={{ padding: '1.5rem' }}>
        <div className="page-header">
          <h2>Conflict Resolution</h2>
          <p>
            Paired Skill and Threshold dice. No target numbers. No to-hit roll.
            The exchange decides which side changes the scene.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
          gap: '1rem',
          alignItems: 'stretch',
        }}>
          <DicePanel
            title="Protagonist"
            subtitle="Skill Die"
            accent="#22d3ee"
            die={skillDie}
            setDie={setSkillDie}
            roll={skillRoll}
            rolling={rolling}
          />

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
          }}>
            <button className="btn btn-secondary" onClick={handleSwapDice} title="Quick-swap dice">
              <ArrowLeftRight size={18} />
            </button>
            <span className="chip">vs</span>
          </div>

          <DicePanel
            title="Obstacle"
            subtitle="Threshold Die"
            accent="#a78bfa"
            die={thresholdDie}
            setDie={setThresholdDie}
            roll={thresholdRoll}
            rolling={rolling}
          />
        </div>

        <div style={{
          marginTop: '1rem',
          padding: '1.25rem',
          textAlign: 'center',
          background: copy.bg,
          border: `2px solid ${copy.border}`,
          borderRadius: '8px',
        }}>
          <div style={{ color: copy.color, fontSize: '1.7rem', fontWeight: 800 }}>
            {copy.title}
          </div>
          <p style={{ margin: '0.35rem auto 0', maxWidth: '620px', color: '#dbe4ef' }}>
            {copy.detail}
          </p>
          {skillRoll && thresholdRoll && (
            <div style={{ marginTop: '0.75rem', color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem' }}>
              {skillRoll.value} / {thresholdRoll.value}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={handleRoll} disabled={rolling} style={{ flex: '1 1 220px', justifyContent: 'center', minHeight: '52px' }}>
            <Zap size={18} /> {rolling ? 'Rolling...' : 'Roll Conflict'}
          </button>
          <button className="btn btn-secondary" onClick={handleReset}>
            <RotateCcw size={16} /> Clear
          </button>
          {winner && (
            <button className="btn btn-secondary" onClick={onTriggerDrift} disabled={!onTriggerDrift}>
              <Gauge size={16} /> {canTriggerDrift ? 'Trigger Drift' : 'Open Drift'}
            </button>
          )}
        </div>

        <div className="chip-row" style={{ marginTop: '0.85rem' }}>
          <span className="chip"><Keyboard size={14} /> Space / Enter rolls</span>
          <span className="chip">Ties: defender holds by default</span>
          <span className="chip">Max roll: check for scene pressure</span>
        </div>
      </section>

      <aside className="panel" style={{ padding: '1rem' }}>
        <div className="section-heading">
          <span className="eyebrow"><History size={14} /> Last 5</span>
          <h3>Roll Log</h3>
        </div>
        {history.length === 0 ? (
          <div className="empty-state" style={{ padding: '1rem' }}>No exchanges yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: '0.6rem', maxHeight: '420px', overflowY: 'auto' }}>
            {history.map((entry) => {
              const entryCopy = resultCopy(entry.winner);
              return (
                <div key={entry.timestamp} style={{
                  padding: '0.75rem',
                  background: 'var(--color-background)',
                  border: `1px solid ${entryCopy.border}`,
                  borderRadius: '8px',
                }}>
                  <strong style={{ color: entryCopy.color, display: 'block', marginBottom: '0.35rem' }}>
                    {entryCopy.title}
                  </strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem' }}>
                    <span>{entry.skillDie}: {entry.skillRoll}</span>
                    <span>{entry.thresholdDie}: {entry.thresholdRoll}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </aside>
    </div>
  );
}

function DicePanel({
  title,
  subtitle,
  accent,
  die,
  setDie,
  roll,
  rolling,
}: {
  title: string;
  subtitle: string;
  accent: string;
  die: Die;
  setDie: (die: Die) => void;
  roll: RollResult | null;
  rolling: boolean;
}) {
  return (
    <article style={{
      background: 'var(--color-background)',
      border: `1px solid ${accent}`,
      borderRadius: '8px',
      padding: '1rem',
      boxShadow: `0 0 0 1px ${accent}22`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'start' }}>
        <div>
          <span className="eyebrow" style={{ color: accent }}>{subtitle}</span>
          <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.35rem' }}>{title}</h3>
        </div>
        <select value={die} onChange={(event) => setDie(event.target.value as Die)} aria-label={subtitle}>
          {DIE_LADDER.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div style={{
        minHeight: '190px',
        marginTop: '1rem',
        display: 'grid',
        placeItems: 'center',
        borderRadius: '8px',
        background: `radial-gradient(circle at center, ${accent}22, rgba(15, 23, 42, 0.9) 62%)`,
        border: '1px solid rgba(148, 163, 184, 0.16)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            color: roll?.isMax ? '#fbbf24' : '#f8fafc',
            fontSize: '5rem',
            fontWeight: 900,
            lineHeight: 1,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {rolling ? '...' : roll ? roll.value : die}
          </div>
          <div style={{ color: roll?.isMax ? '#fbbf24' : accent, fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '0.45rem' }}>
            {roll?.isMax ? 'Maximum' : roll ? 'Result' : 'Loaded'}
          </div>
        </div>
      </div>
    </article>
  );
}
