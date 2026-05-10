import { useState } from 'react';
import { Users, TrendingUp, Trash2, Archive } from 'lucide-react';
import { CharacterGenerator } from './CharacterGenerator';
import { AdvancementTracker } from './AdvancementTracker';
import { useCharacterStorage } from './useCharacterStorage';
import type { Die } from '../../../data/terminus/skills';
import type { CharacterCreationState } from '../../../data/terminus/advancement';

export function CharacterWorkbench() {
  const [tab, setTab] = useState<'generator' | 'tracker' | 'vault'>('generator');
  const { characters, saveCharacter, deleteCharacter, selectedCharacter, selectedCharacterId, setSelectedCharacterId } = useCharacterStorage();

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
    saveCharacter({
      name: char.name,
      order: char.order,
      skills: {
        Force: char.Force,
        Agility: char.Agility,
        Willpower: char.Willpower,
      },
    });
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

  const tabStyle = (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '6px 6px 0 0',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600 as const,
    fontSize: '0.875rem',
    background: active ? 'var(--color-surface)' : 'transparent',
    color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
    borderBottom: active ? '2px solid var(--color-accent)' : '2px solid transparent',
    transition: 'all 0.15s ease',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.25rem',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 1rem',
        background: 'var(--color-background)',
      }}>
        <button onClick={() => setTab('generator')} style={tabStyle(tab === 'generator')}>
          <Users size={18} /> Generator
        </button>
        <button onClick={() => setTab('tracker')} style={tabStyle(tab === 'tracker')}>
          <TrendingUp size={18} /> Advancement
        </button>
        <button onClick={() => setTab('vault')} style={tabStyle(tab === 'vault')}>
          <Archive size={18} /> Vault ({characters.length})
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
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
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
              Character Vault
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              {characters.length === 0
                ? 'No saved characters yet. Create one in the Generator tab.'
                : `${characters.length} character${characters.length !== 1 ? 's' : ''} saved locally.`
              }
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {characters.map(char => (
                <div
                  key={char.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    background: selectedCharacterId === char.id ? 'var(--color-surface-hover)' : 'var(--color-surface)',
                    border: `1px solid ${selectedCharacterId === char.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: '8px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{ cursor: 'pointer', flex: 1 }}
                    onClick={() => handleLoadCharacter(char)}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1rem' }}>
                      {char.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                      {char.order ? `Order: ${char.order}` : 'No order'}
                      {' · '}
                      F:{char.skills.Force} A:{char.skills.Agility} W:{char.skills.Willpower}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                      Created {new Date(char.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteCharacter(char.id)}
                    title="Delete character"
                    style={{
                      background: 'transparent',
                      border: '1px solid transparent',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.borderColor = '#ef4444';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'var(--color-text-muted)';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
