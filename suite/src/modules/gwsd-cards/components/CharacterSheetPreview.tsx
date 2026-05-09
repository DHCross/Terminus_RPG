import type { Character } from '../../silhouette-engine/src/index.ts';
import './CharacterSheetPreview.css';
import { ARMOR_REDUCTION } from '../../silhouette-engine/src/index.ts';

interface Props {
  character: Character;
}

export default function CharacterSheetPreview({ character }: Props) {
  // Extract custom fields from identity or use placeholders
  const identity = character.identity as any;
  const species = identity.species || 'High Alfar';
  const order = identity.order || 'Seeker';
  const subtitle = identity.subtitle || 'Wayfarer Scholar';
  
  const frame = identity.frame || `${order} Frame`;
  const edge = identity.edge || 'Hidden patterns and unstable truths reveal themselves under scrutiny.';
  const approach = identity.immediateWant || 'I read the hidden pattern, then turn the breach into a new truth.';
  
  const region = identity.origin || 'Black Ward Coast';
  const localOrigin = identity.localOrigin || 'Saint Orra’s Gate';
  const oldOffice = identity.deity || 'Saint Latimer';
  const localRite = identity.rite || 'Keeps ink on her fingers until a writ is accepted';
  const accordRel = identity.accord || 'Provisional Responder';
  const signature = identity.signature || 'Latimer Field Ledger';

  const renderThresholdCircles = (current: number, max: number) => {
    const circles = [];
    for (let i = 0; i < max; i++) {
      circles.push(
        <div key={i} className={`ts-circle ${i < current ? 'ts-circle-filled' : 'ts-circle-empty'}`}></div>
      );
    }
    return <div className="ts-threshold-circles">{circles}</div>;
  };

  return (
    <div className="terminus-sheet">
      <div className="ts-inner-border">
        {/* HEADER */}
        <div className="ts-header">
          <div className="ts-title-block">
            <h1 className="ts-name">{character.name.toUpperCase()}</h1>
            <div className="ts-subtitle">
              {species} &bull; {order} &bull; {subtitle}
            </div>
          </div>
          <div className="ts-seal-placeholder">
            {/* Stamp / Compass Rose placeholder */}
            <div className="ts-seal-circle">TR</div>
          </div>
        </div>

        <div className="ts-body-grid">
          {/* LEFT: Portrait Placeholder & Origin */}
          <div className="ts-col-left">
            <div className="ts-portrait-area">
              <div className="ts-portrait-placeholder">
                <span style={{opacity: 0.5}}>[ Portrait Region ]</span>
              </div>
            </div>
            
            <div className="ts-origin-block">
              <div className="ts-field-row">
                <span className="ts-icon-placeholder">🌍</span>
                <div>
                  <span className="ts-field-label">Region:</span> <span className="ts-field-val">{region}</span>
                </div>
              </div>
              <div className="ts-field-row">
                <span className="ts-icon-placeholder">🏛️</span>
                <div>
                  <span className="ts-field-label">Local Origin:</span> <span className="ts-field-val">{localOrigin}</span>
                </div>
              </div>
              <div className="ts-field-row">
                <span className="ts-icon-placeholder">⚖️</span>
                <div>
                  <span className="ts-field-label">Old Office:</span> <span className="ts-field-val">{oldOffice}</span>
                </div>
              </div>
              <div className="ts-field-row">
                <span className="ts-icon-placeholder">🩸</span>
                <div>
                  <span className="ts-field-label">Local Rite:</span> <span className="ts-field-val">{localRite}</span>
                </div>
              </div>
              <div className="ts-field-row">
                <span className="ts-icon-placeholder">🤝</span>
                <div>
                  <span className="ts-field-label">Accord Relationship:</span> <span className="ts-field-val">{accordRel}</span>
                </div>
              </div>
              <div className="ts-field-row">
                <span className="ts-icon-placeholder">🪶</span>
                <div>
                  <span className="ts-field-label">Signature:</span> <span className="ts-field-val">{signature}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Rules & Mechanics */}
          <div className="ts-col-right">
            
            {/* FRAME & APPROACH */}
            <div className="ts-rules-block">
              <div className="ts-section-title">FRAME</div>
              <div className="ts-text-body">{frame}</div>
              
              <div className="ts-divider"></div>
              
              <div className="ts-section-title">EDGE</div>
              <div className="ts-text-body">{edge}</div>
              
              <div className="ts-divider"></div>
              
              <div className="ts-section-title">APPROACH</div>
              <div className="ts-text-body" style={{ fontStyle: 'italic' }}>"{approach}"</div>
              
              <div className="ts-divider"></div>
              
              <div className="ts-section-title">ORDER ABILITIES</div>
              <ul className="ts-abilities-list">
                <li><span className="ts-icon-placeholder">🎯</span> Weak Point</li>
                <li><span className="ts-icon-placeholder">🔍</span> Trace Source</li>
                <li><span className="ts-icon-placeholder">💡</span> Bring to Light</li>
              </ul>
            </div>

            {/* MECHANICS GRID */}
            <div className="ts-mechanics-grid">
              
              {/* SKILLS */}
              <div className="ts-mechanics-box">
                <div className="ts-section-title ts-center">SKILLS</div>
                <div className="ts-stat-row">
                  <span className="ts-stat-name">Force</span>
                  <span className="ts-die-hex">d{character.actions.force}</span>
                </div>
                <div className="ts-divider-subtle"></div>
                <div className="ts-stat-row">
                  <span className="ts-stat-name">Agility</span>
                  <span className="ts-die-hex">d{character.actions.agility}</span>
                </div>
                <div className="ts-divider-subtle"></div>
                <div className="ts-stat-row">
                  <span className="ts-stat-name">Willpower</span>
                  <span className="ts-die-hex">d{character.actions.willpower}</span>
                </div>
              </div>

              {/* THRESHOLDS */}
              <div className="ts-mechanics-box">
                <div className="ts-section-title ts-center">THRESHOLDS</div>
                <div className="ts-threshold-row">
                  <span className="ts-stat-name">Endure</span>
                  {renderThresholdCircles(character.tracks.endure.current, character.tracks.endure.max)}
                </div>
                <div className="ts-threshold-row">
                  <span className="ts-stat-name">Avoid</span>
                  {renderThresholdCircles(character.tracks.avoid.current, character.tracks.avoid.max)}
                </div>
                <div className="ts-threshold-row">
                  <span className="ts-stat-name">Exert</span>
                  {renderThresholdCircles(character.tracks.exert.current, character.tracks.exert.max)}
                </div>
              </div>

            </div>

            {/* GEAR / BOOK PLACEHOLDER */}
            <div className="ts-gear-placeholder">
              <span>{character.weapons.primary.name} ({character.weapons.primary.impact} impact)</span><br/>
              <span style={{opacity: 0.7, fontSize: '0.8em'}}>Armor: {character.armor} (-{ARMOR_REDUCTION[character.armor]})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
