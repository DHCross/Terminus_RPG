import { Crosshair, Shield, Swords, Zap, Eye, Gem } from 'lucide-react';
import type { CharacterData } from './useCharacterStorage';
import { THRESHOLD_MAPPING } from '../../../data/terminus/advancement';
import type { Die } from '../../../data/terminus/skills';

/* ── Order identity: color + icon ── */
const ORDER_STYLE: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  seeker:   { color: '#a78bfa', bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.35)', icon: <Eye size={14} /> },
  breaker:  { color: '#f87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.35)', icon: <Swords size={14} /> },
  warden:   { color: '#60a5fa', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.35)',  icon: <Shield size={14} /> },
  rival:    { color: '#fb923c', bg: 'rgba(251,146,60,0.10)',  border: 'rgba(251,146,60,0.35)',  icon: <Crosshair size={14} /> },
  broker:   { color: '#fbbf24', bg: 'rgba(251,191,36,0.10)',  border: 'rgba(251,191,36,0.35)',  icon: <Gem size={14} /> },
  shade:    { color: '#6b7280', bg: 'rgba(107,114,128,0.10)', border: 'rgba(107,114,128,0.35)', icon: <Zap size={14} /> },
};

const FALLBACK_STYLE = { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.25)', icon: null };

/* ── Die pip: visual representation of a die rank ── */
function DiePip({ die }: { die: string }) {
  const rank = parseInt(die.replace('d', ''), 10);
  const sides = [0, 4, 6, 8, 10, 12][rank] || 6;
  const label = die.toUpperCase();

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      background: 'rgba(15,23,42,0.7)',
      border: '1px solid rgba(148,163,184,0.25)',
      borderRadius: '5px',
      padding: '2px 8px',
      fontSize: '0.75rem',
      fontWeight: 600,
      fontFamily: "'JetBrains Mono', monospace",
      color: '#e2e8f0',
    }}>
      <DieShape sides={sides} color="#94a3b8" />
      {label}
    </span>
  );
}

function DieShape({ sides, color }: { sides: number; color: string }) {
  const size = 16;
  if (sides === 4) {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <polygon points="8,1 15,13 1,13" stroke={color} strokeWidth="1.2" fill="none" />
      </svg>
    );
  }
  if (sides === 6) {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke={color} strokeWidth="1.2" fill="none" />
      </svg>
    );
  }
  if (sides === 8) {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <polygon points="8,1 14,4 14,12 8,15 2,12 2,4" stroke={color} strokeWidth="1.2" fill="none" />
      </svg>
    );
  }
  if (sides === 10) {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <polygon points="8,0.5 14,3 14,9 8,15.5 2,9 2,3" stroke={color} strokeWidth="1.2" fill="none" />
      </svg>
    );
  }
  // d12
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <polygon points="8,0.5 14,4 14,12 8,15.5 2,12 2,4" stroke={color} strokeWidth="1.2" fill="none" />
      <line x1="8" y1="0.5" x2="8" y2="15.5" stroke={color} strokeWidth="0.6" opacity="0.5" />
    </svg>
  );
}

/* ── Threshold circles: visual ○/● display ── */
function ThresholdCircles({ skillDie, label }: { skillDie: string; label: string }) {
  const maxCircles = THRESHOLD_MAPPING[skillDie as Die] || 1;
  const circles = Array.from({ length: maxCircles }, (_, i) => (
    <span key={i} style={{
      display: 'inline-block',
      width: '9px',
      height: '9px',
      borderRadius: '50%',
      border: '1.5px solid #64748b',
      background: 'transparent',
      marginRight: i < maxCircles - 1 ? '3px' : '0',
    }} />
  ));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', width: '38px', flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ display: 'flex', alignItems: 'center' }}>{circles}</span>
    </div>
  );
}

/* ── Narrative snippet ── */
function NarrativeLine({ text, label }: { text?: string; label: string }) {
  if (!text) return null;
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '0.78rem',
      fontFamily: "'EB Garamond', serif",
      fontStyle: 'italic',
      color: '#94a3b8',
      lineHeight: 1.4,
    }}>
      <span style={{ color: '#64748b', fontStyle: 'normal' }}>{label} </span>
      {text}
    </span>
  );
}

/* ── Ability chip ── */
function AbilityChip({ name }: { name: string }) {
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '0.65rem',
      padding: '2px 8px',
      borderRadius: '999px',
      border: '1px solid rgba(148,163,184,0.18)',
      background: 'rgba(148,163,184,0.06)',
      color: '#94a3b8',
      whiteSpace: 'nowrap',
    }}>
      {name}
    </span>
  );
}

