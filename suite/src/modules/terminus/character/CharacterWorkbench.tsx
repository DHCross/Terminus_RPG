import { useState } from 'react';
import { Users, TrendingUp } from 'lucide-react';
import { CharacterGenerator } from './CharacterGenerator';
import { AdvancementTracker } from './AdvancementTracker';
import type { Die } from '../../../data/terminus/skills';

export function CharacterWorkbench() {
  const [tab, setTab] = useState<'generator' | 'tracker'>('generator');
  
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

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-700 bg-slate-950 p-4">
        <button
          onClick={() => setTab('generator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t ${
            tab === 'generator'
              ? 'bg-slate-800 text-amber-400 border-t border-l border-r border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users size={18} /> Generator
        </button>
        <button
          onClick={() => setTab('tracker')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t ${
            tab === 'tracker'
              ? 'bg-slate-800 text-amber-400 border-t border-l border-r border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp size={18} /> Advancement
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-950 to-slate-900">
        {tab === 'generator' && (
          <CharacterGenerator />
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
      </div>
    </div>
  );
}
