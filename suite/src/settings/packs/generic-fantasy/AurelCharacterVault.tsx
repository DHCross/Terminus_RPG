import { useSearchParams } from 'react-router-dom';
import { Archive, Sparkles } from 'lucide-react';
import { FrameVaultWorkbench } from '../../../shared/frame-vault/FrameVaultWorkbench';
import { AUREL_SHEET_CHROME } from '../../sheetChrome';
import { AUREL_CHARACTER_SEEDS } from './seeds';
import { CoherenceCharacterCard } from './CoherenceCharacterCard';
import { DWARVEN_FIGHTER, ELVEN_WIZARD, DIVINE_THEURGIST, type CharacterCardData } from './characterData';

const EXAMPLES: Array<{
  id: string;
  label: string;
  shortDesc: string;
  character: CharacterCardData;
}> = [
  {
    id: 'durgrim',
    label: 'Durgrim Ironvow',
    shortDesc: 'Durgrim Ironvow (Dwarf Vanguard) — Front-line anchor, Endure 5 circles, Impact 3 Greatsword',
    character: DWARVEN_FIGHTER,
  },
  {
    id: 'sylarien',
    label: 'Sylarien Moon-Glass',
    shortDesc: 'Sylarien Moon-Glass (Elven Esoteric Arts) — High Avoid, deep Exert, Unanchored Casting',
    character: ELVEN_WIZARD,
  },
  {
    id: 'caedmon',
    label: 'Brother Caedmon',
    shortDesc: 'Brother Caedmon (Human Sacred Covenants) — Bound by the Edgeless Vow, mending Workings',
    character: DIVINE_THEURGIST,
  },
];

export function AurelCharacterVault() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'examples' ? 'examples' : 'records';
  const selectedExampleId = searchParams.get('example') || 'all';

  const setTab = (tab: 'records' | 'examples') => {
    const next = new URLSearchParams(searchParams);
    if (tab === 'records') {
      next.delete('tab');
      next.delete('example');
    } else {
      next.set('tab', 'examples');
    }
    setSearchParams(next, { replace: true });
  };

  const setExample = (id: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', 'examples');
    if (id === 'all') {
      next.delete('example');
    } else {
      next.set('example', id);
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 0 2rem' }}>
      {/* ── Top Tab Switcher ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: '1.5rem',
          padding: '0.6rem 1rem',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          borderRadius: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setTab('records')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 8,
              border: activeTab === 'records' ? '1px solid #f59e0b' : '1px solid transparent',
              background: activeTab === 'records' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: activeTab === 'records' ? '#f59e0b' : '#94a3b8',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.15s ease',
            }}
          >
            <Archive size={16} />
            Vault Records (Editable)
          </button>
          <button
            type="button"
            onClick={() => setTab('examples')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 8,
              border: activeTab === 'examples' ? '1px solid #f59e0b' : '1px solid transparent',
              background: activeTab === 'examples' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: activeTab === 'examples' ? '#f59e0b' : '#94a3b8',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={16} />
            Example Archetypes (3)
          </button>
        </div>

        <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
          {activeTab === 'records'
            ? 'Fillable field documents with localStorage persistence'
            : 'Interactive tabletop cards with live dice & circle tracking'}
        </div>
      </div>

      {/* ── Content View ── */}
      {activeTab === 'records' ? (
        <FrameVaultWorkbench
          packId="generic-fantasy"
          kind="character"
          chrome={AUREL_SHEET_CHROME}
          title="Aurel Character Vault"
          seeds={AUREL_CHARACTER_SEEDS}
        />
      ) : (
        <div>
          {/* Examples Header */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              background: 'rgba(15, 23, 42, 0.72)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 12,
              marginBottom: '1.75rem',
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                color: '#f59e0b',
                fontWeight: 800,
                fontFamily: 'Inter, sans-serif',
                marginBottom: 4,
              }}
            >
              Aurel Partition · Reference Archetypes
            </div>
            <h2
              style={{
                fontSize: 22,
                color: '#f8fafc',
                margin: '0 0 8px',
                fontFamily: "'EB Garamond', serif",
              }}
            >
              Example Character Table Cards
            </h2>
            <p
              style={{
                color: '#94a3b8',
                fontSize: 14,
                margin: '0 0 14px',
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.5,
              }}
            >
              These three pre-generated characters showcase how Aurel builds upon the Coherence System.
              Each card features interactive Threshold circle tracking, live skill die rolling, and Working
              casting simulations (Sanctioned vs Unanchored Drift).
            </p>

            {/* Filter pills for selecting specific archetype or all */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setExample('all')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: selectedExampleId === 'all' ? '1px solid #f59e0b' : '1px solid #334155',
                  background: selectedExampleId === 'all' ? '#f59e0b' : 'rgba(30, 41, 59, 0.6)',
                  color: selectedExampleId === 'all' ? '#0f172a' : '#cbd5e1',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                View All (3)
              </button>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => setExample(ex.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: selectedExampleId === ex.id ? '1px solid #f59e0b' : '1px solid #334155',
                    background: selectedExampleId === ex.id ? '#f59e0b' : 'rgba(30, 41, 59, 0.6)',
                    color: selectedExampleId === ex.id ? '#0f172a' : '#cbd5e1',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Render cards */}
          <div style={{ display: 'grid', gap: '2.5rem' }}>
            {EXAMPLES.filter((ex) => selectedExampleId === 'all' || selectedExampleId === ex.id).map(
              (ex, index) => (
                <div key={ex.id}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 14,
                      padding: '8px 16px',
                      borderRadius: 8,
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(148, 163, 184, 0.15)',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#f59e0b',
                        fontSize: 12,
                        fontWeight: 800,
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {index + 1}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: '#e2e8f0',
                        fontWeight: 700,
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {ex.shortDesc}
                    </span>
                  </div>
                  <CoherenceCharacterCard character={ex.character} />
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
