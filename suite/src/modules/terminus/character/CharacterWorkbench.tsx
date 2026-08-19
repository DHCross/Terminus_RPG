import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Archive, Sparkles, TrendingUp, Users } from 'lucide-react';
import { ORIGINS } from '../../../data/terminus/archetypes';
import { sheetAbilitiesForOrder } from '../../../data/terminus/orders';
import { CharacterGenerator } from './CharacterGenerator';
import { AdvancementTracker } from './AdvancementTracker';
import { useCharacterStorage, type CharacterData } from './useCharacterStorage';
import { VaultCharacterCard } from './VaultCharacterCard';
import CharacterSheetPreview from '../../gwsd-cards/components/CharacterSheetPreview';
import { applySheetPatchToCharacter, vaultAbilities, vaultCharacterToEngine } from './civicSheetAdapter';
import type { Die } from '../../../data/terminus/skills';
import type { CharacterCreationState } from '../../../data/terminus/advancement';
import { RuleLink } from '../rules/RuleLink';

type CharacterTab = 'generator' | 'tracker' | 'vault';

function newestRecord(records: CharacterData[]): CharacterData | null {
  if (records.length === 0) return null;
  return [...records].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )[0];
}

function recordToCurrent(record: CharacterData) {
  return {
    name: record.name,
    order: record.order || '',
    origin: record.species || '',
    Force: (record.skills?.Force || 'd4') as Die,
    Agility: (record.skills?.Agility || 'd4') as Die,
    Willpower: (record.skills?.Willpower || 'd4') as Die,
    advancementPoints: record.advancementPoints ?? 0,
    completedOperations: record.completedOperations ?? 0,
  };
}

