/* ── Generic Fantasy Pack — Dashboard (Art & Interactive Alpha 0.2) ── */

import { AurelStoryEngine } from './AurelStoryEngine';
import { SignatureKeyLedger } from './SignatureKeyLedger';
import { Link } from 'react-router-dom';

/* ── Section Divider with glyph ── */
function SectionDivider({ glyph, label }: { glyph: string; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'rgba(245,158,11,0.12)',
          border: '1px solid rgba(245,158,11,0.3)',
          color: '#f59e0b',
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {glyph}
      </span>
      <span
        style={{
          display: 'inline-flex',
          fontSize: 11,
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          color: '#94a3b8',
          fontWeight: 800,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #1e293b, transparent)' }} />
    </div>
  );
}

export default function GenericFantasyDashboard() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Hero Banner ── */}
      <div
        style={{
          position: 'relative',
          height: 340,
          overflow: 'hidden',
          marginBottom: 44,
          borderRadius: '0 0 16px 16px',
        }}
      >
        <img
          src="/art/aurel-hero-banner.jpg"
          alt="The Aurel Setting"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%',
          }}
        />
        {/* Dark overlay for readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(11,18,32,0.1) 0%, rgba(11,18,32,0.6) 55%, rgba(11,18,32,1) 100%)',
          }}
        />
        {/* Left edge fade */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(11,18,32,0.75) 0%, transparent 60%)',
          }}
        />
        {/* Content */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '0 32px 30px',
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#f59e0b',
              fontWeight: 800,
              fontFamily: 'Inter, sans-serif',
              marginBottom: 6,
            }}
          >
            Aurel Setting · Alpha 0.2 Preview — Coherence System
          </div>
          <h1
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: '#f8fafc',
              margin: '0 0 8px',
              fontFamily: "'EB Garamond', serif",
              lineHeight: 1.1,
              textShadow: '0 2px 20px rgba(0,0,0,0.9)',
            }}
          >
            Aurel — The Unanchored Realm
          </h1>
          <p
            style={{
              color: '#cbd5e1',
              fontSize: 15.5,
              maxWidth: 680,
              fontFamily: "'EB Garamond', serif",
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            Beneath Tringad's severity lies an older, sunlit world of tall grass, mythic kingdoms,
            and careless magic. In Aurel, magic runs on the Four Controlled Verbs, and Drift is the
            ambient weather.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            <Link
              to="/characters"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '10px 16px',
                background: '#f59e0b',
                color: '#1a1408',
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                borderRadius: 8,
                textDecoration: 'none',
              }}
            >
              Open Character Vault
            </Link>
            <Link
              to="/npcs"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '10px 16px',
                background: 'rgba(15,23,42,0.7)',
                color: '#e2e8f0',
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                borderRadius: 8,
                textDecoration: 'none',
                border: '1px solid rgba(226,232,240,0.25)',
              }}
            >
              NPC Vault
            </Link>
          </div>
        </div>
      </div>

      {/* ── Dashboard body ── */}
      <div style={{ padding: '0 24px 48px' }}>

        {/* The Aurel Story Engine & Four Verbs */}
        <div style={{ marginBottom: 52 }}>
          <SectionDivider glyph="✦" label="The Aurel Story Engine &amp; Four Verbs (Alpha 0.2 §12)" />
          <AurelStoryEngine />
        </div>

        {/* Signature Key Ledger */}
        <div style={{ marginBottom: 52 }}>
          <SectionDivider glyph="◈" label="Signature Key Ledger — Iconic Implements &amp; Anchors" />
          <SignatureKeyLedger />
        </div>

        {/* Status footer */}
        <div
          style={{
            padding: '18px 22px',
            border: '1px dashed #1e293b',
            borderRadius: 10,
            color: '#64748b',
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: '#94a3b8' }}>Status:</strong> Fully updated to <strong>Terminus RPG Alpha Draft 0.2</strong>.
          Interactive cards support live die rolls, threshold circle tracking, and unanchored casting simulations.
          See <code style={{ color: '#8b5cf6' }}>docs/settings/generic-fantasy/design-bible.md</code> for the complete Guide appendix.
        </div>
      </div>
    </div>
  );
}
