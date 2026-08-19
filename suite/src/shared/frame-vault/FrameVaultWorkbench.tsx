import { useEffect, useRef } from 'react';
import { Archive, Plus, Sparkles } from 'lucide-react';
import CharacterSheetPreview from '../../modules/gwsd-cards/components/CharacterSheetPreview';
import { useVaultStorage } from '../useVaultStorage';
import type { SheetChrome } from '../../settings/sheetChrome';
import { applySheetPatchToFrame, blankFrame, frameToEngine } from './adapter';
import type { FrameVaultKind, FrameVaultRecord } from './types';

interface Props {
  packId: string;
  kind: FrameVaultKind;
  chrome: SheetChrome;
  title: string;
  seeds?: Array<Omit<FrameVaultRecord, 'id' | 'createdAt'>>;
}

export function FrameVaultWorkbench({ packId, kind, chrome, title, seeds = [] }: Props) {
  const storageKey = `coherence-vault:${packId}:${kind}`;
  const seededKey = `${storageKey}:seeded`;
  const { records, selectedId, setSelectedId, save, update, remove } = useVaultStorage<FrameVaultRecord>(storageKey, {
    selectedKey: `${storageKey}:selected`,
  });
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    if (records.length > 0) return;
    if (seeds.length === 0) return;
    if (typeof window !== 'undefined' && window.localStorage.getItem(seededKey)) return;
    seeds.forEach((seed) => save(seed));
    window.localStorage.setItem(seededKey, '1');
  }, [records.length, save, seededKey, seeds]);

  const noun = kind === 'npc' ? 'NPC' : chrome.recordNoun;
  const nounPlural = kind === 'npc' ? 'NPCs' : chrome.recordNounPlural;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 0 2rem' }}>
      <div className="panel" style={{ marginBottom: '1.25rem' }}>
        <div className="chip-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="eyebrow">{kind === 'npc' ? 'NPC files' : 'Active frames'}</span>
            <h2 style={{ margin: '0.25rem 0 0' }}>{title}</h2>
            <p className="muted" style={{ margin: '0.25rem 0 0' }}>
              {records.length === 0
                ? `No ${nounPlural} on file yet.`
                : `${records.length} ${records.length === 1 ? noun : nounPlural} on file. Each file is the fillable field document.`}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              const created = save(blankFrame(chrome, kind));
              if (created) setSelectedId(created.id);
            }}
          >
            <Plus size={16} /> New {kind === 'npc' ? 'NPC' : 'Record'}
          </button>
        </div>
      </div>

      {records.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'rgba(30,41,59,0.4)',
            borderRadius: 12,
            border: '1px dashed rgba(148,163,184,0.2)',
          }}
        >
          <Sparkles size={32} style={{ color: '#64748b', marginBottom: '1rem' }} />
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 0.5rem' }}>
            The vault is empty.
          </p>
          <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>
            Click <strong style={{ color: '#94a3b8' }}>New {kind === 'npc' ? 'NPC' : 'Record'}</strong> and type directly on the sheet.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
        {records.map((record) => {
          const isSelected = selectedId === record.id;
          return (
            <article
              key={record.id}
              style={{
                background: 'rgba(15, 23, 42, 0.72)',
                border: `1px solid ${isSelected ? 'rgba(245,158,11,0.45)' : 'rgba(148, 163, 184, 0.18)'}`,
                borderLeft: `3px solid ${isSelected ? '#f59e0b' : '#64748b'}`,
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
                    <Archive size={12} style={{ display: 'inline', marginRight: 6 }} />
                    {kind === 'npc' ? 'NPC field record' : 'Field record'}
                  </div>
                  <div style={{ color: '#e2e8f0', fontWeight: 700, marginTop: 2 }}>
                    {record.name || 'Unnamed'}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>
                    {[record.species, record.order].filter(Boolean).join(' · ')}
                    {isSelected ? ' · Active' : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedId(record.id)}>
                    {isSelected ? 'Active' : 'Set Active'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => remove(record.id)}>
                    Delete
                  </button>
                </div>
              </header>
              <div style={{ padding: 12 }}>
                <CharacterSheetPreview
                  key={record.id}
                  character={frameToEngine(record, chrome)}
                  chrome={chrome}
                  abilities={record.abilities}
                  armorId={record.armor}
                  onChange={(patch) => update(record.id, applySheetPatchToFrame(record, patch))}
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
