import CharacterSheetPreview from '../../gwsd-cards/components/CharacterSheetPreview';
import type { CharacterData } from './useCharacterStorage';
import { applySheetPatchToCharacter, displayOrder, vaultAbilities, vaultCharacterToEngine } from './civicSheetAdapter';

const ORDER_COLOR: Record<string, string> = {
  seeker: '#a78bfa',
  breaker: '#f87171',
  warden: '#60a5fa',
  rival: '#fb923c',
  broker: '#fbbf24',
  shade: '#6b7280',
};

export function VaultCharacterCard({
  character,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
}: {
  character: CharacterData;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<CharacterData>) => void;
}) {
  const orderKey = (character.order || '').toLowerCase();
  const accent = ORDER_COLOR[orderKey] || '#94a3b8';

  return (
    <article
      style={{
        background: 'rgba(15, 23, 42, 0.72)',
        border: `1px solid ${isSelected ? accent : 'rgba(148, 163, 184, 0.18)'}`,
        borderLeft: `3px solid ${accent}`,
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
          <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent }}>
            Civic field record
          </div>
          <div style={{ color: '#e2e8f0', fontWeight: 700, marginTop: 2 }}>
            {character.name || 'Unnamed Responder'}
          </div>
          <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>
            {displayOrder(character.order)}
            {isSelected ? ' · Active' : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onSelect}
          >
            {isSelected ? 'Active' : 'Set Active'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            title="Delete character"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </header>

      <div style={{ padding: 12 }}>
        <CharacterSheetPreview
          key={character.id}
          character={vaultCharacterToEngine(character)}
          abilities={vaultAbilities(character)}
          armorId={character.armor}
          onChange={(patch) => onUpdate(applySheetPatchToCharacter(character, patch))}
        />
      </div>
    </article>
  );
}
