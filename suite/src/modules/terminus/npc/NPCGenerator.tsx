import { useState } from 'react';
import { Activity, Save, Sparkles, UserPlus } from 'lucide-react';
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
  
  const [formData, setFormData] = useState({
    name: '',
    lineage: '',
    role: '',
    appearance: '',
    quirk: '',
    will: '',
    drift: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
            'Authorization': \`Bearer \${apiKey}\`
          },
          body: JSON.stringify(payload)
        }
      );

      const generatedData = JSON.parse(result.choices[0].message.content);
      
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
    } catch (error) {
      console.error("Failed to generate content:", error);
      setGenerationMessage('✗ Failed to generate NPC content. Check your VITE_AI_API_KEY and endpoint.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!formData.name) {
      setGenerationMessage('⚠️ Name is required to save.');
      return;
    }
    onSave(formData);
    // Reset form after saving
    setFormData({
      name: '', lineage: '', role: '', appearance: '', quirk: '', will: '', drift: ''
    });
    setGenerationMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-900 rounded-lg border border-slate-700 shadow-2xl overflow-hidden mt-6">
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-800/30">
        <h3 className="text-lg font-medium text-slate-100 flex items-center gap-2">
          <UserPlus size={20} className="text-amber-500"/>
          NPC Generator
        </h3>
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
          <div className={\`text-sm p-3 rounded \${generationMessage.includes('✓') ? 'bg-green-900/20 text-green-400 border border-green-800/30' : 'bg-red-900/20 text-red-400 border border-red-800/30'}\`}>
            {generationMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Lineage</label>
            <input type="text" name="lineage" value={formData.lineage} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Role / Faction</label>
            <input type="text" name="role" value={formData.role} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Appearance</label>
            <textarea name="appearance" value={formData.appearance} onChange={handleInputChange} rows={2} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none resize-none font-mono text-xs" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Quirk / Mannerism</label>
            <textarea name="quirk" value={formData.quirk} onChange={handleInputChange} rows={2} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none resize-none font-mono text-xs" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-red-400">Will (Intent)</label>
            <textarea name="will" value={formData.will} onChange={handleInputChange} rows={3} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none resize-none font-mono text-xs" placeholder="What do they actively want in this scene?" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-purple-400">Drift (If Ignored)</label>
            <textarea name="drift" value={formData.drift} onChange={handleInputChange} rows={3} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none resize-none font-mono text-xs" placeholder="What happens if the players ignore them or fail?" />
          </div>
        </div>
      </div>

      <div className="bg-slate-950 border-t border-slate-800 p-4 flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 text-sm bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold rounded shadow-lg shadow-amber-900/20 transition-colors"
        >
          <Save size={16} /> Save to NPC Vault
        </button>
      </div>
    </div>
  );
}
