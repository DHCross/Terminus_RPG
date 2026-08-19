/* ── Signature Key Ledger ── */
/* Visual mockup showing how iconic gear displays its Operational Permissions, Kinetic Alignment, and Calibration. */

import { useState } from 'react';
import { ALL_SIGNATURE_KEYS } from './signatureKeyData';
import type { SignatureKey, SignatureCategory } from './signatureKeyData';

const CATEGORY_COLORS: Record<SignatureCategory, string> = {
  'Signature Implement': '#ef4444',
  'Working Anchor': '#8b5cf6',
  'Resonance Key': '#10b981',
  'Unified Signature': '#f59e0b',
};

const CATEGORY_ICONS: Record<SignatureCategory, string> = {
  'Signature Implement': '⚔',
  'Working Anchor': '✦',
  'Resonance Key': '◈',
  'Unified Signature': '✧',
};

const PERMISSION_TYPE_COLORS: Record<string, string> = {
  'Weapon Exception': '#ef4444',
  'Anchor Exception': '#8b5cf6',
  'Resonance Exception': '#10b981',
};

export function SignatureKeyLedger() {
  const [selected, setSelected] = useState<string>(ALL_SIGNATURE_KEYS[0].id);
  const active = ALL_SIGNATURE_KEYS.find((k) => k.id === selected) ?? ALL_SIGNATURE_KEYS[0];

  return (
    <div
      style={{
        maxWidth: 720,
        margin: '0 auto',
        background: 'linear-gradient(180deg,#0b1220,#0f172a)',
        border: '1px solid #1e293b',
        borderRadius: 14,
        color: '#e2e8f0',
        fontFamily: "'EB Garamond', serif",
        boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid #1e293b',
          background: 'linear-gradient(90deg,#111827,#0b1220)',
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#f59e0b',
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Coherence System · Gear Registry
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: '#f8fafc' }}>
          Signature Key Ledger
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', marginTop: 2 }}>
          Defining items that make a character legally and physically legible to the scene state.
        </div>
      </div>

      {/* Key selector tabs */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: '12px 16px',
          borderBottom: '1px solid #1e293b',
          overflowX: 'auto',
          background: 'rgba(11,18,32,0.6)',
        }}
      >
        {ALL_SIGNATURE_KEYS.map((key) => {
          const color = CATEGORY_COLORS[key.category];
          const isActive = key.id === selected;
          return (
            <button
              key={key.id}
              onClick={() => setSelected(key.id)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: `1px solid ${isActive ? color + '66' : '#1e293b'}`,
                background: isActive ? color + '15' : 'transparent',
                color: isActive ? '#f8fafc' : '#94a3b8',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ color, fontSize: 14 }}>{CATEGORY_ICONS[key.category]}</span>
              {key.name}
            </button>
          );
        })}
      </div>

      {/* Active key detail */}
      <KeyDetail keyData={active} />
    </div>
  );
}

