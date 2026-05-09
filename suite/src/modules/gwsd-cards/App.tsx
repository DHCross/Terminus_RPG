/* ── GWSD Card Generator — Main Application ── */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Scene, SilhouetteSectionKey } from './types';
import { smartParse, type DetectedMode } from './parser';
import { detectScenes } from './sceneDetector';
import { buildExtractionPrompt } from './aiExtractor';
import { findRedundancies, redundantSceneIds } from './redundancyChecker';
import {
  detectSceneMode,
  explainSceneMode,
  narrativeDiagnosticsReportToMarkdown,
  runNarrativeDiagnostics,
  type SceneMode,
  SCENE_MODE_META,
} from './narrativeLinter';
import TextInput from './components/TextInput';
import SceneRow from './components/SceneRow';
import PrintLayout from './components/PrintLayout';
import DiagnosticsViewer from './components/DiagnosticsViewer';
import CharacterStudio from './components/CharacterStudio';
import MonsterStudio from './components/MonsterStudio';
import { parseDiagnosticsReport, type ParsedDiagnosticsReport } from './diagnosticsParser';
import { SceneCardBuilder } from '../terminus/scene/SceneCardBuilder';

type View = 'deck' | 'print';
type DeckOrganize = 'scene-order' | 'scene-type';
type Workspace = 'cards' | 'characters' | 'monsters';
type CardsMode = 'parse' | 'builder';

const WORKSPACE_META: Record<Workspace, { title: string; subtitle: string }> = {
  cards: {
    title: 'Scene Card Forge',
    subtitle: 'Distill unstable scenes into Ground, Will, Shift, and Drift before the Rupture spreads.',
  },
  characters: {
    title: 'Silhouette Character Studio',
    subtitle: 'Interactive frame builder for player characters using the live Silhouette engine',
  },
  monsters: {
    title: 'Silhouette Monster Studio',
    subtitle: 'Interactive threat generator for enemy frames and pressure creatures',
  },
};

const MODE_LABELS: Record<DetectedMode, { label: string; desc: string }> = {
  tagged: { label: 'Tagged', desc: 'Parsed from [gwsd] blocks' },
  structural: { label: 'Structural', desc: 'Detected from headers + sidebars' },
};

const LINT_ICON_BY_CODE: Record<string, string> = {
  echo: '🔗',
  railroad: '🛤️',
  museum: '📖',
  'drift-stagnation': '📉',
  'latent-trigger': '⏱️',
  'latent-accumulation': '🫧',
  'solution-monotony': '💤',
  'permission-shift': '🧭',
  'pressure-chain': '⛓️',
  'trap-hazard-collapse': '🪫',
  'competing-vectors': '🧲',
  'false-urgency': '⚠️',
  'logic-conflict': '🧩',
  'unreachable-code': '🧹',
  'hidden-switch': '🕹️',
  'prescriptive-emotion': '🎭',
};

const LINT_LABEL_BY_CODE: Record<string, string> = {
  echo: 'Echo',
  railroad: 'Railroad',
  museum: 'Museum',
  'drift-stagnation': 'Drift Stagnation',
  'latent-trigger': 'Latent Trigger Blur',
  'latent-accumulation': 'Latent Pressure Leak',
  'solution-monotony': 'Solution Monotony',
  'permission-shift': 'Permission Shift Gap',
  'pressure-chain': 'Pressure Chain Weakness',
  'trap-hazard-collapse': 'Trap-Hazard Collapse',
  'competing-vectors': 'Competing Vectors',
  'false-urgency': 'False Urgency',
  'logic-conflict': 'Logic Conflict',
  'unreachable-code': 'Unreachable Code',
  'hidden-switch': 'Hidden Switch',
  'prescriptive-emotion': 'Prescriptive Emotion',
};

function isDiagnosticsLikeInput(text: string): boolean {
  const lower = text.toLowerCase();
  const signals = [
    'narrative diagnostics report',
    'signal summary',
    '## findings',
    '### 1.',
    'severity:',
    'confidence:',
    'diagnosis:',
    'suggested fix:',
  ];
  let matches = 0;
  for (const marker of signals) {
    if (lower.includes(marker)) matches += 1;
  }
  return matches >= 4;
}

function textForState(scene: Scene, state: string): string {
  const card = scene.cards.find((entry) => entry.state === state);
  return card?.text || '';
}

