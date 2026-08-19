import { useState } from 'react';
import { Activity, Save, Sparkles, UserPlus, Users } from 'lucide-react';
import type { NPCData } from './useNPCStorage';

const apiKey = import.meta.env.VITE_AI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";
const apiEndpoint = import.meta.env.VITE_AI_ENDPOINT || "https://api.deepseek.com/chat/completions";
const apiModel = import.meta.env.VITE_AI_MODEL || "deepseek-chat";

interface NPCGeneratorProps {
  onSave: (npc: Omit<NPCData, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function NPCGenerator({ onSave }: NPCGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState('');
  const [generationMode, setGenerationMode] = useState<'single' | 'group'>('single');
  
  // Single NPC form data
  const [formData, setFormData] = useState({
    name: '',
    lineage: '',
    role: '',
    appearance: '',
    quirk: '',
    will: '',
    drift: '',
  });

  // Group NPC form data
  const [groupData, setGroupData] = useState({
    size: 3,
    theme: '', // e.g., "A cult cell", "A merchant caravan", "City guards"
    lineage: '',
  });

  // Generated group array to display
  const [generatedGroup, setGeneratedGroup] = useState<Omit<NPCData, 'id' | 'createdAt' | 'updatedAt'>[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGroupInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGroupData(prev => ({ ...prev, [name]: name === 'size' ? Number(value) : value }));
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
    
    let prompt: string;
    let systemInstruction = "You are a specialized game design assistant for Terminus RPG.";

    if (generationMode === 'single') {
      prompt = `
        You are an expert tabletop RPG designer building an NPC for the Terminus RPG.
        Terminus is a dark fantasy world where reality fractures (Ruptures) when civic routines and systems fail.
        Lineages available: Human, Synth, Cursed, Hollow, Resonant.
        
        Generate a compelling, game-ready NPC. If any fields below are already provided, use them as inspiration.
        
        Current idea:
        Name: ${formData.name}
        Lineage: ${formData.lineage}
        Role/Faction: ${formData.role}
        
        Please provide rich, concise, and game-actionable text for the following fields:
        - name: The NPC's full name.
        - lineage: Their lineage/species (choose from the available ones if empty).
        - role: Their job, faction, or title.
        - appearance: A concise, striking visual description.
        - quirk: A memorable mannerism, speech pattern, or habit.
        - will: What they actively want right now (their Intent/Pressure in the scene).
        - drift: The executable Else statement: "At the end of each round/scene, [specific state change]." What happens if the players ignore or fail them.

        Terminology Boundary: "Rupture" names a condition, not a material or energy source. Never write "Rupture energy," "Rupture power," "Rupture magic," "Rupture-infused," or similar. Describe the physical, civic, or sensory symptoms of failed coherence instead. Show the strain, not the category.
      `;
      systemInstruction += " Return ONLY valid JSON matching the exact keys requested. Do not use markdown formatting outside the JSON.";
    } else {
      prompt = `
        You are an expert tabletop RPG designer building a group of ${groupData.size} NPCs for the Terminus RPG.
        Terminus is a dark fantasy world where reality fractures (Ruptures) when civic routines and systems fail.
        Lineages available: Human, Synth, Cursed, Hollow, Resonant.
        
        Group Theme/Description: ${groupData.theme || 'A random assortment of characters crossing paths'}
        Primary Lineage: ${groupData.lineage || 'Mixed'}
        
        Generate an array of exactly ${groupData.size} distinct NPCs that fit together.
        For each NPC, provide rich, concise, and game-actionable text for the following fields:
        - name: The NPC's full name.
        - lineage: Their lineage/species.
        - role: Their job, faction, or title in relation to the group.
        - appearance: A concise, striking visual description.
        - quirk: A memorable mannerism, speech pattern, or habit.
        - will: What they actively want right now (their Intent/Pressure in the scene).
        - drift: The executable Else statement: "At the end of each round/scene, [specific state change]." What happens if the players ignore or fail them.

        Terminology Boundary: "Rupture" names a condition, not a material or energy source. Never write "Rupture energy," "Rupture power," "Rupture magic," "Rupture-infused," or similar. Describe the physical, civic, or sensory symptoms of failed coherence instead. Show the strain, not the category.
      `;
      systemInstruction += " Return ONLY valid JSON containing an object with a 'npcs' array matching the requested keys. Do not use markdown formatting outside the JSON.";
    }

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
      
      if (generationMode === 'single') {
        setFormData({
          name: generatedData.name || formData.name,
          lineage: generatedData.lineage || formData.lineage,
          role: generatedData.role || formData.role,
          appearance: generatedData.appearance || formData.appearance,
          quirk: generatedData.quirk || formData.quirk,
          will: generatedData.will || formData.will,
          drift: generatedData.drift || formData.drift,
        });
        setGenerationMessage('✓ NPC generated successfully');
      } else {
        if (generatedData.npcs && Array.isArray(generatedData.npcs)) {
          setGeneratedGroup(generatedData.npcs);
          setGenerationMessage(`✓ ${generatedData.npcs.length} NPCs generated successfully`);
        } else {
          throw new Error("Invalid array format returned for group generation.");
        }
      }
    } catch (error) {
      console.error("Failed to generate content:", error);
      setGenerationMessage('✗ Failed to generate NPC content. Check your VITE_AI_API_KEY and endpoint.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSingle = () => {
    if (!formData.name) {
      setGenerationMessage('⚠️ Name is required to save.');
      return;
    }
    onSave(formData);
    setFormData({
      name: '', lineage: '', role: '', appearance: '', quirk: '', will: '', drift: ''
    });
    setGenerationMessage('');
  };

  const handleSaveFromGroup = (index: number) => {
    const npc = generatedGroup[index];
    if (npc) {
      onSave(npc);
      // Remove the saved NPC from the generated group list
      setGeneratedGroup(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSaveAllGroup = () => {
    generatedGroup.forEach(npc => onSave(npc));
    setGeneratedGroup([]);
    setGenerationMessage('✓ Entire group saved to vault.');
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-900 rounded-lg border border-slate-700 shadow-2xl overflow-hidden mt-6">
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-800/30 flex-wrap gap-4">
        <h3 className="text-lg font-medium text-slate-100 flex items-center gap-2 font-cinzel">
          <UserPlus size={20} className="text-amber-500"/>
          NPC Generator
        </h3>
        
        <div className="flex bg-slate-950 border border-slate-700 rounded p-1">
          <button 
            onClick={() => { setGenerationMode('single'); setGenerationMessage(''); }}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded ${generationMode === 'single' ? 'bg-amber-900/30 text-amber-400 font-medium border border-amber-800/50' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <UserPlus size={14} /> Single
          </button>
          <button 
            onClick={() => { setGenerationMode('group'); setGenerationMessage(''); }}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded ${generationMode === 'group' ? 'bg-amber-900/30 text-amber-400 font-medium border border-amber-800/50' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Users size={14} /> Group Batch
          </button>
        </div>

        <button 
          onClick={handleAutoFill}
          disabled={isGenerating || !apiKey}
          className="flex items-center gap-2 text-sm bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-300 border border-indigo-700/50 px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? <Activity size={16} className="animate-pulse" /> : <Sparkles size={16} />}
          {isGenerating ? 'Generating...' : 'Auto-Generate with AI'}
        </button>
      </div>

      <div className="p-6 space-y-6">
        {generationMessage && (
          <div className={`text-sm p-3 rounded ${generationMessage.includes('✓') ? 'bg-green-900/20 text-green-400 border border-green-800/30' : 'bg-red-900/20 text-red-400 border border-red-800/30'}`}>
            {generationMessage}
          </div>
        )}

        {generationMode === 'single' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-inter font-semibold">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-inter font-semibold">Lineage</label>
                <input type="text" name="lineage" value={formData.lineage} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none transition-all placeholder:text-slate-600" placeholder="e.g. Human, Stoneborn, Deep Alfar" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-inter font-semibold">Role / Faction</label>
                <input type="text" name="role" value={formData.role} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-inter font-semibold">Appearance</label>
                <textarea name="appearance" value={formData.appearance} onChange={handleInputChange} rows={2} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none resize-none font-mono text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-inter font-semibold">Quirk / Mannerism</label>
                <textarea name="quirk" value={formData.quirk} onChange={handleInputChange} rows={2} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none resize-none font-mono text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-red-400 font-inter">Will (Intent)</label>
                <textarea name="will" value={formData.will} onChange={handleInputChange} rows={3} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none resize-none font-mono text-xs" placeholder="What do they actively want in this scene?" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-purple-400 font-inter">Drift (If Ignored)</label>
                <textarea name="drift" value={formData.drift} onChange={handleInputChange} rows={3} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none resize-none font-mono text-xs" placeholder="What happens if the players ignore them or fail?" />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveSingle}
                className="flex items-center gap-2 px-6 py-2 text-sm bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold rounded shadow-lg shadow-amber-900/20 transition-colors"
              >
                <Save size={16} /> Save to NPC Vault
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-inter font-semibold">Group Size (1-6)</label>
                <input type="number" min="1" max="6" name="size" value={groupData.size} onChange={handleGroupInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-inter font-semibold">Primary Lineage</label>
                <select name="lineage" value={groupData.lineage} onChange={handleGroupInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none transition-all">
                  <option value="">Mixed</option>
                  <option value="Human">Human</option>
                  <option value="Synth">Synth</option>
                  <option value="Cursed">Cursed</option>
                  <option value="Hollow">Hollow</option>
                  <option value="Resonant">Resonant</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-inter font-semibold">Group Theme / Association</label>
                <input type="text" name="theme" value={groupData.theme} onChange={handleGroupInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none transition-all placeholder:text-slate-600" placeholder="e.g. A ragged cult cell, Local militia" />
              </div>
            </div>

            {generatedGroup.length > 0 && (
              <div className="space-y-4 border-t border-slate-800 pt-6 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-md font-semibold text-slate-200 font-cinzel">Generated Group</h4>
                  <button
                    onClick={handleSaveAllGroup}
                    className="flex items-center gap-2 px-4 py-1.5 text-xs bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold rounded transition-colors"
                  >
                    <Save size={14} /> Save Entire Group
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {generatedGroup.map((npc, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row gap-4 relative">
                      <div className="flex-1">
                        <div className="mb-2">
                          <h5 className="font-cinzel text-lg text-amber-400 m-0">{npc.name}</h5>
                          <span className="text-xs text-slate-400 font-jetbrains">{npc.lineage} | {npc.role}</span>
                        </div>
                        <div className="text-sm font-eb-garamond text-slate-300 mb-2">
                          <p className="mb-1"><strong className="text-slate-400 font-inter text-xs uppercase tracking-wide">Appearance:</strong> {npc.appearance}</p>
                          <p className="mb-0"><strong className="text-slate-400 font-inter text-xs uppercase tracking-wide">Quirk:</strong> {npc.quirk}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                          <div className="bg-slate-900 p-2 rounded border border-slate-800">
                            <strong className="text-red-400 block text-xs mb-1 font-inter uppercase">Will</strong>
                            <span className="text-xs font-mono text-slate-300">{npc.will}</span>
                          </div>
                          <div className="bg-slate-900 p-2 rounded border border-slate-800">
                            <strong className="text-purple-400 block text-xs mb-1 font-inter uppercase">Drift</strong>
                            <span className="text-xs font-mono text-slate-300">{npc.drift}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
                        <button
                          onClick={() => handleSaveFromGroup(idx)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs border border-amber-600/50 text-amber-500 hover:bg-amber-600/10 rounded transition-colors"
                        >
                          <Save size={14} /> Save
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
