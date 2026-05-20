/* ── GWSD Card Generator — Main Application ── */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Scene, SilhouetteSectionKey, StoryFunction, ConnectiveTrigger } from './types';
import Card from './components/Card';
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
import { SceneCardForge } from '../terminus/scene/SceneCardForge';

type View = 'deck' | 'print' | 'play';
type DeckOrganize = 'scene-order' | 'scene-type';
type Workspace = 'cards' | 'characters' | 'monsters';
type CardsMode = 'parse' | 'builder';

const WORKSPACE_META: Record<Workspace, { title: string; subtitle: string }> = {
  cards: {
    title: 'GWSD Card Generator',
    subtitle: 'Silhouette scene cards projected from GWSD extraction grammar for live Guide use',
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
  // Runnable State Machine diagnostics
  'vague-ground': '🌫️',
  'backstory-will': '📜',
  'hazard-has-will': '🌊',
  'trap-no-will': '🪤',
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
  // Runnable State Machine diagnostics
  'vague-ground': 'Vague Ground',
  'backstory-will': 'Backstory Will',
  'hazard-has-will': 'Hazard Has Will',
  'trap-no-will': 'Trap No Will',
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

const DEMO_MANUSCRIPT = `[gwsd]
# ## Scene: Foyer of the Ministry
**Story Function**: hook
**Scene Mode**: social
**Scene Pressure**: 1
**Location**: Ministry entrance
**Act**: ACT I

## Ground
You stand in the crowded foyer of the Civic Ministry. The air is thick with the smell of wet wool and ozone from the scanner grates. Refraction guards filter the line.

## Will
Pass the security checkpoint without triggering the silent civic alarm.

## Shift
If you slip past the refraction guard unnoticed -> Go to #vault-archives (Ground: "Deep inside the vault rooms.")
If the wardens identify your counterfeit credentials -> Go to #ministry-alarm (latentConditionId: #ministry-alarm)

## Drift
Slow line progression increases security suspicion levels.
[/gwsd]

[gwsd]
# ## Scene: Vault Archives
**Story Function**: obstacle
**Scene Mode**: puzzle
**Scene Pressure**: 2
**Location**: Archival sub-level
**Act**: ACT I

## Ground
A massive brass runic dial blocks access to the ledger index. Secondary capacitors pulse with active kinetic energy.

## Will
Align the harmonic dials before mechanical lockouts seal the chamber.

## Shift
If you align the rune gears successfully -> Go to #vault-safehouse (Pressure: -1, Ground: "The central vault seals click open.")
If the capacitors discharge and trigger a containment alarm -> Go to #civic-strain (latentConditionId: #civic-strain)

## Drift
The brass gear rings slip out of alignment, grinding under pressure.
[/gwsd]

[gwsd]
# ## Scene: Vault Safehouse
**Story Function**: prospect
**Scene Mode**: social
**Scene Pressure**: 0
**Location**: Sanctuary archives
**Act**: ACT I

## Ground
A quiet, dusty sanctuary sub-level smelling of parchment and hot grease. Safe from the high-threat sweep squads outside.

## Will
Secure the encrypted ledger and activate the emergency extraction panel.

## Shift
Securing the primary ledger allows a clean extraction -> Go to #mission-complete

## Drift
Sweep squads slowly triangulate your acoustic signature.
[/gwsd]

[gwsd]
# ### Latent Condition: Civic Strain (Lockout)
**Story Function**: latent
**Scene Mode**: hazard
**Scene Pressure**: 3
**Location**: Sector-wide
**Act**: ACT I

## Ground
The civic energy grid drops, sealing all main corridors under amber emergency barriers.

## Will
Bypass the localized power grates or hotwire a substation to lift the containment gates.

## Trigger
Armed when vault archive capacitors discharge.

## Accumulation
Securing security sectors locks out successive corridors.
[/gwsd]

[gwsd]
# ### Latent Condition: Ministry Alarm
**Story Function**: latent
**Scene Mode**: confrontation
**Scene Pressure**: 4
**Location**: Structural
**Act**: ACT I

## Ground
Bells toll loudly throughout the sub-sectors. Refraction guards deploy reinforced shields to isolate exits.

## Will
Evade tactical search sweeps or brace for physical guard patrols.

## Trigger
Armed when counterfeit credentials are flag-detected at the gate.

## Accumulation
Corridor alarm levels increase, summoning heavy interceptor units.
[/gwsd]`;

export default function App({ pendingScene, onPendingSceneConsumed }: { pendingScene?: Scene | null; onPendingSceneConsumed?: () => void }) {
  const [scenes, setScenes] = useState<Scene[]>(() => {
    const parsed = smartParse(DEMO_MANUSCRIPT);
    return parsed.scenes;
  });
  const [deckName, setDeckName] = useState('Silhouette GWSD Deck');
  const [view, setView] = useState<View>('play');
  const [workspace, setWorkspace] = useState<Workspace>('cards');
  const [organizeBy, setOrganizeBy] = useState<DeckOrganize>('scene-order');
  const [modeFilter, setModeFilter] = useState<'all' | SceneMode>('all');
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [editable, setEditable] = useState(false);
  const [detectedMode, setDetectedMode] = useState<DetectedMode | null>('tagged');
  const [sourceText, setSourceText] = useState(DEMO_MANUSCRIPT);
  const [promptCopied, setPromptCopied] = useState(false);
  const [parsedDiagnostics, setParsedDiagnostics] = useState<ParsedDiagnosticsReport | null>(null);
  const [cardsMode, setCardsMode] = useState<CardsMode>('parse');

  interface PlayState {
    activeNodeId: string | null;
    runwayNodeIds: string[];
    scenePressureOverrides: Record<string, number>;
    activeCarryovers: Record<string, string[]>;
    unlockedLatentIds: string[];
  }

  const [playState, setPlayState] = useState<PlayState>({
    activeNodeId: null,
    runwayNodeIds: [],
    scenePressureOverrides: {},
    activeCarryovers: {},
    unlockedLatentIds: [],
  });

  const [playHistory, setPlayHistory] = useState<PlayState[]>([]);

  const resetPlayState = useCallback((currentScenes: Scene[]) => {
    if (currentScenes.length === 0) {
      setPlayState({
        activeNodeId: null,
        runwayNodeIds: [],
        scenePressureOverrides: {},
        activeCarryovers: {},
        unlockedLatentIds: [],
      });
      setPlayHistory([]);
      return;
    }

    const runwayScenes = currentScenes.filter(
      (s) =>
        s.storyFunction !== 'latent' &&
        s.contentType !== 'diagnostic' &&
        s.contentType !== 'reference'
    );
    const runwayNodeIds = runwayScenes.map((s) => s.id);
    const activeNodeId = runwayNodeIds.length > 0 ? runwayNodeIds[0] : currentScenes[0].id;

    setPlayState({
      activeNodeId,
      runwayNodeIds,
      scenePressureOverrides: {},
      activeCarryovers: {},
      unlockedLatentIds: [],
    });
    setPlayHistory([]);
  }, []);

  useEffect(() => {
    resetPlayState(scenes);
  }, [scenes, resetPlayState]);

  // Keybindings for Play Cockpit
  useEffect(() => {
    if (view !== 'play') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        setPlayState((prev) => {
          const idx = prev.runwayNodeIds.indexOf(prev.activeNodeId || '');
          if (idx > 0) {
            return { ...prev, activeNodeId: prev.runwayNodeIds[idx - 1] };
          }
          return prev;
        });
      } else if (e.key === 'ArrowRight') {
        setPlayState((prev) => {
          const idx = prev.runwayNodeIds.indexOf(prev.activeNodeId || '');
          if (idx !== -1 && idx < prev.runwayNodeIds.length - 1) {
            return { ...prev, activeNodeId: prev.runwayNodeIds[idx + 1] };
          }
          return prev;
        });
      } else if (
        e.key === 'u' ||
        e.key === 'U' ||
        (e.ctrlKey && e.key === 'z') ||
        (e.metaKey && e.key === 'z')
      ) {
        if (playHistory.length > 0) {
          e.preventDefault();
          const prev = playHistory[playHistory.length - 1];
          setPlayState(prev);
          setPlayHistory((hist) => hist.slice(0, -1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, playHistory]);

  const getColorForStoryFunction = useCallback((func?: StoryFunction) => {
    switch (func) {
      case 'hook':
        return {
          border: '#10B981',
          bg: 'rgba(16, 185, 129, 0.08)',
          text: '#34D399',
          glow: 'rgba(16, 185, 129, 0.15)',
        };
      case 'obstacle':
        return {
          border: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.08)',
          text: '#FBBF24',
          glow: 'rgba(245, 158, 11, 0.15)',
        };
      case 'prospect':
        return {
          border: '#06B6D4',
          bg: 'rgba(6, 182, 212, 0.08)',
          text: '#22D3EE',
          glow: 'rgba(6, 182, 212, 0.15)',
        };
      case 'latent':
        return {
          border: '#8B5CF6',
          bg: 'rgba(139, 92, 246, 0.08)',
          text: '#A78BFA',
          glow: 'rgba(139, 92, 246, 0.15)',
        };
      default:
        return {
          border: '#4B5563',
          bg: 'rgba(75, 85, 99, 0.08)',
          text: '#9CA3AF',
          glow: 'rgba(75, 85, 99, 0.15)',
        };
    }
  }, []);

  const handleTransition = useCallback(
    (trigger: ConnectiveTrigger) => {
      const targetId = trigger.targetNodeId;
      const targetScene = scenes.find((s) => s.id === targetId);
      if (!targetScene) return;

      setPlayHistory((prev) => [...prev, playState]);

      setPlayState((prev) => {
        const nextPressureOverrides = { ...prev.scenePressureOverrides };
        const nextCarryovers = { ...prev.activeCarryovers };
        const nextUnlocked = [...prev.unlockedLatentIds];

        if (trigger.stateHandoff?.pressureModifier !== undefined) {
          const basePressure = targetScene.scenePressure || 0;
          const currentOverride =
            nextPressureOverrides[targetId] !== undefined
              ? nextPressureOverrides[targetId]
              : basePressure;
          nextPressureOverrides[targetId] = currentOverride + trigger.stateHandoff.pressureModifier;
        }

        if (trigger.stateHandoff?.groundInject) {
          const currentBadges = nextCarryovers[targetId] || [];
          if (!currentBadges.includes(trigger.stateHandoff.groundInject)) {
            nextCarryovers[targetId] = [...currentBadges, trigger.stateHandoff.groundInject];
          }
        }

        if (trigger.stateHandoff?.latentConditionId) {
          const latentId = trigger.stateHandoff.latentConditionId;
          if (!nextUnlocked.includes(latentId)) {
            nextUnlocked.push(latentId);
          }
        }

        let nextRunway = [...prev.runwayNodeIds];
        if (!nextRunway.includes(targetId) && targetScene.storyFunction !== 'latent') {
          const activeIdx = nextRunway.indexOf(prev.activeNodeId || '');
          if (activeIdx !== -1) {
            nextRunway.splice(activeIdx + 1, 0, targetId);
          } else {
            nextRunway.push(targetId);
          }
        }

        return {
          ...prev,
          activeNodeId: targetId,
          runwayNodeIds: nextRunway,
          scenePressureOverrides: nextPressureOverrides,
          activeCarryovers: nextCarryovers,
          unlockedLatentIds: nextUnlocked,
        };
      });
    },
    [scenes, playState]
  );

  const handleRunwayDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', `runway:${id}`);
  };

  const handleUnboundDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', `unbound:${id}`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRunwayDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;

    const [sourceType, sourceId] = data.split(':');
    if (!sourceId) return;

    setPlayHistory((prev) => [...prev, playState]);

    setPlayState((prev) => {
      let nextRunway = [...prev.runwayNodeIds];

      if (sourceType === 'runway') {
        const sourceIdx = nextRunway.indexOf(sourceId);
        const targetIdx = nextRunway.indexOf(targetId);
        if (sourceIdx !== -1 && targetIdx !== -1) {
          nextRunway.splice(sourceIdx, 1);
          nextRunway.splice(targetIdx, 0, sourceId);
        }
      } else if (sourceType === 'unbound') {
        if (!nextRunway.includes(sourceId)) {
          const targetIdx = nextRunway.indexOf(targetId);
          if (targetIdx !== -1) {
            nextRunway.splice(targetIdx, 0, sourceId);
          } else {
            nextRunway.push(sourceId);
          }
        }
      }

      return {
        ...prev,
        runwayNodeIds: nextRunway,
      };
    });
  };

  const handleRunwayEndDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;

    const [sourceType, sourceId] = data.split(':');
    if (!sourceId) return;

    setPlayHistory((prev) => [...prev, playState]);

    setPlayState((prev) => {
      let nextRunway = [...prev.runwayNodeIds];

      if (sourceType === 'runway') {
        const sourceIdx = nextRunway.indexOf(sourceId);
        if (sourceIdx !== -1) {
          nextRunway.splice(sourceIdx, 1);
          nextRunway.push(sourceId);
        }
      } else if (sourceType === 'unbound') {
        if (!nextRunway.includes(sourceId)) {
          nextRunway.push(sourceId);
        }
      }

      return {
        ...prev,
        runwayNodeIds: nextRunway,
      };
    });
  };

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
        hazard:    1,
        conflict:  2,
        social:    3,
        puzzle:    4,
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

  const activeSceneId = useMemo(
    () => (
      selectedSceneId && displayedScenes.some((scene) => scene.id === selectedSceneId)
        ? selectedSceneId
        : displayedScenes[0]?.id || null
    ),
    [displayedScenes, selectedSceneId],
  );

  const selectedScene = useMemo(
    () => scenes.find((scene) => scene.id === activeSceneId) || null,
    [activeSceneId, scenes],
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
    setScenes((prev) => [...prev, { ...scene, order: prev.length + 1 }]);
    setCardsMode('parse');
    setSelectedSceneId(scene.id);
  }, []);

  // Consume a scene that was forged in the AI Forge tab and passed in via props.
  const onPendingSceneConsumedRef = useRef(onPendingSceneConsumed);
  useEffect(() => {
    onPendingSceneConsumedRef.current = onPendingSceneConsumed;
  });
  useEffect(() => {
    if (!pendingScene) return;
    setScenes((prev) => {
      if (prev.some((s) => s.id === pendingScene.id)) return prev;
      return [...prev, { ...pendingScene, order: prev.length + 1 }];
    });
    setCardsMode('parse');
    setSelectedSceneId(pendingScene.id);
    onPendingSceneConsumedRef.current?.();
  }, [pendingScene]);

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
                {entry === 'cards' ? 'Cards' : entry === 'characters' ? 'Characters' : 'Monsters'}
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
                  📝 Extract Cards
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
                  ✨ Forge Card
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
                      onClick={() => setView('play')}
                      style={{
                        padding: '6px 14px',
                        fontSize: 13,
                        border: 'none',
                        cursor: 'pointer',
                        background: view === 'play' ? '#374151' : 'transparent',
                        color: view === 'play' ? 'white' : '#9CA3AF',
                        fontWeight: view === 'play' ? 600 : 400,
                      }}
                    >
                      🕹️ Play Cockpit
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
          <SceneCardForge
            onSceneForged={handleAddScene}
            onCancel={() => setCardsMode('parse')}
          />
        ) : (
          <>
            {/* Input area (always visible unless printing) */}
            <div className="no-print" style={{ marginBottom: 24 }}>
              <TextInput onParse={handleParse} showEditor={scenes.length === 0 && !parsedDiagnostics} />
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
                  padding: '60px 24px',
                  color: '#6B7280',
                }}
              >
                <p style={{ fontSize: 16 }}>
                  GWSD distills scene prose into a live Silhouette rules card so the Guide can run agency, pressure, contingency, and consequence at speed.
                </p>
                <p style={{ fontSize: 13, lineHeight: 1.6 }}>
                  Paste or open a manuscript. Supports <code>[gwsd]</code> tagged blocks, <code>[sidebar]</code> blocks,<br/>
                  and structural detection from headers + prose.
                </p>
                <div style={{ marginTop: 40, borderTop: '1px solid #374151', paddingTop: 24, display: 'inline-block' }}>
                  <p style={{ fontSize: 12, fontStyle: 'italic', color: '#4B5563', margin: 0 }}>
                    "I made a language out of code, taught the bells when they should ring...<br/>
                    built the Orders out of silence, to keep pressure from the seam."
                  </p>
                </div>
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
                      const isActive = scene.id === activeSceneId;
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
            ) : view === 'play' ? (
              <div
                className="no-print"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                  minHeight: 'calc(100vh - 160px)',
                }}
              >
                {/* RUNWAY TIMELINE */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    background: '#111827',
                    border: '1px solid #1E293B',
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    THE RUNWAY (Active Scenario Timeline) — Drag & Drop to Reorder
                  </div>
                  
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      overflowX: 'auto',
                      gap: 12,
                      padding: '8px 4px',
                      position: 'relative',
                    }}
                  >
                    {playState.runwayNodeIds.length === 0 ? (
                      <div style={{ fontSize: 13, color: '#6B7280', fontStyle: 'italic', padding: '12px 0' }}>
                        No nodes on the Runway. Drag latent conditions from the sidebar onto the runway or parse a full manuscript.
                      </div>
                    ) : (
                      playState.runwayNodeIds.map((id, idx) => {
                        const scene = scenes.find((s) => s.id === id);
                        if (!scene) return null;
                        const colors = getColorForStoryFunction(scene.storyFunction);
                        const isActive = playState.activeNodeId === scene.id;

                        const nodeContent = (
                          <div
                            key={scene.id}
                            draggable
                            onDragStart={(e) => handleRunwayDragStart(e, scene.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleRunwayDrop(e, scene.id)}
                            onClick={() => setPlayState((prev) => ({ ...prev, activeNodeId: scene.id }))}
                            style={{
                              flexShrink: 0,
                              width: 190,
                              padding: '12px 14px',
                              borderRadius: 8,
                              background: isActive ? '#1E293B' : 'rgba(15, 23, 42, 0.6)',
                              border: isActive ? '2px solid #F59E0B' : `1px solid ${colors.border}`,
                              boxShadow: isActive ? '0 0 12px rgba(245, 158, 11, 0.3)' : `0 0 8px ${colors.glow}`,
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 6,
                              transition: 'all 0.2s ease',
                              position: 'relative',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 9, fontWeight: 'bold', color: colors.text, letterSpacing: '0.05em' }}>
                                {scene.storyFunction?.toUpperCase() || 'SCENE'}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPlayHistory((prev) => [...prev, playState]);
                                  setPlayState((prev) => {
                                    const nextRunway = prev.runwayNodeIds.filter((x) => x !== scene.id);
                                    let nextActive = prev.activeNodeId;
                                    if (nextActive === scene.id) {
                                      nextActive = nextRunway.length > 0 ? nextRunway[0] : null;
                                    }
                                    return { ...prev, runwayNodeIds: nextRunway, activeNodeId: nextActive };
                                  });
                                }}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#6B7280',
                                  cursor: 'pointer',
                                  fontSize: 12,
                                  padding: 0,
                                  lineHeight: 1,
                                }}
                                title="Remove from Runway"
                              >
                                ×
                              </button>
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#F3F4F6',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {scene.title}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: '#9CA3AF' }}>
                              <span>
                                Pressure:{' '}
                                {playState.scenePressureOverrides[scene.id] !== undefined
                                  ? playState.scenePressureOverrides[scene.id]
                                  : scene.scenePressure || 0}
                              </span>
                            </div>
                          </div>
                        );

                        if (idx < playState.runwayNodeIds.length - 1) {
                          return (
                            <div key={`runway-grp-${scene.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              {nodeContent}
                              <div style={{ color: '#4B5563', fontWeight: 'bold', fontSize: 18, userSelect: 'none' }}>→</div>
                            </div>
                          );
                        }
                        return nodeContent;
                      })
                    )}

                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleRunwayEndDrop}
                      style={{
                        flexShrink: 0,
                        width: 100,
                        height: 50,
                        border: '1px dashed #374151',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        color: '#4B5563',
                        textAlign: 'center',
                        padding: 4,
                        userSelect: 'none',
                      }}
                    >
                      Drop Unbound Card here to append
                    </div>
                  </div>
                </div>

                {/* WORKSPACE & SIDEBAR */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 340px',
                    gap: 24,
                    alignItems: 'start',
                  }}
                >
                  {/* ACTIVE DECK COCKPIT */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {(() => {
                      const activeScene = scenes.find((s) => s.id === playState.activeNodeId);
                      if (!activeScene) {
                        return (
                          <div
                            style={{
                              border: '1px dashed #374151',
                              borderRadius: 8,
                              padding: 40,
                              textAlign: 'center',
                              color: '#6B7280',
                              background: '#111827',
                            }}
                          >
                            <p style={{ fontSize: 16, margin: 0 }}>
                              Select a node from the Runway timeline or drag an Unbound card to get started.
                            </p>
                          </div>
                        );
                      }

                      const currentPress =
                        playState.scenePressureOverrides[activeScene.id] !== undefined
                          ? playState.scenePressureOverrides[activeScene.id]
                          : activeScene.scenePressure || 0;

                      return (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '350px 1fr',
                            gap: 24,
                            alignItems: 'start',
                          }}
                        >
                          <div>
                            <Card
                              scene={activeScene}
                              editable={false}
                              redundant={redundantIds.has(activeScene.id)}
                              lintWarnings={diagnosticsBySceneOrder.get(activeScene.order) || []}
                              sceneMode={sceneModeById.get(activeScene.id)}
                              pressureOverride={playState.scenePressureOverrides[activeScene.id]}
                              carryoverBadges={playState.activeCarryovers[activeScene.id]}
                            />
                          </div>

                          <div
                            style={{
                              background: '#111827',
                              border: '1px solid #1E293B',
                              borderRadius: 12,
                              padding: 20,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 16,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            }}
                          >
                            {/* Cockpit Actions */}
                            <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #1E293B', paddingBottom: 12 }}>
                              <button
                                onClick={() => {
                                  if (playHistory.length > 0) {
                                    const prev = playHistory[playHistory.length - 1];
                                    setPlayState(prev);
                                    setPlayHistory((hist) => hist.slice(0, -1));
                                  }
                                }}
                                disabled={playHistory.length === 0}
                                style={{
                                  flex: 1,
                                  padding: '8px 12px',
                                  background: playHistory.length > 0 ? '#1E293B' : '#0F172A',
                                  color: playHistory.length > 0 ? '#CBD5E1' : '#4B5563',
                                  border: '1px solid #374151',
                                  borderRadius: 6,
                                  fontSize: 12,
                                  fontWeight: 'bold',
                                  cursor: playHistory.length > 0 ? 'pointer' : 'not-allowed',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 6,
                                }}
                                title="Undo the last transition or state change (Hotkey: Ctrl+Z)"
                              >
                                ↩ Undo Transition {playHistory.length > 0 ? `(${playHistory.length})` : ''}
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      'Are you sure you want to reset the entire tabletop state machine? This will clear all pressure modifications and carryover badges.'
                                    )
                                  ) {
                                    resetPlayState(scenes);
                                  }
                                }}
                                style={{
                                  padding: '8px 12px',
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  color: '#FCA5A5',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  borderRadius: 6,
                                  fontSize: 12,
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                }}
                              >
                                Reset
                              </button>
                            </div>

                            {/* Adjusters Panel */}
                            <div
                              style={{
                                border: '1px solid #1E293B',
                                borderRadius: 8,
                                padding: 12,
                                background: 'rgba(15, 23, 42, 0.4)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 10,
                              }}
                            >
                              <div style={{ fontSize: 11, fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase' }}>
                                Tabletop Adjusters
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 12, color: '#E5E7EB' }}>Scene Pressure</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <button
                                    onClick={() => {
                                      setPlayHistory((prev) => [...prev, playState]);
                                      setPlayState((prev) => {
                                        const nextOverrides = { ...prev.scenePressureOverrides };
                                        const current =
                                          nextOverrides[activeScene.id] !== undefined
                                            ? nextOverrides[activeScene.id]
                                            : activeScene.scenePressure || 0;
                                        nextOverrides[activeScene.id] = Math.max(0, current - 1);
                                        return { ...prev, scenePressureOverrides: nextOverrides };
                                      });
                                    }}
                                    style={{
                                      width: 24,
                                      height: 24,
                                      background: '#374151',
                                      border: 'none',
                                      borderRadius: 4,
                                      color: 'white',
                                      cursor: 'pointer',
                                      fontWeight: 'bold',
                                      fontSize: 14,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    -
                                  </button>
                                  <span style={{ fontSize: 14, fontWeight: 'bold', color: '#F59E0B', minWidth: 20, textAlign: 'center' }}>
                                    {currentPress}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setPlayHistory((prev) => [...prev, playState]);
                                      setPlayState((prev) => {
                                        const nextOverrides = { ...prev.scenePressureOverrides };
                                        const current =
                                          nextOverrides[activeScene.id] !== undefined
                                            ? nextOverrides[activeScene.id]
                                            : activeScene.scenePressure || 0;
                                        nextOverrides[activeScene.id] = current + 1;
                                        return { ...prev, scenePressureOverrides: nextOverrides };
                                      });
                                    }}
                                    style={{
                                      width: 24,
                                      height: 24,
                                      background: '#374151',
                                      border: 'none',
                                      borderRadius: 4,
                                      color: 'white',
                                      cursor: 'pointer',
                                      fontWeight: 'bold',
                                      fontSize: 14,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ fontSize: 11, color: '#9CA3AF' }}>Inject Custom Carryover Badge</span>
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    const form = e.currentTarget;
                                    const input = form.elements.namedItem('badgeText') as HTMLInputElement;
                                    const text = input.value.trim();
                                    if (!text) return;

                                    setPlayHistory((prev) => [...prev, playState]);
                                    setPlayState((prev) => {
                                      const nextCarryovers = { ...prev.activeCarryovers };
                                      const current = nextCarryovers[activeScene.id] || [];
                                      if (!current.includes(text)) {
                                        nextCarryovers[activeScene.id] = [...current, text];
                                      }
                                      return { ...prev, activeCarryovers: nextCarryovers };
                                    });
                                    input.value = '';
                                  }}
                                  style={{ display: 'flex', gap: 6 }}
                                >
                                  <input
                                    name="badgeText"
                                    placeholder="e.g. Broken Archway, Rupture Caste..."
                                    style={{
                                      flex: 1,
                                      padding: '4px 8px',
                                      fontSize: 11,
                                      background: '#0F172A',
                                      color: '#E5E7EB',
                                      border: '1px solid #374151',
                                      borderRadius: 4,
                                      outline: 'none',
                                    }}
                                  />
                                  <button
                                    type="submit"
                                    style={{
                                      padding: '4px 8px',
                                      background: '#4F46E5',
                                      border: 'none',
                                      borderRadius: 4,
                                      color: 'white',
                                      fontSize: 11,
                                      fontWeight: 'bold',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Inject
                                  </button>
                                </form>
                              </div>
                            </div>

                            {/* connective transitions */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <div style={{ fontSize: 11, fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Connective State Routing
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                                {activeScene.connectiveTriggers && activeScene.connectiveTriggers.length > 0 ? (
                                  activeScene.connectiveTriggers.map((trigger, tIdx) => {
                                    const targetScene = scenes.find((s) => s.id === trigger.targetNodeId);
                                    
                                    const isSuccess =
                                      trigger.label.toLowerCase().includes('success') ||
                                      trigger.label.toLowerCase().includes('clear') ||
                                      targetScene?.storyFunction === 'prospect';
                                    const isFailure =
                                      trigger.label.toLowerCase().includes('fail') ||
                                      trigger.label.toLowerCase().includes('drift') ||
                                      trigger.label.toLowerCase().includes('hazard') ||
                                      targetScene?.storyFunction === 'latent';

                                    let borderCol = '#374151';
                                    let bgCol = 'rgba(30, 41, 59, 0.4)';
                                    let textCol = '#CBD5E1';
                                    let glowCol = 'transparent';

                                    if (isSuccess) {
                                      borderCol = '#059669';
                                      bgCol = 'rgba(5, 150, 105, 0.12)';
                                      textCol = '#34D399';
                                      glowCol = 'rgba(5, 150, 105, 0.15)';
                                    } else if (isFailure) {
                                      borderCol = '#DC2626';
                                      bgCol = 'rgba(220, 38, 38, 0.12)';
                                      textCol = '#FCA5A5';
                                      glowCol = 'rgba(220, 38, 38, 0.15)';
                                    }

                                    return (
                                      <button
                                        key={trigger.id || tIdx}
                                        onClick={() => handleTransition(trigger)}
                                        style={{
                                          width: '100%',
                                          textAlign: 'left',
                                          padding: '12px 16px',
                                          borderRadius: 8,
                                          border: `1px solid ${borderCol}`,
                                          background: bgCol,
                                          color: textCol,
                                          cursor: 'pointer',
                                          boxShadow: `0 2px 6px ${glowCol}`,
                                          transition: 'all 0.2s ease',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: 6,
                                        }}
                                      >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 8 }}>
                                          <span style={{ fontSize: 13, fontWeight: 600 }}>{trigger.label}</span>
                                          <span style={{ fontSize: 11, fontWeight: 'bold', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                                            → {targetScene ? targetScene.title : `[Missing: ${trigger.targetNodeId}]`}
                                          </span>
                                        </div>
                                        {trigger.stateHandoff && (
                                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
                                            {trigger.stateHandoff.pressureModifier !== undefined && (
                                              <span style={{ fontSize: 9, background: 'rgba(239, 68, 68, 0.2)', color: '#FCA5A5', padding: '1px 5px', borderRadius: 4, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                                Pressure:{' '}
                                                {trigger.stateHandoff.pressureModifier > 0
                                                  ? `+${trigger.stateHandoff.pressureModifier}`
                                                  : trigger.stateHandoff.pressureModifier}
                                              </span>
                                            )}
                                            {trigger.stateHandoff.groundInject && (
                                              <span style={{ fontSize: 9, background: 'rgba(245, 158, 11, 0.2)', color: '#FDE047', padding: '1px 5px', borderRadius: 4, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                                Ground: "{trigger.stateHandoff.groundInject}"
                                              </span>
                                            )}
                                            {trigger.stateHandoff.latentConditionId && (
                                              <span style={{ fontSize: 9, background: 'rgba(139, 92, 246, 0.2)', color: '#C084FC', padding: '1px 5px', borderRadius: 4, border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                                                Arms: {trigger.stateHandoff.latentConditionId}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </button>
                                    );
                                  })
                                ) : (
                                  <div style={{ fontSize: 12, color: '#6B7280', fontStyle: 'italic', padding: '4px 0' }}>
                                    No bound triggers parsed for this scene.
                                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                      <button
                                        onClick={() => {
                                          const idx = playState.runwayNodeIds.indexOf(playState.activeNodeId || '');
                                          if (idx !== -1 && idx < playState.runwayNodeIds.length - 1) {
                                            setPlayState((p) => ({ ...p, activeNodeId: p.runwayNodeIds[idx + 1] }));
                                          }
                                        }}
                                        disabled={
                                          playState.runwayNodeIds.indexOf(playState.activeNodeId || '') ===
                                          playState.runwayNodeIds.length - 1
                                        }
                                        style={{
                                          flex: 1,
                                          padding: '6px 12px',
                                          fontSize: 11,
                                          background: '#1E293B',
                                          color: '#CBD5E1',
                                          border: '1px solid #374151',
                                          borderRadius: 4,
                                          cursor: 'pointer',
                                        }}
                                      >
                                        Next Runway Node →
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Read Aloud block if available */}
                            {activeScene.terminus?.readAloud && (
                              <div
                                style={{
                                  borderTop: '1px solid #1E293B',
                                  paddingTop: 12,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 6,
                                }}
                              >
                                <div style={{ fontSize: 11, fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase' }}>
                                  Guide Read-Aloud
                                </div>
                                <div
                                  style={{
                                    fontSize: 12,
                                    lineHeight: 1.5,
                                    fontStyle: 'italic',
                                    color: '#CBD5E1',
                                    background: 'rgba(255,255,255,0.03)',
                                    padding: 10,
                                    borderRadius: 6,
                                    borderLeft: '2px solid #8B5CF6',
                                  }}
                                >
                                  {activeScene.terminus.readAloud}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* UNBOUND DOCK SIDEBAR */}
                  <div
                    style={{
                      background: '#111827',
                      border: '1px solid #1E293B',
                      borderRadius: 12,
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      maxHeight: 'calc(100vh - 160px)',
                      overflowY: 'auto',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#F9FAFB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        UNBOUND DOCK
                      </div>
                      <span style={{ fontSize: 11, color: '#6B7280' }}>
                        Background latent conditions. Click to manual Arm/Disarm, or drag to the Runway sequence.
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                      {(() => {
                        const latentScenes = scenes.filter((s) => s.storyFunction === 'latent');
                        if (latentScenes.length === 0) {
                          return (
                            <div style={{ fontSize: 11, color: '#4B5563', fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>
                              No Latent Conditions found. Declare latent conditions starting with "### Latent Condition: [Title]" at the bottom of your draft.
                            </div>
                          );
                        }

                        return latentScenes.map((scene) => {
                          const isArmed = playState.unlockedLatentIds.includes(scene.id);
                          const triggerText = scene.cards.find((c) => c.state === 'trigger')?.text || '';
                          const groundText = scene.cards.find((c) => c.state === 'ground')?.text || '';

                          return (
                            <div
                              key={scene.id}
                              draggable
                              onDragStart={(e) => handleUnboundDragStart(e, scene.id)}
                              onClick={() => {
                                setPlayHistory((prev) => [...prev, playState]);
                                setPlayState((prev) => {
                                  const nextUnlocked = prev.unlockedLatentIds.includes(scene.id)
                                    ? prev.unlockedLatentIds.filter((id) => id !== scene.id)
                                    : [...prev.unlockedLatentIds, scene.id];
                                  return { ...prev, unlockedLatentIds: nextUnlocked };
                                });
                              }}
                              style={{
                                padding: 12,
                                borderRadius: 8,
                                background: 'rgba(15, 23, 42, 0.6)',
                                border: isArmed ? '2px solid #8B5CF6' : '1px solid #374151',
                                boxShadow: isArmed ? '0 0 12px rgba(139, 92, 246, 0.3)' : 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 6,
                                transition: 'all 0.2s ease',
                                opacity: isArmed ? 1 : 0.7,
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 9, fontWeight: 'bold', color: isArmed ? '#A78BFA' : '#9CA3AF', letterSpacing: '0.05em' }}>
                                  {isArmed ? '⚡ ARMED LATENT' : '💤 LATENT CONDITION'}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPlayHistory((prev) => [...prev, playState]);
                                    setPlayState((prev) => {
                                      let nextRunway = [...prev.runwayNodeIds];
                                      if (!nextRunway.includes(scene.id)) {
                                        nextRunway.push(scene.id);
                                      }
                                      return { ...prev, runwayNodeIds: nextRunway };
                                    });
                                  }}
                                  style={{
                                    background: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: 4,
                                    color: '#CBD5E1',
                                    fontSize: 9,
                                    padding: '2px 6px',
                                    cursor: 'pointer',
                                  }}
                                  title="Promote to Runway"
                                >
                                  + Runway
                                </button>
                              </div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#F3F4F6' }}>
                                {scene.title}
                              </div>
                              <div style={{ fontSize: 10, color: '#9CA3AF', lineHeight: 1.4 }}>
                                {triggerText ? (
                                  <div>
                                    <strong>Trigger:</strong>{' '}
                                    {triggerText.length > 80 ? triggerText.slice(0, 80) + '...' : triggerText}
                                  </div>
                                ) : (
                                  <div>
                                    {groundText.length > 80 ? groundText.slice(0, 80) + '...' : groundText}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
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
