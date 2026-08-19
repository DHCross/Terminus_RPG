/* ── Unified GWSD Scene Card — ONE card per scene ──
 *
 * Architecture: each scene gets a single card. The card's color/identity
 * comes from its narrative depth (campaign/act/scene/state), and the body
 * always shows all four GWSD states vertically in the same layout.
 *
 * Banner = "where am I?" (navigation)
 * Body   = "what do I do?" (execution — Ground/Will/Shift/Drift)
 *
 * State labels are NOT color-coded. They are all #374151 (muted dark).
 * Position is enough once the eye learns the pattern.
 *
 * Card dims: 350×500px digital, 3.75"×5.25" print (4-up letter ratio).
 * Each state gets equal vertical space — don't collapse when text is short.
 */

import type { Scene } from '../types';
import { COHERENCE_SECTION_META, SCOPE_STYLES, STATE_META } from '../types';

interface Props {
  scene: Scene;
  editable?: boolean;
  onEditCard?: (cardIdx: number, text: string) => void;
  printMode?: boolean;
  /** Flag when consecutive cards share identical GWSD bodies */
  redundant?: boolean;
  lintWarnings?: Array<{ icon: string; name: string; severity: 'high' | 'medium' | 'low' }>;
  sceneMode?: { icon: string; label: string; verb: string };
  validationWarnings?: string[];
  pressureOverride?: number;
  carryoverBadges?: string[];
}

