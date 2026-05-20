import { useState } from 'react';
import { Sparkles, Activity, Save, Cpu, Plus, Check, Volume2, Globe, FileText, WifiOff } from 'lucide-react';
import { generateNamesFromAI } from '../../../services/aiService';
import {
  type CultureProfile,
  type NameUsage,
  type GeneratedName,
  generateOfflineName,
} from '../../../data/terminus/names';

const apiKey = import.meta.env.VITE_AI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";
const apiEndpoint = import.meta.env.VITE_AI_ENDPOINT || "https://api.deepseek.com/chat/completions";
const apiModel = import.meta.env.VITE_AI_MODEL || "deepseek-chat";

interface NomenclatorGeneratorProps {
  onSave: (nameData: Omit<GeneratedName, 'id' | 'createdAt'>) => void;
  detailMode: boolean;
}

export function NomenclatorGenerator({ onSave, detailMode }: NomenclatorGeneratorProps) {
  const [culture, setCulture] = useState<CultureProfile>('Welsh');
  const [usage, setUsage] = useState<NameUsage>('person');
  const [count, setCount] = useState<number>(3);
  const [contextPrompt, setContextPrompt] = useState<string>('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [generatedNames, setGeneratedNames] = useState<Omit<GeneratedName, 'id' | 'createdAt'>[]>([]);
  const [savedIndexes, setSavedIndexes] = useState<Set<number>>(new Set());

  const handleOfflineForge = () => {
    setIsGenerating(true);
    setStatusMessage(null);
    setSavedIndexes(new Set());
    
    setTimeout(() => {
      const results: Omit<GeneratedName, 'id' | 'createdAt'>[] = [];
      for (let i = 0; i < count; i++) {
        results.push(generateOfflineName(culture, usage));
      }
      setGeneratedNames(results);
      setIsGenerating(false);
      setStatusMessage('✓ Offline Forge complete. Highly stable nomenclature recovered.');
    }, 400);
  };

  const handleAIGenerate = async () => {
    if (!apiKey) {
      setStatusMessage('⚠️ API Key not configured. Using offline generator.');
      handleOfflineForge();
      return;
    }

    setIsGenerating(true);
    setStatusMessage(null);
    setSavedIndexes(new Set());

    // Deduce clean base URL
    const baseUrl = apiEndpoint.endsWith('/chat/completions')
      ? apiEndpoint.replace(/\/chat\/completions$/, '')
      : apiEndpoint;

    try {
      const results = await generateNamesFromAI(
        { culture, usage, count, contextPrompt },
        apiKey,
        baseUrl,
        apiModel
      );
      setGeneratedNames(results);
      setStatusMessage(`✓ Recovered ${results.length} coherent names from AI Nomenclator.`);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`✗ Nomenclator sync failed. Falling back to local databases. Error: ${err.message || err}`);
      // Fallback
      const results: Omit<GeneratedName, 'id' | 'createdAt'>[] = [];
      for (let i = 0; i < count; i++) {
        results.push(generateOfflineName(culture, usage));
      }
      setGeneratedNames(results);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveName = (index: number) => {
    const item = generatedNames[index];
    if (item) {
      onSave(item);
      setSavedIndexes(prev => {
        const next = new Set(prev);
        next.add(index);
        return next;
      });
    }
  };

  const handleSaveAll = () => {
    generatedNames.forEach((item, index) => {
      if (!savedIndexes.has(index)) {
        onSave(item);
      }
    });
    setSavedIndexes(new Set(generatedNames.map((_, i) => i)));
  };

  // Color mapping based on culture profile for card borders and glows
  const getCultureGlow = (culture: string) => {
    switch (culture) {
      case 'Welsh': return 'shadow-[0_0_15px_rgba(34,211,238,0.08)] border-cyan-900/40';
      case 'Norse': return 'shadow-[0_0_15px_rgba(129,140,248,0.08)] border-indigo-900/40';
      case 'Gaelic': return 'shadow-[0_0_15px_rgba(52,211,153,0.08)] border-emerald-900/40';
      case 'Egyptian': return 'shadow-[0_0_15px_rgba(251,191,36,0.08)] border-amber-900/40';
      default: return 'border-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Control Panel */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Culture Selector */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Culture Profile</label>
            <select
              value={culture}
              onChange={(e) => setCulture(e.target.value as CultureProfile)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:border-amber-500 outline-none transition-all cursor-pointer font-medium"
            >
              <option value="Welsh">Welsh Inspiration</option>
              <option value="Norse">Norse Inspiration</option>
              <option value="Gaelic">Gaelic Inspiration</option>
              <option value="Egyptian">Egyptian Inspiration</option>
            </select>
          </div>

          {/* Usage Selector */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Usage Category</label>
            <select
              value={usage}
              onChange={(e) => setUsage(e.target.value as NameUsage)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:border-amber-500 outline-none transition-all cursor-pointer font-medium"
            >
              <option value="person">Person (NPC/Character)</option>
              <option value="place">Place (District/District Locus)</option>
              <option value="institution">Institution (Guild/Tribunal)</option>
              <option value="office">Office (Civil Ministry/Bureau)</option>
              <option value="threat">Threat (Rupture/Hazard)</option>
              <option value="ritual">Ritual (Stability Working)</option>
              <option value="artifact">Artifact (Locus Core/Echo)</option>
              <option value="custom">Custom (Tradition/Tavern)</option>
            </select>
          </div>

          {/* Count Selector */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Forge Count</label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:border-amber-500 outline-none transition-all cursor-pointer font-medium"
            >
              <option value={1}>1 Name</option>
              <option value={3}>3 Names</option>
              <option value={5}>5 Names</option>
              <option value={8}>8 Names</option>
            </select>
          </div>

          {/* Context / Prompt Field */}
          <div className="md:col-span-4 space-y-2">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Thematic Context (Optional)</label>
            <input
              type="text"
              value={contextPrompt}
              onChange={(e) => setContextPrompt(e.target.value)}
              placeholder="e.g. iron mines, blind keeper, salt flat"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-amber-500 outline-none transition-all"
            />
          </div>

        </div>

        {/* Forge Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-800/80 flex-wrap">
          <button
            onClick={handleOfflineForge}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-3 text-sm font-medium bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 rounded-xl transition-all disabled:opacity-50"
            title="Generate names instantly from curated offline databases"
          >
            <WifiOff size={16} className="text-slate-400" />
            Offline Swift Forge
          </button>

          <button
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 text-sm font-bold bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl shadow-lg hover:shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {isGenerating ? <Activity size={16} className="animate-spin text-slate-950" /> : <Sparkles size={16} className="text-slate-950" />}
            {isGenerating ? 'Synthesizing...' : 'Forge with AI Coherence'}
          </button>
        </div>
      </div>

      {/* Generation Status Alert Banner */}
      {statusMessage && (
        <div className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
          statusMessage.includes('✓') 
            ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30' 
            : statusMessage.includes('⚠️')
              ? 'bg-amber-950/20 text-amber-400 border-amber-900/30'
              : 'bg-red-950/20 text-red-400 border-red-900/30'
        }`}>
          <span>{statusMessage}</span>
          {generatedNames.length > 0 && savedIndexes.size < generatedNames.length && (
            <button
              onClick={handleSaveAll}
              className="text-xs bg-slate-900 hover:bg-slate-950 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              Save All to Vault
            </button>
          )}
        </div>
      )}

      {/* Grid List of Generated Names */}
      {generatedNames.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {generatedNames.map((item, index) => {
            const isSaved = savedIndexes.has(index);
            return (
              <div
                key={index}
                className={`bg-slate-900/50 backdrop-blur-sm border rounded-xl p-5 hover:translate-y-[-2px] transition-all duration-300 flex flex-col justify-between group ${getCultureGlow(item.cultureProfile)}`}
              >
                <div className="space-y-4">
                  {/* Top Badges & Actions */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded border border-cyan-800/40 bg-cyan-950/20 text-cyan-400">
                        {item.cultureProfile}
                      </span>
                      <span className="text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded border border-purple-800/40 bg-purple-950/20 text-purple-400">
                        {item.usage}
                      </span>
                    </div>

                    <button
                      onClick={() => handleSaveName(index)}
                      disabled={isSaved}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        isSaved
                          ? 'bg-emerald-950/10 text-emerald-400 border-emerald-900/30 cursor-default'
                          : 'bg-slate-950 hover:bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {isSaved ? <Check size={12} /> : <Plus size={12} />}
                      {isSaved ? 'Archived' : 'Save Vault'}
                    </button>
                  </div>

                  {/* Display Format: Name, Pronunciation, Short description */}
                  <div className="space-y-1">
                    <h3 className="text-2xl font-cinzel font-semibold text-slate-100 tracking-wide">
                      {item.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-mono text-amber-500 font-bold uppercase tracking-widest bg-amber-950/20 px-2 py-0.5 rounded border border-amber-900/30 flex items-center gap-1">
                        <Volume2 size={10} /> {item.phonetic}
                      </span>
                      {item.shortMeaning && (
                        <span className="text-xs text-slate-400 italic">
                          ({item.shortMeaning})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Public Description */}
                  {item.publicDescription ? (
                    <p className="text-sm text-slate-300 leading-relaxed font-inter">
                      {item.publicDescription}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No description provided.</p>
                  )}

                  {/* Optional Technical IPA / Internal Notes under Nomenclator Detail Mode */}
                  {detailMode && (
                    <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3 animation-fade-in">
                      {item.ipa && (
                        <div className="space-y-1 bg-slate-950/40 p-2 rounded border border-slate-800/50">
                          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                            <Globe size={10} /> Technical IPA Spelling
                          </span>
                          <p className="text-xs font-mono text-cyan-400 pl-4">
                            /{item.ipa}/
                          </p>
                        </div>
                      )}

                      {item.internalNote && (
                        <div className="space-y-1 bg-rose-950/10 p-2.5 rounded border border-rose-900/20">
                          <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1 uppercase tracking-wider">
                            <FileText size={10} /> Internal Dev/GM Ledger
                          </span>
                          <p className="text-xs text-rose-300/90 leading-normal pl-4 font-inter">
                            {item.internalNote}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
