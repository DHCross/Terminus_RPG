import type { CSSProperties, ReactNode } from 'react';
import type { DieSize } from '../../coherence-engine/src/index.ts';
import { buildPointCost } from '../../coherence-engine/src/index.ts';
import type { WeaponDraft } from '../coherenceStudio';
import { DIE_OPTIONS, VECTOR_OPTIONS } from '../coherenceStudio';

export const panelStyle: CSSProperties = {
  border: '1px solid #1E293B',
  borderRadius: 12,
  background: '#111827',
  padding: 16,
  display: 'grid',
  gap: 14,
};

export const fieldStyle: CSSProperties = {
  display: 'grid',
  gap: 6,
  fontSize: 12,
  color: '#94A3B8',
};

export const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 14,
  background: '#0F172A',
  color: '#E5E7EB',
  border: '1px solid #334155',
  borderRadius: 8,
  boxSizing: 'border-box',
};

export const textAreaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: 96,
  resize: 'vertical',
  fontFamily: 'inherit',
};

export const selectStyle: CSSProperties = inputStyle;

export const primaryButtonStyle: CSSProperties = {
  padding: '10px 14px',
  fontSize: 13,
  fontWeight: 600,
  color: '#F8FAFC',
  background: '#2563EB',
  border: '1px solid #3B82F6',
  borderRadius: 8,
  cursor: 'pointer',
};

export const secondaryButtonStyle: CSSProperties = {
  padding: '10px 14px',
  fontSize: 13,
  fontWeight: 600,
  color: '#CBD5E1',
  background: '#1E293B',
  border: '1px solid #334155',
  borderRadius: 8,
  cursor: 'pointer',
};

export function StudioGrid({ editor, sidebar }: Readonly<{ editor: ReactNode; sidebar: ReactNode }>) {
  return (
    <div
      className="no-print"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.5fr) 360px',
        gap: 20,
        alignItems: 'start',
      }}
    >
      <div style={{ display: 'grid', gap: 20 }}>{editor}</div>
      <aside style={{ display: 'grid', gap: 20, position: 'sticky', top: 16 }}>{sidebar}</aside>
    </div>
  );
}

