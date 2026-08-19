import { useMemo, useState } from 'react';
import type { Enemy, EnemyDefinition, ValidationDiagnostic } from '../../coherence-engine/src/index.ts';
import { ARMOR_REDUCTION } from '../../coherence-engine/src/index.ts';
import {
  buildMonsterFromDraft,
  cloneMonsterDraft,
  defaultMonsterDraft,
  downloadJson,
  MONSTER_ENCOUNTER_PACKS,
  MONSTER_PRESETS,
  type MonsterDraft,
} from '../coherenceStudio';
import {
  DiagnosticsList,
  DiceEditor,
  Field,
  inputStyle,
  PanelSection,
  primaryButtonStyle,
  secondaryButtonStyle,
  selectStyle,
  statLine,
  StudioGrid,
  summaryChip,
  textAreaStyle,
  WeaponEditor,
} from './CoherenceStudioCommon';

interface MonsterRecord {
  savedAt: string;
  draft: MonsterDraft;
  definition: EnemyDefinition;
  enemy: Enemy;
  diagnostics: ValidationDiagnostic[];
}

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString();
}

export default function MonsterStudio() {
  const [draft, setDraft] = useState<MonsterDraft>(() => defaultMonsterDraft());
  const [roster, setRoster] = useState<MonsterRecord[]>([]);
  const preview = useMemo(() => buildMonsterFromDraft(draft), [draft]);
  const monsterPresetsByKey = useMemo(() => new Map(MONSTER_PRESETS.map((preset) => [preset.key, preset])), []);

  const saveCurrent = () => {
    setRoster((current) => [
      {
        savedAt: new Date().toISOString(),
        draft: cloneMonsterDraft(draft),
        definition: preview.definition,
        enemy: preview.enemy,
        diagnostics: preview.diagnostics,
      },
      ...current,
    ]);
  };

  const exportRoster = () => {
    downloadJson('coherence_monsters.json', {
      exportedAt: new Date().toISOString(),
      monsters: roster.map((entry) => ({
        savedAt: entry.savedAt,
        definition: entry.definition,
        enemy: entry.enemy,
        diagnostics: entry.diagnostics,
      })),
    });
  };

  const loadRecord = (entry: MonsterRecord) => {
    setDraft(cloneMonsterDraft(entry.draft));
  };

  const removeRecord = (savedAt: string) => {
    setRoster((current) => current.filter((item) => item.savedAt !== savedAt));
  };

  const addEncounterPack = (presetKeys: string[]) => {
    const baseTimestamp = Date.now();
    const nextEntries = presetKeys
      .map((presetKey, index) => {
        const preset = monsterPresetsByKey.get(presetKey);
        if (!preset) return null;
        const built = buildMonsterFromDraft(preset.draft);

        return {
          savedAt: new Date(baseTimestamp + index).toISOString(),
          draft: cloneMonsterDraft(preset.draft),
          definition: built.definition,
          enemy: built.enemy,
          diagnostics: built.diagnostics,
        };
      })
      .filter((entry): entry is MonsterRecord => entry !== null);

    if (nextEntries.length === 0) return;

    setDraft(cloneMonsterDraft(nextEntries[0].draft));
    setRoster((current) => [...nextEntries, ...current]);
  };

  return (
    <StudioGrid
      editor={
        <>
          <PanelSection
            title="Monster Studio"
            description="Generate Coherence System enemy frames that sit beside the scene cards and use the same force, pressure, and rupture vocabulary. Includes a starter bestiary roster to bootstrap encounter design."
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {MONSTER_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  onClick={() => setDraft(cloneMonsterDraft(preset.draft))}
                  title={preset.description}
                  style={secondaryButtonStyle}
                >
                  {preset.label}
                </button>
              ))}
              <button onClick={() => setDraft(defaultMonsterDraft())} style={secondaryButtonStyle}>
                Reset Draft
              </button>
            </div>
            <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>One-click encounter packs (adds 3 monsters to Saved Monsters)</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {MONSTER_ENCOUNTER_PACKS.map((pack) => (
                  <button
                    key={pack.key}
                    onClick={() => addEncounterPack(pack.presetKeys)}
                    title={pack.description}
                    style={secondaryButtonStyle}
                  >
                    Pack: {pack.label}
                  </button>
                ))}
              </div>
            </div>
          </PanelSection>

          <PanelSection title="Threat Identity" description="Monsters carry the same core frame as characters, plus a behavior pattern and dedicated attack profile.">
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <Field label="Name">
                <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} style={inputStyle} />
              </Field>
              <Field label="Armor">
                <select value={draft.armor} onChange={(event) => setDraft({ ...draft, armor: event.target.value as MonsterDraft['armor'] })} style={selectStyle}>
                  {Object.keys(ARMOR_REDUCTION).map((armor) => (
                    <option key={armor} value={armor}>
                      {armor} · -{ARMOR_REDUCTION[armor as keyof typeof ARMOR_REDUCTION]} impact
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Origin / Frame">
              <textarea value={draft.background} onChange={(event) => setDraft({ ...draft, background: event.target.value })} style={textAreaStyle} />
            </Field>
            <Field label="Immediate Want">
              <textarea value={draft.immediateWant} onChange={(event) => setDraft({ ...draft, immediateWant: event.target.value })} style={textAreaStyle} />
            </Field>
            <Field label="Behavior Pattern">
              <textarea value={draft.behavior} onChange={(event) => setDraft({ ...draft, behavior: event.target.value })} style={textAreaStyle} />
            </Field>
            <Field label="Notes">
              <textarea value={draft.notesText} onChange={(event) => setDraft({ ...draft, notesText: event.target.value })} style={textAreaStyle} />
            </Field>
          </PanelSection>

          <DiceEditor
            title="Action Dice"
            values={[
              { key: 'force', label: 'Force', value: draft.actions.force },
              { key: 'agility', label: 'Agility', value: draft.actions.agility },
              { key: 'willpower', label: 'Willpower', value: draft.actions.willpower },
            ]}
            onChange={(key, value) => setDraft({ ...draft, actions: { ...draft.actions, [key]: value } })}
            totalPoints={preview.actionPoints}
          />

          <DiceEditor
            title="Defense Dice"
            values={[
              { key: 'endure', label: 'Endure', value: draft.defenses.endure },
              { key: 'avoid', label: 'Avoid', value: draft.defenses.avoid },
              { key: 'exert', label: 'Exert', value: draft.defenses.exert },
            ]}
            onChange={(key, value) => setDraft({ ...draft, defenses: { ...draft.defenses, [key]: value } })}
            totalPoints={preview.defensePoints}
          />

          <WeaponEditor title="Primary Weapon" weapon={draft.primaryWeapon} onChange={(nextWeapon) => setDraft({ ...draft, primaryWeapon: nextWeapon })} />
          <WeaponEditor title="Secondary Weapon" weapon={draft.secondaryWeapon} onChange={(nextWeapon) => setDraft({ ...draft, secondaryWeapon: nextWeapon })} />
          <WeaponEditor title="Signature Attack" weapon={draft.attack} onChange={(nextWeapon) => setDraft({ ...draft, attack: nextWeapon })} />
        </>
      }
      sidebar={
        <>
          <PanelSection title="Generated Monster" description="Live enemy frame preview from the current draft.">
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC' }}>{preview.enemy.name}</div>
              <div style={{ fontSize: 13, lineHeight: 1.55, color: '#CBD5E1' }}>{preview.enemy.identity.background}</div>
              <div style={{ fontSize: 13, lineHeight: 1.55, color: '#E2E8F0' }}>{preview.enemy.behavior}</div>
            </div>
            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
              {summaryChip('Initiative', `Phase ${preview.enemy.initiativePhase}`)}
              {summaryChip('Armor', `${preview.enemy.armor} · -${ARMOR_REDUCTION[preview.enemy.armor]}`)}
              {summaryChip('Force', statLine(preview.enemy.actions.force))}
              {summaryChip('Agility', statLine(preview.enemy.actions.agility))}
              {summaryChip('Willpower', statLine(preview.enemy.actions.willpower))}
              {summaryChip('Endure', `${preview.enemy.tracks.endure.current}/${preview.enemy.tracks.endure.max}`)}
              {summaryChip('Vitality', `${preview.enemy.tracks.vitality.current}/${preview.enemy.tracks.vitality.max}`)}
              {summaryChip('Avoid', `${preview.enemy.tracks.avoid.current}/${preview.enemy.tracks.avoid.max}`)}
              {summaryChip('Exert', `${preview.enemy.tracks.exert.current}/${preview.enemy.tracks.exert.max}`)}
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#F8FAFC' }}>Attack Pattern</div>
              <div style={{ fontSize: 12, color: '#CBD5E1', lineHeight: 1.5 }}>
                {preview.enemy.attack.name}: {preview.enemy.attack.impact} impact
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={saveCurrent} style={primaryButtonStyle}>Save to Roster</button>
              <button onClick={exportRoster} style={secondaryButtonStyle} disabled={roster.length === 0}>
                Export Roster
              </button>
            </div>
          </PanelSection>

          <PanelSection title="Validation" description="Direct engine diagnostics for the current threat frame.">
            <DiagnosticsList diagnostics={preview.diagnostics} />
          </PanelSection>

          <PanelSection title="Saved Monsters" description="Load, export, or remove generated threats.">
            {roster.length === 0 ? (
              <div style={{ fontSize: 12, color: '#94A3B8' }}>No saved monsters yet.</div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {roster.map((entry) => (
                  <div
                    key={`${entry.savedAt}-${entry.enemy.id}`}
                    style={{
                      borderRadius: 10,
                      border: '1px solid #1E293B',
                      background: '#0F172A',
                      padding: 12,
                      display: 'grid',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'grid', gap: 2 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>{entry.enemy.name}</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>{formatTimestamp(entry.savedAt)}</div>
                    </div>
                    <div style={{ fontSize: 12, color: '#CBD5E1' }}>Initiative {entry.enemy.initiativePhase} · Attack {entry.enemy.attack.name}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button onClick={() => loadRecord(entry)} style={secondaryButtonStyle}>Load</button>
                      <button
                        onClick={() => removeRecord(entry.savedAt)}
                        style={secondaryButtonStyle}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PanelSection>
        </>
      }
    />
  );
}
