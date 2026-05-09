import { useMemo, useState } from 'react';
import type { Character, CharacterDefinition, ValidationDiagnostic } from '../../silhouette-engine/src/index.ts';
import { ARMOR_REDUCTION } from '../../silhouette-engine/src/index.ts';
import {
  buildCharacterFromDraft,
  CHARACTER_PRESETS,
  cloneCharacterDraft,
  defaultCharacterDraft,
  downloadJson,
  type CharacterDraft,
} from '../silhouetteStudio';
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
} from './SilhouetteStudioCommon';
import CharacterSheetPreview from './CharacterSheetPreview';

interface CharacterRecord {
  savedAt: string;
  draft: CharacterDraft;
  definition: CharacterDefinition;
  character: Character;
  diagnostics: ValidationDiagnostic[];
}

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString();
}

export default function CharacterStudio() {
  const [draft, setDraft] = useState<CharacterDraft>(() => defaultCharacterDraft());
  const [roster, setRoster] = useState<CharacterRecord[]>([]);
  const preview = useMemo(() => buildCharacterFromDraft(draft), [draft]);

  const saveCurrent = () => {
    setRoster((current) => [
      {
        savedAt: new Date().toISOString(),
        draft: cloneCharacterDraft(draft),
        definition: preview.definition,
        character: preview.character,
        diagnostics: preview.diagnostics,
      },
      ...current,
    ]);
  };

  const exportRoster = () => {
    downloadJson('silhouette_characters.json', {
      exportedAt: new Date().toISOString(),
      characters: roster.map((entry) => ({
        savedAt: entry.savedAt,
        definition: entry.definition,
        character: entry.character,
        diagnostics: entry.diagnostics,
      })),
    });
  };

  const loadRecord = (entry: CharacterRecord) => {
    setDraft(cloneCharacterDraft(entry.draft));
  };

  const removeRecord = (savedAt: string) => {
    setRoster((current) => current.filter((item) => item.savedAt !== savedAt));
  };

  return (
    <StudioGrid
      editor={
        <>
          <PanelSection
            title="Character Studio"
            description="Build live Silhouette player frames with actual action dice, defense dice, armor, weapons, and validation from the engine. Includes simplified NPC starter templates."
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CHARACTER_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  onClick={() => setDraft(cloneCharacterDraft(preset.draft))}
                  title={preset.description}
                  style={secondaryButtonStyle}
                >
                  {preset.label}
                </button>
              ))}
              <button onClick={() => setDraft(defaultCharacterDraft())} style={secondaryButtonStyle}>
                Reset Draft
              </button>
            </div>
          </PanelSection>

          <PanelSection title="Identity" description="These fields become the character frame identity in the Silhouette engine.">
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <Field label="Name">
                <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} style={inputStyle} />
              </Field>
              <Field label="Armor">
                <select value={draft.armor} onChange={(event) => setDraft({ ...draft, armor: event.target.value as CharacterDraft['armor'] })} style={selectStyle}>
                  {Object.keys(ARMOR_REDUCTION).map((armor) => (
                    <option key={armor} value={armor}>
                      {armor} · -{ARMOR_REDUCTION[armor as keyof typeof ARMOR_REDUCTION]} impact
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Nation / Origin">
                <input value={draft.origin} onChange={(event) => setDraft({ ...draft, origin: event.target.value })} style={inputStyle} placeholder="e.g. The Pinder Traverse" />
              </Field>
              <Field label="Old Office (Deity)">
                <input value={draft.deity} onChange={(event) => setDraft({ ...draft, deity: event.target.value })} style={inputStyle} placeholder="e.g. The Arch-Sumner" />
              </Field>
            </div>
            <Field label="Background">
              <textarea value={draft.background} onChange={(event) => setDraft({ ...draft, background: event.target.value })} style={textAreaStyle} />
            </Field>
            <Field label="Immediate Want">
              <textarea value={draft.immediateWant} onChange={(event) => setDraft({ ...draft, immediateWant: event.target.value })} style={textAreaStyle} />
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
        </>
      }
      sidebar={
        <>
          <PanelSection title="Generated Character" description="Live engine output from the current draft.">
            <CharacterSheetPreview character={preview.character} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              <button onClick={saveCurrent} style={primaryButtonStyle}>Save to Roster</button>
              <button onClick={exportRoster} style={secondaryButtonStyle} disabled={roster.length === 0}>
                Export Roster
              </button>
            </div>
          </PanelSection>

          <PanelSection title="Validation" description="Direct engine diagnostics for the current frame.">
            <DiagnosticsList diagnostics={preview.diagnostics} />
          </PanelSection>

          <PanelSection title="Saved Characters" description="Load, export, or remove generated frames.">
            {roster.length === 0 ? (
              <div style={{ fontSize: 12, color: '#94A3B8' }}>No saved characters yet.</div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {roster.map((entry) => (
                  <div
                    key={`${entry.savedAt}-${entry.character.id}`}
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
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>{entry.character.name}</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>{formatTimestamp(entry.savedAt)}</div>
                    </div>
                    <div style={{ fontSize: 12, color: '#CBD5E1' }}>Initiative {entry.character.initiativePhase} · Armor {entry.character.armor}</div>
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