/* ── Main Card ── */
export function VaultCharacterCard({
  character,
  isSelected,
  onSelect,
  onDelete,
}: {
  character: CharacterData;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const orderKey = (character.order || '').toLowerCase();
  const style = ORDER_STYLE[orderKey] || FALLBACK_STYLE;

  const abilities: string[] = character.orderAbilities
    ? character.orderAbilities.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const hasNarrative = !!(character.frame || character.edge);

  return (
    <div
      onClick={onSelect}
      style={{
        position: 'relative',
        cursor: 'pointer',
        background: isSelected
          ? `linear-gradient(135deg, ${style.bg}, rgba(30,41,59,0.9))`
          : 'var(--color-surface)',
        border: `1px solid ${isSelected ? style.border : 'var(--color-border)'}`,
        borderLeft: `3px solid ${style.color}`,
        borderRadius: '10px',
        padding: '0',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = style.border;
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px ${style.border}`;
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'var(--color-border)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {/* Header stripe */}
      <div style={{
        padding: '1rem 1.25rem 0.5rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name */}
          <h3 style={{
            margin: 0,
            fontFamily: "'EB Garamond', serif",
            fontSize: '1.35rem',
            fontWeight: 700,
            color: '#f8fafc',
            letterSpacing: '0.5px',
            lineHeight: 1.2,
          }}>
            {character.name}
          </h3>

          {/* Order + Species badge row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
            {character.order && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: style.color,
                background: style.bg,
                border: `1px solid ${style.border}`,
                borderRadius: '5px',
                padding: '2px 10px',
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
              }}>
                {style.icon}
                {character.order}
              </span>
            )}
            {character.species && (
              <span style={{
                fontSize: '0.72rem',
                color: '#94a3b8',
                background: 'rgba(148,163,184,0.08)',
                borderRadius: '4px',
                padding: '2px 8px',
              }}>
                {character.species}
              </span>
            )}
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete character"
          style={{
            background: 'transparent',
            border: '1px solid transparent',
            color: '#64748b',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '5px',
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e2 => {
            e2.currentTarget.style.color = '#ef4444';
            e2.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)';
            e2.currentTarget.style.background = 'rgba(239,68,68,0.08)';
          }}
          onMouseLeave={e2 => {
            e2.currentTarget.style.color = '#64748b';
            e2.currentTarget.style.borderColor = 'transparent';
            e2.currentTarget.style.background = 'transparent';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>

      {/* Core stats: Skills + Thresholds */}
      <div style={{
        padding: '0.5rem 1.25rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6px 12px',
        borderTop: '1px solid rgba(51,65,85,0.35)',
        borderBottom: '1px solid rgba(51,65,85,0.35)',
      }}>
        {/* Left: Skill dice */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', width: '38px' }}>F</span>
            <DiePip die={character.skills?.Force || 'd4'} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', width: '38px' }}>A</span>
            <DiePip die={character.skills?.Agility || 'd4'} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', width: '38px' }}>W</span>
            <DiePip die={character.skills?.Willpower || 'd4'} />
          </div>
        </div>

        {/* Right: Threshold circles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', justifyContent: 'center' }}>
          <ThresholdCircles skillDie={character.skills?.Force || 'd4'} label="Endure" />
          <ThresholdCircles skillDie={character.skills?.Agility || 'd4'} label="Avoid" />
          <ThresholdCircles skillDie={character.skills?.Willpower || 'd4'} label="Exert" />
        </div>
      </div>

      {/* Identity strip: Approach + Signature + Equipment */}
      <div style={{
        padding: '0.6rem 1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        fontSize: '0.72rem',
        color: '#94a3b8',
        borderBottom: hasNarrative || abilities.length > 0 ? '1px solid rgba(51,65,85,0.25)' : 'none',
      }}>
        {character.approach && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ color: '#64748b', fontSize: '0.6rem', textTransform: 'uppercase' }}>Approach</span>
            <span style={{ color: '#e2e8f0' }}>{character.approach}</span>
          </span>
        )}
        {character.signature && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ color: '#64748b', fontSize: '0.6rem', textTransform: 'uppercase' }}>Signature</span>
            <span style={{ color: '#e2e8f0', fontStyle: 'italic' }}>{character.signature}</span>
          </span>
        )}
        {character.primaryWeapon && character.primaryWeapon !== 'unarmed' && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ color: '#64748b', fontSize: '0.6rem', textTransform: 'uppercase' }}>Weapon</span>
            <span style={{ color: '#cbd5e1' }}>{character.primaryWeapon}</span>
          </span>
        )}
        {character.armor && character.armor !== 'none' && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ color: '#64748b', fontSize: '0.6rem', textTransform: 'uppercase' }}>Armor</span>
            <span style={{ color: '#cbd5e1' }}>{character.armor}</span>
          </span>
        )}
      </div>

      {/* Narrative background */}
      {hasNarrative && (
        <div style={{
          padding: '0.6rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          borderBottom: abilities.length > 0 ? '1px solid rgba(51,65,85,0.25)' : 'none',
        }}>
          <NarrativeLine text={character.frame} label="—”" />
          <NarrativeLine text={character.edge} label="—”" />
        </div>
      )}

      {/* Abilities */}
      {abilities.length > 0 && (
        <div style={{
          padding: '0.6rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '5px',
          borderBottom: '1px solid rgba(51,65,85,0.2)',
        }}>
          {abilities.slice(0, 4).map((a, i) => (
            <AbilityChip key={i} name={a} />
          ))}
          {abilities.length > 4 && (
            <span style={{ fontSize: '0.65rem', color: '#64748b' }}>+{abilities.length - 4} more</span>
          )}
        </div>
      )}

      {/* Footer: date + metadata */}
      <div style={{
        padding: '0.5rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.65rem',
        color: '#475569',
      }}>
        <span>Created {new Date(character.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        {isSelected && (
          <span style={{ color: style.color, fontWeight: 600, fontSize: '0.68rem' }}>Active</span>
        )}
      </div>
    </div>
  );
}
