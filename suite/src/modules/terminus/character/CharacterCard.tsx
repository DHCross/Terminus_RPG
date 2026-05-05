import { useState, useEffect } from 'react';
import { SKILLS, DIE_LADDER, CIRCLE_MAPPING, type Die } from '../../../data/terminus/skills';
import { SKILL_TO_THRESHOLD_MAP } from '../../../data/terminus/thresholds';
import { useCharacterStorage, type CharacterData } from './useCharacterStorage';
import { useToast } from '../../../components/Toast';

export function CharacterCard() {
  const {
    characters,
    selectedCharacter,
    saveCharacter,
    updateCharacter,
    deleteCharacter,
    setSelectedCharacterId,
  } = useCharacterStorage();
  const { addToast } = useToast();

  const [name, setName] = useState('New Character');
  const [species, setSpecies] = useState('');
  const [order, setOrder] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Base skill levels default to d4
  const [skills, setSkills] = useState<Record<string, Die>>({
    [SKILLS.FORCE]: 'd4',
    [SKILLS.AGILITY]: 'd4',
    [SKILLS.WILLPOWER]: 'd4'
  });

  // Load selected character
  useEffect(() => {
    if (selectedCharacter) {
      setName(selectedCharacter.name);
      setSpecies(selectedCharacter.species || '');
      setOrder(selectedCharacter.order || '');
      setSkills(selectedCharacter.skills);
      setIsDirty(false);
    } else {
      setName('New Character');
      setSpecies('');
      setOrder('');
      setSkills({
        [SKILLS.FORCE]: 'd4',
        [SKILLS.AGILITY]: 'd4',
        [SKILLS.WILLPOWER]: 'd4'
      });
      setIsDirty(false);
    }
  }, [selectedCharacter]);

  const handleSkillChange = (skill: string, die: Die) => {
    setSkills(prev => ({ ...prev, [skill]: die }));
    setIsDirty(true);
  };

  const handleSave = () => {
    if (selectedCharacter) {
      updateCharacter(selectedCharacter.id, { name, species, order, skills });
      addToast('success', `Character "${name}" updated successfully`);
    } else {
      saveCharacter({ name, species, order, skills });
      addToast('success', `Character "${name}" created successfully`);
    }
    setIsDirty(false);
  };

  const handleNew = () => {
    setSelectedCharacterId(null);
    setName('New Character');
    setSpecies('');
    setOrder('');
    setSkills({
      [SKILLS.FORCE]: 'd4',
      [SKILLS.AGILITY]: 'd4',
      [SKILLS.WILLPOWER]: 'd4'
    });
    setIsDirty(false);
  };

  const handleDelete = () => {
    if (selectedCharacter && confirm('Delete this character?')) {
      deleteCharacter(selectedCharacter.id);
      addToast('info', `Character "${selectedCharacter.name}" deleted`);
    }
  };

  return (
    <div className="character-card">
      <header className="card-header">
        <input
          className="name-input"
          value={name}
          onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
          placeholder="Character Name"
        />
        <div className="status-badges">
          {isDirty && <span className="badge dirty-badge">Unsaved</span>}
          <span className="badge health-badge">Healthy</span>
        </div>
      </header>

      {/* Character selector and actions */}
      <section className="card-actions">
        <div className="character-selector">
          <label>Saved Characters:</label>
          <select
            value={selectedCharacter?.id || ''}
            onChange={(e) => setSelectedCharacterId(e.target.value || null)}
          >
            <option value="">-- New Character --</option>
            {characters.map((char) => (
              <option key={char.id} value={char.id}>
                {char.name}
              </option>
            ))}
          </select>
        </div>
        <div className="action-buttons">
          <button onClick={handleNew} className="btn btn-secondary">
            New
          </button>
          {selectedCharacter && (
            <button onClick={handleDelete} className="btn btn-danger">
              Delete
            </button>
          )}
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={!isDirty}
          >
            {isDirty ? 'Save' : 'Saved'}
          </button>
        </div>
      </section>

      {/* Additional fields */}
      <section className="card-details">
        <div className="detail-row">
          <label>Species:</label>
          <input
            type="text"
            value={species}
            onChange={(e) => { setSpecies(e.target.value); setIsDirty(true); }}
            placeholder="e.g., Human, High Alfar"
          />
        </div>
        <div className="detail-row">
          <label>Order:</label>
          <input
            type="text"
            value={order}
            onChange={(e) => { setOrder(e.target.value); setIsDirty(true); }}
            placeholder="e.g., Seeker, Breaker, Warden"
          />
        </div>
      </section>

      <section className="card-body">
        <h3 className="section-title">Skills & Thresholds</h3>
        <p className="section-subtitle">Paired Skills (Active) and Thresholds (Passive).</p>

        <div className="skills-grid">
          {Object.values(SKILLS).map((skill) => {
            const currentDie = skills[skill];
            const thresholdName = SKILL_TO_THRESHOLD_MAP[skill];
            const circleValue = CIRCLE_MAPPING[currentDie];

            return (
              <div key={skill} className="skill-row">
                <div className="skill-info">
                  <span className="skill-name">{skill}</span>
                  <select
                    className="die-select"
                    value={currentDie}
                    onChange={(e) => handleSkillChange(skill, e.target.value as Die)}
                  >
                    {DIE_LADDER.map(die => (
                      <option key={die} value={die}>{die}</option>
                    ))}
                  </select>
                </div>

                <div className="threshold-info">
                  <span className="threshold-name">{thresholdName}</span>
                  <div className="threshold-circles">
                    {[1, 2, 3, 4, 5].map(circle => (
                      <div
                        key={circle}
                        className={`circle ${circle <= circleValue ? 'filled' : 'empty'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card-footer">
        <p className="footer-note">No passive target numbers. No to-hit rolls.</p>
      </section>
    </div>
  );
}
