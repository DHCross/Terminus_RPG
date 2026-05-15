import { useState } from 'react';
import { Archive, Sparkles, TrendingUp, Users } from 'lucide-react';
import { CharacterGenerator } from './CharacterGenerator';
import { AdvancementTracker } from './AdvancementTracker';
import { useCharacterStorage } from './useCharacterStorage';
import { VaultCharacterCard } from './VaultCharacterCard';
import type { Die } from '../../../data/terminus/skills';
import type { CharacterCreationState } from '../../../data/terminus/advancement';
import { RuleLink } from '../rules/RuleLink';

export function CharacterWorkbench() {
  const [tab, setTab] = useState<'generator' | 'tracker' | 'vault'>('generator');
  const { characters, saveCharacter, deleteCharacter, selectedCharacter, selectedCharacterId, setSelectedCharacterId } = useCharacterStorage();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [currentCharacter, setCurrentCharacter] = useState({
    name: 'Unnamed Responder',
    order: '',
    origin: '',
    Force: 'd4' as Die,
    Agility: 'd4' as Die,
    Willpower: 'd4' as Die,
    advancementPoints: 0,
    completedOperations: 0,
  });

  const handleSaveFromGenerator = (char: CharacterCreationState) => {
    const saved = saveCharacter({
      name: char.name,
      order: char.order,
      species: char.origin,
      skills: {
        Force: char.Force,
        Agility: char.Agility,
        Willpower: char.Willpower,
      },
    });
    setCurrentCharacter({
      name: saved.name,
      order: saved.order || '',
      origin: saved.species || '',
      Force: (saved.skills.Force || 'd4') as Die,
      Agility: (saved.skills.Agility || 'd4') as Die,
      Willpower: (saved.skills.Willpower || 'd4') as Die,
      advancementPoints: 0,
      completedOperations: 0,
    });
    setSaveMessage(`${saved.name} saved to the vault.`);
    window.setTimeout(() => setSaveMessage(null), 4000);
  };

  const handleLoadCharacter = (char: typeof characters[number]) => {
    setCurrentCharacter({
      name: char.name,
      order: char.order || '',
      origin: '',
      Force: (char.skills.Force || 'd4') as Die,
      Agility: (char.skills.Agility || 'd4') as Die,
      Willpower: (char.skills.Willpower || 'd4') as Die,
      advancementPoints: 0,
      completedOperations: 0,
    });
    setSelectedCharacterId(char.id);
    setTab('tracker');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="tab-bar">
        <button onClick={() => setTab('generator')} className={tab === 'generator' ? 'tab-button active' : 'tab-button'}>
          <Users size={18} /> Generator
        </button>
        <button onClick={() => setTab('tracker')} className={tab === 'tracker' ? 'tab-button active' : 'tab-button'}>
          <TrendingUp size={18} /> Advancement
        </button>
        <button onClick={() => setTab('vault')} className={tab === 'vault' ? 'tab-button active' : 'tab-button'}>
          <Archive size={18} /> Vault ({characters.length})
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <div className="panel" style={{ maxWidth: '960px', margin: '0 auto 1rem' }}>
          <div className="chip-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="eyebrow">Active Record</span>
              <h2 style={{ margin: '0.25rem 0 0' }}>
                {selectedCharacter?.name || currentCharacter.name}
              </h2>
              <p className="muted" style={{ margin: '0.25rem 0 0' }}>
                {selectedCharacter?.order || currentCharacter.order || 'No Order selected'} / {characters.length} vault record{characters.length === 1 ? '' : 's'}
              </p>
            </div>
            <div className="chip-row">
              <button className="btn btn-secondary" onClick={() => setTab('vault')}>
                <Archive size={16} /> View Vault
              </button>
              <button className="btn btn-secondary" onClick={() => setTab('tracker')}>
                <TrendingUp size={16} /> Advance
              </button>
              <RuleLink section="skills" block />
            </div>
          </div>
          {saveMessage && (
            <div className="empty-state" style={{ marginTop: '1rem', padding: '0.85rem' }}>
              {saveMessage} Continue in Advancement or review it in the Vault.
            </div>
          )}
        </div>

        {tab === 'generator' && (
          <CharacterGenerator onSave={handleSaveFromGenerator} />
        )}

        {tab === 'tracker' && (
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
              setCurrentCharacter(prev => ({
                ...prev,
                [skill]: newDie,
                advancementPoints: prev.advancementPoints - apSpent,
              }));
            }}
            onAPEarned={(amount) => {
              setCurrentCharacter(prev => ({
                ...prev,
                advancementPoints: prev.advancementPoints + amount,
                completedOperations: prev.completedOperations + 1,
              }));
            }}
          />
        )}

        {tab === 'vault' && (
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            {/* Vault header */}
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
                    : `${characters.length} responder${characters.length !== 1 ? 's' : ''} on file`
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
                  {['seeker','breaker','warden','rival','broker','shade'].map(orderId => {
                    const count = characters.filter(c => (c.order || '').toLowerCase() === orderId).length;
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

            {/* Empty state */}
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
                  Generate your first responder in the <strong style={{ color: '#94a3b8' }}>Generator</strong> tab, then save to vault.
                </p>
              </div>
            )}

            {/* Card grid */}
            {characters.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))',
                gap: '1rem',
              }}>
                {characters.map(char => (
                  <VaultCharacterCard
                    key={char.id}
                    character={char}
                    isSelected={selectedCharacterId === char.id}
                    onSelect={() => handleLoadCharacter(char)}
                    onDelete={() => deleteCharacter(char.id)}
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
