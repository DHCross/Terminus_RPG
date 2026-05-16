import { Trash2 } from 'lucide-react';
import type { NPCData } from './useNPCStorage';

interface VaultNPCCardProps {
  npc: NPCData;
  onDelete: () => void;
}

export function VaultNPCCard({ npc, onDelete }: VaultNPCCardProps) {
  return (
    <div style={{
      background: 'rgba(30,41,59,0.5)',
      border: '1px solid rgba(148,163,184,0.1)',
      borderRadius: '8px',
      padding: '1rem',
      position: 'relative',
    }}>
      <button
        onClick={onDelete}
        title="Delete NPC"
        style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          background: 'transparent',
          border: 'none',
          color: '#64748b',
          cursor: 'pointer',
        }}
      >
        <Trash2 size={16} />
      </button>
      
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: '0 0 0.25rem 0', color: '#f8fafc', fontSize: '1.25rem', fontFamily: "'EB Garamond', serif" }}>
          {npc.name || 'Unnamed NPC'}
        </h3>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
          {npc.lineage || 'Unknown Lineage'} | {npc.role || 'Unknown Role'}
        </p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
        <div>
          <strong style={{ color: '#cbd5e1', display: 'block' }}>Appearance & Quirk</strong>
          <span style={{ color: '#94a3b8' }}>{npc.appearance} {npc.quirk}</span>
        </div>
        <div>
          <strong style={{ color: '#fca5a5', display: 'block' }}>Will (Intent)</strong>
          <span style={{ color: '#94a3b8' }}>{npc.will}</span>
        </div>
        <div>
          <strong style={{ color: '#c084fc', display: 'block' }}>Drift (If Ignored)</strong>
          <span style={{ color: '#94a3b8' }}>{npc.drift}</span>
        </div>
      </div>
    </div>
  );
}
