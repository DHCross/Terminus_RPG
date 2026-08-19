/* ── Full Spread Print Layout: 1 scene per page (US Letter) ── */

import type { Scene } from '../types';
import { SCOPE_STYLES, STATE_META } from '../types';
import {
  Compass,
  MapPin,
  Activity,
  Shield,
  Layers,
  Map,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Skull,
  User,
  Zap,
} from 'lucide-react';

interface Props {
  scenes: Scene[];
}

export default function FullSpreadPrintLayout({ scenes }: Props) {
  // Parse drift ladder text into individual steps if possible
  const parseDriftLadder = (driftText?: string) => {
    if (!driftText) return [];
    return driftText
      .split('\n')
      .map(line => line.replace(/^[-*•\d.]\s*/, '').trim())
      .filter(line => line.length > 0);
  };

  // Parse map hooks text into individual items
  const parseMapHooks = (mapText?: string) => {
    if (!mapText) return [];
    // Split by commas or newlines
    const separators = /[,\n]/;
    return mapText
      .split(separators)
      .map(item => item.replace(/^[-*•]\s*/, '').trim())
      .filter(item => item.length > 0);
  };

  return (
    <div className="full-spread-layout">
      <style>{`
        .full-spread-layout {
          --gwsd-spread-width: 8.5in;
          --gwsd-spread-height: 11in;
          --gwsd-spread-margin-x: 0.5in;
          --gwsd-spread-margin-y: 0.5in;
          --gwsd-spread-content-width: calc(var(--gwsd-spread-width) - (2 * var(--gwsd-spread-margin-x)));
          --gwsd-spread-content-height: calc(var(--gwsd-spread-height) - (2 * var(--gwsd-spread-margin-y)));
        }

        @media print {
          @page {
            margin: 0;
            size: letter;
          }
          body {
            margin: 0;
            padding: 0;
            background: #F5F0E3 !important;
          }
          .no-print {
            display: none !important;
          }
          .full-spread-layout, .spread-page {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .spread-page {
            page-break-after: always;
            width: var(--gwsd-spread-width);
            height: var(--gwsd-spread-height);
            box-sizing: border-box;
            padding: var(--gwsd-spread-margin-y) var(--gwsd-spread-margin-x);
            position: relative;
            background: #F5F0E3 !important; /* Premium cream/parchment background */
            color: #1F242E !important;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          .spread-page:last-child {
            page-break-after: auto;
          }
        }

        @media screen {
          .spread-page {
            width: var(--gwsd-spread-content-width);
            height: var(--gwsd-spread-content-height);
            margin: 40px auto;
            padding: 30px;
            box-sizing: content-box;
            background: #FDFBF7;
            color: #1F242E;
            border: 1px solid #D4C3A3;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(43, 33, 26, 0.15);
            display: flex;
            flex-direction: column;
            position: relative;
          }
        }

        /* Common typography & styles */
        .spread-page {
          font-family: 'Palatino', 'Palatino Linotype', 'Book Antiqua', Georgia, serif;
        }

        .spread-header {
          border-bottom: 2px double #8C7A5F;
          padding-bottom: 10px;
          margin-bottom: 12px;
        }

        .spread-title {
          font-size: 22pt;
          font-weight: 700;
          color: #2E2320;
          letter-spacing: -0.01em;
          margin: 0;
          font-family: Georgia, serif;
          line-height: 1.2;
        }

        .spread-breadcrumb {
          font-size: 8.5pt;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #7E6B56;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .spread-meta-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 8px;
          font-size: 9pt;
        }

        .spread-meta-badge {
          background: rgba(140, 122, 95, 0.08);
          border: 1px solid rgba(140, 122, 95, 0.25);
          border-radius: 4px;
          padding: 4px 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #4A3C31;
          font-weight: 600;
        }

        .read-aloud-box {
          background: rgba(139, 92, 246, 0.03);
          border-left: 3px solid #8B5CF6;
          border-radius: 0 6px 6px 0;
          padding: 8px 12px;
          font-style: italic;
          font-size: 10pt;
          line-height: 1.45;
          color: #374151;
          margin-bottom: 12px;
          position: relative;
        }

        .read-aloud-label {
          font-family: sans-serif;
          font-size: 7.5pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #8B5CF6;
          margin-bottom: 3px;
        }

        .gwsd-engine-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: auto auto;
          gap: 12px;
          margin-bottom: 14px;
        }

        .gwsd-state-box {
          border: 1px solid #D4C3A3;
          background: rgba(253, 251, 247, 0.6);
          border-radius: 6px;
          padding: 8px 12px;
          display: flex;
          flex-direction: column;
        }

        .gwsd-state-box.pressure-variant {
          background: rgba(220, 38, 38, 0.02);
          border-color: rgba(220, 38, 38, 0.15);
        }

        .gwsd-state-label {
          font-family: sans-serif;
          font-size: 8pt;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #7E6B56;
          border-bottom: 1px solid rgba(140, 122, 95, 0.15);
          padding-bottom: 3px;
          margin-bottom: 6px;
          text-transform: uppercase;
        }

        .gwsd-state-box.pressure-variant .gwsd-state-label {
          color: #C2410C;
        }

        .gwsd-state-body {
          font-size: 10pt;
          line-height: 1.4;
          color: #2E2320;
          flex: 1;
        }

        .spread-lower-section {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 16px;
          flex: 1;
          min-height: 0; /* allows box to shrink and remain on letter page */
        }

        .lower-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 0;
        }

        .spread-section-card {
          border: 1px solid #D4C3A3;
          border-radius: 6px;
          padding: 10px 12px;
          background: rgba(253, 251, 247, 0.4);
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .spread-section-title {
          font-family: sans-serif;
          font-size: 8.5pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #5C4A3C;
          margin: 0 0 6px 0;
          display: flex;
          align-items: center;
          gap: 6px;
          border-bottom: 1px solid rgba(140, 122, 95, 0.18);
          padding-bottom: 4px;
        }

        .drift-ladder-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin: 0;
          padding: 0;
          list-style: none;
          overflow-y: auto;
          flex: 1;
        }

        .drift-ladder-item {
          display: flex;
          gap: 8px;
          font-size: 9.5pt;
          line-height: 1.35;
        }

        .drift-ladder-num {
          font-family: sans-serif;
          font-size: 7.5pt;
          font-weight: 800;
          background: #8C7A5F;
          color: #F5F0E3;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justifyContent: center;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .map-hooks-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          overflow-y: auto;
        }

        .map-hook-tag {
          font-size: 9pt;
          background: rgba(140, 122, 95, 0.08);
          border: 1px solid rgba(140, 122, 95, 0.25);
          color: #4A3C31;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 600;
        }

        .triggers-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          overflow-y: auto;
          flex: 1;
        }

        .trigger-button-mock {
          border: 1px solid #D4C3A3;
          border-radius: 4px;
          padding: 6px 10px;
          font-size: 9pt;
          background: #FDFBF7;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .trigger-button-mock.success-path {
          border-color: rgba(5, 150, 105, 0.3);
          background: rgba(5, 150, 105, 0.02);
        }

        .trigger-button-mock.failure-path {
          border-color: rgba(220, 38, 38, 0.3);
          background: rgba(220, 38, 38, 0.02);
        }

        .trigger-header-mock {
          display: flex;
          justify-content: space-between;
          font-weight: 600;
          color: #2E2320;
        }

        .trigger-button-mock.success-path .trigger-header-mock {
          color: #047857;
        }

        .trigger-button-mock.failure-path .trigger-header-mock {
          color: #B91C1C;
        }

        .order-badge-row {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .order-badge {
          font-family: sans-serif;
          font-size: 8pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid;
        }

        .order-badge.seeker {
          background: rgba(59, 130, 246, 0.08);
          border-color: rgba(59, 130, 246, 0.3);
          color: #1D4ED8;
        }

        .order-badge.breaker {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.3);
          color: #B91C1C;
        }

        .order-badge.warden {
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(16, 185, 129, 0.3);
          color: #047857;
        }

        .order-badge.rival {
          background: rgba(245, 158, 11, 0.08);
          border-color: rgba(245, 158, 11, 0.3);
          color: #B45309;
        }

        .order-badge.broker {
          background: rgba(139, 92, 246, 0.08);
          border-color: rgba(139, 92, 246, 0.3);
          color: #6D28D9;
        }

        .order-badge.shade {
          background: rgba(107, 114, 128, 0.08);
          border-color: rgba(107, 114, 128, 0.3);
          color: #374151;
        }

        .spread-footer {
          border-top: 1px solid rgba(140, 122, 95, 0.2);
          padding-top: 6px;
          margin-top: 10px;
          font-size: 7.5pt;
          text-align: center;
          color: #8C7A5F;
          font-family: sans-serif;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
      `}</style>

      {scenes.map((scene) => {
        const meta = scene.meta;
        const isLatent = scene.stateType === 'latent';

        // Extract the Ground, Will, Shift, Drift contents
        const getCardText = (state: string) => {
          const card = scene.cards.find(c => c.state === state);
          return card?.cardText || card?.text || '';
        };

        const groundText = getCardText('ground');
        const willText = getCardText(isLatent ? 'will' : 'will'); // Hidden Pressure for Latent matches will
        const actionText = getCardText(isLatent ? 'trigger' : 'shift');
        const escalationText = getCardText(isLatent ? 'accumulation' : 'drift');

        const driftSteps = parseDriftLadder(meta?.driftLadder);
        const mapHooks = parseMapHooks(meta?.mapHooks);

        return (
          <div key={scene.id} className="spread-page">
            {/* Header section */}
            <div className="spread-header">
              <div className="spread-breadcrumb">
                {scene.scope?.breadcrumb
                  ? scene.scope.breadcrumb.map((b) => b.title).join(' › ')
                  : `Act ${scene.act || 'I'} › Scene`}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h1 className="spread-title">{scene.title}</h1>
                <span
                  style={{
                    fontFamily: 'sans-serif',
                    fontSize: '8pt',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: isLatent ? '#374151' : '#1E293B',
                    color: '#F9FAFB',
                    letterSpacing: '0.05em',
                  }}
                >
                  {isLatent ? 'LATENT CONDITION' : 'ACTIVE SCENE'}
                </span>
              </div>

              {/* Meta information row */}
              <div className="spread-meta-grid">
                <div className="spread-meta-badge">
                  <MapPin size={12} />
                  <span>Loc: {meta?.location || 'Unspecified'}</span>
                </div>
                <div className="spread-meta-badge">
                  <Compass size={12} />
                  <span>Mode: {meta?.sceneMode ? meta.sceneMode.toUpperCase() : 'STANDARD'}</span>
                </div>
                <div className="spread-meta-badge">
                  <Layers size={12} />
                  <span>Function: {scene.storyFunction ? scene.storyFunction.toUpperCase() : 'SCENE'}</span>
                </div>
                <div className="spread-meta-badge">
                  <Activity size={12} />
                  <span>Pressure: {meta?.scenePressure !== undefined ? meta.scenePressure : 0}</span>
                </div>
              </div>
            </div>

            {/* Read aloud block */}
            {meta?.readAloud && (
              <div className="read-aloud-box">
                <div className="read-aloud-label">Read Aloud</div>
                <div>{meta.readAloud}</div>
              </div>
            )}

            {/* GWSD 2x2 Grid */}
            <div className="gwsd-engine-grid">
              <div className="gwsd-state-box">
                <div className="gwsd-state-label">Ground</div>
                <div className="gwsd-state-body">{groundText}</div>
              </div>
              <div className="gwsd-state-box pressure-variant">
                <div className="gwsd-state-label">{isLatent ? 'Hidden Pressure' : 'Will'}</div>
                <div className="gwsd-state-body">{willText}</div>
              </div>
              <div className="gwsd-state-box">
                <div className="gwsd-state-label">{isLatent ? 'Trigger' : 'Shift'}</div>
                <div className="gwsd-state-body">{actionText}</div>
              </div>
              <div className="gwsd-state-box pressure-variant">
                <div className="gwsd-state-label">{isLatent ? 'Accumulation' : 'Drift'}</div>
                <div className="gwsd-state-body">{escalationText}</div>
              </div>
            </div>

            {/* Lower detailed section */}
            <div className="spread-lower-section">
              {/* Left Column: Drift Ladder & Map Hooks */}
              <div className="lower-col">
                <div className="spread-section-card" style={{ flex: 1 }}>
                  <h3 className="spread-section-title">
                    <TrendingUp size={12} />
                    Drift Ladder
                  </h3>
                  {driftSteps.length > 0 ? (
                    <ul className="drift-ladder-list">
                      {driftSteps.map((step, idx) => (
                        <li key={idx} className="drift-ladder-item">
                          <span className="drift-ladder-num">{idx + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ fontSize: '9pt', color: '#7E6B56', fontStyle: 'italic' }}>
                      No drift escalation steps configured. Pressure resolves standard drift states.
                    </div>
                  )}
                </div>

                {mapHooks.length > 0 && (
                  <div className="spread-section-card" style={{ flexShrink: 0 }}>
                    <h3 className="spread-section-title">
                      <Map size={12} />
                      Map Hooks & Nouns
                    </h3>
                    <div className="map-hooks-grid">
                      {mapHooks.map((noun, idx) => (
                        <span key={idx} className="map-hook-tag">
                          {noun}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Connective Triggers & Order Hooks */}
              <div className="lower-col">
                <div className="spread-section-card" style={{ flex: 1 }}>
                  <h3 className="spread-section-title">
                    <ArrowRight size={12} />
                    Connective Triggers
                  </h3>
                  {scene.connectiveTriggers && scene.connectiveTriggers.length > 0 ? (
                    <div className="triggers-list">
                      {scene.connectiveTriggers.map((trigger, idx) => {
                        const isSuccess =
                          trigger.label.toLowerCase().includes('success') ||
                          trigger.label.toLowerCase().includes('clear') ||
                          trigger.label.toLowerCase().includes('shift');
                        const isFailure =
                          trigger.label.toLowerCase().includes('fail') ||
                          trigger.label.toLowerCase().includes('drift') ||
                          trigger.label.toLowerCase().includes('hazard');

                        return (
                          <div
                            key={trigger.id || idx}
                            className={`trigger-button-mock ${
                              isSuccess ? 'success-path' : isFailure ? 'failure-path' : ''
                            }`}
                          >
                            <div className="trigger-header-mock">
                              <span>{trigger.label}</span>
                              <span style={{ fontSize: '7.5pt', opacity: 0.8 }}>
                                → {trigger.targetNodeId}
                              </span>
                            </div>
                            {trigger.stateHandoff && (
                              <div style={{ fontSize: '7.5pt', color: '#7E6B56', display: 'flex', gap: 6, marginTop: 1 }}>
                                {trigger.stateHandoff.pressureModifier !== undefined && (
                                  <span>Pres: {trigger.stateHandoff.pressureModifier > 0 ? `+${trigger.stateHandoff.pressureModifier}` : trigger.stateHandoff.pressureModifier}</span>
                                )}
                                {trigger.stateHandoff.groundInject && (
                                  <span>Inject: "{trigger.stateHandoff.groundInject}"</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: '9pt', color: '#7E6B56', fontStyle: 'italic' }}>
                      No direct triggers. Transitions resolve via Runway sequencing.
                    </div>
                  )}
                </div>

                {meta?.orderTags && meta.orderTags.length > 0 && (
                  <div className="spread-section-card" style={{ flexShrink: 0 }}>
                    <h3 className="spread-section-title">
                      <Shield size={12} />
                      Accord Order Hooks
                    </h3>
                    <div className="order-badge-row">
                      {meta.orderTags.map((order) => (
                        <span key={order} className={`order-badge ${order.toLowerCase()}`}>
                          {order}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer stamp */}
            <div className="spread-footer">
              TERMINUS ADVANTAGE SYSTEM • GWSD RUNTIME ENGINE LAYER • ZONE {meta?.zoneId || 'A'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
