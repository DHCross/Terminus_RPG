import { useState } from 'react';
import { TrendingUp, Zap, AlertCircle } from 'lucide-react';
import type { Die } from '../../../data/terminus/skills';
import {
  THRESHOLD_MAPPING,
  ADVANCEMENT_COSTS,
  advancementCost,
  advanceSkill,
  canAdvanceSkill,
  deriveThresholds,
} from '../../../data/terminus/advancement';

interface AdvancementTrackerProps {
  characterName: string;
  skills: { Force: Die; Agility: Die; Willpower: Die };
  availableAP: number;
  completedOperations: number;
  onSkillAdvanced?: (skill: string, newDie: Die, apSpent: number) => void;
  onAPEarned?: (amount: number) => void;
}

export function AdvancementTracker({
  characterName,
  skills,
  availableAP,
  completedOperations,
  onSkillAdvanced,
  onAPEarned,
}: AdvancementTrackerProps) {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [simulatedAP, setSimulatedAP] = useState(availableAP);

  const thresholds = deriveThresholds(skills);

  const handleAdvanceSkill = (skill: 'Force' | 'Agility' | 'Willpower') => {
    if (!canAdvanceSkill(skills[skill], simulatedAP)) return;

    const result = advanceSkill(skills[skill], simulatedAP);
    if (result) {
      setSimulatedAP(prev => prev - result.apSpent);
      onSkillAdvanced?.(skill, result.newDie, result.apSpent);
    }
  };

  const getDiceOrder = (): Die[] => ['d4', 'd6', 'd8', 'd10', 'd12'] as const;

  const SkillAdvancementRow = ({ skill, threshold, thresholdName }: { skill: 'Force' | 'Agility' | 'Willpower'; threshold: number; thresholdName: string }) => {
    const currentDie = skills[skill];
    const diceOrder = getDiceOrder();
    const currentIndex = diceOrder.indexOf(currentDie);
    const cost = advancementCost(currentDie);
    const canAdvance = canAdvanceSkill(currentDie, simulatedAP);
    const isMaxed = currentDie === 'd12';

    return (
      <div key={skill} className="border border-slate-700 rounded p-4 space-y-3">
        <div
          className="flex items-center justify-between cursor-pointer hover:bg-slate-800/30 p-2 rounded transition-colors"
          onClick={() => setExpandedSkill(expandedSkill === skill ? null : skill)}
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="w-20">
              <div className="font-semibold text-amber-400">{skill}</div>
              <div className="text-xs text-slate-500">{thresholdName}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-slate-200 w-10 text-center">{currentDie}</div>
              <div className="text-xs text-slate-500">
                {THRESHOLD_MAPPING[currentDie]} threshold{THRESHOLD_MAPPING[currentDie] !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          {!isMaxed && (
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-400">
                {cost} AP to advance
              </div>
            </div>
          )}
          {isMaxed && (
            <div className="text-xs text-amber-500 font-semibold">Mastered</div>
          )}
        </div>

        {/* Expanded Advancement Details */}
        {expandedSkill === skill && (
          <div className="space-y-3 pt-3 border-t border-slate-700">
            {/* Die progression */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Advancement Path</label>
              <div className="flex gap-1 mt-2">
                {diceOrder.map((die, index) => {
                  const isActive = index <= currentIndex;
                  const isCurrent = die === currentDie;
                  return (
                    <div
                      key={die}
                      className={`flex-1 py-2 text-center rounded text-xs font-mono transition-colors ${
                        isCurrent
                          ? 'bg-amber-900/40 text-amber-300 border border-amber-700/50'
                          : isActive
                          ? 'bg-slate-800/50 text-slate-300 border border-slate-700'
                          : 'bg-slate-950 text-slate-600 border border-slate-800'
                      }`}
                    >
                      {die}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Advancement costs */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Costs from Here</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { from: 'd4', to: 'd6', cost: ADVANCEMENT_COSTS.d4_to_d6 },
                  { from: 'd6', to: 'd8', cost: ADVANCEMENT_COSTS.d6_to_d8 },
                  { from: 'd8', to: 'd10', cost: ADVANCEMENT_COSTS.d8_to_d10 },
                  { from: 'd10', to: 'd12', cost: ADVANCEMENT_COSTS.d10_to_d12 },
                ].map(({ from, to, cost }) => {
                  const fromIndex = diceOrder.indexOf(from as Die);
                  const isRelevant = currentIndex >= fromIndex;
                  return (
                    <div
                      key={`${from}-${to}`}
                      className={`text-xs p-2 rounded ${
                        isRelevant
                          ? 'bg-slate-800/50 text-slate-300'
                          : 'bg-slate-950 text-slate-600'
                      }`}
                    >
                      <div className="font-mono">{from} → {to}</div>
                      <div className="font-semibold text-amber-400">{cost} AP</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Advance button */}
            {!isMaxed && (
              <button
                onClick={() => handleAdvanceSkill(skill)}
                disabled={!canAdvance}
                className={`w-full py-2 px-3 rounded text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                  canAdvance
                    ? 'bg-amber-600 hover:bg-amber-500 text-amber-950'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Zap size={14} />
                Advance {skill} ({cost} AP)
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-700 rounded-lg p-6 space-y-6">
      <header className="border-b border-slate-700 pb-4">
        <h2 className="text-2xl font-bold text-amber-500 flex items-center gap-2 mb-2">
          <TrendingUp size={24} /> Advancement Tracker
        </h2>
        <p className="text-sm text-slate-400">{characterName}</p>
      </header>

      {/* AP Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-950 border border-slate-700 rounded p-4">
          <label className="text-xs text-slate-500 uppercase block mb-1">Available AP</label>
          <div className="text-3xl font-bold text-amber-400">{simulatedAP}</div>
        </div>
        <div className="bg-slate-950 border border-slate-700 rounded p-4">
          <label className="text-xs text-slate-500 uppercase block mb-1">Operations Completed</label>
          <div className="text-3xl font-bold text-amber-400">{completedOperations}</div>
        </div>
        <div className="bg-slate-950 border border-slate-700 rounded p-4">
          <label className="text-xs text-slate-500 uppercase block mb-1">Next AP Earning</label>
          <div className="text-sm text-slate-300">After operation</div>
        </div>
      </div>

      {/* AP Earning Info */}
      <div className="bg-indigo-900/20 border border-indigo-700/30 rounded p-4 flex gap-3">
        <AlertCircle size={20} className="text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-indigo-300 mb-1">Advancement Economy</p>
          <p className="text-indigo-200/70 text-xs">
            Earn AP from operations. High die advancement (d10, d12) becomes increasingly rare and valuable. Costs scale to maintain pressure balance.
          </p>
        </div>
      </div>

      {/* Skill Advancement Trackers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-200">Skill Advancement</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkillAdvancementRow skill="Force" threshold={thresholds.Endure} thresholdName="Endure" />
          <SkillAdvancementRow skill="Agility" threshold={thresholds.Avoid} thresholdName="Avoid" />
          <SkillAdvancementRow skill="Willpower" threshold={thresholds.Exert} thresholdName="Exert" />
        </div>
      </div>

      {/* Manual AP Entry (for testing/operations) */}
      <div className="border-t border-slate-700 pt-4">
        <div className="flex gap-2 items-center">
          <label className="text-sm text-slate-400">Earn AP from operation:</label>
          <button
            onClick={() => {
              const amount = 1; // Usually determined by operation
              setSimulatedAP(prev => prev + amount);
              onAPEarned?.(amount);
            }}
            className="px-4 py-1 text-sm bg-slate-800 text-slate-300 border border-slate-700 rounded hover:bg-slate-700 transition-colors"
          >
            +1 AP
          </button>
        </div>
      </div>
    </div>
  );
}
