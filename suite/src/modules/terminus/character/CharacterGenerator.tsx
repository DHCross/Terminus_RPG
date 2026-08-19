import { useState } from 'react';
import { Dices, Shuffle, Save } from 'lucide-react';
import { ORDERS_LIST } from '../../../data/terminus/orders';
import { ORIGINS, generateArchetype, applyArchetypeUpgrades, generateRandomCharacter, type OriginId } from '../../../data/terminus/archetypes';
import { deriveThresholds, type CharacterCreationState } from '../../../data/terminus/advancement';
import type { Die } from '../../../data/terminus/skills';
import CharacterSheetPreview, { type CharacterSheetPatch } from '../../gwsd-cards/components/CharacterSheetPreview';
import { createCharacter, type Character } from '../../coherence-engine/src/index';
import { toEngineArmor } from '../../../data/terminus/armor';

interface CharacterGeneratorProps {
  onSave?: (character: CharacterCreationState) => void;
}

export function CharacterGenerator({ onSave }: CharacterGeneratorProps = {}) {
  const [step, setStep] = useState<'origin-select' | 'order-select' | 'upgrade-assign' | 'review'>('origin-select');
  const [selectedOrigin, setSelectedOrigin] = useState<OriginId | ''>('');
  
  const getLineageImage = (originId: string) => {
    if (originId.startsWith('human')) return 'human.png.png';
    if (originId.startsWith('stoneborn')) return 'stoneborn.png.png';
    if (originId.startsWith('wild_alfar')) return 'wild_alfar.png.png';
    if (originId.startsWith('deep_alfar')) return 'deep_alfar.png.png';
    if (originId.startsWith('high_alfar')) return 'high_alfar.png.png';
    return 'human.png.png';
  };
  
  const [character, setCharacter] = useState<CharacterCreationState>({
    name: 'Unnamed Responder',
    order: '',
    origin: '',
    Force: 'd4',
    Agility: 'd4',
    Willpower: 'd4',
    Endure: 1,
    Avoid: 1,
    Exert: 1,
    advancementPoints: 0,
    completedOperations: 0,
  });

  const [unassignedUpgrades, setUnassignedUpgrades] = useState<Set<Die>>(
    new Set(['d10', 'd8', 'd6'])
  );

  const handleSelectOrigin = (originId: OriginId) => {
    setSelectedOrigin(originId);
    setStep('order-select');
  };

  const handleSelectOrder = (orderId: string) => {
    if (!selectedOrigin) return;
    const archetype = generateArchetype(orderId, selectedOrigin);
    const skills = applyArchetypeUpgrades(archetype);
    const thresholds = deriveThresholds(skills);
    
    setCharacter(prev => ({
      ...prev,
      order: orderId,
      origin: selectedOrigin,
      Force: skills.Force,
      Agility: skills.Agility,
      Willpower: skills.Willpower,
      ...thresholds,
    }));
    setSheetCopy({
      species: '',
      orderName: '',
      approach: '',
      background: '',
      objective: '',
      primaryWeapon: '',
      secondaryItem: '',
      armor: 'none',
    });
    
    setStep('review');
  };

  const handleRandomGenerate = () => {
    const randomOrder = ORDERS_LIST[Math.floor(Math.random() * ORDERS_LIST.length)].id;
    const { archetype, skills } = generateRandomCharacter(randomOrder);
    const thresholds = deriveThresholds(skills);
    
    setCharacter(prev => ({
      ...prev,
      order: randomOrder,
      origin: archetype.origin,
      Force: skills.Force,
      Agility: skills.Agility,
      Willpower: skills.Willpower,
      ...thresholds,
    }));
    
    setSelectedOrigin(archetype.origin);
    setSheetCopy({
      species: '',
      orderName: '',
      approach: '',
      background: '',
      objective: '',
      primaryWeapon: '',
      secondaryItem: '',
      armor: 'none',
    });
    setStep('review');
  };

  const handleAssignUpgrade = (skill: 'Force' | 'Agility' | 'Willpower', upgradeDie: Die) => {
    setCharacter(prev => ({
      ...prev,
      [skill]: upgradeDie,
    }));
    
    setUnassignedUpgrades(prev => {
      const newSet = new Set(prev);
      newSet.delete(upgradeDie);
      return newSet;
    });
  };

  const [saved, setSaved] = useState(false);
  const [sheetCopy, setSheetCopy] = useState({
    species: '',
    orderName: '',
    approach: '',
    background: '',
    objective: '',
    primaryWeapon: '',
    secondaryItem: '',
    armor: 'none',
  });

  const handleSaveCharacter = () => {
    const thresholds = deriveThresholds({
      Force: character.Force,
      Agility: character.Agility,
      Willpower: character.Willpower,
    });
    
    const originName = character.origin ? ORIGINS.find(o => o.id === character.origin)?.name : 'Unknown Lineage';

    const finalCharacter = {
      ...character,
      ...thresholds,
      speciesLabel: sheetCopy.species || originName,
      approach: sheetCopy.approach,
      backgroundSentence: sheetCopy.background,
      currentObjective: sheetCopy.objective,
      primaryWeapon: sheetCopy.primaryWeapon,
      secondaryItem: sheetCopy.secondaryItem,
      armor: sheetCopy.armor,
    };
    
    onSave?.(finalCharacter);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getPreviewCharacter = (): Character => {
    const originName = character.origin ? ORIGINS.find(o => o.id === character.origin)?.name : 'Unknown Lineage';
    const orderName = character.order ? ORDERS_LIST.find(o => o.id === character.order)?.name : 'Unknown Order';

    return createCharacter({
      id: character.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'new-character',
      name: character.name || 'Unnamed Responder',
      identity: {
        background: sheetCopy.background || 'A denizen of Tringad, searching for fault lines in the quiet day.',
        immediateWant: sheetCopy.approach || 'Name how you work in the field.',
        species: sheetCopy.species || originName,
        order: sheetCopy.orderName || orderName,
      } as any,
      actions: {
        force: parseInt(character.Force.replace('d', '')) as any,
        agility: parseInt(character.Agility.replace('d', '')) as any,
        willpower: parseInt(character.Willpower.replace('d', '')) as any,
      },
      defenses: {
        endure: parseInt(character.Force.replace('d', '')) as any,
        avoid: parseInt(character.Agility.replace('d', '')) as any,
        exert: parseInt(character.Willpower.replace('d', '')) as any,
      },
      armor: toEngineArmor(sheetCopy.armor),
      weapons: {
        primary: { name: sheetCopy.primaryWeapon || 'Work blade', impact: 1, vectors: [] },
        secondary: { name: sheetCopy.secondaryItem || 'Backup tool', impact: 1, vectors: [] },
      },
      notes: [sheetCopy.objective || 'Observe local simulation snags and locate the next breach.'],
    });
  };

  const applySheetPatch = (patch: CharacterSheetPatch) => {
    if (patch.name !== undefined) {
      setCharacter((prev) => ({ ...prev, name: patch.name || 'Unnamed Responder' }));
    }

    const nextSkills = {
      Force: patch.force ? (`d${patch.force}` as Die) : character.Force,
      Agility: patch.agility ? (`d${patch.agility}` as Die) : character.Agility,
      Willpower: patch.willpower ? (`d${patch.willpower}` as Die) : character.Willpower,
    };

    if (patch.force || patch.agility || patch.willpower) {
      setCharacter((prev) => ({
        ...prev,
        ...nextSkills,
        ...deriveThresholds(nextSkills),
      }));
    }

    setSheetCopy((prev) => ({
      ...prev,
      species: patch.species ?? prev.species,
      orderName: patch.order ?? prev.orderName,
      approach: patch.approach ?? prev.approach,
      background: patch.background ?? prev.background,
      objective: patch.objective ?? prev.objective,
      primaryWeapon: patch.primaryWeapon ?? prev.primaryWeapon,
      secondaryItem: patch.secondaryItem ?? prev.secondaryItem,
      armor: patch.armor ?? prev.armor,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-950 rounded-lg border border-slate-800 space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-amber-500 flex items-center gap-2 mb-2 drop-shadow-md">
          <Dices size={24} /> Character Generator
        </h2>
        <p className="text-sm text-slate-400">Build a Terminus responder with controlled advancement</p>
      </header>

      {/* Progress Stepper */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        {[
          { id: 'origin-select', label: '1. Lineage' },
          { id: 'order-select', label: '2. Order' },
          { id: 'upgrade-assign', label: '3. Upgrades' },
          { id: 'review', label: '4. Finalize' }
        ].map((s, idx) => {
          const isActive = step === s.id;
          const isPast = ['origin-select', 'order-select', 'upgrade-assign', 'review'].indexOf(step) > idx;
          return (
            <div key={s.id} className={`flex flex-col items-center gap-2 flex-1 relative ${isActive ? 'opacity-100' : isPast ? 'opacity-70' : 'opacity-30'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${isActive ? 'bg-amber-500 text-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : isPast ? 'bg-slate-700 text-slate-300' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                {idx + 1}
              </div>
              <div className={`text-xs font-medium tracking-wide uppercase ${isActive ? 'text-amber-400' : 'text-slate-500'}`}>
                {s.label}
              </div>
              {idx < 3 && <div className="absolute top-4 left-[60%] right-[-40%] h-[2px] bg-slate-800" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Origin Selection */}
      {step === 'origin-select' && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200">1. Choose Your Origin (Lineage)</h3>
          <div className="space-y-2">
            {ORIGINS.map(origin => (
              <button
                key={origin.id}
                onClick={() => handleSelectOrigin(origin.id)}
                className="relative overflow-hidden w-full p-6 bg-slate-900 border border-slate-700 rounded-lg hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:-translate-y-1 transition-all duration-300 text-left group"
              >
                <div className="absolute inset-0 opacity-20 group-hover:opacity-50 transition-opacity duration-300">
                  <img src={`/images/lineages/${getLineageImage(origin.id)}`} alt={origin.name} className="w-full h-full object-cover object-center mix-blend-screen grayscale contrast-125" />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent" />
                </div>
                <div className="relative z-10 flex justify-between items-center">
                  <div className="max-w-[70%]">
                    <div className="font-bold text-xl text-amber-400 group-hover:text-amber-300 drop-shadow-md">{origin.name}</div>
                    <div className="text-sm text-slate-300 mt-2 leading-relaxed">{origin.description}</div>
                  </div>
                  <div className="text-lg font-bold text-slate-500 bg-slate-950/50 px-3 py-1 rounded border border-slate-800 backdrop-blur-sm">
                    +{origin.archetypalBonus}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="pt-4 border-t border-slate-700">
            <button
              onClick={() => handleRandomGenerate()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-900/30 text-indigo-300 border border-indigo-700/50 rounded hover:bg-indigo-800/40 transition-colors"
            >
              <Shuffle size={16} /> Generate Random Character
            </button>
          </div>
        </section>
      )}

      {/* Step 2: Order Selection */}
      {step === 'order-select' && (
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setStep('origin-select')}
              className="px-3 py-1 text-sm bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
            >
              ← Back
            </button>
            <h3 className="text-lg font-semibold text-slate-200">2. Choose Your Order</h3>
          </div>
          <p className="text-sm text-slate-400">
            An Order is a licensed field identity, not a job. Abilities are free standing permission.
            After this step you will still pick three of the four starter abilities on the sheet.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ORDERS_LIST.map(order => (
              <button
                key={order.id}
                onClick={() => handleSelectOrder(order.id)}
                className="relative overflow-hidden p-5 min-h-[220px] bg-slate-900 border border-slate-700 rounded-lg hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:-translate-y-1 transition-all duration-300 text-left group"
              >
                <div className="absolute inset-0 opacity-30 group-hover:opacity-70 transition-opacity duration-300">
                  <img src={`/images/orders/${order.id}.png.png`} alt={order.name} className="w-full h-full object-cover object-top mix-blend-screen grayscale contrast-125" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent" />
                </div>
                <div className="relative z-10 mt-8">
                  <div className="font-bold text-lg text-amber-400 group-hover:text-amber-300 drop-shadow-md">{order.name}</div>
                  <div className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">{order.fieldFunction}</div>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed line-clamp-3">{order.identity}</p>
                  <p className="text-xs text-slate-500 mt-2 italic">{order.notThis}</p>
                  <p className="text-xs text-amber-200/80 mt-2">{order.howToPlay[0]}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Step 3: Upgrade Assignment (only if manual mode) */}
      {step === 'upgrade-assign' && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200">3. Assign Your Upgrades</h3>
          <p className="text-sm text-slate-400">You have three upgrades to place: +d10, +d8, +d6</p>
          
          <div className="grid grid-cols-3 gap-4">
            {(['Force', 'Agility', 'Willpower'] as const).map(skill => (
              <div key={skill} className="space-y-2 p-3 bg-slate-900 border border-slate-700 rounded">
                <div className="font-semibold text-amber-400">{skill}</div>
                <div className="text-sm text-slate-300">Current: {character[skill]}</div>
                <div className="flex gap-1">
                  {Array.from(unassignedUpgrades).map(die => (
                    <button
                      key={die}
                      onClick={() => handleAssignUpgrade(skill, die)}
                      className="flex-1 px-2 py-1 text-xs bg-slate-800 text-slate-300 border border-slate-600 rounded hover:border-amber-500 hover:bg-slate-700"
                    >
                      {die}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Step 4: Review */}
      {step === 'review' && (
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Your Character</h3>
            <button
              onClick={() => setStep('origin-select')}
              className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded hover:text-slate-200"
            >
              Start Over
            </button>
          </div>

          {/* Character Preview Sheet */}
          <div className="bg-slate-900 border border-slate-700 rounded p-4 flex justify-center">
            <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
              <CharacterSheetPreview
                character={getPreviewCharacter()}
                armorId={sheetCopy.armor}
                onChange={applySheetPatch}
              />
            </div>
          </div>

          {/* Character Name Input */}
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Character Name</label>
            <input
              type="text"
              value={character.name}
              onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-amber-500 outline-none"
              placeholder="Enter character name..."
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveCharacter}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-bold rounded shadow-lg transition-colors ${
              saved
                ? 'bg-green-600 text-white shadow-green-900/20'
                : 'bg-amber-600 hover:bg-amber-500 text-amber-950 shadow-amber-900/20'
            }`}
          >
            <Save size={18} /> {saved ? 'Saved to Vault!' : 'Save Character'}
          </button>
        </section>
      )}
    </div>
  );
}
