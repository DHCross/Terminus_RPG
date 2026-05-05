import { useState, useMemo } from 'react';
import type { ParsedDiagnosticsReport, ParsedSignal } from '../diagnosticsParser';

const SEV_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  high:   { bg: '#7f1d1d', text: '#fca5a5', border: '#dc2626' },
  medium: { bg: '#78350f', text: '#fde68a', border: '#d97706' },
  low:    { bg: '#1e3a5f', text: '#93c5fd', border: '#3b82f6' },
};

const CONF_DOT: Record<string, string> = {
  high: '#22c55e',
  medium: '#eab308',
  low: '#6b7280',
};

type SevFilter = 'all' | 'high' | 'medium' | 'low';
type GroupBy = 'scene' | 'signal' | 'severity';

export default function DiagnosticsViewer({ report }: { report: ParsedDiagnosticsReport }) {
  const [sevFilter, setSevFilter] = useState<SevFilter>('all');
  const [groupBy, setGroupBy] = useState<GroupBy>('scene');
  const [expandedIdx, setExpandedIdx] = useState<Set<number>>(new Set());

  const filtered = useMemo(
    () => (sevFilter === 'all' ? report.signals : report.signals.filter((s) => s.severity === sevFilter)),
    [report.signals, sevFilter],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, ParsedSignal[]>();
    for (const s of filtered) {
      let key: string;
      if (groupBy === 'scene') key = s.scene || 'Unknown';
      else if (groupBy === 'signal') key = `${s.icon} ${s.name}`;
      else key = s.severity.charAt(0).toUpperCase() + s.severity.slice(1);
      const arr = map.get(key) || [];
      arr.push(s);
      map.set(key, arr);
    }
    return map;
  }, [filtered, groupBy]);

  const toggleExpand = (idx: number) => {
    setExpandedIdx((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const expandAll = () => setExpandedIdx(new Set(filtered.map((s) => s.index)));
  const collapseAll = () => setExpandedIdx(new Set());

  // Count by severity
  const highCount = report.signals.filter((s) => s.severity === 'high').length;
  const medCount = report.signals.filter((s) => s.severity === 'medium').length;
  const lowCount = report.signals.filter((s) => s.severity === 'low').length;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#F3F4F6',
            margin: 0,
          }}
        >
          {report.title} — Narrative Diagnostics
        </h2>
        <p style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 0' }}>
          Generated {new Date(report.generatedAt).toLocaleString()} · {report.sceneCount} scenes
          analyzed · {report.signalCount} signals found
        </p>
      </div>

      {/* Severity summary bar */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          padding: '10px 14px',
          background: '#1F2937',
          borderRadius: 8,
          marginBottom: 16,
          alignItems: 'center',
        }}
      >
        <SevBadge sev="high" count={highCount} active={sevFilter === 'high'} onClick={() => setSevFilter(sevFilter === 'high' ? 'all' : 'high')} />
        <SevBadge sev="medium" count={medCount} active={sevFilter === 'medium'} onClick={() => setSevFilter(sevFilter === 'medium' ? 'all' : 'medium')} />
        <SevBadge sev="low" count={lowCount} active={sevFilter === 'low'} onClick={() => setSevFilter(sevFilter === 'low' ? 'all' : 'low')} />
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: '#6B7280', marginRight: 4 }}>Group by:</span>
        {(['scene', 'signal', 'severity'] as GroupBy[]).map((g) => (
          <button
            key={g}
            onClick={() => setGroupBy(g)}
            style={{
              padding: '3px 8px',
              fontSize: 11,
              borderRadius: 4,
              border: 'none',
              cursor: 'pointer',
              background: groupBy === g ? '#374151' : 'transparent',
              color: groupBy === g ? '#F3F4F6' : '#9CA3AF',
              fontWeight: groupBy === g ? 600 : 400,
            }}
          >
            {g.charAt(0).toUpperCase() + g.slice(1)}
          </button>
        ))}
        <span style={{ borderLeft: '1px solid #374151', height: 16, margin: '0 4px' }} />
        <button
          onClick={expandAll}
          style={{ fontSize: 11, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
        >
          Expand all
        </button>
        <button
          onClick={collapseAll}
          style={{ fontSize: 11, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
        >
          Collapse
        </button>
      </div>

      {/* Signal summary chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {report.summary
          .filter((s) => s.count > 0)
          .map((s) => (
            <span
              key={s.name}
              style={{
                padding: '3px 8px',
                borderRadius: 12,
                fontSize: 11,
                background: '#1F2937',
                color: '#D1D5DB',
                border: '1px solid #374151',
              }}
            >
              {s.icon} {s.name}: <strong>{s.count}</strong>
            </span>
          ))}
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: '#6B7280', textAlign: 'center', padding: 40 }}>
          No signals match the current filter.
        </p>
      ) : (
        /* Grouped findings */
        Array.from(grouped.entries()).map(([groupLabel, signals]) => (
          <div key={groupLabel} style={{ marginBottom: 16 }}>
            <h3
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#9CA3AF',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '6px 0',
                borderBottom: '1px solid #374151',
                marginBottom: 8,
              }}
            >
              {groupLabel}
              <span style={{ fontWeight: 400, marginLeft: 8, fontSize: 11, color: '#6B7280' }}>
                ({signals.length} signal{signals.length !== 1 ? 's' : ''})
              </span>
            </h3>
            {signals.map((signal) => (
              <SignalRow
                key={signal.index}
                signal={signal}
                expanded={expandedIdx.has(signal.index)}
                onToggle={() => toggleExpand(signal.index)}
                showScene={groupBy !== 'scene'}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
}

function SevBadge({
  sev,
  count,
  active,
  onClick,
}: {
  sev: 'high' | 'medium' | 'low';
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  const c = SEV_COLORS[sev];
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 6,
        border: `1px solid ${active ? c.border : '#374151'}`,
        background: active ? c.bg : 'transparent',
        color: active ? c.text : '#9CA3AF',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: c.border,
        }}
      />
      {sev.charAt(0).toUpperCase() + sev.slice(1)}: {count}
    </button>
  );
}

function SignalRow({
  signal,
  expanded,
  onToggle,
  showScene,
}: {
  signal: ParsedSignal;
  expanded: boolean;
  onToggle: () => void;
  showScene: boolean;
}) {
  const sev = SEV_COLORS[signal.severity] || SEV_COLORS.medium;

  return (
    <div
      style={{
        marginBottom: 6,
        borderRadius: 6,
        border: `1px solid ${expanded ? sev.border + '55' : '#374151'}`,
        background: expanded ? '#111827' : '#1a1a2e',
        overflow: 'hidden',
      }}
    >
      {/* Collapsed row */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#E5E7EB',
          fontSize: 13,
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 10, color: '#6B7280', width: 12, flexShrink: 0 }}>
          {expanded ? '▼' : '▶'}
        </span>
        {/* Severity dot */}
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: sev.border,
            flexShrink: 0,
          }}
        />
        {/* Signal icon + name */}
        <span style={{ width: 20, textAlign: 'center', flexShrink: 0 }}>{signal.icon}</span>
        <span style={{ fontWeight: 600, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {signal.name}
        </span>
        {showScene && signal.scene && (
          <span
            style={{
              fontSize: 11,
              color: '#6B7280',
              flexShrink: 0,
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {signal.scene}
          </span>
        )}
        {/* Confidence dot */}
        <span
          title={`Confidence: ${signal.confidence}`}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: CONF_DOT[signal.confidence] || CONF_DOT.medium,
            flexShrink: 0,
          }}
        />
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '0 12px 12px 42px', fontSize: 12, lineHeight: 1.7, color: '#D1D5DB' }}>
          {signal.scene && (
            <p style={{ margin: '0 0 4px' }}>
              <strong style={{ color: '#9CA3AF' }}>Scene:</strong> {signal.scene}
              {signal.relatedScene && (
                <span style={{ color: '#6B7280' }}> → {signal.relatedScene}</span>
              )}
            </p>
          )}
          <p style={{ margin: '0 0 4px' }}>
            <strong style={{ color: '#9CA3AF' }}>Diagnosis:</strong> {signal.diagnosis}
          </p>
          <p style={{ margin: '0 0 4px' }}>
            <strong style={{ color: '#9CA3AF' }}>Evidence:</strong>{' '}
            <span style={{ color: '#A5B4FC' }}>{signal.evidence}</span>
          </p>
          <p style={{ margin: '0 0 0' }}>
            <strong style={{ color: '#9CA3AF' }}>Fix:</strong>{' '}
            <span style={{ color: '#6EE7B7' }}>{signal.suggestedFix}</span>
          </p>
        </div>
      )}
    </div>
  );
}
