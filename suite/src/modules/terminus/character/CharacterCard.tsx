import { useState, useEffect } from 'react';
import { SKILLS, DIE_LADDER, CIRCLE_MAPPING, type Die } from '../../../data/terminus/skills';
import { SKILL_TO_THRESHOLD_MAP } from '../../../data/terminus/thresholds';
import { ORDERS_LIST } from '../../../data/terminus/orders';
import { WEAPONS, SIGNATURE_ITEMS } from '../../../data/terminus/weapons';
import { ARMOR_TYPES } from '../../../data/terminus/armor';
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
  const [approach, setApproach] = useState('');
  const [signature, setSignature] = useState('');
  const [frame, setFrame] = useState('');
  const [edge, setEdge] = useState('');
  const [orderAbilities, setOrderAbilities] = useState('');
  const [region, setRegion] = useState('');
  const [localOrigin, setLocalOrigin] = useState('');
  const [oldOffice, setOldOffice] = useState('');
  const [localRite, setLocalRite] = useState('');
  const [accordRelationship, setAccordRelationship] = useState('');
  const [primaryWeapon, setPrimaryWeapon] = useState('unarmed');
  const [secondaryWeapon, setSecondaryWeapon] = useState('');
  const [armor, setArmor] = useState('none');
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
      setName(selectedCharacter.name || 'New Character');
      setSpecies(selectedCharacter.species || '');
      setOrder(selectedCharacter.order || '');
      setApproach(selectedCharacter.approach || '');
      setSignature(selectedCharacter.signature || '');
      setFrame(selectedCharacter.frame || '');
      setEdge(selectedCharacter.edge || '');
      setOrderAbilities(selectedCharacter.orderAbilities || '');
      setRegion(selectedCharacter.region || '');
      setLocalOrigin(selectedCharacter.localOrigin || '');
      setOldOffice(selectedCharacter.oldOffice || '');
      setLocalRite(selectedCharacter.localRite || '');
      setAccordRelationship(selectedCharacter.accordRelationship || '');
      setPrimaryWeapon(selectedCharacter.primaryWeapon || 'unarmed');
      setSecondaryWeapon(selectedCharacter.secondaryWeapon || '');
      setArmor(selectedCharacter.armor || 'none');
      setSkills((selectedCharacter.skills as Record<string, Die>) || {
        [SKILLS.FORCE]: 'd4',
        [SKILLS.AGILITY]: 'd4',
        [SKILLS.WILLPOWER]: 'd4'
      });
      setIsDirty(false);
    } else {
      setName('New Character');
      setSpecies('');
      setOrder('');
      setApproach('');
      setSignature('');
      setFrame('');
      setEdge('');
      setOrderAbilities('');
      setRegion('');
      setLocalOrigin('');
      setOldOffice('');
      setLocalRite('');
      setAccordRelationship('');
      setPrimaryWeapon('unarmed');
      setSecondaryWeapon('');
      setArmor('none');
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

  // Get approaches for selected order
  const selectedOrderData = ORDERS_LIST.find(o => o.id === order);
  const availableApproaches = selectedOrderData?.approaches || [];
  const availableSignatures = selectedOrderData?.signatures || [];

  const handleSave = () => {
    const characterPayload = {
      name,
      species,
      order,
      approach,
      signature,
      frame,
      edge,
      orderAbilities,
      region,
      localOrigin,
      oldOffice,
      localRite,
      accordRelationship,
      primaryWeapon,
      secondaryWeapon,
      armor,
      skills,
    };

    if (selectedCharacter) {
      updateCharacter(selectedCharacter.id, characterPayload);
      addToast('success', `Character "${name}" updated successfully`);
    } else {
      saveCharacter(characterPayload);
      addToast('success', `Character "${name}" created successfully`);
    }
    setIsDirty(false);
  };

  const handleNew = () => {
    setSelectedCharacterId(null);
    setName('New Character');
    setSpecies('');
    setOrder('');
    setApproach('');
    setSignature('');
    setFrame('');
    setEdge('');
    setOrderAbilities('');
    setRegion('');
    setLocalOrigin('');
    setOldOffice('');
    setLocalRite('');
    setAccordRelationship('');
    setPrimaryWeapon('unarmed');
    setSecondaryWeapon('');
    setArmor('none');
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
          <label>Region:</label>
          <input
            type="text"
            value={region}
            onChange={(e) => { setRegion(e.target.value); setIsDirty(true); }}
            placeholder="e.g., Black Ward Coast"
          />
        </div>
        <div className="detail-row">
          <label>Local Origin:</label>
          <input
            type="text"
            value={localOrigin}
            onChange={(e) => { setLocalOrigin(e.target.value); setIsDirty(true); }}
            placeholder="e.g., Saint Orra's Gate"
          />
        </div>
        <div className="detail-row">
          <label>Old Office:</label>
          <input
            type="text"
            value={oldOffice}
            onChange={(e) => { setOldOffice(e.target.value); setIsDirty(true); }}
            placeholder="e.g., Saint Latimer"
          />
        </div>
        <div className="detail-row">
          <label>Local Rite:</label>
          <input
            type="text"
            value={localRite}
            onChange={(e) => { setLocalRite(e.target.value); setIsDirty(true); }}
            placeholder="e.g., Keeps ink on her fingers..."
          />
        </div>
        <div className="detail-row">
          <label>Accord Relationship:</label>
          <input
            type="text"
            value={accordRelationship}
            onChange={(e) => { setAccordRelationship(e.target.value); setIsDirty(true); }}
            placeholder="e.g., Provisional Responder"
          />
        </div>
        <div className="detail-row">
          <label>Frame:</label>
          <input
            type="text"
            value={frame}
            onChange={(e) => { setFrame(e.target.value); setIsDirty(true); }}
            placeholder="e.g., Seeker Frame"
          />
        </div>
        <div className="detail-row">
          <label>Edge:</label>
          <textarea
            value={edge}
            onChange={(e) => { setEdge(e.target.value); setIsDirty(true); }}
            placeholder="Describe your Edge..."
            style={{ flex: 1, backgroundColor: '#0f172a', color: '#f8fafc', border: '1px solid #334155', padding: '0.5rem', borderRadius: '0.25rem', minHeight: '60px' }}
          />
        </div>
        <div className="detail-row">
          <label>Order Abilities:</label>
          <textarea
            value={orderAbilities}
            onChange={(e) => { setOrderAbilities(e.target.value); setIsDirty(true); }}
            placeholder="e.g., Weak Point, Trace Source"
            style={{ flex: 1, backgroundColor: '#0f172a', color: '#f8fafc', border: '1px solid #334155', padding: '0.5rem', borderRadius: '0.25rem', minHeight: '60px' }}
          />
        </div>
        <div className="detail-row">
          <label>Order:</label>
          <select
            value={order}
            onChange={(e) => {
              setOrder(e.target.value);
              setApproach('');
              setSignature('');
              setIsDirty(true);
            }}
            style={{
              flex: 1,
              backgroundColor: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #334155',
              padding: '0.5rem',
              borderRadius: '0.25rem',
              outline: 'none',
            }}
          >
            <option value="">Select Order</option>
            {ORDERS_LIST.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
        {order && (
          <>
            <div className="detail-row">
              <label>Approach:</label>
              <select
                value={approach}
                onChange={(e) => { setApproach(e.target.value); setIsDirty(true); }}
                disabled={!order}
                style={{
                  flex: 1,
                  backgroundColor: '#0f172a',
                  color: '#f8fafc',
                  border: '1px solid #334155',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  outline: 'none',
                }}
              >
                <option value="">Select Approach</option>
                {availableApproaches.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="detail-row">
              <label>Signature:</label>
              <select
                value={signature}
                onChange={(e) => { setSignature(e.target.value); setIsDirty(true); }}
                disabled={!order}
                style={{
                  flex: 1,
                  backgroundColor: '#0f172a',
                  color: '#f8fafc',
                  border: '1px solid #334155',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  outline: 'none',
                }}
              >
                <option value="">Select Signature</option>
                {availableSignatures.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="custom">Custom...</option>
              </select>
            </div>
            {signature === 'custom' && (
              <div className="detail-row">
                <label>Custom Signature:</label>
                <input
                  type="text"
                  value={signature === 'custom' ? '' : signature}
                  onChange={(e) => { setSignature(e.target.value); setIsDirty(true); }}
                  placeholder="Enter custom signature item"
                  style={{
                    flex: 1,
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
                    outline: 'none',
                  }}
                />
              </div>
            )}
          </>
        )}
      </section>

      {/* Equipment section */}
      <section className="card-details" style={{ borderTop: '1px solid #334155', paddingTop: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#3b82f6' }}>Equipment</h3>
        <div className="detail-row">
          <label>Primary Weapon:</label>
          <select
            value={primaryWeapon}
            onChange={(e) => { setPrimaryWeapon(e.target.value); setIsDirty(true); }}
            style={{
              flex: 1,
              backgroundColor: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #334155',
              padding: '0.5rem',
              borderRadius: '0.25rem',
              outline: 'none',
            }}
          >
            {WEAPONS.map((w) => (
              <option key={w.id} value={w.id}>{w.name} (Impact: {w.impact})</option>
            ))}
          </select>
        </div>
        <div className="detail-row">
          <label>Secondary Weapon:</label>
          <select
            value={secondaryWeapon}
            onChange={(e) => { setSecondaryWeapon(e.target.value); setIsDirty(true); }}
            style={{
              flex: 1,
              backgroundColor: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #334155',
              padding: '0.5rem',
              borderRadius: '0.25rem',
              outline: 'none',
            }}
          >
            <option value="">None</option>
            {WEAPONS.map((w) => (
              <option key={w.id} value={w.id}>{w.name} (Impact: {w.impact})</option>
            ))}
          </select>
        </div>
        <div className="detail-row">
          <label>Armor:</label>
          <select
            value={armor}
            onChange={(e) => { setArmor(e.target.value); setIsDirty(true); }}
            style={{
              flex: 1,
              backgroundColor: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #334155',
              padding: '0.5rem',
              borderRadius: '0.25rem',
              outline: 'none',
            }}
          >
            {ARMOR_TYPES.map((a) => (
              <option key={a.id} value={a.id}>{a.name} (Reduction: {a.reduction})</option>
            ))}
          </select>
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