export function PanelSection({
  title,
  description,
  children,
}: Readonly<{ title: string; description?: string; children: ReactNode }>) {
  return (
    <section style={panelStyle}>
      <div style={{ display: 'grid', gap: 4 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC' }}>{title}</div>
        {description ? <div style={{ fontSize: 12, lineHeight: 1.5, color: '#94A3B8' }}>{description}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function Field({ label, children }: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <label style={fieldStyle}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export function PointsBadge({ points }: Readonly<{ points: number }>) {
  const ok = points === 5;
  return (
    <span
      style={{
        padding: '4px 8px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        color: ok ? '#D1FAE5' : '#FDE68A',
        background: ok ? 'rgba(5, 150, 105, 0.18)' : 'rgba(217, 119, 6, 0.18)',
        border: ok ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(245, 158, 11, 0.35)',
      }}
    >
      {points} pts
    </span>
  );
}

export function DiceEditor<TName extends string>({
  title,
  values,
  onChange,
  totalPoints,
}: Readonly<{
  title: string;
  values: Array<{ key: TName; label: string; value: DieSize }>;
  onChange: (key: TName, value: DieSize) => void;
  totalPoints: number;
}>) {
  return (
    <PanelSection title={title} description="Each ladder step spends one build point from d4 upward.">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#94A3B8' }}>Coherence build budget target: 5 points</span>
        <PointsBadge points={totalPoints} />
      </div>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        {values.map((entry) => (
          <Field key={entry.key} label={entry.label}>
            <select
              value={entry.value}
              onChange={(event) => onChange(entry.key, Number(event.target.value) as DieSize)}
              style={selectStyle}
            >
              {DIE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} · {option.points} pts
                </option>
              ))}
            </select>
          </Field>
        ))}
      </div>
    </PanelSection>
  );
}

function toggleVector(vectors: WeaponDraft['vectors'], value: WeaponDraft['vectors'][number]): WeaponDraft['vectors'] {
  return vectors.includes(value)
    ? vectors.filter((entry) => entry !== value)
    : [...vectors, value];
}

export function WeaponEditor({
  title,
  weapon,
  onChange,
}: Readonly<{
  title: string;
  weapon: WeaponDraft;
  onChange: (nextWeapon: WeaponDraft) => void;
}>) {
  return (
    <PanelSection title={title} description="Impact, vectors, and notes feed straight into the Coherence System engine output.">
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <Field label="Weapon Name">
          <input
            value={weapon.name}
            onChange={(event) => onChange({ ...weapon, name: event.target.value })}
            style={inputStyle}
          />
        </Field>
        <Field label="Impact">
          <input
            type="number"
            min={1}
            value={weapon.impact}
            onChange={(event) => onChange({ ...weapon, impact: Number(event.target.value) || 1 })}
            style={inputStyle}
          />
        </Field>
        <Field label="Bonus Impact">
          <input
            type="number"
            min={0}
            value={weapon.bonusImpact}
            onChange={(event) => onChange({ ...weapon, bonusImpact: Math.max(0, Number(event.target.value) || 0) })}
            style={inputStyle}
          />
        </Field>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <span style={{ fontSize: 12, color: '#94A3B8' }}>Vectors</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {VECTOR_OPTIONS.map((vector) => {
            const checked = weapon.vectors.includes(vector);
            return (
              <label
                key={vector}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 10px',
                  borderRadius: 999,
                  border: checked ? '1px solid #2563EB' : '1px solid #334155',
                  background: checked ? 'rgba(37, 99, 235, 0.15)' : '#0F172A',
                  color: checked ? '#DBEAFE' : '#CBD5E1',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onChange({ ...weapon, vectors: toggleVector(weapon.vectors, vector) })}
                />
                <span>{vector}</span>
              </label>
            );
          })}
        </div>
      </div>
      <Field label="Notes">
        <textarea
          value={weapon.notes}
          onChange={(event) => onChange({ ...weapon, notes: event.target.value })}
          style={textAreaStyle}
        />
      </Field>
    </PanelSection>
  );
}

export function DiagnosticsList({
  diagnostics,
}: Readonly<{ diagnostics: Array<{ severity: string; message: string; path: string }> }>) {
  if (diagnostics.length === 0) {
    return <div style={{ fontSize: 12, color: '#86EFAC' }}>No validation issues.</div>;
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {diagnostics.map((diagnostic) => {
        const severityColor = diagnostic.severity === 'error'
          ? '#FCA5A5'
          : diagnostic.severity === 'warning'
          ? '#FCD34D'
          : '#93C5FD';
        const severityBorder = diagnostic.severity === 'error'
          ? 'rgba(239, 68, 68, 0.35)'
          : diagnostic.severity === 'warning'
          ? 'rgba(245, 158, 11, 0.35)'
          : 'rgba(59, 130, 246, 0.35)';
        return (
          <div
            key={`${diagnostic.path}-${diagnostic.message}`}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: '#0F172A',
              border: `1px solid ${severityBorder}`,
              display: 'grid',
              gap: 4,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: severityColor, textTransform: 'uppercase' }}>
              {diagnostic.severity}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.45, color: '#E5E7EB' }}>{diagnostic.message}</div>
            <div style={{ fontSize: 11, color: '#64748B' }}>{diagnostic.path}</div>
          </div>
        );
      })}
    </div>
  );
}

export function summaryChip(label: string, value: string): ReactNode {
  return (
    <div
      key={label}
      style={{
        padding: '10px 12px',
        borderRadius: 10,
        background: '#0F172A',
        border: '1px solid #1E293B',
        display: 'grid',
        gap: 2,
      }}
    >
      <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 14, color: '#F8FAFC', fontWeight: 700 }}>{value}</div>
    </div>
  );
}

export function statLine(value: DieSize): string {
  return `d${value} · ${buildPointCost(value)} pts`;
}