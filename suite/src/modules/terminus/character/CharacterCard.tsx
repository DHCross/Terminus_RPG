import { useState } from 'react';
import { SKILLS, DIE_LADDER, CIRCLE_MAPPING, type Die } from '../../../data/terminus/skills';
import { SKILL_TO_THRESHOLD_MAP } from '../../../data/terminus/thresholds';

export function CharacterCard() {
  const [name, setName] = useState('New Character');
  
  // Base skill levels default to d4
  const [skills, setSkills] = useState<Record<string, Die>>({
    [SKILLS.FORCE]: 'd4',
    [SKILLS.AGILITY]: 'd4',
    [SKILLS.WILLPOWER]: 'd4'
  });

  const handleSkillChange = (skill: string, die: Die) => {
    setSkills(prev => ({ ...prev, [skill]: die }));
  };

  return (
    <div className="character-card">
      <header className="card-header">
        <input 
          className="name-input" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Character Name" 
        />
        <div className="status-badges">
          <span className="badge health-badge">Healthy</span>
        </div>
      </header>

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