export default function Card({
  scene,
  editable = false,
  onEditCard,
  printMode = false,
  redundant = false,
  lintWarnings = [],
  sceneMode,
  validationWarnings = [],
  pressureOverride,
  carryoverBadges = [],
}: Props) {
  const isLatent = scene.stateType === 'latent';
  const useCoherenceRules = Boolean(scene.coherence) && !editable;
  const scopeStyle = scene.scope
    ? SCOPE_STYLES[scene.scope.depth] || SCOPE_STYLES.scene
    : SCOPE_STYLES.scene;
  const sectionEntries = useCoherenceRules && scene.coherence
    ? scene.coherence.sections.map((section) => ({
        id: `${scene.id}-${section.key}`,
        label: COHERENCE_SECTION_META[section.key].label,
        text: section.text,
        key: section.key,
      }))
    : scene.cards.map((card, idx) => ({
        id: card.id,
        label: STATE_META[card.state].label,
        text: card.cardText || card.text,
        key: card.state,
        sourceIndex: idx,
        meta: card.meta,
      }));

  const headerBadges: Array<{ key: string; label: string; title: string }> = [];
  const currentPressure = pressureOverride !== undefined ? pressureOverride : scene.scenePressure;
  if (currentPressure !== undefined) {
    headerBadges.push({
      key: 'scene-pressure',
      label: `PRESSURE: ${currentPressure}`,
      title: `Current Scene Pressure Level: ${currentPressure}${pressureOverride !== undefined ? ' (Modified)' : ''}`,
    });
  }
  if (sceneMode) {
    headerBadges.push({
      key: 'scene-mode',
      label: sceneMode.label,
      title: `${sceneMode.label} mode — primary verb: ${sceneMode.verb}`,
    });
  }
  if (useCoherenceRules && scene.coherence) {
    headerBadges.push({
      key: 'pressure-type',
      label: `PRESSURE: ${scene.coherence.pressureType.toUpperCase()}`,
      title: `Coherence pressure type: ${scene.coherence.pressureType}`,
    });
  }

  return (
      <div
      className={`gwsd-card ${printMode ? 'print-card' : ''}`}
      style={{
        width: printMode ? 'var(--gwsd-card-width, 3.75in)' : 350,
        height: printMode ? 'var(--gwsd-card-height, 5.25in)' : 500,
        borderRadius: printMode ? 3 : 8,
        border: printMode
          ? (isLatent ? '1px dashed #6B7280' : '1px solid #3F3123')
          : (isLatent ? '1px dashed rgba(100, 116, 139, 0.7)' : 'none'),
        background: printMode
          ? (isLatent
            ? 'linear-gradient(180deg, #F5F0E3 0%, #EEE9DE 48%, #E5E7EB 100%)'
            : 'linear-gradient(180deg, #F5F0E3 0%, #EFE7D5 100%)')
          : 'white',
        boxShadow: printMode ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        fontFamily: printMode
          ? "'Palatino Linotype', 'Book Antiqua', Palatino, 'Times New Roman', serif"
          : "'Inter', 'Segoe UI', 'SF Pro', system-ui, sans-serif",
        overflow: 'hidden',
        boxSizing: 'border-box',
        outline: redundant ? '2px dashed #d97706' : 'none',
        outlineOffset: redundant ? -2 : 0,
      }}
    >
      {/* Banner — navigation: colored by narrative depth */}
      <div
        style={{
          background: printMode
            ? 'linear-gradient(180deg, #2E2320 0%, #1E1715 100%)'
            : scopeStyle.bg,
          color: printMode ? '#F5EBDD' : scopeStyle.text,
          padding: printMode ? '4px 10px' : '6px 14px',
          flexShrink: 0,
          borderBottom: printMode ? '1px solid #3F3123' : 'none',
        }}
      >
        {/* Act / location context line */}
        {scene.scope?.breadcrumb && scene.scope.breadcrumb.length > 1 && (
          <div
            style={{
              fontSize: printMode ? 8 : 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              opacity: 0.85,
              marginBottom: 2,
            }}
          >
            {scene.scope.breadcrumb
              .slice(0, -1)
              .map((a) => `${a.title}`)
              .join(' \u203A ')}
          </div>
        )}
        {/* Scene name — largest banner element */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: printMode ? 10 : 13,
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            {scene.scope?.banner
              ? scene.scope.breadcrumb?.[scene.scope.breadcrumb.length - 1]?.title || scene.title
              : scene.title}
          </div>
          {headerBadges.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {headerBadges.map((badge) => (
                <span
                  key={badge.key}
                  title={badge.title}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: printMode ? 8 : 10,
                    lineHeight: 1,
                    fontWeight: 700,
                    padding: printMode ? '1px 4px' : '2px 6px',
                    borderRadius: 999,
                    border: printMode ? '1px solid rgba(245, 235, 221, 0.5)' : '1px solid rgba(255,255,255,0.25)',
                    background: printMode ? 'rgba(245, 235, 221, 0.14)' : 'rgba(255,255,255,0.14)',
                    color: printMode ? '#F5EBDD' : '#F9FAFB',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <span>{badge.label}</span>
                </span>
              ))}
            </div>
          )}
        </div>
        {useCoherenceRules && scene.coherence && (
          <div
            style={{
              marginTop: 4,
              fontSize: printMode ? 8 : 10,
              lineHeight: 1.35,
              color: printMode ? '#E8DCC8' : 'rgba(255,255,255,0.82)',
            }}
          >
            {scene.coherence.environmentSummary}
          </div>
        )}
        {!printMode && lintWarnings.length > 0 && (
          <div
            className="no-print"
            style={{
              marginTop: 4,
              display: 'flex',
              gap: 4,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {lintWarnings.map((warning) => (
              <span
                key={`${warning.name}-${warning.icon}`}
                title={`${warning.name} (${warning.severity})`}
                style={{
                  fontSize: 11,
                  lineHeight: 1,
                  padding: '2px 4px',
                  borderRadius: 4,
                  background:
                    warning.severity === 'high'
                      ? 'rgba(239, 68, 68, 0.22)'
                      : warning.severity === 'medium'
                      ? 'rgba(245, 158, 11, 0.22)'
                      : 'rgba(59, 130, 246, 0.2)',
                  border:
                    warning.severity === 'high'
                      ? '1px solid rgba(239, 68, 68, 0.55)'
                      : warning.severity === 'medium'
                      ? '1px solid rgba(245, 158, 11, 0.55)'
                      : '1px solid rgba(59, 130, 246, 0.5)',
                }}
              >
                {warning.icon}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* GWSD body — 4 state sections, equal vertical space, invariant order */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
        }}
      >
        {sectionEntries.map((section, idx) => {
          const displayText = section.text;
          const useBalancedPrintSpacing = printMode && displayText.trim().length <= 95;
          const isLatentLowerHalf = !useCoherenceRules && isLatent && idx >= 2;
          const isPressureBand = useCoherenceRules && (section.key === 'pressure' || section.key === 'consequence');

          return (
            <div
              key={section.id}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: printMode ? '4px 10px' : '6px 14px',
                borderBottom: idx < 3 ? (printMode ? '1px solid #B8A789' : '1px solid #E5E7EB') : 'none',
                background: isPressureBand
                  ? (printMode ? 'rgba(92, 47, 20, 0.06)' : 'rgba(120, 53, 15, 0.12)')
                  : isLatentLowerHalf
                  ? (printMode ? 'rgba(148, 163, 184, 0.08)' : 'rgba(226, 232, 240, 0.38)')
                  : 'transparent',
              }}
            >
              {/* State label — semi-bold, uppercase, muted dark. NOT color-coded. */}
              <div
                style={{
                  fontSize: printMode ? 9 : 11,
                  fontWeight: printMode ? 700 : 600,
                  textTransform: 'uppercase',
                  letterSpacing: printMode ? '0.07em' : '0.04em',
                  color: printMode ? '#2B211A' : '#374151',
                  marginBottom: printMode ? 2 : 3,
                  flexShrink: 0,
                }}
              >
                {section.label}
              </div>

              {/* State text */}
              {editable ? (
                <textarea
                  value={displayText}
                  onChange={(e) => onEditCard?.(('sourceIndex' in section ? section.sourceIndex : idx), e.target.value)}
                  aria-label={`${section.label} text`}
                  rows={2}
                  style={{
                    flex: 1,
                    fontSize: printMode ? 10 : 13,
                    lineHeight: '1.5',
                    color: '#1F2937',
                    border: '1px solid #e5e7eb',
                    borderRadius: 3,
                    padding: '2px 4px',
                    background: isLatentLowerHalf ? 'rgba(255,255,255,0.4)' : 'transparent',
                    font: 'inherit',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
              ) : (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: useBalancedPrintSpacing ? 'center' : 'flex-start',
                  }}
                >
                  {(section.key === 'ground' || section.key === 'agency') && carryoverBadges && carryoverBadges.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8, flexShrink: 0 }}>
                      {carryoverBadges.map((badge, bIdx) => (
                        <div
                          key={bIdx}
                          style={{
                            fontSize: printMode ? 8 : 11,
                            fontWeight: 600,
                            padding: '4px 8px',
                            background: printMode ? '#F0E6D2' : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%)',
                            color: printMode ? '#78350F' : '#D97706',
                            border: printMode ? '1px solid #B8A789' : '1px solid rgba(217, 119, 6, 0.25)',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <span style={{ color: '#D97706', fontSize: '12px' }}>✦</span>
                          <span>{badge}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: printMode ? 10 : 13,
                      lineHeight: printMode ? '1.35' : '1.5',
                      color: printMode ? '#231913' : '#1F2937',
                    }}
                  >
                    {displayText}
                  </div>
                  {/* Terminus Metadata Pills */}
                  {'meta' in section && section.meta && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: printMode ? '2px' : '4px', marginTop: printMode ? '4px' : '8px' }}>
                      {section.meta.scenePressure !== undefined && (
                        <span style={{ fontSize: printMode ? '8px' : '10px', background: 'rgba(236, 72, 153, 0.1)', color: '#EC4899', border: '1px solid rgba(236, 72, 153, 0.3)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          Pressure: {section.meta.scenePressure}
                        </span>
                      )}
                      {section.meta.conflict?.hazardDie && (
                        <span style={{ fontSize: printMode ? '8px' : '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          Hazard: {section.meta.conflict.hazardDie}
                        </span>
                      )}
                      {section.meta.conflict?.actorDie && (
                        <span style={{ fontSize: printMode ? '8px' : '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          Actor: {section.meta.conflict.actorDie}
                        </span>
                      )}
                      {section.meta.conflict?.targetThresholds && section.meta.conflict.targetThresholds.length > 0 && (
                        <span style={{ fontSize: printMode ? '8px' : '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          vs {section.meta.conflict.targetThresholds.join(', ')}
                        </span>
                      )}
                      {section.meta.conflict?.suggestedSkill && (
                        <span style={{ fontSize: printMode ? '8px' : '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          Skill: {section.meta.conflict.suggestedSkill}
                        </span>
                      )}
                      {section.meta.conflict?.impact && (
                        <span style={{ fontSize: printMode ? '8px' : '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          Impact: {section.meta.conflict.impact}
                        </span>
                      )}
                      {section.meta.conflict?.vector?.label && (
                        <span style={{ fontSize: printMode ? '8px' : '10px', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          Vector: {section.meta.conflict.vector.label}
                        </span>
                      )}
                      {section.meta.orderTags?.map(tag => (
                        <span key={tag} style={{ fontSize: printMode ? '8px' : '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          [{tag}]
                        </span>
                      ))}
                      {section.meta.zoneId && (
                        <span style={{ fontSize: printMode ? '8px' : '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          Zone: {section.meta.zoneId}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Redundancy warning */}
      {redundant && (
        <div
          style={{
            fontSize: printMode ? 7 : 9,
            color: '#d97706',
            textAlign: 'center',
            padding: '2px 8px 4px',
            background: '#d9770610',
            flexShrink: 0,
          }}
        >
          ⚠ Identical GWSD — cosmetic transition
        </div>
      )}

      {/* Validation warnings — on-screen only */}
      {!printMode && validationWarnings.length > 0 && (
        <div
          className="no-print"
          style={{
            fontSize: 9,
            color: '#EF4444',
            textAlign: 'center',
            padding: '3px 8px',
            background: 'rgba(239, 68, 68, 0.08)',
            borderTop: '1px solid rgba(239, 68, 68, 0.2)',
            flexShrink: 0,
          }}
        >
          {validationWarnings.length} validation issue{validationWarnings.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
