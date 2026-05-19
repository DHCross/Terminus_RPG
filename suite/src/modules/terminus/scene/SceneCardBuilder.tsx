import { useState } from 'react';
import { useToast } from '../../../components/Toast';
import type { Scene, GWSDCard, ActiveGWSDCard, LatentGWSDCard, GWSDState, TerminusOrder, TerminusSceneMode } from '../../gwsd-cards/types';
import { ORDERS_LIST } from '../../../data/terminus/orders';
import { exportCanonicalMarkdown, exportInlineGWSD, exportVisualCard } from './exportScene';
import { AIGenerator } from './AIGenerator';
import type { AISceneResponse } from '../../../services/aiService';

interface SceneCardBuilderProps {
  onAddScene: (scene: Scene) => void;
  onCancel: () => void;
}

const PRESSURE_TYPES = [
  { value: 'ground', label: 'Ground', description: 'Environmental pressure, physical conditions, terrain' },
  { value: 'will', label: 'Will', description: 'Social pressure, faction influence, NPC intentions' },
  { value: 'shift', label: 'Shift', description: 'Changing circumstances, momentum shifts' },
  { value: 'drift', label: 'Drift', description: 'Gradual erosion, slow decay, accumulation' },
] as const;

export function SceneCardBuilder({ onAddScene, onCancel }: SceneCardBuilderProps) {
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [adventure, setAdventure] = useState('Custom Adventure');
  const [act, setAct] = useState('');
  const [location, setLocation] = useState('');
  const [sceneMode, setSceneMode] = useState<TerminusSceneMode>('confrontation');
  const [stateType, setStateType] = useState<'active' | 'latent'>('active');
  const [driftLadder, setDriftLadder] = useState('');
  const [mapHooks, setMapHooks] = useState('');
  const [readAloud, setReadAloud] = useState('');

  // GWSD states
  const [ground, setGround] = useState('');
  const [will, setWill] = useState('');
  const [shift, setShift] = useState('');
  const [drift, setDrift] = useState('');
  const [trigger, setTrigger] = useState('');
  const [accumulation, setAccumulation] = useState('');
  const [reveal, setReveal] = useState('');

  const [pressureType, setPressureType] = useState<string>('ground');
  const [scenePressure, setScenePressure] = useState<number>(3);

  // Order hooks
  const [orderHooks, setOrderHooks] = useState<Record<TerminusOrder, string>>({
    seeker: '',
    breaker: '',
    warden: '',
    rival: '',
    broker: '',
    shade: '',
  });

  const [showExportPreview, setShowExportPreview] = useState(false);
  type ExportTab = 'canonical' | 'inline' | 'visual';
  const [activeExportTab, setActiveExportTab] = useState<ExportTab>('canonical');

  const handleCreate = () => {
    if (!title.trim()) {
      addToast('error', 'Scene title is required');
      return;
    }

    if (!ground.trim() || !will.trim()) {
      addToast('error', 'Ground and Will are required');
      return;
    }

    if (stateType === 'active' && (!shift.trim() || !drift.trim())) {
      addToast('error', 'Shift and Drift are required for active states');
      return;
    }

    if (stateType === 'latent' && (!trigger.trim() || !accumulation.trim())) {
      addToast('error', 'Trigger and Accumulation are required for latent conditions');
      return;
    }

    const hasOrderHooks = Object.values(orderHooks).some(hook => hook.trim());
    if (!hasOrderHooks) {
      addToast('warning', 'No Order hooks defined. Consider adding opportunities for each Order.');
    }

    const sceneId = crypto.randomUUID();

    // Create GWSD cards
    const createCard = (state: GWSDState, text: string): GWSDCard => {
      const base = {
        id: crypto.randomUUID(),
        sceneId,
        stateType,
        state,
        text,
        source: 'manual' as const,
      };

      if (stateType === 'active') {
        return base as ActiveGWSDCard;
      } else {
        return base as LatentGWSDCard;
      }
    };

    const cards: [GWSDCard, GWSDCard, GWSDCard, GWSDCard] = stateType === 'active'
      ? [
          createCard('ground', ground),
          createCard('will', will),
          createCard('shift', shift),
          createCard('drift', drift),
        ]
      : [
          createCard('ground', ground),
          createCard('will', will),
          createCard('trigger', trigger),
          createCard('accumulation', accumulation),
        ];

    const newScene: Scene = {
      id: sceneId,
      title: title.trim(),
      adventure: adventure.trim(),
      act: act.trim() || undefined,
      order: 1,
      stateType,
      scenePressure,
      cards,
      raw: '',
        terminus: {
          scenePressure,
          location: location.trim(),
          sceneMode,
          driftLadder: driftLadder.trim(),
          mapHooks: mapHooks.trim(),
          readAloud: readAloud.trim(),
          orderTags: (Object.entries(orderHooks) as Array<[TerminusOrder, string]>)
            .filter(([, hook]) => hook.trim())
            .map(([order]) => order),
        },
      };

    onAddScene(newScene);
    addToast('success', `Scene "${title}" forged`);
  };

  /** Build a temporary Scene from form state for export preview */
  const buildPreviewScene = (): Scene | null => {
    if (!title.trim() || !ground.trim() || !will.trim()) return null;
    const sceneId = 'preview';
    const createCard = (state: GWSDState, text: string): GWSDCard => {
      const base = {
        id: 'preview-' + state,
        sceneId,
        stateType,
        state,
        text,
        source: 'manual' as const,
      };
      return stateType === 'active' ? base as ActiveGWSDCard : base as LatentGWSDCard;
    };
    const cards: [GWSDCard, GWSDCard, GWSDCard, GWSDCard] = stateType === 'active'
      ? [createCard('ground', ground), createCard('will', will), createCard('shift', shift), createCard('drift', drift)]
      : [createCard('ground', ground), createCard('will', will), createCard('trigger', trigger), createCard('accumulation', accumulation)];
    return {
      id: sceneId,
      title: title.trim(),
      adventure: adventure.trim(),
      act: act.trim() || undefined,
      order: 1,
      stateType,
      scenePressure,
      cards,
      raw: '',
        terminus: {
          scenePressure,
          location: location.trim(),
          sceneMode,
          driftLadder: driftLadder.trim(),
          mapHooks: mapHooks.trim(),
          readAloud: readAloud.trim(),
          orderTags: (Object.entries(orderHooks) as Array<[TerminusOrder, string]>)
            .filter(([, hook]) => hook.trim())
            .map(([order]) => order),
        },
      };
  };

  const handleAIGenerated = (data: AISceneResponse) => {
    setTitle(data.title || '');
    if (data.adventure) setAdventure(data.adventure);
    if (data.act) setAct(data.act);
    setLocation(data.location || '');
    setSceneMode(data.sceneMode || 'confrontation');
    setStateType(data.stateType || 'active');
    setPressureType(data.pressureType || 'ground');
    setScenePressure(data.scenePressure || 3);
    setReadAloud(data.readAloud || '');
    setGround(data.ground || '');
    setWill(data.will || '');
    
    if (data.stateType === 'active') {
      setShift(data.shift || '');
      setDrift(data.drift || '');
    } else {
      setTrigger(data.trigger || '');
      setAccumulation(data.accumulation || '');
      setReveal(data.reveal || '');
    }

    setDriftLadder(data.driftLadder || '');
    setMapHooks(data.mapHooks || '');
    
    if (data.orderHooks) {
      setOrderHooks({
        seeker: data.orderHooks.seeker || '',
        breaker: data.orderHooks.breaker || '',
        warden: data.orderHooks.warden || '',
        rival: data.orderHooks.rival || '',
        broker: data.orderHooks.broker || '',
        shade: data.orderHooks.shade || '',
      });
    }
  };

  return (
    <div style={{
      backgroundColor: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '0.75rem',
      padding: '2rem',
      maxWidth: '900px',
      margin: '0 auto',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #334155',
      }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Create Scene Card</h2>
        <button
          onClick={onCancel}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            color: '#94a3b8',
            border: '1px solid #334155',
            borderRadius: '0.25rem',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>

      <AIGenerator onGenerate={handleAIGenerated} adventure={adventure} act={act} />

      {/* Basic Info */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', color: '#3b82f6' }}>Basic Information</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              Scene Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Crumbling Bridge"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#f8fafc',
                fontSize: '1rem',
              }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                Adventure
              </label>
              <input
                type="text"
                value={adventure}
                onChange={(e) => setAdventure(e.target.value)}
                placeholder="e.g., The Sunken Tomb"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '0.375rem',
                  color: '#f8fafc',
                  fontSize: '1rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                Act (optional)
              </label>
              <input
                type="text"
                value={act}
                onChange={(e) => setAct(e.target.value)}
                placeholder="e.g., Act II"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '0.375rem',
                  color: '#f8fafc',
                  fontSize: '1rem',
                }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                Location / Map Reference
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., The Undercrypts (Zone 4)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '0.375rem',
                  color: '#f8fafc',
                  fontSize: '1rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                Scene Mode / Resolver
              </label>
              <select
                value={sceneMode}
                onChange={(e) => setSceneMode(e.target.value as TerminusSceneMode)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '0.375rem',
                  color: '#f8fafc',
                  fontSize: '1rem',
                }}
              >
                <option value="confrontation">Confrontation — commitment / possession / force</option>
                <option value="hazard">Hazard — environment / exposure / endurance</option>
                <option value="kinetic">Kinetic — movement / distance / routes</option>
                <option value="social">Social — leverage / persuasion / hierarchy</option>
                <option value="discovery">Discovery — attention / information</option>
                <option value="puzzle">Puzzle — inference / system manipulation</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              State Type — <em style={{ fontWeight: 400, color: '#64748b' }}>Is this reality currently executable?</em>
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setStateType('active')}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: stateType === 'active' ? '#3b82f6' : '#0f172a',
                  color: stateType === 'active' ? 'white' : '#94a3b8',
                  border: stateType === 'active' ? '2px solid #3b82f6' : '1px solid #334155',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Active Scene
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 400, marginTop: '0.25rem' }}>
                  Pressure is running. Actions resolve now.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStateType('latent')}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: stateType === 'latent' ? '#3b82f6' : '#0f172a',
                  color: stateType === 'latent' ? 'white' : '#94a3b8',
                  border: stateType === 'latent' ? '2px solid #3b82f6' : '1px solid #334155',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Latent Condition
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 400, marginTop: '0.25rem' }}>
                  Pressure is stored. Future instability.
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GWSD States */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', color: '#3b82f6' }}>
          {stateType === 'active' ? 'Scene State' : 'Latent Condition'}
          <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#94a3b8', marginLeft: '0.5rem' }}>
            {stateType === 'active'
              ? '— Ground, Will, Shift, Drift'
              : '— Ground, Hidden Pressure, Trigger, Accumulation'}
          </span>
        </h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              Ground * — {stateType === 'active' ? 'What is currently reliable' : 'What appears stable on the surface'}
            </label>
            <textarea
              value={ground}
              onChange={(e) => setGround(e.target.value)}
              placeholder={stateType === 'active'
                ? 'What is currently reliable? What rules, terrain, access, or social conditions define what can happen here?'
                : 'What appears stable on the surface?'}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#f8fafc',
                fontSize: '0.9375rem',
                resize: 'vertical',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              {stateType === 'active'
                ? 'Will * — What pressure is already acting'
                : 'Hidden Pressure * — What instability is present but not yet active'}
            </label>
            <textarea
              value={will}
              onChange={(e) => setWill(e.target.value)}
              placeholder={stateType === 'active'
                ? 'What pressure is already acting? Who or what is trying to change the situation?'
                : 'What instability is present but not yet active?'}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#f8fafc',
                fontSize: '0.9375rem',
                resize: 'vertical',
              }}
            />
          </div>
          {stateType === 'active' ? (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                  Shift * — What changes when characters act
                </label>
                <textarea
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  placeholder="What changes immediately when characters act, interfere, or commit?"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.375rem',
                    color: '#f8fafc',
                    fontSize: '0.9375rem',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                  Drift * — What changes if no one acts
                </label>
                <textarea
                  value={drift}
                  onChange={(e) => setDrift(e.target.value)}
                  placeholder="What changes if no one resolves the situation? What worsens, advances, closes, or breaks?"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.375rem',
                    color: '#f8fafc',
                    fontSize: '0.9375rem',
                    resize: 'vertical',
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                  Trigger * — What turns this into an active scene
                </label>
                <textarea
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  placeholder="What event, choice, or discovery turns this into an active scene?"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.375rem',
                    color: '#f8fafc',
                    fontSize: '0.9375rem',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                  Accumulation * — How the hidden pressure builds
                </label>
                <textarea
                  value={accumulation}
                  onChange={(e) => setAccumulation(e.target.value)}
                  placeholder="How does the hidden pressure build while unnoticed?"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.375rem',
                    color: '#f8fafc',
                    fontSize: '0.9375rem',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                  Reveal Condition — What active state does this become
                </label>
                <textarea
                  value={reveal}
                  onChange={(e) => setReveal(e.target.value)}
                  placeholder="What active state does this become when revealed?"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.375rem',
                    color: '#f8fafc',
                    fontSize: '0.9375rem',
                    resize: 'vertical',
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Scene Pressure */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', color: '#3b82f6' }}>
          Scene Settings
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              Pressure Type
            </label>
            <select
              value={pressureType}
              onChange={(e) => setPressureType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#f8fafc',
                fontSize: '0.9375rem',
              }}
            >
              {PRESSURE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} — {type.description}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              Scene Pressure (1-5)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={scenePressure}
              onChange={(e) => setScenePressure(parseInt(e.target.value) || 3)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#f8fafc',
                fontSize: '0.9375rem',
              }}
            />
          </div>
        </div>
      </div>

      {/* Optional Flavor Mechanics */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', color: '#3b82f6' }}>
          Additional Scene Data <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#94a3b8' }}>(Optional)</span>
        </h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              Read-Aloud Box
            </label>
            <textarea
              value={readAloud}
              onChange={(e) => setReadAloud(e.target.value)}
              placeholder="Atmospheric prose derived from Ground + a hint of Will. What do the players immediately experience?"
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#f8fafc',
                fontSize: '0.9375rem',
                resize: 'vertical',
                fontStyle: 'italic',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              Drift Ladder / Transition State
            </label>
            <textarea
              value={driftLadder}
              onChange={(e) => setDriftLadder(e.target.value)}
              placeholder="If Drift occurs sequentially (e.g. 1. Shadows lengthen -> 2. Torches extinguish -> 3. The Beast arrives), list the ladder steps here."
              rows={2}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#f8fafc',
                fontSize: '0.9375rem',
                resize: 'vertical',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              Map Hooks / Nouns
            </label>
            <textarea
              value={mapHooks}
              onChange={(e) => setMapHooks(e.target.value)}
              placeholder="List nouns the card reinterprets or specific hooks to the map (e.g. The crumbling pillar, the iron grate)."
              rows={2}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '0.375rem',
                color: '#f8fafc',
                fontSize: '0.9375rem',
                resize: 'vertical',
              }}
            />
          </div>
        </div>
      </div>

      {/* Order Hooks */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', color: '#3b82f6' }}>
          Order Hooks
          <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#94a3b8', marginLeft: '0.5rem' }}>
            — Specific opportunities for each Order in this scene
          </span>
        </h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {ORDERS_LIST.map((order) => (
            <div key={order.id}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                {order.name} — {order.fieldFunction}
              </label>
              <textarea
                value={orderHooks[order.id] || ''}
                onChange={(e) => setOrderHooks({ ...orderHooks, [order.id]: e.target.value })}
                placeholder={`Describe a specific opportunity for ${order.name} in this scene...`}
                rows={2}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '0.375rem',
                  color: '#f8fafc',
                  fontSize: '0.9375rem',
                  resize: 'vertical',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Export Preview */}
      {showExportPreview && (() => {
        const preview = buildPreviewScene();
        if (!preview) return (
          <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.375rem', color: '#f87171' }}>
            Fill in at least Title, Ground, and {stateType === 'active' ? 'Will' : 'Hidden Pressure'} to preview export.
          </div>
        );
        const exports: Record<ExportTab, { label: string; content: string }> = {
          canonical: { label: 'Canonical Markdown', content: exportCanonicalMarkdown(preview) },
          inline: { label: 'Inline [gwsd]', content: exportInlineGWSD(preview) },
          visual: { label: 'Visual Card', content: exportVisualCard(preview) },
        };
        return (
          <div style={{ marginBottom: '1.5rem', border: '1px solid #334155', borderRadius: '0.5rem', overflow: 'hidden' }}>
            <div style={{ display: 'flex', backgroundColor: '#0f172a' }}>
              {(Object.keys(exports) as ExportTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveExportTab(tab)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    fontSize: '0.8125rem',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeExportTab === tab ? '#1e293b' : 'transparent',
                    color: activeExportTab === tab ? '#f8fafc' : '#64748b',
                    fontWeight: activeExportTab === tab ? 600 : 400,
                    borderBottom: activeExportTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                  }}
                >
                  {exports[tab].label}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <pre style={{
                padding: '1rem',
                margin: 0,
                backgroundColor: '#0f172a',
                color: '#e2e8f0',
                fontSize: '0.8125rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: '300px',
                overflow: 'auto',
                fontFamily: activeExportTab === 'visual' ? "'SF Mono', 'Fira Code', monospace" : 'inherit',
              }}>
                {exports[activeExportTab].content}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(exports[activeExportTab].content);
                  addToast('success', `${exports[activeExportTab].label} copied to clipboard`);
                }}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  backgroundColor: '#334155',
                  color: '#e2e8f0',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                }}
              >
                Copy
              </button>
            </div>
          </div>
        );
      })()}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #334155' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#334155',
            color: '#f8fafc',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9375rem',
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => setShowExportPreview(!showExportPreview)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#1e293b',
            color: '#94a3b8',
            border: '1px solid #475569',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9375rem',
          }}
        >
          {showExportPreview ? 'Hide Preview' : 'Preview Export'}
        </button>
        <button
          onClick={handleCreate}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9375rem',
          }}
        >
          Forge Scene Card
        </button>
      </div>
    </div>
  );
}
