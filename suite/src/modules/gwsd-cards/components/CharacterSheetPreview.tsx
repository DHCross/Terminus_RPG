import type { Character, CharacterIdentity } from '../../silhouette-engine/src/index.ts';
import './CharacterSheetPreview.css';

type SheetIdentity = CharacterIdentity & {
  species?: string;
  order?: string;
  subtitle?: string;
  frame?: string;
  edge?: string;
  accord?: string;
  signature?: string;
  localOrigin?: string;
  rite?: string;
};

interface Props {
  character: Character;
}

// Dynamic definitions of game Order Abilities
const ORDER_ABILITIES: Record<string, Array<{ name: string; desc: string }>> = {
  seeker: [
    { name: 'Weak Point', desc: 'Scan target layout to discover a vulnerability, reducing their Avoid threshold by 1.' },
    { name: 'Trace Source', desc: 'Verify the origin of any active occult pressure or structural simulation snags.' },
    { name: 'Bring to Light', desc: 'Expose a hidden latent condition or hidden path within the active zone structure.' },
  ],
  breaker: [
    { name: 'Rupture Casting', desc: 'Channel unstable fuel to force an environmental Shift, crumbling structural barriers.' },
    { name: 'Kinetic Strike', desc: 'Exert physical force to shove, disarm, or destabilize a target’s position.' },
    { name: 'Fracture Seam', desc: 'Target a map noun or structure to trigger an immediate, high-impact localized collapse.' },
  ],
  warden: [
    { name: 'Bastion Gate', desc: 'Erect a physical or kinetic perimeter blocking enemy movement and kinetic vectors.' },
    { name: 'Aegis Sentinel', desc: 'Interpose yourself to take the impact of an attack targeting an adjacent ally.' },
    { name: 'Unyielding Stance', desc: 'Anchor your weight, rendering you immune to forced positioning or shoves.' },
  ],
  rival: [
    { name: 'Parry & Riposte', desc: 'Spend Avoid defense to deflect a kinetic attack and strike back in the same motion.' },
    { name: 'Disarming Gaze', desc: 'Leverage intense focus to halt an opponent’s planned active state trigger.' },
    { name: 'Pressure Pivot', desc: 'Convert an incoming Drift pressure increase into a direct willpower check advantage.' },
  ],
  broker: [
    { name: 'Procedural Writ', desc: 'Submit a formal permit or mandate that forces local authority NPCs to pause action.' },
    { name: 'Information Deal', desc: 'Trade a verified secret to change a target NPC’s immediate want or social loyalty.' },
    { name: 'Leverage Clause', desc: 'Exploit a prior contract to compel cooperation or extract assets in a social scene.' },
  ],
  shade: [
    { name: 'Umbral Slip', desc: 'Slip into shadows or snags in the environment, bypassing physical search actions.' },
    { name: 'Vanish from Record', desc: 'Erase your presence from logs, archives, or local sensor grids completely.' },
    { name: 'Silent Omission', desc: 'Perform a delicate kinetic or security action without making any sound or trigger.' },
  ],
};

