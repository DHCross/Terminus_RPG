import { useState } from 'react';
import { Archive, Sparkles, Users } from 'lucide-react';
import { NPCGenerator } from './NPCGenerator';
import { VaultNPCCard } from './VaultNPCCard';
import { useNPCStorage } from './useNPCStorage';

export function NPCWorkbench() {
  const [tab, setTab] = useState<'generator' | 'vault'>('generator');
  const { npcs, saveNPC, deleteNPC } = useNPCStorage();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = (npcData: any) => {
    const saved = saveNPC(npcData);
    setSaveMessage(\`\${saved.name} saved to the vault.\`);
    window.setTimeout(() => setSaveMessage(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="tab-bar">
        <button onClick={() => setTab('generator')} className={tab === 'generator' ? 'tab-button active' : 'tab-button'}>
          <Users size={18} /> NPC Generator
        </button>
        <button onClick={() => setTab('vault')} className={tab === 'vault' ? 'tab-button active' : 'tab-button'}>
          <Archive size={18} /> Vault ({npcs.length})
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <div className="panel" style={{ maxWidth: '960px', margin: '0 auto 1rem' }}>
          <div className="chip-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="eyebrow">NPC System</span>
              <h2 style={{ margin: '0.25rem 0 0' }}>Terminus NPCs</h2>
              <p className="muted" style={{ margin: '0.25rem 0 0' }}>
                {npcs.length} vault record{npcs.length === 1 ? '' : 's'}
              </p>
            </div>
            <div className="chip-row">
              <button className="btn btn-secondary" onClick={() => setTab('vault')}>
                <Archive size={16} /> View Vault
              </button>
            </div>
          </div>
          {saveMessage && (
            <div className="empty-state" style={{ marginTop: '1rem', padding: '0.85rem', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              {saveMessage} Check the Vault tab to view.
            </div>
          )}
        </div>

        {tab === 'generator' && (
          <NPCGenerator onSave={handleSave} />
        )}

        {tab === 'vault' && (
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
            }}>
              <div>
                <h2 style={{
                  margin: '0 0 0.25rem 0',
                  fontFamily: "'EB Garamond', serif",
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#f8fafc',
                  letterSpacing: '1px',
                }}>
                  NPC Vault
                </h2>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>
                  {npcs.length === 0
                    ? 'No NPCs on file. Generate one in the Generator.'
                    : \`\${npcs.length} NPC\${npcs.length !== 1 ? 's' : ''} on file\`
                  }
                </p>
              </div>
            </div>

            {npcs.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: 'rgba(30,41,59,0.4)',
                borderRadius: '12px',
                border: '1px dashed rgba(148,163,184,0.2)',
              }}>
                <Sparkles size={32} style={{ color: '#64748b', marginBottom: '1rem', margin: '0 auto' }} />
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 0.5rem 0' }}>
                  No NPCs in the vault yet.
                </p>
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>
                  Generate your first NPC in the Generator tab, then save to vault.
                </p>
              </div>
            )}

            {npcs.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1rem',
              }}>
                {npcs.map((npc) => (
                  <VaultNPCCard
                    key={npc.id}
                    npc={npc}
                    onDelete={() => deleteNPC(npc.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
