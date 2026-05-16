import { Trash2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { NPCData } from './useNPCStorage';

interface VaultNPCCardProps {
  npc: NPCData;
  onDelete: () => void;
}

export function VaultNPCCard({ npc, onDelete }: VaultNPCCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = () => {
    const markdown = \`# \${npc.name || 'Unnamed NPC'}
*\${npc.lineage || 'Unknown Lineage'} \${npc.role || 'Unknown Role'}*

**Appearance:** \${npc.appearance}
**Quirk:** \${npc.quirk}

**Will:** \${npc.will}
**Drift:** \${npc.drift}\`;

    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      background: 'rgba(30,41,59,0.5)',
      border: '1px solid rgba(148,163,184,0.1)',
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
          title="Delete NPC"
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
        <h3 style={{ margin: '0 0 0.25rem 0', color: '#f8fafc', fontSize: '1.25rem', fontFamily: "'Cinzel', serif" }}>
          {npc.name || 'Unnamed NPC'}
        </h3>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
          {npc.lineage || 'Unknown Lineage'} | {npc.role || 'Unknown Role'}
        </p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
        <div>
          <strong style={{ color: '#cbd5e1', display: 'block', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Appearance & Quirk</strong>
          <span style={{ color: '#94a3b8', fontFamily: "'EB Garamond', serif", fontSize: '1.05rem' }}>{npc.appearance} {npc.quirk}</span>
        </div>
        <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '0.5rem', borderRadius: '4px', borderLeft: '2px solid #ef4444' }}>
          <strong style={{ color: '#fca5a5', display: 'block', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Will (Intent)</strong>
          <span style={{ color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}>{npc.will}</span>
        </div>
        <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '0.5rem', borderRadius: '4px', borderLeft: '2px solid #a855f7' }}>
          <strong style={{ color: '#c084fc', display: 'block', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Drift (If Ignored)</strong>
          <span style={{ color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}>{npc.drift}</span>
        </div>
      </div>
    </div>
  );
}
