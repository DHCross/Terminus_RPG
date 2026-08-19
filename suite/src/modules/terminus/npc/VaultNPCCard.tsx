import CharacterSheetPreview from '../../gwsd-cards/components/CharacterSheetPreview';
import type { NPCData } from './useNPCStorage';
import { applySheetPatchToNpc, npcToEngine } from '../character/civicSheetAdapter';

export function VaultNPCCard({
  npc,
  onDelete,
  onUpdate,
}: {
  npc: NPCData;
  onDelete: () => void;
  onUpdate: (updates: Partial<NPCData>) => void;
}) {
  return (
    <article
      style={{
        background: 'rgba(15, 23, 42, 0.72)',
        border: '1px solid rgba(148, 163, 184, 0.18)',
        borderLeft: '3px solid #94a3b8',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '0.85rem 1rem',
          borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
        }}
      >
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8' }}>
            Civic field record · NPC
          </div>
          <div style={{ color: '#e2e8f0', fontWeight: 700, marginTop: 2 }}>
            {npc.name || 'Unnamed NPC'}
          </div>
          <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>
            {[npc.lineage, npc.role].filter(Boolean).join(' · ') || 'Unfiled denizen'}
          </div>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          title="Delete NPC"
          onClick={onDelete}
        >
          Delete
        </button>
      </header>

      <div style={{ padding: 12 }}>
        <CharacterSheetPreview
          character={npcToEngine(npc)}
          onChange={(patch) => onUpdate(applySheetPatchToNpc(npc, patch))}
        />
      </div>
    </article>
  );
}
