import { useState } from 'react';
import { Activity, Save, Sparkles, Skull } from 'lucide-react';
import type { MonsterData } from './useMonsterStorage';
import { THRESHOLD_MAPPING } from '../../../data/terminus/advancement';

const apiKey = import.meta.env.VITE_AI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";
const apiEndpoint = import.meta.env.VITE_AI_ENDPOINT || "https://api.deepseek.com/chat/completions";
const apiModel = import.meta.env.VITE_AI_MODEL || "deepseek-chat";

interface MonsterGeneratorProps {
  onSave: (monster: Omit<MonsterData, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function MonsterGenerator({ onSave }: MonsterGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    threatLevel: 'Standard',
    category: 'Beast',
    combatRole: 'Brute',
    appearance: '',
    will: '',
    drift: '',
  });

  const [generatedMonster, setGeneratedMonster] = useState<Omit<MonsterData, 'id' | 'createdAt' | 'updatedAt'> | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchWithRetry = async (url: string, options: RequestInit, retries: number = 3) => {
    const delays = [1000, 2000, 4000];
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delays[i]));
      }
    }
  };

  const handleAutoFill = async () => {
    if (!apiKey) {
      setGenerationMessage('⚠️ API key not configured. Set VITE_AI_API_KEY in your environment.');
      return;
    }

    setIsGenerating(true);
    setGenerationMessage('');
    
    const prompt = `
      You are an expert tabletop RPG designer building a Monster/Adversary statblock for the Terminus RPG.
      Terminus is a dark fantasy world where reality fractures (Ruptures) when civic routines and systems fail.
      
      Create a monster matching these parameters:
      Name/Concept: ${formData.name || 'Random suitable threat'}
      Threat Level: ${formData.threatLevel}
      Category: ${formData.category}
      Combat Role: ${formData.combatRole}
      
      Please provide rich, concise, and game-actionable text for the following fields. Follow the Terminus mechanics strictly:
      - name: The creature's name.
      - appearance: A concise, striking visual description.
      - will: What they actively want right now (their Intent/Behavior).
      - drift: The executable Else statement: "At the end of each round, [specific state change]." What happens if the players ignore them.
      - skills: An object with Force, Agility, and Willpower. Each must be one of: "d4", "d6", "d8", "d10", "d12".
          * Minor: mostly d4s and d6s.
          * Standard: d6s and d8s.
          * Elite: d8s and d10s.
          * Boss: d10s and d12s.
      - primaryAttack: An object with:
          * name: Name of the attack.
          * impact: A number 1, 2, or 3 (1 is weak, 2 is standard, 3 is devastating).
          * vectors: 1 or 2 comma-separated tags (e.g. "Brutal, Piercing", "Area, Ranged", "Concealed").
      - specialAbility: A unique passive, reaction, or magical Rupture effect.
      - armor: A number 0, 1, or 2 (Reduction value).
    `;

    const systemInstruction = "You are a specialized game design assistant for Terminus RPG. Return ONLY valid JSON matching the exact keys requested. Do not use markdown formatting outside the JSON.";

    const payload = {
      model: apiModel,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    };

    try {
      const result = await fetchWithRetry(
        apiEndpoint,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload)
        }
      );

      const generatedData = JSON.parse(result.choices[0].message.content);
      
      // Calculate thresholds based on generated skills
      const thresholds = {
        Endure: THRESHOLD_MAPPING[generatedData.skills.Force as keyof typeof THRESHOLD_MAPPING] || 3,
        Avoid: THRESHOLD_MAPPING[generatedData.skills.Agility as keyof typeof THRESHOLD_MAPPING] || 3,
        Exert: THRESHOLD_MAPPING[generatedData.skills.Willpower as keyof typeof THRESHOLD_MAPPING] || 3,
      };

      const finalMonster = {
        name: generatedData.name,
        threatLevel: formData.threatLevel,
        category: formData.category,
        appearance: generatedData.appearance,
        will: generatedData.will,
        drift: generatedData.drift,
        skills: generatedData.skills,
        thresholds: thresholds,
        primaryAttack: generatedData.primaryAttack,
        specialAbility: generatedData.specialAbility,
        armor: Number(generatedData.armor) || 0,
      };

      setGeneratedMonster(finalMonster);
      setGenerationMessage('✓ Monster generated successfully');
    } catch (error) {
      console.error("Failed to generate content:", error);
      setGenerationMessage('✗ Failed to generate Monster content. Check your VITE_AI_API_KEY and endpoint.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!generatedMonster) return;
    onSave(generatedMonster);
    setGeneratedMonster(null);
    setFormData(prev => ({ ...prev, name: '' }));
    setGenerationMessage('');
  };

  return (
    <div className="max-w-5xl mx-auto bg-slate-900 rounded-lg border border-slate-700 shadow-2xl overflow-hidden mt-6">
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-800/30 flex-wrap gap-4">
        <h3 className="text-lg font-medium text-slate-100 flex items-center gap-2 font-cinzel">
          <Skull size={20} className="text-red-500"/>
          Monster & Threat Generator
        </h3>

        <button 
          onClick={handleAutoFill}
          disabled={isGenerating || !apiKey}
          className="flex items-center gap-2 text-sm bg-red-900/40 hover:bg-red-800/60 text-red-300 border border-red-700/50 px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? <Activity size={16} className="animate-pulse" /> : <Sparkles size={16} />}
          {isGenerating ? 'Generating...' : 'Auto-Generate Threat'}
        </button>
      </div>

      <div className="p-6 space-y-6">
        {generationMessage && (
          <div className={`text-sm p-3 rounded ${generationMessage.includes('✓') ? 'bg-green-900/20 text-green-400 border border-green-800/30' : 'bg-red-900/20 text-red-400 border border-red-800/30'}`}>
            {generationMessage}
          </div>
        )}

        <div className="bg-slate-950 border border-slate-800 rounded p-4 mb-6">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Generation Parameters</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-inter font-semibold">Concept / Name (Optional)</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-red-500 outline-none transition-all placeholder:text-slate-600" placeholder="e.g. Glass Hound" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-inter font-semibold">Threat Level</label>
              <select name="threatLevel" value={formData.threatLevel} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-red-500 outline-none transition-all">
                <option value="Minor">Minor (Minion/Swarm)</option>
                <option value="Standard">Standard (Typical Threat)</option>
                <option value="Elite">Elite (Tough Adversary)</option>
                <option value="Boss">Boss (Scene Ending Threat)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-inter font-semibold">Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-red-500 outline-none transition-all">
                <option value="Beast">Beast / Predator</option>
                <option value="Cultist">Cultist / Humanoid</option>
                <option value="Rupture Entity">Rupture Entity</option>
                <option value="Automaton">Automaton / Construct</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-inter font-semibold">Combat Role</label>
              <select name="combatRole" value={formData.combatRole} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-red-500 outline-none transition-all">
                <option value="Brute">Brute (High Force, straightforward)</option>
                <option value="Skirmisher">Skirmisher (High Agility, mobile)</option>
                <option value="Artillery">Artillery (Ranged, high damage)</option>
                <option value="Controller">Controller (Manipulates, debuffs)</option>
                <option value="Lurker">Lurker (Stealth, ambush)</option>
                <option value="Sentinel">Sentinel (Protects others, tough)</option>
              </select>
            </div>
          </div>
        </div>

        {generatedMonster && (
          <div className="border border-red-900/30 rounded-lg p-6 bg-slate-950 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-cinzel text-red-400 m-0 leading-none">{generatedMonster.name}</h2>
                <span className="text-xs font-jetbrains text-slate-400 uppercase tracking-widest mt-1 block">
                  {generatedMonster.threatLevel} {generatedMonster.category}
                </span>
              </div>
            </div>

            <p className="font-eb-garamond text-slate-300 text-lg italic mb-6">
              {generatedMonster.appearance}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded p-3">
                  <h4 className="text-xs font-inter font-bold text-red-400 uppercase mb-2">Combat Profile</h4>
                  
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center bg-slate-950 p-2 rounded">
                      <span className="block text-[10px] text-slate-500 uppercase">Force</span>
                      <strong className="text-slate-200 font-jetbrains">{generatedMonster.skills.Force}</strong>
                      <span className="block text-[10px] text-red-400 mt-1">Endure {generatedMonster.thresholds.Endure}</span>
                    </div>
                    <div className="text-center bg-slate-950 p-2 rounded">
                      <span className="block text-[10px] text-slate-500 uppercase">Agility</span>
                      <strong className="text-slate-200 font-jetbrains">{generatedMonster.skills.Agility}</strong>
                      <span className="block text-[10px] text-blue-400 mt-1">Avoid {generatedMonster.thresholds.Avoid}</span>
                    </div>
                    <div className="text-center bg-slate-950 p-2 rounded">
                      <span className="block text-[10px] text-slate-500 uppercase">Willpower</span>
                      <strong className="text-slate-200 font-jetbrains">{generatedMonster.skills.Willpower}</strong>
                      <span className="block text-[10px] text-purple-400 mt-1">Exert {generatedMonster.thresholds.Exert}</span>
                    </div>
                  </div>

                  <div className="text-sm font-inter">
                    <span className="text-slate-400">Armor Reduction: </span>
                    <strong className="text-slate-200">{generatedMonster.armor}</strong>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded p-3">
                  <h4 className="text-xs font-inter font-bold text-amber-500 uppercase mb-2">Actions</h4>
                  
                  <div className="mb-3">
                    <strong className="text-slate-200 block text-sm font-inter">⚔️ {generatedMonster.primaryAttack.name}</strong>
                    <div className="text-xs text-slate-400 mt-1 flex gap-3">
                      <span>Impact <strong className="text-amber-400">{generatedMonster.primaryAttack.impact}</strong></span>
                      <span>Vectors: <strong className="text-amber-400">{generatedMonster.primaryAttack.vectors}</strong></span>
                    </div>
                  </div>

                  {generatedMonster.specialAbility && (
                    <div className="pt-2 border-t border-slate-800">
                      <strong className="text-slate-200 block text-sm font-inter mb-1">✨ Special Ability</strong>
                      <p className="text-sm text-slate-300 font-eb-garamond m-0 leading-tight">
                        {generatedMonster.specialAbility}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded p-3 border-l-2 border-l-red-500">
                  <strong className="text-red-400 block text-xs mb-1 font-inter uppercase">Will (Intent)</strong>
                  <span className="text-sm font-eb-garamond text-slate-300 leading-snug block">{generatedMonster.will}</span>
                </div>
                
                <div className="bg-slate-900 border border-slate-800 rounded p-3 border-l-2 border-l-purple-500">
                  <strong className="text-purple-400 block text-xs mb-1 font-inter uppercase">Drift (If Ignored)</strong>
                  <span className="text-sm font-eb-garamond text-slate-300 leading-snug block">{generatedMonster.drift}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 text-sm bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow-lg shadow-red-900/20 transition-colors"
              >
                <Save size={16} /> Save to Bestiary
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