export default function CharacterSheetPreview({ character }: Props) {
  const identity = character.identity as SheetIdentity;
  const species = identity.species || 'High Alfar';
  const order = identity.order || 'Seeker';
  const subtitle = identity.subtitle || 'Provisional Scholar Frame';

  const originRegion = identity.origin || 'Black Ward Coast';
  const signatureItem = identity.signature || 'Notched brass compass';
  const backgroundSentence = identity.background || 'A denizen shaped by the hidden machine, searching for fault lines.';
  const currentObjective = character.notes?.[0] || 'Observe local simulation snags and locate the next breach.';

  // Standardize values for mapping classes
  const lineageNormalized = species.toLowerCase().replace(/\s+/g, '');
  const orderNormalized = order.toLowerCase();

  // Determine Order Abilities based on selection
  const abilities = ORDER_ABILITIES[orderNormalized] || ORDER_ABILITIES.seeker;

  // ── DYNAMIC LINEAGE RENDERING HELPERS ──
  
  // Render corner flourishes based on Lineage
  const renderCornerFlourish = (position: 'left' | 'right') => {
    const isLeft = position === 'left';
    if (lineageNormalized.includes('stoneborn')) {
      // Stoneborn: Heavy runic blocky runes
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="2" y="2" width="20" height="20" rx="1" />
          <path d="M6,6 L18,18 M18,6 L6,18 M12,2 L12,22 M2,12 L22,12" />
        </svg>
      );
    } else if (lineageNormalized.includes('high')) {
      // High Alfar: Delicate starburst geometry
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="5" />
          <path d="M12,2 L12,22 M2,12 L22,12 M5,5 L19,19 M5,19 L19,5" strokeWidth="1" />
          <circle cx="12" cy="12" r="9" strokeDasharray="2,2" />
        </svg>
      );
    } else if (lineageNormalized.includes('deep')) {
      // Deep Alfar: Angular, jagged crystal shards
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12,2 22,12 12,22 2,12" />
          <polygon points="12,6 18,12 12,18 6,12" />
          <line x1="12" y1="2" x2="12" y2="22" />
        </svg>
      );
    } else if (lineageNormalized.includes('wild')) {
      // Wild Alfar: Leaf/vine loop flourishes
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12,22 C12,16 6,12 12,2 C12,12 18,16 12,22 Z" />
          <path d="M2,12 C8,12 12,6 12,2 C12,6 16,12 22,12" />
        </svg>
      );
    } else {
      // Human (Default): Administrative cogs/gears
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12,2 L12,4 M12,20 L12,22 M2,12 L4,12 M20,12 L22,12 M5,5 L6.5,6.5 M17.5,17.5 L19,19 M5,19 L6.5,17.5 M17.5,6.5 L19,5" />
        </svg>
      );
    }
  };

  // Render Section II Lined Box Divider based on Lineage
  const renderLinedBoxDivider = () => {
    if (lineageNormalized.includes('stoneborn')) {
      return (
        <svg viewBox="0 0 100 20" width="80" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5,10 L95,10" />
          <rect x="42" y="3" width="16" height="14" fill="#F5F0E3" stroke="currentColor" strokeWidth="1.5" />
          <line x1="50" y1="3" x2="50" y2="17" />
        </svg>
      );
    } else if (lineageNormalized.includes('high')) {
      return (
        <svg viewBox="0 0 100 20" width="90" height="16" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="50" cy="10" r="6" />
          <circle cx="50" cy="10" r="2" fill="currentColor" />
          <path d="M10,10 L38,10 M62,10 L90,10" />
          <circle cx="25" cy="10" r="1.5" />
          <circle cx="75" cy="10" r="1.5" />
        </svg>
      );
    } else if (lineageNormalized.includes('deep')) {
      return (
        <svg viewBox="0 0 100 20" width="80" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10,10 L40,10 M60,10 L90,10" />
          <polygon points="50,2 57,10 50,18 43,10" fill="none" stroke="currentColor" />
        </svg>
      );
    } else if (lineageNormalized.includes('wild')) {
      return (
        <svg viewBox="0 0 100 20" width="80" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10,10 Q30,18 50,10 T90,10" />
          <path d="M46,6 C48,2 52,2 54,6 C52,10 48,10 46,6 Z" fill="currentColor" />
        </svg>
      );
    } else {
      // Human / Default: Winged Eye
      return (
        <svg viewBox="0 0 100 20" width="80" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10,10 C30,16 40,4 50,10 C60,4 70,16 90,10" />
          <circle cx="50" cy="10" r="4.5" fill="none" />
          <circle cx="50" cy="10" r="1.5" fill="currentColor" />
          <path d="M42,8 C46,4 54,4 58,8" />
        </svg>
      );
    }
  };

  // ── DYNAMIC ORDER RENDERING HELPERS ──

  // Render Crest Center Emblem based on Accord Order
  const renderCrestEmblem = () => {
    switch (orderNormalized) {
      case 'breaker':
        // Breaker: Crashing hammer or rupture spark
        return <path d="M50,18 L32,32 L46,32 L36,54 L58,34 L46,34 Z" fill="currentColor" />;
      case 'warden':
        // Warden: Iron fortress shield
        return <path d="M50,18 L70,25 L65,55 C65,70 50,82 50,82 C50,82 35,70 35,55 L30,25 Z" fill="currentColor" />;
      case 'rival':
        // Rival: Crossed tactical blades
        return (
          <>
            <path d="M30,30 L70,70" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            <path d="M70,30 L30,70" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            <circle cx="50" cy="50" r="8" fill="currentColor" />
          </>
        );
      case 'broker':
        // Broker: Heavy scales of exchange or inkwell quill
        return (
          <>
            <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="4" />
            <line x1="25" y1="35" x2="75" y2="35" stroke="currentColor" strokeWidth="4" />
            <path d="M25,35 L15,65 C15,65 25,75 35,65 Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M75,35 L65,65 C65,65 75,75 85,65 Z" fill="none" stroke="currentColor" strokeWidth="2" />
          </>
        );
      case 'shade':
        // Shade: Shadowy split eye or dark cowl
        return (
          <>
            <path d="M25,50 C35,30 65,30 75,50 C65,70 35,70 25,50 Z" fill="none" stroke="currentColor" strokeWidth="4" />
            <circle cx="50" cy="50" r="10" fill="currentColor" />
            <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="2" strokeDasharray="3,3" />
          </>
        );
      case 'seeker':
      default:
        // Seeker: Star compass of pathways
        return (
          <>
            <path d="M50,15 L54,42 L58,40 L50,85 L42,40 L46,42 Z" fill="currentColor" />
            <circle cx="50" cy="35" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="35" r="2.5" fill="currentColor" />
            <path d="M30,35 C40,25 60,25 70,35 C60,45 40,45 30,35 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
          </>
        );
    }
  };

  // Determine official stamp text and ink tone based on Order
  const getStampMeta = () => {
    switch (orderNormalized) {
      case 'breaker':
        return { label: 'DEPT RUIN', text: 'BREAKER', code: 'Doc 808-Beta' };
      case 'warden':
        return { label: 'DEPT AEGIS', text: 'WARDEN', code: 'Doc 902-Alpha' };
      case 'rival':
        return { label: 'DEPT CLASH', text: 'RIVAL', code: 'Doc 705-Omega' };
      case 'broker':
        return { label: 'DEPT WRITS', text: 'BROKER', code: 'Doc 112-Kappa' };
      case 'shade':
        return { label: 'CLASSIFIED', text: 'SHADE', code: 'Doc 000-Void' };
      case 'seeker':
      default:
        return { label: 'DEPT PROBE', text: 'SEEKER', code: 'Doc 049-Gamma' };
    }
  };

  const stampMeta = getStampMeta();

  // Render polyhedral die SVGs dynamically based on skill rating
  const renderDieSvg = (size: number) => {
    switch (size) {
      case 4:
        return (
          <svg viewBox="0 0 100 100" className="ts-die-vector">
            <polygon points="50,15 15,80 85,80" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
            <line x1="50" y1="15" x2="50" y2="50" stroke="currentColor" strokeWidth="2" />
            <line x1="15" y1="80" x2="50" y2="50" stroke="currentColor" strokeWidth="2" />
            <line x1="85" y1="80" x2="50" y2="50" stroke="currentColor" strokeWidth="2" />
            <text x="50" y="72" fontFamily="'Cinzel', serif" fontSize="18" fontWeight="bold" textAnchor="middle" fill="currentColor">d4</text>
          </svg>
        );
      case 8:
        return (
          <svg viewBox="0 0 100 100" className="ts-die-vector">
            <polygon points="50,5 90,50 50,95 10,50" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
            <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="2" />
            <polygon points="50,5 50,95 90,50" fill="none" stroke="currentColor" strokeWidth="2" />
            <polygon points="50,5 50,95 10,50" fill="none" stroke="currentColor" strokeWidth="2" />
            <text x="50" y="58" fontFamily="'Cinzel', serif" fontSize="16" fontWeight="bold" textAnchor="middle" fill="currentColor">d8</text>
          </svg>
        );
      case 10:
        return (
          <svg viewBox="0 0 100 100" className="ts-die-vector">
            <polygon points="50,5 85,35 85,65 50,95 15,65 15,35" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
            <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="2" />
            <line x1="15" y1="35" x2="85" y2="65" stroke="currentColor" strokeWidth="1.5" />
            <line x1="15" y1="65" x2="85" y2="35" stroke="currentColor" strokeWidth="1.5" />
            <text x="50" y="56" fontFamily="'Cinzel', serif" fontSize="16" fontWeight="bold" textAnchor="middle" fill="currentColor">d10</text>
          </svg>
        );
      case 12:
        return (
          <svg viewBox="0 0 100 100" className="ts-die-vector">
            <polygon points="50,5 80,20 95,50 80,80 50,95 20,80 5,50 20,20" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
            <polygon points="50,20 75,35 65,65 35,65 25,35" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="50" y1="5" x2="50" y2="20" stroke="currentColor" strokeWidth="2" />
            <line x1="80" y1="20" x2="75" y2="35" stroke="currentColor" strokeWidth="2" />
            <line x1="95" y1="50" x2="65" y2="65" stroke="currentColor" strokeWidth="2" />
            <line x1="50" y1="95" x2="50" y2="65" stroke="currentColor" strokeWidth="2" />
            <line x1="20" y1="80" x2="35" y2="65" stroke="currentColor" strokeWidth="2" />
            <line x1="5" y1="50" x2="25" y2="35" stroke="currentColor" strokeWidth="2" />
            <text x="50" y="52" fontFamily="'Cinzel', serif" fontSize="15" fontWeight="bold" textAnchor="middle" fill="currentColor">d12</text>
          </svg>
        );
      case 6:
      default:
        return (
          <svg viewBox="0 0 100 100" className="ts-die-vector">
            <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
            <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="2" />
            <line x1="10" y1="30" x2="50" y2="50" stroke="currentColor" strokeWidth="2" />
            <line x1="90" y1="30" x2="50" y2="50" stroke="currentColor" strokeWidth="2" />
            <line x1="10" y1="70" x2="50" y2="90" stroke="currentColor" strokeWidth="1.5" />
            <line x1="90" y1="70" x2="50" y2="90" stroke="currentColor" strokeWidth="1.5" />
            <text x="50" y="42" fontFamily="'Cinzel', serif" fontSize="16" fontWeight="bold" textAnchor="middle" fill="currentColor">d6</text>
          </svg>
        );
    }
  };

  const renderThresholdCircles = (current: number, max: number) => {
    return (
      <div className="ts-threshold-row-circles">
        {Array.from({ length: 5 }).map((_, i) => {
          let bubbleClass = 'ts-bubble';
          if (i < current) bubbleClass += ' filled';
          else if (i < max) bubbleClass += ' unlocked';
          return <div key={i} className={bubbleClass} />;
        })}
      </div>
    );
  };

  return (
    <div className={`terminus-sheet-container skin-lineage-${lineageNormalized} skin-order-${orderNormalized}`}>
      <div className="terminus-sheet">
        <div className="ts-inner-border">
          {/* HEADER TEXT & STAMP ROW */}
          <div className="ts-top-row">
            <div className="ts-brand">
              <div className="ts-brand-main">TERMINUS RPG</div>
              <div className="ts-brand-motto">GLORY IN SERVICE. ORDER IN ALL THINGS.</div>
            </div>
            
            {/* SVG Center Crest - customized dynamically by Accord Order */}
            <div className="ts-crest-center">
              <svg viewBox="0 0 100 100" width="56" height="56">
                <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,2" />
                {renderCrestEmblem()}
                <path d="M30,55 C20,65 25,82 50,82 C75,82 80,65 70,55" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>

            <div className="ts-meta-stamp-area">
              <div className="ts-doc-number">{stampMeta.code}-9</div>
              <div className="ts-official-stamp-box">
                <span className="ts-stamp-label">Official Stamp</span>
                {/* Visual ink seal - color matched to dynamic skin */}
                <div className="ts-red-ink-seal">
                  <svg viewBox="0 0 100 100" width="50" height="50">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,2" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1" />
                    <text x="50" y="44" fontFamily="'Cinzel', serif" fontSize="9" fontWeight="bold" textAnchor="middle" fill="currentColor">{stampMeta.label}</text>
                    <text x="50" y="56" fontFamily="'Cinzel', serif" fontSize="9" fontWeight="bold" textAnchor="middle" fill="currentColor">{stampMeta.text}</text>
                    <path d="M25,64 L75,64" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN FIELD TITLE */}
          <div className="ts-header-plate">
            <div className="ts-plate-sub">CIVIC FIELD DOCUMENT –</div>
            <div className="ts-plate-main">BUREAU OF STRATEGIC AFFAIRS</div>
          </div>

          {/* SECTION I: IDENTITY */}
          <div className="ts-section-header">
            <span className="ts-section-num">I</span>
            <span className="ts-section-title-text">Identity</span>
          </div>
          <div className="ts-identity-fields">
            <div className="ts-field-inline" style={{ width: '40%' }}>
              <span className="ts-inline-label">Name</span>
              <span className="ts-inline-value handwriting">{character.name.toUpperCase()}</span>
            </div>
            <div className="ts-field-inline" style={{ width: '30%' }}>
              <span className="ts-inline-label">Species / Lineage</span>
              <span className="ts-inline-value handwriting">{species}</span>
            </div>
            <div className="ts-field-inline" style={{ width: '30%' }}>
              <span className="ts-inline-label">Accord Order</span>
              <span className="ts-inline-value handwriting">{order}</span>
            </div>
          </div>

          {/* SECTION II: APPROACH & SIGNATURE */}
          <div className="ts-section-header">
            <span className="ts-section-num">II</span>
            <span className="ts-section-title-text">Approach & Signature</span>
          </div>
          <p className="ts-section-instruction">Describe your character's demeanor and defining action.</p>
          <div className="ts-lined-box">
            <div className="handwriting-block">
              {identity.immediateWant ? `My approach is defined by my frame: ${subtitle}. I act with deliberate focus: "${identity.immediateWant}"` : backgroundSentence}
            </div>
            {/* Winged eye decoration at bottom center - lineage matched */}
            <div className="ts-lined-box-divider">
              {renderLinedBoxDivider()}
            </div>
          </div>

          {/* SECTION III: SKILLS & THRESHOLDS */}
          <div className="ts-section-header">
            <span className="ts-section-num">III</span>
            <span className="ts-section-title-text">Skills & Thresholds</span>
          </div>
          <div className="ts-skills-grid">
            {/* Force / Endure */}
            <div className="ts-skill-column">
              <div className="ts-skill-header-row">
                <div className="ts-skill-label-block">
                  <div className="ts-skill-label-name">FORCE (d{character.actions.force})</div>
                </div>
                <div className="ts-die-box-wrapper">
                  {renderDieSvg(character.actions.force)}
                </div>
                <div className="ts-rating-square">
                  <div className="ts-square-label">RATING</div>
                  <div className="ts-square-val">d{character.actions.force}</div>
                </div>
              </div>
              <div className="ts-threshold-track">
                <span className="ts-track-label">ENDURE</span>
                {renderThresholdCircles(character.tracks.endure.current, character.tracks.endure.max)}
              </div>
            </div>

            {/* Agility / Avoid */}
            <div className="ts-skill-column">
              <div className="ts-skill-header-row">
                <div className="ts-skill-label-block">
                  <div className="ts-skill-label-name">AGILITY (d{character.actions.agility})</div>
                </div>
                <div className="ts-die-box-wrapper">
                  {renderDieSvg(character.actions.agility)}
                </div>
                <div className="ts-rating-square">
                  <div className="ts-square-label">RATING</div>
                  <div className="ts-square-val">d{character.actions.agility}</div>
                </div>
              </div>
              <div className="ts-threshold-track">
                <span className="ts-track-label">AVOID</span>
                {renderThresholdCircles(character.tracks.avoid.current, character.tracks.avoid.max)}
              </div>
            </div>

            {/* Willpower / Exert */}
            <div className="ts-skill-column">
              <div className="ts-skill-header-row">
                <div className="ts-skill-label-block">
                  <div className="ts-skill-label-name">WILLPOWER (d{character.actions.willpower})</div>
                </div>
                <div className="ts-die-box-wrapper">
                  {renderDieSvg(character.actions.willpower)}
                </div>
                <div className="ts-rating-square">
                  <div className="ts-square-label">RATING</div>
                  <div className="ts-square-val">d{character.actions.willpower}</div>
                </div>
              </div>
              <div className="ts-threshold-track">
                <span className="ts-track-label">EXERT</span>
                {renderThresholdCircles(character.tracks.exert.current, character.tracks.exert.max)}
              </div>
            </div>
          </div>

          {/* SECTION IV: ORDER ABILITIES */}
          <div className="ts-section-header">
            <span className="ts-section-num">IV</span>
            <span className="ts-section-title-text">Order Abilities</span>
          </div>
          <div className="ts-abilities-grid">
            {abilities.map((ability, idx) => (
              <div key={idx} className="ts-ability-card">
                <div className="ts-ability-badge">{idx + 1}</div>
                <h4 className="ts-ability-name">{ability.name}</h4>
                <p className="ts-ability-desc">{ability.desc}</p>
              </div>
            ))}
          </div>

          {/* SECTION V: BACKGROUND & GEAR */}
          <div className="ts-section-header">
            <span className="ts-section-num">V</span>
            <span className="ts-section-title-text">Background & Gear</span>
          </div>
          <div className="ts-gear-fields">
            <div className="ts-field-row-full">
              <span className="ts-row-label">Primary Weapon</span>
              <span className="ts-row-value handwriting">
                {character.weapons.primary.name} ({character.weapons.primary.impact} Impact, {character.weapons.primary.vectors.join(', ') || 'No vectors'})
              </span>
            </div>
            <div className="ts-field-row-full">
              <span className="ts-row-label">Secondary Item</span>
              <span className="ts-row-value handwriting">
                {character.weapons.secondary.name} ({character.weapons.secondary.impact} Impact)
              </span>
            </div>
            <div className="ts-field-row-full">
              <span className="ts-row-label">Background Sentence: "Write one defining sentence about your past."</span>
              <span className="ts-row-value handwriting">{backgroundSentence}</span>
            </div>
            <div className="ts-field-row-full">
              <span className="ts-row-label">Current Objective:</span>
              <span className="ts-row-value handwriting">{currentObjective}</span>
            </div>
          </div>

          {/* FOOTER */}
          <div className="ts-footer-row">
            {/* SVG gears/runes in corners */}
            <div className="ts-gear-deco left">
              {renderCornerFlourish('left')}
            </div>
            
            <div className="ts-footer-text">✦ THE BUREAU SEES ALL. THE BUREAU REMEMBERS. ✦</div>

            <div className="ts-gear-deco right">
              {renderCornerFlourish('right')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