export function CharacterWorkbench() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { characters, saveCharacter, updateCharacter, deleteCharacter, selectedCharacter, selectedCharacterId, setSelectedCharacterId } = useCharacterStorage();

  const tabFromUrl = searchParams.get('tab');
  const [tab, setTab] = useState<CharacterTab>(() => {
    if (tabFromUrl === 'tracker' || tabFromUrl === 'vault' || tabFromUrl === 'generator') return tabFromUrl;
    return characters.length > 0 ? 'vault' : 'generator';
  });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const activeRecord = useMemo(
    () => selectedCharacter ?? newestRecord(characters),
    [selectedCharacter, characters],
  );

  const [currentCharacter, setCurrentCharacter] = useState(() =>
    activeRecord
      ? recordToCurrent(activeRecord)
      : {
          name: 'Unnamed Responder',
          order: '',
          origin: '',
          Force: 'd4' as Die,
          Agility: 'd4' as Die,
          Willpower: 'd4' as Die,
          advancementPoints: 0,
          completedOperations: 0,
        },
  );

  useEffect(() => {
    if (selectedCharacterId && characters.some((record) => record.id === selectedCharacterId)) return;
    const newest = newestRecord(characters);
    if (newest) setSelectedCharacterId(newest.id);
  }, [characters, selectedCharacterId, setSelectedCharacterId]);

  useEffect(() => {
    if (tabFromUrl === 'tracker' || tabFromUrl === 'vault' || tabFromUrl === 'generator') {
      setTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
    if (!activeRecord) return;
    setCurrentCharacter(recordToCurrent(activeRecord));
  }, [activeRecord]);

  const openTab = (next: CharacterTab) => {
    setTab(next);
    setSearchParams(next === 'vault' ? {} : { tab: next }, { replace: true });
  };

  const handleSaveFromGenerator = (char: CharacterCreationState) => {
    const saved = saveCharacter({
      name: char.name,
      order: char.order,
      species: char.speciesLabel || ORIGINS.find((origin) => origin.id === char.origin)?.name || char.origin,
      skills: {
        Force: char.Force,
        Agility: char.Agility,
        Willpower: char.Willpower,
      },
      approach: char.approach,
      frame: char.backgroundSentence,
      background: char.backgroundSentence,
      objective: char.currentObjective,
      primaryWeapon: char.primaryWeapon,
      secondaryWeapon: char.secondaryItem,
      armor: char.armor,
      abilities: sheetAbilitiesForOrder(char.order),
    });
    setCurrentCharacter(recordToCurrent(saved));
    setSaveMessage(`${saved.name} saved. The civic sheet is now the vault file.`);
    window.setTimeout(() => setSaveMessage(null), 4000);
    openTab('vault');
  };

  const handleLoadCharacter = (char: CharacterData) => {
    setSelectedCharacterId(char.id);
    setCurrentCharacter(recordToCurrent(char));
    openTab('tracker');
  };

  const handleSheetChange = (record: CharacterData, patch: Parameters<typeof applySheetPatchToCharacter>[1]) => {
    const updates = applySheetPatchToCharacter(record, patch);
    updateCharacter(record.id, updates);
    setCurrentCharacter((prev) => ({
      ...prev,
      name: updates.name ?? prev.name,
      order: (updates.order as string) ?? prev.order,
      Force: (updates.skills?.Force as Die) ?? prev.Force,
      Agility: (updates.skills?.Agility as Die) ?? prev.Agility,
      Willpower: (updates.skills?.Willpower as Die) ?? prev.Willpower,
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="tab-bar">
        <button type="button" onClick={() => openTab('generator')} className={tab === 'generator' ? 'tab-button active' : 'tab-button'}>
          <Users size={18} /> Generator
        </button>
        <button type="button" onClick={() => openTab('tracker')} className={tab === 'tracker' ? 'tab-button active' : 'tab-button'}>
          <TrendingUp size={18} /> Advancement
        </button>
        <button type="button" onClick={() => openTab('vault')} className={tab === 'vault' ? 'tab-button active' : 'tab-button'}>
          <Archive size={18} /> Vault ({characters.length})
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <div className="panel" style={{ maxWidth: '960px', margin: '0 auto 1rem' }}>
          <div className="chip-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="eyebrow">Active civic file</span>
              <h2 style={{ margin: '0.25rem 0 0' }}>
                {activeRecord?.name || currentCharacter.name}
              </h2>
              <p className="muted" style={{ margin: '0.25rem 0 0' }}>
                {activeRecord?.order || currentCharacter.order || 'No Order selected'} / {characters.length} vault record{characters.length === 1 ? '' : 's'}
              </p>
            </div>
            <div className="chip-row">
              <button type="button" className="btn btn-secondary" onClick={() => openTab('vault')}>
                <Archive size={16} /> View Vault
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => openTab('tracker')}>
                <TrendingUp size={16} /> Advance
              </button>
              <RuleLink section="skills" block />
            </div>
          </div>
          {saveMessage && (
            <div className="empty-state" style={{ marginTop: '1rem', padding: '0.85rem' }}>
              {saveMessage}
            </div>
          )}
        </div>

        {tab === 'generator' && (
          <CharacterGenerator onSave={handleSaveFromGenerator} />
        )}

        {tab === 'tracker' && (
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            {activeRecord ? (
              <div style={{ marginBottom: '1.5rem' }}>
                <p className="muted" style={{ margin: '0 0 0.75rem' }}>
                  This is the vault file. Click any field to type. Advancement below spends AP on the same record.
                </p>
                <CharacterSheetPreview
                  key={activeRecord.id}
                  character={vaultCharacterToEngine({
                    ...activeRecord,
                    name: currentCharacter.name || activeRecord.name,
                    skills: {
                      Force: currentCharacter.Force,
                      Agility: currentCharacter.Agility,
                      Willpower: currentCharacter.Willpower,
                    },
                  })}
                  abilities={vaultAbilities(activeRecord)}
                  armorId={activeRecord.armor}
                  onChange={(patch) => handleSheetChange(activeRecord, patch)}
                />
              </div>
            ) : (
              <div className="empty-state" style={{ marginBottom: '1.5rem' }}>
                No civic file yet. Generate a responder and save it — the sheet becomes the vault record.
              </div>
            )}
            <AdvancementTracker
              characterName={currentCharacter.name}
              skills={{
                Force: currentCharacter.Force,
                Agility: currentCharacter.Agility,
                Willpower: currentCharacter.Willpower,
              }}
              availableAP={currentCharacter.advancementPoints}
              completedOperations={currentCharacter.completedOperations}
              onSkillAdvanced={(skill, newDie, apSpent) => {
                setCurrentCharacter((prev) => ({
                  ...prev,
                  [skill]: newDie,
                  advancementPoints: prev.advancementPoints - apSpent,
                }));
                if (activeRecord) {
                  updateCharacter(activeRecord.id, {
                    skills: {
                      ...activeRecord.skills,
                      [skill]: newDie,
                    },
                    advancementPoints: (activeRecord.advancementPoints ?? currentCharacter.advancementPoints) - apSpent,
                  });
                }
              }}
              onAPEarned={(amount) => {
                setCurrentCharacter((prev) => ({
                  ...prev,
                  advancementPoints: prev.advancementPoints + amount,
                  completedOperations: prev.completedOperations + 1,
                }));
                if (activeRecord) {
                  updateCharacter(activeRecord.id, {
                    advancementPoints: (activeRecord.advancementPoints ?? currentCharacter.advancementPoints) + amount,
                    completedOperations: (activeRecord.completedOperations ?? currentCharacter.completedOperations) + 1,
                  });
                }
              }}
            />
          </div>
        )}

        {tab === 'vault' && (
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div>
                <h2 style={{
                  margin: '0 0 0.25rem 0',
                  fontFamily: "'EB Garamond', serif",
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#f8fafc',
                  letterSpacing: '1px',
                }}>
                  Character Vault
                </h2>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>
                  {characters.length === 0
                    ? 'No responders on file. Create one in the Generator.'
                    : `${characters.length} responder${characters.length !== 1 ? 's' : ''} on file. Each file is the fillable civic sheet.`
                  }
                </p>
              </div>
              {characters.length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  fontSize: '0.75rem',
                  color: '#64748b',
                }}>
                  {['seeker','breaker','warden','rival','broker','shade'].map((orderId) => {
                    const count = characters.filter((record) => (record.order || '').toLowerCase() === orderId).length;
                    if (count === 0) return null;
                    return (
                      <span key={orderId} style={{
                        padding: '3px 10px',
                        background: 'rgba(148,163,184,0.06)',
                        borderRadius: '4px',
                        border: '1px solid rgba(148,163,184,0.12)',
                      }}>
                        {orderId.charAt(0).toUpperCase() + orderId.slice(1)}: {count}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {characters.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: 'rgba(30,41,59,0.4)',
                borderRadius: '12px',
                border: '1px dashed rgba(148,163,184,0.2)',
              }}>
                <Sparkles size={32} style={{ color: '#64748b', marginBottom: '1rem' }} />
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 0.5rem 0' }}>
                  No characters in the vault yet.
                </p>
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>
                  Generate a responder, save it, and this tab becomes the civic sheet.
                </p>
              </div>
            )}

            {characters.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '1.25rem',
              }}>
                {characters.map((char) => (
                  <VaultCharacterCard
                    key={char.id}
                    character={char}
                    isSelected={activeRecord?.id === char.id}
                    onSelect={() => handleLoadCharacter(char)}
                    onDelete={() => deleteCharacter(char.id)}
                    onUpdate={(updates) => updateCharacter(char.id, updates)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
