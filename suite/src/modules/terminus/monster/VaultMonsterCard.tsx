import { Trash2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { MonsterData } from './useMonsterStorage';

interface VaultMonsterCardProps {
  monster: MonsterData;
  onDelete: () => void;
}

export function VaultMonsterCard({ monster, onDelete }: VaultMonsterCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = () => {
    const markdown = `# ${monster.name}
*${monster.threatLevel} ${monster.category}*

**Appearance:** ${monster.appearance}

**Combat Profile**
- **Force:** ${monster.skills.Force} (Endure: ${monster.thresholds.Endure})
- **Agility:** ${monster.skills.Agility} (Avoid: ${monster.thresholds.Avoid})
- **Willpower:** ${monster.skills.Willpower} (Exert: ${monster.thresholds.Exert})
- **Armor Reduction:** ${monster.armor}

**Actions**
- ⚔️ **${monster.primaryAttack.name}:** Impact ${monster.primaryAttack.impact} [${monster.primaryAttack.vectors}]
${monster.specialAbility ? `- ✨ **Special:** ${monster.specialAbility}` : ''}

**Will:** ${monster.will}
**Drift:** ${monster.drift}`;

    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      background: 'rgba(30,41,59,0.5)',
      border: '1px solid rgba(153, 27, 27, 0.3)',
      borderRadius: '8px',
      padding: '1rem',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleCopyMarkdown}
          title="Copy Markdown"
          style={{
            background: 'transparent',
            border: 'none',
            color: copied ? '#10b981' : '#64748b',
            cursor: 'pointer',
            padding: '2px'
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
        <button
          onClick={onDelete}
          title="Delete Monster"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '2px'
          }}
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      <div style={{ marginBottom: '1rem', paddingRight: '2.5rem' }}>
        <h3 style={{ margin: '0 0 0.25rem 0', color: '#f87171', fontSize: '1.25rem', fontFamily: "'Cinzel', serif" }}>
          {monster.name}
        </h3>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
          {monster.threatLevel} | {monster.category}
        </p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
        <div>
          <span style={{ color: '#cbd5e1', fontFamily: "'EB Garamond', serif", fontSize: '1.05rem', fontStyle: 'italic' }}>
            {monster.appearance}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.5rem', borderRadius: '4px' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Force</span>
            <strong style={{ color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace" }}>{monster.skills.Force}</strong>
            <span style={{ display: 'block', fontSize: '0.65rem', color: '#f87171' }}>Endure {monster.thresholds.Endure}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Agility</span>
            <strong style={{ color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace" }}>{monster.skills.Agility}</strong>
            <span style={{ display: 'block', fontSize: '0.65rem', color: '#60a5fa' }}>Avoid {monster.thresholds.Avoid}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Willpower</span>
            <strong style={{ color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace" }}>{monster.skills.Willpower}</strong>
            <span style={{ display: 'block', fontSize: '0.65rem', color: '#c084fc' }}>Exert {monster.thresholds.Exert}</span>
          </div>
        </div>

        <div>
          <strong style={{ color: '#fbbf24', display: 'block', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Attack</strong>
          <span style={{ color: '#e2e8f0', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem' }}>
            ⚔️ {monster.primaryAttack.name} (Impact {monster.primaryAttack.impact}) [{monster.primaryAttack.vectors}]
          </span>
        </div>

        {monster.specialAbility && (
          <div>
            <strong style={{ color: '#fbbf24', display: 'block', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Special Ability</strong>
            <span style={{ color: '#e2e8f0', fontFamily: "'EB Garamond', serif", fontSize: '1rem' }}>
              ✨ {monster.specialAbility}
            </span>
          </div>
        )}

        <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '0.5rem', borderRadius: '4px', borderLeft: '2px solid #ef4444' }}>
          <strong style={{ color: '#fca5a5', display: 'block', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Will (Intent)</strong>
          <span style={{ color: '#e2e8f0', fontFamily: "'EB Garamond', serif", fontSize: '1rem' }}>{monster.will}</span>
        </div>
        <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '0.5rem', borderRadius: '4px', borderLeft: '2px solid #a855f7' }}>
          <strong style={{ color: '#c084fc', display: 'block', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Drift (If Ignored)</strong>
          <span style={{ color: '#e2e8f0', fontFamily: "'EB Garamond', serif", fontSize: '1rem' }}>{monster.drift}</span>
        </div>
      </div>
    </div>
  );
}
