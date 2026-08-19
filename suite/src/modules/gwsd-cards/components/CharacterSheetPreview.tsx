import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { DIE_SIZES, type Character, type CharacterIdentity, type DieSize } from '../../coherence-engine/src/index.ts';
import { TERMINUS_SHEET_CHROME, type SheetChrome } from '../../../settings/sheetChrome';
import { sheetAbilitiesForOrder } from '../../../data/terminus/orders';
import { cycleBodyArmor, sheetArmorLine } from '../../../data/terminus/armor';
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

export interface CharacterSheetPatch {
  name?: string;
  species?: string;
  order?: string;
  subtitle?: string;
  approach?: string;
  background?: string;
  objective?: string;
  primaryWeapon?: string;
  secondaryItem?: string;
  armor?: string;
  force?: DieSize;
  agility?: DieSize;
  willpower?: DieSize;
  endure?: number;
  avoid?: number;
  exert?: number;
  abilities?: Array<{ name: string; desc: string }>;
}

interface Props {
  character: Character;
  /** When false, the sheet stays a static print preview. Defaults to true. */
  editable?: boolean;
  onChange?: (patch: CharacterSheetPatch) => void;
  /** Pack-specific document labels. Defaults to Terminus civic chrome. */
  chrome?: SheetChrome;
  /** When provided, these fill Section IV instead of Terminus Order lookup. */
  abilities?: Array<{ name: string; desc: string }>;
  /** Pack armor id (padded, leather, chain…). Falls back to the engine slot on the character. */
  armorId?: string;
}

interface SheetFields {
  name: string;
  species: string;
  order: string;
  subtitle: string;
  approach: string;
  background: string;
  objective: string;
  primaryWeapon: string;
  secondaryItem: string;
  armor: string;
  force: DieSize;
  agility: DieSize;
  willpower: DieSize;
  endure: number;
  avoid: number;
  exert: number;
}

function formatWeaponLine(name: string, impact: number, vectors?: string[]): string {
  if (vectors) {
    return `${name} (${impact} Impact, ${vectors.join(', ') || 'No vectors'})`;
  }
  return `${name} (${impact} Impact)`;
}

function displayWeaponLine(name: string, impact: number, vectors?: string[]): string {
  if (/\bImpact\b/i.test(name)) return name;
  return formatWeaponLine(name, impact, vectors);
}

function extractSheetFields(character: Character, chrome: SheetChrome, armorId?: string): SheetFields {
  const identity = character.identity as SheetIdentity;
  const species = identity.species || chrome.defaultSpecies;
  const order = identity.order || chrome.defaultOrder;
  const subtitle = identity.subtitle || identity.frame || 'Provisional Scholar Frame';
  const background = identity.background || 'A responder shaped by the quiet wards, searching for boundary fault lines.';
  const approach = identity.immediateWant
    || `My approach is defined by my frame: ${subtitle}. I act with deliberate focus: "Observe local boundary fractures and locate the next breach."`;

  return {
    name: character.name || 'Unnamed Responder',
    species,
    order,
    subtitle,
    approach,
    background,
    objective: character.notes?.[0] || 'Observe local boundary fractures and locate the next breach.',
    primaryWeapon: displayWeaponLine(
      character.weapons.primary.name,
      character.weapons.primary.impact,
      character.weapons.primary.vectors,
    ),
    secondaryItem: displayWeaponLine(character.weapons.secondary.name, character.weapons.secondary.impact),
    armor: armorId || character.armor || 'none',
    force: character.actions.force,
    agility: character.actions.agility,
    willpower: character.actions.willpower,
    endure: character.tracks.endure.current,
    avoid: character.tracks.avoid.current,
    exert: character.tracks.exert.current,
  };
}

function maxFromDie(die: DieSize): number {
  return Math.min(5, Math.max(1, (die - 2) / 2)) as number;
}

function cycleDie(current: DieSize): DieSize {
  const index = DIE_SIZES.indexOf(current);
  return DIE_SIZES[(index + 1) % DIE_SIZES.length];
}

function SheetInput({
  value,
  onChange,
  className,
  ariaLabel,
  style,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel: string;
  style?: CSSProperties;
}) {
  return (
    <input
      type="text"
      aria-label={ariaLabel}
      className={`ts-sheet-input ${className ?? ''}`.trim()}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      style={style}
    />
  );
}