function KeyDetail({ keyData: k }: { keyData: SignatureKey }) {
  const color = CATEGORY_COLORS[k.category];

  return (
    <div style={{ padding: '24px', display: 'grid', gap: 20 }}>
      {/* Identity block */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 16,
          paddingBottom: 16,
          borderBottom: '1px solid #1e293b',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 10,
            background: color + '18',
            border: `1px solid ${color}44`,
            color: color,
            fontSize: 24,
            flexShrink: 0,
          }}
        >
          {CATEGORY_ICONS[k.category]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f8fafc' }}>{k.name}</div>
          <div style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>
            Bearer: <span style={{ color: '#e2e8f0', fontStyle: 'normal', fontWeight: 600 }}>{k.bearer}</span>
          </div>
          <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <CategoryBadge category={k.category} formerly={k.categoryFormerly} color={color} />
            {k.heritageRegistered && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: '#f59e0b',
                  background: '#f59e0b11',
                  border: '1px solid #f59e0b33',
                  borderRadius: 4,
                  padding: '3px 8px',
                }}
              >
                ✓ Heritage Registered
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={{ fontSize: 13.5, color: '#cbd5e1', fontStyle: 'italic', lineHeight: 1.6 }}>
        {k.description}
      </div>

      {/* Kinetic Alignment */}
      <div
        style={{
          border: `1px solid ${color}33`,
          borderRadius: 8,
          padding: '14px 16px',
          background: color + '08',
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: color,
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
            marginBottom: 8,
          }}
        >
          Kinetic Alignment
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <AlignmentChip label={k.kineticAlignment.skill} color={color} />
          <span style={{ color: '#475569', fontSize: 14 }}>→</span>
          <AlignmentChip label={k.kineticAlignment.threshold} color={color} />
        </div>
        <div style={{ fontSize: 12.5, color: '#94a3b8' }}>{k.kineticAlignment.description}</div>
      </div>

      {/* Implement Calibration */}
      <div
        style={{
          border: '1px solid #1e293b',
          borderRadius: 8,
          padding: '14px 16px',
          background: 'rgba(15,23,42,0.6)',
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#94a3b8',
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
            marginBottom: 8,
          }}
        >
          Implement Calibration
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 10,
              background: 'linear-gradient(180deg,#1e293b,#0f172a)',
              border: '1px solid #334155',
              color: '#f59e0b',
              fontSize: 28,
              fontWeight: 800,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            +{k.calibration}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 600 }}>
              {k.calibration > 0
                ? `Calibration bonus (+${k.calibration}): increases weapon Impact or steps up Skill rolls on aligned exchanges.`
                : 'Defensive / emotional continuity item — stabilizes Resolve and Threshold circles.'}
            </div>
            <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>{k.calibrationNote}</div>
          </div>
        </div>
      </div>

      {/* Focus Pool (Unified Signatures only) */}
      {k.focusPool && (
        <div
          style={{
            border: '1px solid #f59e0b33',
            borderRadius: 8,
            padding: '14px 16px',
            background: '#f59e0b08',
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#f59e0b',
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              marginBottom: 8,
            }}
          >
            Focus Pool — Unified Signature
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: k.focusPool.max }, (_, i) => (
                <span
                  key={i}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: 'Inter, sans-serif',
                    background: i < k.focusPool!.current ? '#f59e0b22' : 'transparent',
                    border: `1.5px solid ${i < k.focusPool!.current ? '#f59e0b' : '#334155'}`,
                    boxShadow: i < k.focusPool!.current ? '0 0 8px rgba(245,158,11,0.4)' : 'none',
                    color: i < k.focusPool!.current ? '#f59e0b' : '#475569',
                  }}
                >
                  ●
                </span>
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              <strong style={{ color: '#e2e8f0' }}>{k.focusPool.current}/{k.focusPool.max}</strong> Focus Points.
              Spend to cast Workings without marking personal Exert Circles — the item absorbs the strain.
            </div>
          </div>
        </div>
      )}

      {/* Embedded Permissions */}
      <div>
        <div
          style={{
            fontSize: 10,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#94a3b8',
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
            marginBottom: 10,
            borderBottom: '1px solid #1e293b',
            paddingBottom: 6,
          }}
        >
          Embedded Permissions {k.embeddedPermissions.length > 0 && `(${k.embeddedPermissions.length})`}
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {k.embeddedPermissions.map((perm) => {
            const permColor = PERMISSION_TYPE_COLORS[perm.type] || '#64748b';
            return (
              <div
                key={perm.name}
                style={{
                  border: '1px solid #1e293b',
                  borderRadius: 8,
                  padding: '12px 14px',
                  background: 'rgba(15,23,42,0.6)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>{perm.name}</span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: 'Inter, sans-serif',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      color: permColor,
                      background: permColor + '11',
                      border: `1px solid ${permColor}33`,
                      borderRadius: 4,
                      padding: '2px 8px',
                    }}
                  >
                    {perm.type}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>
                  formerly <em>{perm.formerly}</em>
                </div>
                <div style={{ fontSize: 12.5, color: '#cbd5e1', marginBottom: 6 }}>{perm.effect}</div>
                <div
                  style={{
                    fontSize: 11,
                    color: permColor,
                    fontFamily: 'Inter, sans-serif',
                    background: permColor + '08',
                    borderRadius: 4,
                    padding: '4px 8px',
                  }}
                >
                  <strong style={{ letterSpacing: '1px', textTransform: 'uppercase', fontSize: 10 }}>Mechanical:</strong>{' '}
                  {perm.mechanical}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Heritage Register status */}
      <div
        style={{
          padding: '12px 14px',
          border: `1px ${k.heritageRegistered ? 'solid' : 'dashed'} #1e293b`,
          borderRadius: 8,
          background: k.heritageRegistered ? 'rgba(245,158,11,0.04)' : 'transparent',
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
            color: k.heritageRegistered ? '#f59e0b' : '#475569',
            marginBottom: 4,
          }}
        >
          Heritage Register {k.heritageRegistered ? '✓ Certified' : '✗ Unregistered'}
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>{k.heritageNote}</div>
      </div>
    </div>
  );
}

function CategoryBadge({ category, formerly, color }: { category: SignatureCategory; formerly: string; color: string }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        color: color,
        background: color + '11',
        border: `1px solid ${color}33`,
        borderRadius: 4,
        padding: '3px 8px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {category}
      <span style={{ color: '#475569', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
        (was {formerly})
      </span>
    </span>
  );
}

function AlignmentChip({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
        padding: '4px 12px',
        borderRadius: 6,
        background: color + '15',
        border: `1px solid ${color}44`,
        color: '#e2e8f0',
        fontWeight: 700,
        fontSize: 12,
        fontFamily: 'Inter, sans-serif',
        textTransform: 'capitalize',
      }}
    >
      {label}
    </span>
  );
}
