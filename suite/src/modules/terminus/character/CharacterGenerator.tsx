import { useState } from 'react';
import { Dices, Shuffle, Save } from 'lucide-react';
import { ORDERS_LIST } from '../../../data/terminus/orders';
import { ORIGINS, generateArchetype, applyArchetypeUpgrades, generateRandomCharacter, type OriginId } from '../../../data/terminus/archetypes';
import { CHARACTER_BASELINE, CREATION_UPGRADES, THRESHOLD_MAPPING, deriveThresholds, type CharacterCreationState } from '../../../data/terminus/advancement';
import type { Die } from '../../../data/terminus/skills';

export function CharacterGenerator() {
  const [step, setStep] = useState<'order-select' | 'origin-select' | 'upgrade-assign' | 'review'>('order-select');
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [selectedOrigin, setSelectedOrigin] = useState<OriginId | ''>('');
  
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

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrder(orderId);
    setStep('origin-select');
  };

  const handleSelectOrigin = (originId: OriginId) => {
    setSelectedOrigin(originId);
    const archetype = generateArchetype(selectedOrder, originId);
    const skills = applyArchetypeUpgrades(archetype);
    const thresholds = deriveThresholds(skills);
    
    setCharacter(prev => ({
      ...prev,
      order: selectedOrder,
      origin: originId,
      Force: skills.Force,
      Agility: skills.Agility,
      Willpower: skills.Willpower,
      ...thresholds,
    }));
    
    setStep('review');
  };

  const handleRandomGenerate = (orderId: string) => {
    const { archetype, skills } = generateRandomCharacter(orderId);
    const thresholds = deriveThresholds(skills);
    
    setCharacter(prev => ({
      ...prev,
      order: orderId,
      origin: archetype.origin,
      Force: skills.Force,
      Agility: skills.Agility,
      Willpower: skills.Willpower,
      ...thresholds,
    }));
    
    setSelectedOrder(orderId);
    setStep('review');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-950 rounded-lg border border-slate-800 space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-amber-500 flex items-center gap-2 mb-2">
          <Dices size={24} /> Character Generator
        </h2>
        <p className="text-sm text-slate-400">Build a Terminus responder with controlled advancement</p>
      </header>

      {step === 'order-select' && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200">1. Choose Your Order</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ORDERS_LIST.map(order => (
              <button
                key={order.id}
                onClick={() => handleSelectOrder(order.id)}
                className="p-4 bg-slate-900 border border-slate-700 rounded hover:border-amber-500 hover:bg-slate-800/50 transition-all text-left group"
              >
                <div className="font-semibold text-amber-400 group-hover:text-amber-300">{order.name}</div>
                <div className="text-xs text-slate-500 mt-1">{order.id}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 'origin-select' && (
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setStep('order-select')}
              className="px-3 py-1 text-sm bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
            >
              ← Back
            </button>
            <h3 className="text-lg font-semibold text-slate-200">2. Choose Your Origin</h3>
          </div>
          <div className="space-y-2">
            {ORIGINS.map(origin => (
              <button
                key={origin.id}
                onClick={() => handleSelectOrigin(origin.id)}
                className="w-full p-4 bg-slate-900 border border-slate-700 rounded hover:border-amber-500 hover:bg-slate-800/50 transition-all text-left group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-amber-400 group-hover:text-amber-300">{origin.name}</div>
                    <div className="text-sm text-slate-400 mt-1">{origin.description}</div>
                  </div>
                  <div className="text-xs text-slate-500">+{origin.archetypalBonus}</div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="pt-4 border-t border-slate-700">
            <button
              onClick={() => handleRandomGenerate(selectedOrder)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-900/30 text-indigo-300 border border-indigo-700/50 rounded hover:bg-indigo-800/40 transition-colors"
            >
              <Shuffle size={16} /> Generate Random Character
            </button>
          </div>
        </section>
      )}

      {step === 'review' && (
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Your Character</h3>
            <button
              onClick={() => setStep('order-select')}
              className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded hover:text-slate-200"
            >
              Start Over
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded p-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-500 uppercase">Order</label>
                <div className="text-lg font-semibold text-amber-400">{character.order || 'Select Order'}</div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase">Origin</label>
                <div className="text-lg font-semibold text-amber-400">{character.origin || 'Select Origin'}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {(['Force', 'Agility', 'Willpower'] as const).map(skill => (
              <div key={skill} className="bg-slate-900 border border-slate-700 rounded p-3 space-y-2">
                <div className="text-sm font-semibold text-amber-400">{skill}</div>
                <div className="text-2xl font-bold text-slate-200">{character[skill]}</div>
              </div>
            ))}
          </div>

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

          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold rounded shadow-lg shadow-amber-900/20 transition-colors"
          >
            <Save size={18} /> Save Character
          </button>
        </section>
      )}
    </div>
  );
}