function textForSilhouetteSection(scene: Scene, section: SilhouetteSectionKey): string {
  return scene.silhouette?.sections.find((entry) => entry.key === section)?.text || '';
}

function pressureTypeLabel(scene: Scene): string {
  const pressureType = scene.silhouette?.pressureType;
  return pressureType
    ? pressureType.charAt(0).toUpperCase() + pressureType.slice(1)
    : 'Unknown';
}

export default function App() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [deckName, setDeckName] = useState('Silhouette GWSD Deck');
  const [view, setView] = useState<View>('deck');
  const [workspace, setWorkspace] = useState<Workspace>('cards');
  const [organizeBy, setOrganizeBy] = useState<DeckOrganize>('scene-order');
  const [modeFilter, setModeFilter] = useState<'all' | SceneMode>('all');
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [editable, setEditable] = useState(false);
  const [detectedMode, setDetectedMode] = useState<DetectedMode | null>(null);
  const [sourceText, setSourceText] = useState('');
  const [promptCopied, setPromptCopied] = useState(false);
  const [parsedDiagnostics, setParsedDiagnostics] = useState<ParsedDiagnosticsReport | null>(null);
  const [cardsMode, setCardsMode] = useState<CardsMode>('parse');

  const workspaceMeta = WORKSPACE_META[workspace];
  const isCardsWorkspace = workspace === 'cards';

  // Redundancy detection using Jaccard similarity
  const redundancies = useMemo(() => findRedundancies(scenes), [scenes]);
  const redundantIds = useMemo(
    () => redundantSceneIds(redundancies),
    [redundancies],
  );
  const diagnosticsReport = useMemo(() => runNarrativeDiagnostics(scenes), [scenes]);
  const diagnosticsBySceneOrder = useMemo(() => {
    const out = new Map<number, Array<{ icon: string; name: string; severity: 'high' | 'medium' | 'low' }>>();
    for (const signal of diagnosticsReport.signals) {
      if (typeof signal.sceneOrder !== 'number') continue;
      const mappedIcon = LINT_ICON_BY_CODE[signal.code] || signal.icon;
      const mappedName = LINT_LABEL_BY_CODE[signal.code] || signal.name;
      const list = out.get(signal.sceneOrder) || [];
      if (!list.some((x) => x.name === mappedName)) {
        list.push({ icon: mappedIcon, name: mappedName, severity: signal.severity });
      }
      out.set(signal.sceneOrder, list);
    }
    return out;
  }, [diagnosticsReport]);
  const sceneModeById = useMemo(() => {
    const out = new Map<string, { icon: string; label: string; verb: string }>();
    for (const scene of scenes) {
      const mode = detectSceneMode(scene);
      out.set(scene.id, SCENE_MODE_META[mode]);
    }
    return out;
  }, [scenes]);
  const sceneModeKeyById = useMemo(() => {
    const out = new Map<string, SceneMode>();
    for (const scene of scenes) {
      out.set(scene.id, detectSceneMode(scene));
    }
    return out;
  }, [scenes]);
  const sceneModeEvidenceById = useMemo(() => {
    const out = new Map<string, ReturnType<typeof explainSceneMode>>();
    for (const scene of scenes) {
      out.set(scene.id, explainSceneMode(scene));
    }
    return out;
  }, [scenes]);
  const displayedScenes = useMemo(() => {
    const filtered = modeFilter === 'all'
      ? [...scenes]
      : scenes.filter((scene) => sceneModeKeyById.get(scene.id) === modeFilter);

    if (organizeBy === 'scene-type') {
      const modeRank: Record<SceneMode, number> = {
        discovery: 0,
        trap: 1,
        hazard: 2,
        conflict: 3,
        social: 4,
        puzzle: 5,
      };

      filtered.sort((a, b) => {
        const modeA = sceneModeKeyById.get(a.id) || 'discovery';
        const modeB = sceneModeKeyById.get(b.id) || 'discovery';
        const rankDiff = modeRank[modeA] - modeRank[modeB];
        if (rankDiff !== 0) return rankDiff;
        return a.order - b.order;
      });
      return filtered;
    }

    filtered.sort((a, b) => a.order - b.order);
    return filtered;
  }, [scenes, modeFilter, organizeBy, sceneModeKeyById]);

  useEffect(() => {
    if (displayedScenes.length === 0) {
      setSelectedSceneId(null);
      return;
    }
    if (!selectedSceneId || !displayedScenes.some((scene) => scene.id === selectedSceneId)) {
      setSelectedSceneId(displayedScenes[0].id);
    }
  }, [displayedScenes, selectedSceneId]);

  const selectedScene = useMemo(
    () => scenes.find((scene) => scene.id === selectedSceneId) || null,
    [scenes, selectedSceneId],
  );
  const selectedSceneEvidence = useMemo(
    () => (selectedScene ? sceneModeEvidenceById.get(selectedScene.id) || null : null),
    [sceneModeEvidenceById, selectedScene],
  );

  const handleParse = useCallback((text: string, name?: string) => {
    setSourceText(text);
    const parseName = name || 'Adventure';
    const { scenes: parsed, mode } = smartParse(text, parseName);

    if (parsed.length === 0 && isDiagnosticsLikeInput(text)) {
      // This is a diagnostics report — parse it as such and show the viewer
      const diagReport = parseDiagnosticsReport(text);
      setParsedDiagnostics(diagReport);
    } else {
      setParsedDiagnostics(null);
    }

    setScenes(parsed);
    setSelectedSceneId(parsed[0]?.id || null);
    setDetectedMode(mode);
    if (name) setDeckName(name);
  }, []);

  const handleEditCard = useCallback(
    (sceneId: string, cardIdx: number, text: string) => {
      setScenes((prev) =>
        prev.map((scene) => {
          if (scene.id !== sceneId) return scene;
          const nextCards = [...scene.cards] as Scene['cards'];
          nextCards[cardIdx] = { ...nextCards[cardIdx], text, source: 'manual' };
          return { ...scene, cards: nextCards };
        }),
      );
    },
    [],
  );

  const handleAddScene = useCallback((scene: Scene) => {
    setScenes((prev) => [...prev, scene]);
    setCardsMode('parse');
    setSelectedSceneId(scene.id);
  }, []);

  const handleExportJSON = useCallback(() => {
    const data = {
      name: deckName,
      exportedAt: new Date().toISOString(),
      scenes: scenes.map((s) => ({
        title: s.title,
        adventure: s.adventure,
        act: s.act,
        stateType: s.stateType,
        gwsd: {
          ground: textForState(s, 'ground'),
          will: textForState(s, 'will'),
          ...(s.stateType === 'latent'
            ? {
                trigger: textForState(s, 'trigger'),
                accumulation: textForState(s, 'accumulation'),
              }
            : {
                shift: textForState(s, 'shift'),
                drift: textForState(s, 'drift'),
              }),
        },
        silhouette: s.silhouette?.sceneCard ?? null,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deckName.replace(/\s+/g, '_')}_gwsd.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [scenes, deckName]);

  const handleExportMarkdown = useCallback(() => {
    const lines = scenes.map((s) => {
      const labeled = [
        `**${s.title}**`,
        `**Type** — ${s.stateType === 'latent' ? 'Latent' : 'Active'} / ${pressureTypeLabel(s)} Pressure`,
        `**Environment** — ${s.silhouette?.environmentSummary || textForState(s, 'ground')}`,
        `**Agency** — ${textForSilhouetteSection(s, 'agency')}`,
        `**Pressure** — ${textForSilhouetteSection(s, 'pressure')}`,
        `**Contingency** — ${textForSilhouetteSection(s, 'contingency')}`,
        `**Consequence** — ${textForSilhouetteSection(s, 'consequence')}`,
        '',
      ];
      return labeled.join('\n');
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deckName.replace(/\s+/g, '_')}_gwsd.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [scenes, deckName]);

  const handleExportLintReport = useCallback(() => {
    const markdown = narrativeDiagnosticsReportToMarkdown(
      diagnosticsReport,
      `${deckName} — Narrative Diagnostics Report`,
    );
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deckName.replace(/\s+/g, '_')}_narrative_diagnostics_report.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [deckName, diagnosticsReport]);

  return (
    <div
      style={{
        color: '#E5E7EB',
        fontFamily: "'Inter', 'Segoe UI', 'SF Pro', system-ui, sans-serif",
      }}
    >
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
        @media screen {
          .print-only { display: none; }
          .print-only.print-preview { display: block; }
        }
      `}</style>
      {/* Header */}
      <header
        className="no-print"
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#F9FAFB' }}>
            {workspaceMeta.title}
          </h1>
          <span style={{ fontSize: 12, color: '#6B7280' }}>
            {workspaceMeta.subtitle}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              background: '#1E293B',
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            {(['cards', 'characters', 'monsters'] as Workspace[]).map((entry) => (
              <button
                key={entry}
                onClick={() => setWorkspace(entry)}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  border: 'none',
                  cursor: 'pointer',
                  background: workspace === entry ? '#374151' : 'transparent',
                  color: workspace === entry ? '#F9FAFB' : '#9CA3AF',
                  fontWeight: workspace === entry ? 700 : 500,
                }}
              >
                {entry === 'cards' ? 'Scenes' : entry === 'characters' ? 'Responders' : 'Ruptures'}
              </button>
            ))}
          </div>

          {isCardsWorkspace && (
            <>
              {/* Mode toggle for cards workspace */}
              <div
                style={{
                  display: 'flex',
                  background: '#1E293B',
                  borderRadius: 6,
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setCardsMode('parse')}
                  style={{
                    padding: '6px 14px',
                    fontSize: 13,
                    border: 'none',
                    cursor: 'pointer',
                    background: cardsMode === 'parse' ? '#374151' : 'transparent',
                    color: cardsMode === 'parse' ? 'white' : '#9CA3AF',
                    fontWeight: cardsMode === 'parse' ? 600 : 400,
                  }}
                >
                  📝 Parse
                </button>
                <button
                  onClick={() => setCardsMode('builder')}
                  style={{
                    padding: '6px 14px',
                    fontSize: 13,
                    border: 'none',
                    cursor: 'pointer',
                    background: cardsMode === 'builder' ? '#374151' : 'transparent',
                    color: cardsMode === 'builder' ? 'white' : '#9CA3AF',
                    fontWeight: cardsMode === 'builder' ? 600 : 400,
                  }}
                >
                  ✨ Builder
                </button>
              </div>

              {scenes.length > 0 && cardsMode === 'parse' && (
                <>
                  {/* View toggle */}
                  <div
                    style={{
                      display: 'flex',
                      background: '#1E293B',
                      borderRadius: 6,
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      onClick={() => setView('deck')}
                      style={{
                        padding: '6px 14px',
                        fontSize: 13,
                        border: 'none',
                        cursor: 'pointer',
                        background: view === 'deck' ? '#374151' : 'transparent',
                        color: view === 'deck' ? 'white' : '#9CA3AF',
                        fontWeight: view === 'deck' ? 600 : 400,
                      }}
                    >
                      🃏 Deck
                    </button>
                    <button
                      onClick={() => setView('print')}
                      style={{
                        padding: '6px 14px',
                        fontSize: 13,
                        border: 'none',
                        cursor: 'pointer',
                        background: view === 'print' ? '#374151' : 'transparent',
                        color: view === 'print' ? 'white' : '#9CA3AF',
                        fontWeight: view === 'print' ? 600 : 400,
                      }}
                    >
                      🖨 Print
                    </button>
                  </div>
                </>
              )}

              {scenes.length > 0 && cardsMode === 'parse' && (
                <>
                  <label
                    style={{
                      fontSize: 12,
                      color: '#9CA3AF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={editable}
                      onChange={(e) => setEditable(e.target.checked)}
                    />
                    Edit
                  </label>

                  <button
                    onClick={() => window.print()}
                    style={{
                      padding: '6px 14px',
                      fontSize: 13,
                      background: '#374151',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    Print Cards
                  </button>
                </>
              )}

              {scenes.length > 0 && cardsMode === 'parse' && (
                <>
                  <button onClick={handleExportJSON} style={exportBtnStyle}>
                    JSON
                  </button>
                  <button onClick={handleExportMarkdown} style={exportBtnStyle}>
                    MD
                  </button>
                  <button
                    onClick={handleExportLintReport}
                    style={exportBtnStyle}
                    title="Export narrative diagnostics as a markdown report"
                  >
                    Diagnostics
                  </button>
                  <button
                    onClick={() => {
                      // Build AI prompts for all detected scenes and copy to clipboard
                      const chunks = detectScenes(sourceText);
                      const prompts = chunks.map((c) =>
                        buildExtractionPrompt(
                          c.sidebars.length > 0 ? c.sidebars.join('\n\n') : c.prose,
                          c.title,
                        ),
                      );
                      navigator.clipboard.writeText(prompts.join('\n\n---\n\n'));
                      setPromptCopied(true);
                      setTimeout(() => setPromptCopied(false), 2000);
                    }}
                    style={aiBtnStyle}
                    title="Copy AI extraction prompts for all scenes to clipboard"
                  >
                    {promptCopied ? '✓ Copied' : '🤖 AI Prompt'}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </header>

      {/* Stats bar */}
      {isCardsWorkspace && scenes.length > 0 && cardsMode === 'parse' && (
        <div
          className="no-print"
          style={{
            padding: '8px 24px',
            fontSize: 12,
            color: '#9CA3AF',
            borderBottom: '1px solid #1E293B',
            display: 'flex',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <span>{scenes.length} scene card{scenes.length !== 1 ? 's' : ''}</span>
          <span>
            {Math.ceil(scenes.length / 4)} page{Math.ceil(scenes.length / 4) !== 1 ? 's' : ''} when printed
          </span>
          {detectedMode && (
            <span
              title={MODE_LABELS[detectedMode].desc}
              style={{
                padding: '2px 8px',
                background: detectedMode === 'tagged' ? '#1E3A5F' : '#1E3B2F',
                color: detectedMode === 'tagged' ? '#60A5FA' : '#6EE7B7',
                borderRadius: 4,
                fontWeight: 600,
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {MODE_LABELS[detectedMode].label}
            </span>
          )}
          {redundancies.length > 0 && (
            <span style={{ color: '#d97706' }}>
              ⚠ {redundancies.length} redundant pair{redundancies.length !== 1 ? 's' : ''} ({'>'}90% similar)
            </span>
          )}
          {diagnosticsReport.signalCount > 0 && (
            <span style={{ color: '#f59e0b' }} title="Narrative diagnostic signals across scene logic">
              🧪 {diagnosticsReport.signalCount} narrative signal{diagnosticsReport.signalCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {isCardsWorkspace && scenes.length > 0 && cardsMode === 'parse' && (
        <div
          className="no-print"
          style={{
            padding: '6px 24px 10px',
            fontSize: 11,
            color: '#94A3B8',
            borderBottom: '1px solid #1E293B',
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span style={{ color: '#CBD5E1', fontWeight: 600 }}>Signal Legend:</span>
          {(Object.keys(LINT_ICON_BY_CODE) as Array<keyof typeof LINT_ICON_BY_CODE>).map((code) => (
            <span key={code} title={LINT_LABEL_BY_CODE[code]} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span>{LINT_ICON_BY_CODE[code]}</span>
              <span>{LINT_LABEL_BY_CODE[code]}</span>
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <main style={{ padding: view === 'print' ? 0 : '24px' }}>
        {workspace === 'characters' ? (
          <CharacterStudio />
        ) : workspace === 'monsters' ? (
          <MonsterStudio />
        ) : workspace === 'cards' && cardsMode === 'builder' ? (
          <SceneCardBuilder
            onAddScene={handleAddScene}
            onCancel={() => setCardsMode('parse')}
          />
        ) : (
          <>
            {/* Input area (always visible unless printing) */}
            <div className="no-print" style={{ marginBottom: 24, display: 'flex', gap: 24 }}>
              {/* Left Status Strip */}
              <div style={{
                width: 240, 
                background: 'rgba(15, 18, 25, 0.7)', 
                border: '1px solid rgba(205, 164, 94, 0.25)',
                padding: '1.5rem',
                borderRadius: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                fontFamily: "'Inter', sans-serif"
              }}>
                <h3 style={{ margin: 0, color: '#cda45e', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'Cinzel', serif" }}>Field Status</h3>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                  <div style={{ marginBottom: 12 }}><span style={{ color: '#E5E7EB' }}>Ground:</span> {scenes.length ? 'scene active' : 'awaiting manuscript'}</div>
                  <div style={{ marginBottom: 12 }}><span style={{ color: '#E5E7EB' }}>Will:</span> {scenes.length ? 'pressure detected' : 'no active pressure detected'}</div>
                  <div style={{ marginBottom: 12 }}><span style={{ color: '#E5E7EB' }}>Shift:</span> {scenes.length ? 'parameters set' : 'parse required'}</div>
                  <div><span style={{ color: '#E5E7EB' }}>Drift:</span> {scenes.length ? 'tracked' : 'none'}</div>
                </div>
              </div>

              {/* Main Text Input */}
              <div style={{ flex: 1 }}>
                {scenes.length === 0 && !parsedDiagnostics && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                    {['Ground', 'Will', 'Shift', 'Drift'].map(col => (
                      <div key={col} style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)', padding: '16px', textAlign: 'center', color: '#cda45e', fontSize: 13, textTransform: 'uppercase', letterSpacing: 2, fontFamily: "'Cinzel', serif" }}>
                        {col}
                      </div>
                    ))}
                  </div>
                )}
                <TextInput onParse={handleParse} showEditor={scenes.length === 0 && !parsedDiagnostics} />
              </div>
            </div>

            {scenes.length === 0 && parsedDiagnostics ? (
              <div className="no-print">
                <DiagnosticsViewer report={parsedDiagnostics} />
              </div>
            ) : scenes.length === 0 ? (
              <div
                className="no-print"
                style={{
                  textAlign: 'center',
                  padding: '40px 24px',
                  color: '#9CA3AF',
                }}
              >
                <p style={{ fontSize: 16, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
                  Distill unstable scenes into Ground, Will, Shift, and Drift before the Rupture spreads.
                </p>
                <p style={{ fontSize: 13, lineHeight: 1.6 }}>
                  Paste field notes, adventure text, or raw scene prose.<br/>
                  The Forge reads for <code>[gwsd]</code> tags, <code>[sidebar]</code> blocks, and structural headers.
                </p>
              </div>
            ) : view === 'deck' ? (
              <div
                className="no-print"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '320px minmax(0, 1fr)',
                  gap: 20,
                  alignItems: 'start',
                }}
              >
                <aside
                  style={{
                    position: 'sticky',
                    top: 16,
                    maxHeight: 'calc(100vh - 150px)',
                    border: '1px solid #1E293B',
                    borderRadius: 8,
                    background: '#111827',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: 12, borderBottom: '1px solid #1E293B', display: 'grid', gap: 10 }}>
                    <label style={{ display: 'grid', gap: 4, fontSize: 11, color: '#9CA3AF' }}>
                      Organize Cards
                      <select
                        value={organizeBy}
                        onChange={(e) => setOrganizeBy(e.target.value as DeckOrganize)}
                        style={selectStyle}
                      >
                        <option value="scene-order">Scene Order (Default)</option>
                        <option value="scene-type">Scene Type</option>
                      </select>
                    </label>

                    <label style={{ display: 'grid', gap: 4, fontSize: 11, color: '#9CA3AF' }}>
                      Filter by Type
                      <select
                        value={modeFilter}
                        onChange={(e) => setModeFilter(e.target.value as 'all' | SceneMode)}
                        style={selectStyle}
                      >
                        <option value="all">All Types</option>
                        <option value="discovery">🔍 Discovery</option>
                        <option value="trap">🪤 Trap</option>
                        <option value="hazard">⚡ Hazard</option>
                        <option value="conflict">⚔️ Conflict</option>
                        <option value="social">💬 Social</option>
                        <option value="puzzle">🧩 Puzzle</option>
                      </select>
                    </label>
                  </div>

                  <div style={{ borderBottom: '1px solid #1E293B', padding: '10px 12px 6px', fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>
                    Outline
                  </div>
                  <div style={{ overflowY: 'auto', maxHeight: 250, borderBottom: '1px solid #1E293B' }}>
                    {displayedScenes.map((scene) => {
                      const isActive = scene.id === selectedSceneId;
                      const modeMeta = sceneModeById.get(scene.id);
                      return (
                        <button
                          key={scene.id}
                          onClick={() => {
                            setSelectedSceneId(scene.id);
                            const node = document.getElementById(`scene-card-${scene.id}`);
                            node?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            border: 'none',
                            borderBottom: '1px solid #1F2937',
                            background: isActive ? '#1E293B' : 'transparent',
                            color: isActive ? '#F9FAFB' : '#CBD5E1',
                            cursor: 'pointer',
                            padding: '8px 12px',
                            display: 'grid',
                            gap: 3,
                          }}
                        >
                          <span style={{ fontSize: 11, color: '#93C5FD' }}>
                            Scene {scene.order + 1}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{scene.title}</span>
                          {modeMeta && (
                            <span style={{ fontSize: 10, color: '#94A3B8' }}>
                              {modeMeta.icon} {modeMeta.label}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ padding: '10px 12px 6px', fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>
                    Section Text
                  </div>
                  <div
                    style={{
                      flex: 1,
                      overflowY: 'auto',
                      padding: '0 12px 12px',
                      fontSize: 12,
                      lineHeight: 1.55,
                      color: '#D1D5DB',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {selectedScene?.raw?.trim() || 'Select a scene in the outline to inspect source section text.'}
                    {selectedSceneEvidence && (
                      <div
                        style={{
                          marginTop: 12,
                          paddingTop: 10,
                          borderTop: '1px solid #1F2937',
                          display: 'grid',
                          gap: 6,
                          whiteSpace: 'normal',
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#CBD5E1' }}>
                          Runtime Rubric — {SCENE_MODE_META[selectedSceneEvidence.mode].icon} {SCENE_MODE_META[selectedSceneEvidence.mode].label}
                        </div>
                        <div style={{ fontSize: 11, color: '#94A3B8', display: 'grid', gap: 4 }}>
                          <span>
                            {selectedSceneEvidence.driftChannel === 'response'
                              ? '🪤'
                              : selectedSceneEvidence.driftChannel === 'inevitability'
                              ? '⚡'
                              : '➖'}{' '}
                            Drift Channel ({selectedSceneEvidence.driftChannel === 'none'
                              ? 'none'
                              : selectedSceneEvidence.driftChannel})
                          </span>
                          <span>{selectedSceneEvidence.trapIntent ? '✅' : '❌'} Trap Intent (agentive Will)</span>
                          <span>{selectedSceneEvidence.trapTrigger ? '✅' : '❌'} {selectedScene?.stateType === 'latent' ? 'Latent Trigger (resolution test)' : 'Trap Trigger (decision test in Shift)'}</span>
                          <span>{selectedSceneEvidence.hazardGround ? '✅' : '❌'} Hazard Ground (environmental condition)</span>
                          <span>{selectedSceneEvidence.hazardExposure ? '✅' : '❌'} {selectedScene?.stateType === 'latent' ? 'Latent Accumulation (pressure model)' : 'Hazard Exposure (accumulation model)'}</span>
                          <span>{selectedSceneEvidence.hpTaxPattern ? '⚠️' : '✅'} HP-Tax Pattern Check</span>
                          <span>
                            {(selectedSceneEvidence.shiftDriftDivergence >= 0.45 ? '✅' : '⚠️')}{' '}
                            {selectedScene?.stateType === 'latent' ? 'Trigger/Accumulation' : 'Shift/Drift'} Divergence {(selectedSceneEvidence.shiftDriftDivergence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </aside>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: 24,
                    alignItems: 'start',
                  }}
                >
                  {displayedScenes.map((scene) => (
                    <div key={scene.id} id={`scene-card-${scene.id}`}>
                      <SceneRow
                        scene={scene}
                        editable={editable}
                        onEditCard={handleEditCard}
                        redundant={redundantIds.has(scene.id)}
                        lintWarnings={diagnosticsBySceneOrder.get(scene.order) || []}
                        sceneMode={sceneModeById.get(scene.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Print layout: always mounted for window.print(), visible on screen only in print view */}
            {scenes.length > 0 && (
              <div className={`print-only${view === 'print' ? ' print-preview' : ''}`}>
                <PrintLayout scenes={scenes} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

const exportBtnStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 12,
  background: '#1E293B',
  color: '#9CA3AF',
  border: '1px solid #374151',
  borderRadius: 6,
  cursor: 'pointer',
};

const aiBtnStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 12,
  background: '#1E293B',
  color: '#A78BFA',
  border: '1px solid #5B21B6',
  borderRadius: 6,
  cursor: 'pointer',
};

const selectStyle: React.CSSProperties = {
  padding: '6px 8px',
  fontSize: 12,
  background: '#0F172A',
  color: '#E5E7EB',
  border: '1px solid #374151',
  borderRadius: 6,
};