function SheetTextArea({
  value,
  onChange,
  className,
  ariaLabel,
  rows = 3,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel: string;
  rows?: number;
}) {
  return (
    <textarea
      aria-label={ariaLabel}
      className={`ts-sheet-textarea ${className ?? ''}`.trim()}
      value={value}
      rows={rows}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

const EMPTY_SHEET_ABILITIES = [
  { name: '', desc: '' },
  { name: '', desc: '' },
  { name: '', desc: '' },
];

function defaultAbilitiesForOrder(order: string) {
  const fromPack = sheetAbilitiesForOrder(order);
  return fromPack.length > 0 ? fromPack : EMPTY_SHEET_ABILITIES;
}

export default function CharacterSheetPreview({
  character,
  editable = true,
  onChange,
  chrome = TERMINUS_SHEET_CHROME,
  abilities: abilitiesProp,
  armorId,
}: Props) {
  const incoming = extractSheetFields(character, chrome, armorId);
  const [fields, setFields] = useState<SheetFields>(incoming);
  const prevIncoming = useRef(incoming);
  const defaultAbilities = abilitiesProp || defaultAbilitiesForOrder(incoming.order);
  const [abilities, setAbilities] = useState(defaultAbilities);
  const prevOrder = useRef(incoming.order);

  useEffect(() => {
    const prev = prevIncoming.current;
    const changed: Partial<SheetFields> = {};
    (Object.keys(incoming) as Array<keyof SheetFields>).forEach((key) => {
      if (incoming[key] !== prev[key]) {
        changed[key] = incoming[key] as never;
      }
    });
    if (Object.keys(changed).length > 0) {
      setFields((current) => ({ ...current, ...changed }));
    }
    prevIncoming.current = incoming;
  }, [incoming]);

  useEffect(() => {
    if (abilitiesProp) return;
    if (fields.order !== prevOrder.current) {
      const nextAbilities = defaultAbilitiesForOrder(fields.order);
      setAbilities(nextAbilities);
      prevOrder.current = fields.order;
    }
  }, [abilitiesProp, fields.order]);

  const updateFields = (patch: CharacterSheetPatch) => {
    const { abilities: _abilities, ...fieldPatch } = patch;
    setFields((current) => ({
      ...current,
      ...fieldPatch,
    }));
    onChange?.(patch);
  };

  const species = fields.species;
  const order = fields.order;
  const backgroundSentence = fields.background;
  const currentObjective = fields.objective;

  // Standardize values for mapping classes
  const lineageNormalized = (() => {
    const raw = species.toLowerCase().replace(/\s+/g, '');
    if (raw.includes('dwarf')) return 'stoneborn';
    if (raw.includes('elf')) return 'high';
    return raw;
  })();
  const orderNormalized = order.toLowerCase();

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
    if (chrome.terminusStamps) {
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
          return { label: 'DEPT PROBE', text: 'SEEKER', code: 'Doc 049-Gamma' };
        default:
          break;
      }
    }
    const stampText = (order || chrome.defaultOrder).slice(0, 12).toUpperCase();
    return { label: chrome.stampLabel.toUpperCase(), text: stampText, code: chrome.stampCode };
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

  const renderThresholdCircles = (
    track: 'endure' | 'avoid' | 'exert',
    current: number,
    max: number,
  ) => {
    return (
      <div className="ts-threshold-row-circles">
        {Array.from({ length: 5 }).map((_, i) => {
          let bubbleClass = 'ts-bubble';
          if (i < current) bubbleClass += ' filled';
          else if (i < max) bubbleClass += ' unlocked';
          const clickable = editable && i < max;
          return clickable ? (
            <button
              key={i}
              type="button"
              className={bubbleClass}
              aria-label={`${track} circle ${i + 1} of ${max}`}
              onClick={() => {
                const next = current === i + 1 ? i : i + 1;
                updateFields({ [track]: next });
              }}
            />
          ) : (
            <div key={i} className={bubbleClass} />
          );
        })}
      </div>
    );
  };

  const renderDieRating = (stat: 'force' | 'agility' | 'willpower', size: DieSize) => {
    if (!editable) {
      return (
        <div className="ts-rating-square">
          <div className="ts-square-label">RATING</div>
          <div className="ts-square-val">d{size}</div>
        </div>
      );
    }

    return (
      <button
        type="button"
        className="ts-rating-square ts-rating-square-button"
        aria-label={`Cycle ${stat} die. Current d${size}`}
        title="Click to cycle die size"
        onClick={() => {
          const next = cycleDie(size);
          const track = stat === 'force' ? 'endure' : stat === 'agility' ? 'avoid' : 'exert';
          const nextMax = maxFromDie(next);
          const currentTrack = fields[track];
          updateFields({
            [stat]: next,
            [track]: Math.min(currentTrack, nextMax),
          });
        }}
      >
        <div className="ts-square-label">RATING</div>
        <div className="ts-square-val">d{size}</div>
      </button>
    );
  };

  return (
    <div className={`coherence-sheet-container skin-lineage-${lineageNormalized} skin-order-${orderNormalized}`}>
      <div className="coherence-sheet">
        <div className="ts-inner-border">
          {/* HEADER TEXT & STAMP ROW */}
          <div className="ts-top-row">
            <div className="ts-brand">
              <div className="ts-brand-main">{chrome.brand}</div>
              <div className="ts-brand-motto">{chrome.motto}</div>
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
                <span className="ts-stamp-label">{chrome.stampLabel}</span>
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
            <div className="ts-plate-sub">{chrome.documentKind}</div>
            <div className="ts-plate-main">{chrome.documentAuthority}</div>
          </div>
          {editable && (
            <p className="ts-fill-hint">Click any underlined field to type. Click a rating box to cycle dice. Click armor to cycle its permission. Click threshold circles to mark pressure.</p>
          )}

          {/* SECTION I: IDENTITY */}
          <div className="ts-section-header">
            <span className="ts-section-num">I</span>
            <span className="ts-section-title-text">Identity</span>
          </div>
          <div className="ts-identity-fields">
            <div className="ts-field-inline" style={{ width: '40%' }}>
              <span className="ts-inline-label">Name</span>
              {editable ? (
                <SheetInput
                  className="ts-inline-value handwriting"
                  ariaLabel="Name"
                  value={fields.name}
                  onChange={(value) => updateFields({ name: value })}
                  style={{ textTransform: 'uppercase' }}
                />
              ) : (
                <span className="ts-inline-value handwriting">{fields.name.toUpperCase()}</span>
              )}
            </div>
            <div className="ts-field-inline" style={{ width: '30%' }}>
              <span className="ts-inline-label">{chrome.speciesLabel}</span>
              {editable ? (
                <SheetInput
                  className="ts-inline-value handwriting"
                  ariaLabel={chrome.speciesLabel}
                  value={species}
                  onChange={(value) => updateFields({ species: value })}
                />
              ) : (
                <span className="ts-inline-value handwriting">{species}</span>
              )}
            </div>
            <div className="ts-field-inline" style={{ width: '30%' }}>
              <span className="ts-inline-label">{chrome.orderLabel}</span>
              {editable ? (
                <SheetInput
                  className="ts-inline-value handwriting"
                  ariaLabel={chrome.orderLabel}
                  value={order}
                  onChange={(value) => updateFields({ order: value })}
                />
              ) : (
                <span className="ts-inline-value handwriting">{order}</span>
              )}
            </div>
          </div>

          {/* SECTION II: APPROACH & SIGNATURE */}
          <div className="ts-section-header">
            <span className="ts-section-num">II</span>
            <span className="ts-section-title-text">Approach & Signature</span>
          </div>
          <p className="ts-section-instruction">Describe your character's demeanor and defining action.</p>
          <div className="ts-lined-box">
            {editable ? (
              <SheetTextArea
                className="handwriting-block"
                ariaLabel="Approach and signature"
                value={fields.approach}
                onChange={(value) => updateFields({ approach: value })}
                rows={4}
              />
            ) : (
              <div className="handwriting-block">{fields.approach}</div>
            )}
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
                  <div className="ts-skill-label-name">FORCE (d{fields.force})</div>
                </div>
                <div className="ts-die-box-wrapper">
                  {renderDieSvg(fields.force)}
                </div>
                {renderDieRating('force', fields.force)}
              </div>
              <div className="ts-threshold-track">
                <span className="ts-track-label">ENDURE</span>
                {renderThresholdCircles('endure', fields.endure, maxFromDie(fields.force))}
              </div>
            </div>

            {/* Agility / Avoid */}
            <div className="ts-skill-column">
              <div className="ts-skill-header-row">
                <div className="ts-skill-label-block">
                  <div className="ts-skill-label-name">AGILITY (d{fields.agility})</div>
                </div>
                <div className="ts-die-box-wrapper">
                  {renderDieSvg(fields.agility)}
                </div>
                {renderDieRating('agility', fields.agility)}
              </div>
              <div className="ts-threshold-track">
                <span className="ts-track-label">AVOID</span>
                {renderThresholdCircles('avoid', fields.avoid, maxFromDie(fields.agility))}
              </div>
            </div>

            {/* Willpower / Exert */}
            <div className="ts-skill-column">
              <div className="ts-skill-header-row">
                <div className="ts-skill-label-block">
                  <div className="ts-skill-label-name">WILLPOWER (d{fields.willpower})</div>
                </div>
                <div className="ts-die-box-wrapper">
                  {renderDieSvg(fields.willpower)}
                </div>
                {renderDieRating('willpower', fields.willpower)}
              </div>
              <div className="ts-threshold-track">
                <span className="ts-track-label">EXERT</span>
                {renderThresholdCircles('exert', fields.exert, maxFromDie(fields.willpower))}
              </div>
            </div>
          </div>

          {/* SECTION IV: ORDER ABILITIES */}
          <div className="ts-section-header">
            <span className="ts-section-num">IV</span>
            <span className="ts-section-title-text">{chrome.abilitiesTitle}</span>
          </div>
          <div className="ts-abilities-grid">
            {abilities.map((ability, idx) => (
              <div key={idx} className="ts-ability-card">
                <div className="ts-ability-badge">{idx + 1}</div>
                {editable ? (
                  <>
                    <SheetInput
                      className="ts-ability-name"
                      ariaLabel={`${chrome.abilitiesTitle} ${idx + 1} name`}
                      value={ability.name}
                      onChange={(value) => {
                        const next = abilities.map((entry, abilityIndex) =>
                          abilityIndex === idx ? { ...entry, name: value } : entry,
                        );
                        setAbilities(next);
                        onChange?.({ abilities: next });
                      }}
                    />
                    <SheetTextArea
                      className="ts-ability-desc"
                      ariaLabel={`${ability.name || chrome.abilitiesTitle} ${idx + 1} description`}
                      value={ability.desc}
                      rows={3}
                      onChange={(value) => {
                        const next = abilities.map((entry, abilityIndex) =>
                          abilityIndex === idx ? { ...entry, desc: value } : entry,
                        );
                        setAbilities(next);
                        onChange?.({ abilities: next });
                      }}
                    />
                  </>
                ) : (
                  <>
                    <h4 className="ts-ability-name">{ability.name}</h4>
                    <p className="ts-ability-desc">{ability.desc}</p>
                  </>
                )}
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
              {editable ? (
                <SheetInput
                  className="ts-row-value handwriting"
                  ariaLabel="Primary weapon"
                  value={fields.primaryWeapon}
                  onChange={(value) => updateFields({ primaryWeapon: value })}
                />
              ) : (
                <span className="ts-row-value handwriting">{fields.primaryWeapon}</span>
              )}
            </div>
            <div className="ts-field-row-full">
              <span className="ts-row-label">Secondary Item</span>
              {editable ? (
                <SheetInput
                  className="ts-row-value handwriting"
                  ariaLabel="Secondary item"
                  value={fields.secondaryItem}
                  onChange={(value) => updateFields({ secondaryItem: value })}
                />
              ) : (
                <span className="ts-row-value handwriting">{fields.secondaryItem}</span>
              )}
            </div>
            <div className="ts-field-row-full">
              <span className="ts-row-label">Armor</span>
              {editable ? (
                <button
                  type="button"
                  className="ts-row-value handwriting"
                  aria-label="Cycle armor permission"
                  onClick={() => updateFields({ armor: cycleBodyArmor(fields.armor) })}
                  style={{ textAlign: 'left', background: 'transparent', border: 0, padding: 0, cursor: 'pointer', width: '100%' }}
                >
                  {sheetArmorLine(fields.armor, chrome.terminusStamps ? 'terminus' : 'generic')}
                </button>
              ) : (
                <span className="ts-row-value handwriting">
                  {sheetArmorLine(fields.armor, chrome.terminusStamps ? 'terminus' : 'generic')}
                </span>
              )}
            </div>
            <div className="ts-field-row-full">
              <span className="ts-row-label">Background Sentence: "Write one defining sentence about your past."</span>
              {editable ? (
                <SheetInput
                  className="ts-row-value handwriting"
                  ariaLabel="Background sentence"
                  value={backgroundSentence}
                  onChange={(value) => updateFields({ background: value })}
                />
              ) : (
                <span className="ts-row-value handwriting">{backgroundSentence}</span>
              )}
            </div>
            <div className="ts-field-row-full">
              <span className="ts-row-label">Current Objective:</span>
              {editable ? (
                <SheetInput
                  className="ts-row-value handwriting"
                  ariaLabel="Current objective"
                  value={currentObjective}
                  onChange={(value) => updateFields({ objective: value })}
                />
              ) : (
                <span className="ts-row-value handwriting">{currentObjective}</span>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="ts-footer-row">
            {/* SVG gears/runes in corners */}
            <div className="ts-gear-deco left">
              {renderCornerFlourish('left')}
            </div>
            
            <div className="ts-footer-text">✦ {chrome.footer} ✦</div>

            <div className="ts-gear-deco right">
              {renderCornerFlourish('right')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
