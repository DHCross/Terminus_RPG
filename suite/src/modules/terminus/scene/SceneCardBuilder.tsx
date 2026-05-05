import { useState } from 'react';
import { useToast } from '../../../components/Toast';
import type { Scene, GWSDCard, ActiveGWSDCard, LatentGWSDCard } from '../../gwsd-cards/types';

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
  const [stateType, setStateType] = useState<'active' | 'latent'>('active');

  // GWSD states
  const [ground, setGround] = useState('');
  const [will, setWill] = useState('');
  const [shift, setShift] = useState('');
  const [drift, setDrift] = useState('');
  const [trigger, setTrigger] = useState('');
  const [accumulation, setAccumulation] = useState('');

  // Silhouette sections
  const [agency, setAgency] = useState('');
  const [pressure, setPressure] = useState('');
  const [contingency, setContingency] = useState('');
  const [consequence, setConsequence] = useState('');

  const [environmentSummary, setEnvironmentSummary] = useState('');
  const [pressureType, setPressureType] = useState<string>('ground');
  const [scenePressure, setScenePressure] = useState<number>(3);

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
      addToast('error', 'Shift and Drift are required for active scenes');
      return;
    }

    if (stateType === 'latent' && (!trigger.trim() || !accumulation.trim())) {
      addToast('error', 'Trigger and Accumulation are required for latent scenes');
      return;
    }

    const sceneId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Create GWSD cards
    const createCard = (state: string, text: string): GWSDCard => {
      const base = {
        id: crypto.randomUUID(),
        sceneId,
        stateType,
        state: state as any,
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
    };

    onAddScene(newScene);
    addToast('success', `Scene "${title}" created successfully`);
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
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              Scene Type *
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
                Active
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 400, marginTop: '0.25rem' }}>
                  Immediate pressure, ongoing conflict
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
                Latent
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 400, marginTop: '0.25rem' }}>
                  Dormant pressure, waiting for trigger
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GWSD States */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', color: '#3b82f6' }}>
          GWSD States
          <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#94a3b8', marginLeft: '0.5rem' }}>
            — The four pressures that define the scene
          </span>
        </h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              Ground * — The environment, physical conditions, terrain
            </label>
            <textarea
              value={ground}
              onChange={(e) => setGround(e.target.value)}
              placeholder="Describe the physical setting, weather, terrain, lighting, sounds, smells..."
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
              Will * — Social pressure, faction influence, NPC intentions
            </label>
            <textarea
              value={will}
              onChange={(e) => setWill(e.target.value)}
              placeholder="Describe who wants what, social tensions, faction goals, NPC agendas..."
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
                  Shift * — Changing circumstances, momentum shifts
                </label>
                <textarea
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  placeholder="Describe how the situation changes, what shifts in momentum, new developments..."
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
                  Drift * — Gradual erosion, slow decay, accumulation
                </label>
                <textarea
                  value={drift}
                  onChange={(e) => setDrift(e.target.value)}
                  placeholder="Describe what happens if nothing changes, gradual consequences, slow buildup..."
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
                  Trigger * — What activates the latent pressure
                </label>
                <textarea
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  placeholder="Describe what causes the latent pressure to activate: a specific action, time limit, condition met..."
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
                  Accumulation * — Pressure buildup before trigger
                </label>
                <textarea
                  value={accumulation}
                  onChange={(e) => setAccumulation(e.target.value)}
                  placeholder="Describe how pressure builds before the trigger: warning signs, escalating tension, visible deterioration..."
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
          Create Scene
        </button>
      </div>
    </div>
  );
}