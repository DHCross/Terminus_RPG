import { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Archive,
  Plus,
  Check,
  Trash2,
  Edit2,
  Save,
  Download,
  BookOpen,
  Users,
  Layers,
  Activity,
  WifiOff,
  Copy,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertTriangle,
  Flame,
  Search,
  Compass,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { generateAdventureOutline } from '../../../settings/packs/terminus/ai';
import { useAdventureStorage } from './useAdventureStorage';
import { exportAdventureToMarkdown } from './exportAdventure';
import { sampleAdventureOutline } from './sampleAdventure';
import type { AdventureOutline, NPCProfile, MinorNPC, ThreatProfile, MinorThreat, EncounterElement } from './types';

// API configuration
const apiKey = import.meta.env.VITE_AI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";
const apiEndpoint = import.meta.env.VITE_AI_ENDPOINT || "https://api.deepseek.com/chat/completions";
const apiModel = import.meta.env.VITE_AI_MODEL || "deepseek-chat";

export function AdventureWorkbench() {
  const [tab, setTab] = useState<'forge' | 'vault'>('forge');
  const { adventures, saveAdventure, deleteAdventure } = useAdventureStorage();

  // Form parameters
  const [premise, setPremise] = useState('');
  const [structure, setStructure] = useState<'dungeon' | 'mystery' | 'fights' | 'survival' | 'intrigue'>('mystery');
  const [culture, setCulture] = useState<'Welsh' | 'Norse' | 'Gaelic' | 'Egyptian' | 'Other'>('Welsh');
  const [playerProgression, setPlayerProgression] = useState('Levels 2-3, 3-4 hours');
  const [campaignContext, setCampaignContext] = useState('Standard Responder Operations');
  const [coreActivity, setCoreActivity] = useState('Responders sent into districts where reality anchors are failing to stabilize the local routine.');

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Active work outline
  const [activeOutline, setActiveOutline] = useState<Omit<AdventureOutline, 'id' | 'createdAt'> & { id?: string } | null>(null);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  // Vault state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStructure, setFilterStructure] = useState<string>('All');
  const [viewingSavedId, setViewingSavedId] = useState<string | null>(null);

  // Fill in active outline if viewing a saved one
  const handleViewSaved = (adventure: AdventureOutline) => {
    setActiveOutline(adventure);
    setViewingSavedId(adventure.id);
    setEditMode(false);
    setTab('forge');
  };

  const handleCreateNew = () => {
    setActiveOutline(null);
    setViewingSavedId(null);
    setEditMode(false);
    setPremise('');
  };

  // Offline fallback or sample loader
  const handleOfflineSwiftForge = () => {
    setIsGenerating(true);
    setStatusMessage('Restoring pre-compiled coherent anchor data...');
    setTimeout(() => {
      setActiveOutline(sampleAdventureOutline);
      setViewingSavedId(null);
      setEditMode(false);
      setIsGenerating(false);
      setStatusMessage('✓ Loaded highly stable offline template adventure.');
    }, 500);
  };

  const handleAIForge = async () => {
    if (!apiKey) {
      setStatusMessage('⚠️ API Key not configured. Using offline swift forge.');
      handleOfflineSwiftForge();
      return;
    }

    setIsGenerating(true);
    setStatusMessage('Contacting the Coherence Engine. Adjusting district boundaries...');
    
    // Clean base URL
    const baseUrl = apiEndpoint.endsWith('/chat/completions')
      ? apiEndpoint.replace(/\/chat\/completions$/, '')
      : apiEndpoint;

    try {
      const outline = await generateAdventureOutline(
        { premise, structure, culture, playerProgression, campaignContext, coreActivity },
        apiKey,
        baseUrl,
        apiModel
      );
      setActiveOutline(outline);
      setViewingSavedId(null);
      setEditMode(false);
      setStatusMessage('✓ Synthesized complete, story-latent adventure outline successfully.');
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`✗ Synthesis failed. Falling back to offline template. Error: ${err.message || err}`);
      setActiveOutline(sampleAdventureOutline);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToVault = () => {
    if (!activeOutline) return;
    const saved = saveAdventure({
      ...activeOutline,
      id: viewingSavedId || undefined
    });
    setViewingSavedId(saved.id);
    setActiveOutline(saved);
    setSaveMessage(`✓ "${saved.title}" securely archived in the Adventure Vault.`);
    window.setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleCopyMarkdown = () => {
    if (!activeOutline) return;
    
    // Add dummy id/createdAt for export compatibility
    const fullAdventure: AdventureOutline = {
      ...activeOutline,
      id: viewingSavedId || 'temp-id',
      createdAt: new Date().toISOString()
    };

    const markdownText = exportAdventureToMarkdown(fullAdventure);
    navigator.clipboard.writeText(markdownText).then(() => {
      setCopiedMarkdown(true);
      window.setTimeout(() => setCopiedMarkdown(false), 2000);
    });
  };

  const premiseSuggestions = [
    {
      title: "Bleeding Ink",
      premise: "An administrative ledger in a quiet municipal office is writing fatal civil sentences that automatically execute themselves on the citizenry, erasing their homes.",
      structure: "mystery",
      culture: "Welsh"
    },
    {
      title: "Repeating Tolls",
      premise: "A massive brass lighthouse's foghorn is sounding for ships that crashed sixty years ago, and drawing current travelers into past temporal loops.",
      structure: "dungeon",
      culture: "Norse"
    },
    {
      title: "Liquid Memories",
      premise: "A harbor town's well water has turned to warm, oily ink. Drinking it grants forbidden knowledge of long-lost lineages but rots the current year's memories.",
      structure: "intrigue",
      culture: "Gaelic"
    },
    {
      title: "The Silent Silt Wards",
      premise: "The silt-walls surrounding a plague fortress are slowly shifting inwards, echoing rules that restrict the movement of iron weapons or metal gears.",
      structure: "survival",
      culture: "Egyptian"
    }
  ];

  // Filtering vault adventures
  const filteredAdventures = useMemo(() => {
    return adventures.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.originationLocale.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStructure = filterStructure === 'All' || a.plot.act1.endpoint /* dummy checker */ ? true : true; // structure archetypes check
      
      return matchesSearch;
    });
  }, [adventures, searchQuery, filterStructure]);

  const structureColors = {
    dungeon: 'bg-rose-950/20 text-rose-400 border-rose-900/30',
    mystery: 'bg-cyan-950/20 text-cyan-400 border-cyan-900/30',
    fights: 'bg-amber-950/20 text-amber-400 border-amber-900/30',
    survival: 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30',
    intrigue: 'bg-purple-950/20 text-purple-400 border-purple-900/30'
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-6rem)]">
      
      {/* Tab bar */}
      <div className="tab-bar flex justify-between items-center bg-slate-900 border-b border-slate-800 px-6 py-2">
        <div className="flex gap-2">
          <button
            onClick={() => setTab('forge')}
            className={`tab-button ${tab === 'forge' ? 'active' : ''}`}
          >
            <Sparkles size={16} /> Adventure Forge
          </button>
          <button
            onClick={() => setTab('vault')}
            className={`tab-button ${tab === 'vault' ? 'active' : ''}`}
          >
            <Archive size={16} /> Adventure Vault ({adventures.length})
          </button>
        </div>
        
        {activeOutline && tab === 'forge' && (
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-950/20 border border-cyan-900/30 px-3 py-1.5 rounded-lg transition-all"
          >
            <Plus size={14} /> New Forge
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* Banner Branding */}
        <div className="panel max-w-5xl mx-auto mb-6 bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
          <span className="eyebrow flex items-center gap-1.5 text-xs text-amber-500 font-bold uppercase tracking-widest">
            <Compass size={12} /> The Storytellers Guideway
          </span>
          <h2 className="text-2xl font-cinzel font-semibold text-slate-100 mt-1">
            Terminus Adventure Architect
          </h2>
          <p className="muted text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Reality is story-latent, composed of paths, wills, and triggers. Avoid rigid scripts or lore dumping. Use this engine to architect responsive districts, populate them with active NPC wills, and map triggered tabletop encounters.
          </p>

          {saveMessage && (
            <div className="mt-4 p-3 bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 rounded-xl text-xs font-semibold animation-fade-in flex justify-between items-center">
              <span>{saveMessage}</span>
              <button onClick={() => setTab('vault')} className="underline hover:text-emerald-200">
                Open Vault
              </button>
            </div>
          )}
        </div>

        {tab === 'forge' && (
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Outline generator inputs form (shown when no active outline or when forcing a regenerate) */}
            {!activeOutline && !isGenerating && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-6">
                <h3 className="text-lg font-cinzel font-semibold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" /> Forge a New Operation
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Premise field */}
                  <div className="md:col-span-12 space-y-2">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                      Adventure Premise or Seed
                    </label>
                    <textarea
                      value={premise}
                      onChange={(e) => setPremise(e.target.value)}
                      placeholder="e.g. Responders investigate an old library whose archives are slowly dissolving, causing the surrounding streets to vanish from history."
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:border-amber-500 outline-none transition-all resize-none"
                    />
                    
                    {/* Prompt suggestions chips */}
                    <div className="pt-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
                        Need Inspiration? Pick a thematic seed:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {premiseSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setPremise(suggestion.premise);
                              setStructure(suggestion.structure as any);
                              setCulture(suggestion.culture as any);
                            }}
                            className="text-xs bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl transition-all font-medium text-left max-w-xs truncate"
                            title={suggestion.premise}
                          >
                            ⭐ {suggestion.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Archetype select */}
                  <div className="md:col-span-4 space-y-2">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                      Gameplay Archetype Loop
                    </label>
                    <select
                      value={structure}
                      onChange={(e) => setStructure(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:border-amber-500 outline-none transition-all cursor-pointer font-medium"
                    >
                      <option value="mystery">The Mystery (Clue-driven investigation)</option>
                      <option value="dungeon">The Dungeon (Geography-driven exploration)</option>
                      <option value="fights">The Chain of Fights (Momentum-driven confrontations)</option>
                      <option value="survival">Survival (Threat-driven defense)</option>
                      <option value="intrigue">Intrigue (Power-driven political vying)</option>
                    </select>
                  </div>

                  {/* Culture profile select */}
                  <div className="md:col-span-4 space-y-2">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                      Naming & Lore Culture
                    </label>
                    <select
                      value={culture}
                      onChange={(e) => setCulture(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:border-amber-500 outline-none transition-all cursor-pointer font-medium"
                    >
                      <option value="Welsh">Welsh Inspiration (Rhudd-Sarn, Maerwyn)</option>
                      <option value="Norse">Norse Inspiration (Valdr-Vard, Vardrek)</option>
                      <option value="Gaelic">Gaelic Inspiration (Baird, Aodh)</option>
                      <option value="Egyptian">Egyptian Inspiration (Khamat-Maat, Sithny)</option>
                      <option value="Other">Other Inspiration</option>
                    </select>
                  </div>

                  {/* Level & Playtime */}
                  <div className="md:col-span-4 space-y-2">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                      Player Level Range & Playtime
                    </label>
                    <input
                      type="text"
                      value={playerProgression}
                      onChange={(e) => setPlayerProgression(e.target.value)}
                      placeholder="e.g. Levels 2-3, 3-4 hours"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>

                  {/* Campaign context */}
                  <div className="md:col-span-6 space-y-2">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                      Campaign Context (Optional)
                    </label>
                    <input
                      type="text"
                      value={campaignContext}
                      onChange={(e) => setCampaignContext(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>

                  {/* Core activity */}
                  <div className="md:col-span-6 space-y-2">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                      Responders Core Activity (Goal premise)
                    </label>
                    <input
                      type="text"
                      value={coreActivity}
                      onChange={(e) => setCoreActivity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-800 flex-wrap">
                  <button
                    onClick={handleOfflineSwiftForge}
                    className="flex items-center gap-2 px-5 py-3 text-sm font-medium bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
                  >
                    <WifiOff size={16} className="text-slate-400" />
                    Offline Swift Forge
                  </button>

                  <button
                    onClick={handleAIForge}
                    disabled={!premise.trim()}
                    className="flex items-center gap-2 px-6 py-3 text-sm font-bold bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl shadow-lg hover:shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles size={16} className="text-slate-950" />
                    Forge with AI Coherence
                  </button>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isGenerating && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-16 text-center space-y-4 max-w-xl mx-auto shadow-2xl backdrop-blur-md">
                <Activity size={40} className="animate-spin text-amber-500 mx-auto" />
                <h4 className="text-lg font-cinzel font-semibold text-slate-200">Revising Regional Constants</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  {statusMessage || 'Aligning timelines, anchoring NPC wills, and writing active encounter complications...'}
                </p>
              </div>
            )}

            {/* Generated Outline Output */}
            {activeOutline && !isGenerating && (
              <div className="space-y-6">
                
                {/* Control Actions Bar */}
                <div className="flex justify-between items-center bg-slate-900/80 border border-slate-800/80 p-3.5 rounded-2xl backdrop-blur-md sticky top-0 z-10 shadow-lg">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border transition-all ${
                        editMode
                          ? 'bg-amber-950/20 text-amber-400 border-amber-800/40'
                          : 'bg-slate-950 hover:bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      <Edit2 size={13} />
                      {editMode ? 'Disable Edit Mode' : 'Edit Outline'}
                    </button>
                    
                    <button
                      onClick={handleSaveToVault}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl shadow transition-all hover:scale-[1.01]"
                    >
                      <Save size={13} />
                      Save Vault Record
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyMarkdown}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 px-4 py-2 rounded-xl transition-all"
                    >
                      {copiedMarkdown ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      {copiedMarkdown ? 'Copied!' : 'Export GFM Markdown'}
                    </button>
                  </div>
                </div>

                {/* Adventure Details Layout */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-inner backdrop-blur-sm">
                  
                  {/* TITLE & HEADER BASICS */}
                  <div className="border-b border-slate-800/80 pb-6 space-y-4">
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-400">
                          Terminus RPG Adventure Outline
                        </span>
                        {editMode ? (
                          <input
                            type="text"
                            value={activeOutline.title}
                            onChange={(e) => setActiveOutline({ ...activeOutline, title: e.target.value })}
                            className="text-3xl font-cinzel font-bold text-slate-100 bg-slate-950 border border-slate-800 rounded-xl p-2 w-full mt-2 focus:border-amber-500 outline-none"
                          />
                        ) : (
                          <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-slate-100 tracking-wide mt-2">
                            {activeOutline.title}
                          </h1>
                        )}
                      </div>

                      <span className={`text-xs uppercase font-extrabold tracking-wider px-3.5 py-1.5 rounded-xl border ${structureColors[structure as keyof typeof structureColors] || 'border-slate-800 bg-slate-950'}`}>
                        {structure.toUpperCase()} LOOP
                      </span>
                    </div>

                    {/* Summary Box */}
                    <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
                      <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider block mb-1">Synopsis & Premise</span>
                      {editMode ? (
                        <textarea
                          value={activeOutline.summary}
                          onChange={(e) => setActiveOutline({ ...activeOutline, summary: e.target.value })}
                          rows={3}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-200 focus:border-amber-500 outline-none resize-none"
                        />
                      ) : (
                        <p className="text-slate-300 text-sm leading-relaxed font-inter italic">
                          "{activeOutline.summary}"
                        </p>
                      )}
                    </div>

                    {/* Meta information row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-900">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Real World Date</span>
                        {editMode ? (
                          <input
                            type="text"
                            value={activeOutline.realWorldDate}
                            onChange={(e) => setActiveOutline({ ...activeOutline, realWorldDate: e.target.value })}
                            className="bg-slate-950 border border-slate-850 rounded p-1 w-full text-xs text-slate-300"
                          />
                        ) : (
                          <span className="font-semibold text-slate-300 flex items-center gap-1"><Calendar size={12} /> {activeOutline.realWorldDate}</span>
                        )}
                      </div>

                      <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-900">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">In-Game Date</span>
                        {editMode ? (
                          <input
                            type="text"
                            value={activeOutline.campaignDate}
                            onChange={(e) => setActiveOutline({ ...activeOutline, campaignDate: e.target.value })}
                            className="bg-slate-950 border border-slate-850 rounded p-1 w-full text-xs text-slate-300"
                          />
                        ) : (
                          <span className="font-semibold text-slate-300 flex items-center gap-1"><Calendar size={12} /> {activeOutline.campaignDate}</span>
                        )}
                      </div>

                      <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-900 col-span-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Progression & Playtime</span>
                        {editMode ? (
                          <input
                            type="text"
                            value={activeOutline.playerProgression}
                            onChange={(e) => setActiveOutline({ ...activeOutline, playerProgression: e.target.value })}
                            className="bg-slate-950 border border-slate-850 rounded p-1 w-full text-xs text-slate-300"
                          />
                        ) : (
                          <span className="font-semibold text-slate-300">{activeOutline.playerProgression}</span>
                        )}
                      </div>

                      <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-900 col-span-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Campaign Context</span>
                        {editMode ? (
                          <input
                            type="text"
                            value={activeOutline.campaignContext}
                            onChange={(e) => setActiveOutline({ ...activeOutline, campaignContext: e.target.value })}
                            className="bg-slate-950 border border-slate-850 rounded p-1 w-full text-xs text-slate-300"
                          />
                        ) : (
                          <span className="font-semibold text-slate-300 truncate block">{activeOutline.campaignContext}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* IN-GAME SETTING */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-cinzel font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
                      <MapPin size={18} className="text-cyan-500" /> Origination Locale & Themes
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      
                      {/* Locale details */}
                      <div className="md:col-span-8 space-y-4 bg-slate-950/20 p-5 rounded-2xl border border-slate-800/40">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5">Starting Location</span>
                          {editMode ? (
                            <input
                              type="text"
                              value={activeOutline.originationLocale.name}
                              onChange={(e) => setActiveOutline({
                                ...activeOutline,
                                originationLocale: { ...activeOutline.originationLocale, name: e.target.value }
                              })}
                              className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-sm text-slate-200"
                            />
                          ) : (
                            <h4 className="text-base font-cinzel font-semibold text-slate-200">{activeOutline.originationLocale.name}</h4>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5">Physical Description</span>
                          {editMode ? (
                            <textarea
                              value={activeOutline.originationLocale.description}
                              onChange={(e) => setActiveOutline({
                                ...activeOutline,
                                originationLocale: { ...activeOutline.originationLocale, description: e.target.value }
                              })}
                              rows={2}
                              className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-sm text-slate-200"
                            />
                          ) : (
                            <p className="text-xs text-slate-300 font-inter leading-relaxed">{activeOutline.originationLocale.description}</p>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5">Cultural & Geographical Details</span>
                          {editMode ? (
                            <textarea
                              value={activeOutline.originationLocale.details}
                              onChange={(e) => setActiveOutline({
                                ...activeOutline,
                                originationLocale: { ...activeOutline.originationLocale, details: e.target.value }
                              })}
                              rows={2}
                              className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-sm text-slate-200"
                            />
                          ) : (
                            <p className="text-xs text-slate-300 font-inter leading-relaxed">{activeOutline.originationLocale.details}</p>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5">Ongoing Local Tensions</span>
                          {editMode ? (
                            <textarea
                              value={activeOutline.originationLocale.tensions}
                              onChange={(e) => setActiveOutline({
                                ...activeOutline,
                                originationLocale: { ...activeOutline.originationLocale, tensions: e.target.value }
                              })}
                              rows={2}
                              className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-sm text-slate-200"
                            />
                          ) : (
                            <p className="text-xs text-slate-300 font-inter leading-relaxed">{activeOutline.originationLocale.tensions}</p>
                          )}
                        </div>
                      </div>

                      {/* Theme details */}
                      <div className="md:col-span-4 space-y-4 flex flex-col justify-between">
                        <div className="bg-slate-950/20 p-5 rounded-2xl border border-slate-800/40 flex-1 space-y-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block mb-0.5">Primary Theme</span>
                            {editMode ? (
                              <input
                                type="text"
                                value={activeOutline.themes.primary}
                                onChange={(e) => setActiveOutline({
                                  ...activeOutline,
                                  themes: { ...activeOutline.themes, primary: e.target.value }
                                })}
                                className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-xs text-slate-200"
                              />
                            ) : (
                              <p className="text-sm font-semibold text-slate-200 font-cinzel">{activeOutline.themes.primary}</p>
                            )}
                          </div>

                          <div className="border-t border-slate-800/50 pt-3">
                            <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block mb-0.5">Secondary Theme</span>
                            {editMode ? (
                              <input
                                type="text"
                                value={activeOutline.themes.secondary}
                                onChange={(e) => setActiveOutline({
                                  ...activeOutline,
                                  themes: { ...activeOutline.themes, secondary: e.target.value }
                                })}
                                className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-xs text-slate-200"
                              />
                            ) : (
                              <p className="text-xs text-slate-300 font-inter">{activeOutline.themes.secondary}</p>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* MILIEU EVENTS */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-cinzel font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
                      <FileText size={18} className="text-purple-500" /> Milieu Events & Continuity
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      <div className="bg-slate-950/20 p-5 rounded-2xl border border-slate-800/40 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Past History / Anchoring Events</span>
                        {editMode ? (
                          <textarea
                            value={activeOutline.milieu.pastEvents}
                            onChange={(e) => setActiveOutline({
                              ...activeOutline,
                              milieu: { ...activeOutline.milieu, pastEvents: e.target.value }
                            })}
                            rows={3}
                            className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-200"
                          />
                        ) : (
                          <p className="text-xs text-slate-300 leading-relaxed font-inter">{activeOutline.milieu.pastEvents}</p>
                        )}
                      </div>

                      <div className="bg-slate-950/20 p-5 rounded-2xl border border-slate-800/40 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Ongoing Regional Conflict</span>
                        {editMode ? (
                          <textarea
                            value={activeOutline.milieu.ongoingEvents}
                            onChange={(e) => setActiveOutline({
                              ...activeOutline,
                              milieu: { ...activeOutline.milieu, ongoingEvents: e.target.value }
                            })}
                            rows={3}
                            className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-200"
                          />
                        ) : (
                          <p className="text-xs text-slate-300 leading-relaxed font-inter">{activeOutline.milieu.ongoingEvents}</p>
                        )}
                      </div>

                      <div className="bg-slate-950/20 p-5 rounded-2xl border border-slate-800/40 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-amber-500 block">Potential Outcomes / Consequences</span>
                        {editMode ? (
                          <textarea
                            value={activeOutline.milieu.consequences}
                            onChange={(e) => setActiveOutline({
                              ...activeOutline,
                              milieu: { ...activeOutline.milieu, consequences: e.target.value }
                            })}
                            rows={3}
                            className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-xs text-slate-200"
                          />
                        ) : (
                          <p className="text-xs text-slate-300 leading-relaxed font-inter">{activeOutline.milieu.consequences}</p>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* ACTIVE NPCS LEDGER */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-cinzel font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
                      <Users size={18} className="text-amber-500" /> Non-Player Character (NPC) Ledger
                    </h3>

                    {/* Major NPCs list */}
                    <div className="space-y-3">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Major NPC Profiles (Social Anchor & Active Wills)</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {activeOutline.npcs.major.map((npc, idx) => (
                          <div key={idx} className="bg-slate-950/30 border border-slate-850 rounded-2xl p-5 space-y-4">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                {editMode ? (
                                  <input
                                    type="text"
                                    value={npc.name}
                                    onChange={(e) => {
                                      const nextMajor = [...activeOutline.npcs.major];
                                      nextMajor[idx] = { ...npc, name: e.target.value };
                                      setActiveOutline({ ...activeOutline, npcs: { ...activeOutline.npcs, major: nextMajor } });
                                    }}
                                    className="bg-slate-950 border border-slate-800 rounded p-1 text-sm text-slate-200"
                                  />
                                ) : (
                                  <h4 className="text-base font-cinzel font-semibold text-slate-100">{npc.name}</h4>
                                )}
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  {npc.gender} {npc.race} | {npc.class}
                                </span>
                              </div>

                              <span className="text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded border border-cyan-800/40 bg-cyan-950/20 text-cyan-400">
                                {npc.role.toUpperCase()}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-900/60">
                              <div>
                                <span className="text-[9px] uppercase font-bold text-slate-500 block">Social Class & Stand</span>
                                <span className="text-slate-300 font-semibold">{npc.socialClass}</span>
                              </div>
                              <div>
                                <span className="text-[9px] uppercase font-bold text-slate-500 block">Affiliations</span>
                                <span className="text-slate-300 font-semibold">{npc.affiliations}</span>
                              </div>
                            </div>

                            <div className="text-xs space-y-2">
                              <div>
                                <span className="text-[9px] uppercase font-bold text-slate-500 block">Active Intention / Will</span>
                                <p className="text-slate-300 font-inter mt-0.5 leading-normal">{npc.goals}</p>
                              </div>
                              <div>
                                <span className="text-[9px] uppercase font-bold text-slate-500 block">Relationship to Responders</span>
                                <p className="text-slate-300 font-inter mt-0.5 leading-normal">{npc.relationship}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Minor NPCs */}
                    <div className="bg-slate-950/20 p-5 rounded-2xl border border-slate-800/40 space-y-3">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Minor NPC Profiles (Purpose-Anchored)</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeOutline.npcs.minor.map((npc, idx) => (
                          <div key={idx} className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 flex justify-between gap-4">
                            <div className="space-y-1">
                              <h5 className="text-xs font-semibold text-slate-200 font-cinzel">{npc.name}</h5>
                              <p className="text-xs text-slate-400 leading-normal font-inter">{npc.description}</p>
                            </div>
                            <span className="text-[9px] uppercase font-bold text-amber-500 bg-amber-950/10 border border-amber-900/20 px-2 py-0.5 rounded self-start h-auto">
                              Purpose: {npc.purpose}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* THREATS & MONSTERS */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-cinzel font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
                      <Flame size={18} className="text-rose-500" /> Threat & Monster Register
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      
                      {/* Major threats */}
                      <div className="md:col-span-8 space-y-4 bg-slate-950/20 p-5 rounded-2xl border border-slate-800/40">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Major Threats & Manifestations</span>
                        
                        <div className="space-y-4">
                          {activeOutline.threats.major.map((threat, idx) => (
                            <div key={idx} className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 space-y-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-200 font-cinzel">{threat.name}</h4>
                                  <span className="text-[10px] text-slate-500">{threat.type} {threat.class ? `| ${threat.class}` : ''}</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Thematic Narrative Role</span>
                                  <p className="text-slate-300 font-inter mt-0.5">{threat.role}</p>
                                </div>
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Goals & Drives</span>
                                  <p className="text-slate-300 font-inter mt-0.5">{threat.goals}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Minor threats */}
                      <div className="md:col-span-4 bg-slate-950/20 p-5 rounded-2xl border border-slate-800/40 space-y-4">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Minor Encounters Threats</span>
                        
                        <div className="space-y-3">
                          {activeOutline.threats.minor.map((threat, idx) => (
                            <div key={idx} className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 space-y-1">
                              <div className="flex justify-between items-center">
                                <h5 className="text-xs font-semibold text-slate-200 font-cinzel">{threat.name}</h5>
                                <span className="text-[9px] uppercase text-rose-400 font-bold">{threat.role}</span>
                              </div>
                              <p className="text-xs text-slate-400 font-inter leading-normal">{threat.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* STORY LATENT PLOT ARCHITECTURE */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-cinzel font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
                      <Layers size={18} className="text-cyan-500" /> Story-Latent Plot Architecture
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Act 1 */}
                      <div className="bg-slate-950/30 border border-slate-850 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded bg-cyan-950/20 text-cyan-400 border border-cyan-900/30">
                            Act 1: Introduction
                          </span>
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-bold text-slate-500 block">Inciting Incident</span>
                            <p className="text-xs text-slate-300 font-inter leading-relaxed">{activeOutline.plot.act1.incitingIncident}</p>
                          </div>
                          <div className="space-y-1 border-t border-slate-900/60 pt-2">
                            <span className="text-[9px] uppercase font-bold text-slate-500 block">Primary Endpoint</span>
                            <p className="text-xs text-slate-300 font-inter leading-relaxed">{activeOutline.plot.act1.endpoint}</p>
                          </div>
                        </div>

                        <div className="border-t border-slate-900/60 pt-3 mt-3">
                          <span className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Complications / Turning Points</span>
                          <ul className="text-xs text-slate-400 space-y-1 pl-4 list-disc font-inter">
                            {activeOutline.plot.act1.turningPoints.map((tp, idx) => (
                              <li key={idx}>{tp}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Act 2 */}
                      <div className="bg-slate-950/30 border border-slate-850 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded bg-purple-950/20 text-purple-400 border border-purple-900/30">
                            Act 2: Rising Action
                          </span>
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-bold text-slate-500 block">Secondary Obstacle / Twists</span>
                            <p className="text-xs text-slate-300 font-inter leading-relaxed">{activeOutline.plot.act2.incitingIncident}</p>
                          </div>
                          <div className="space-y-1 border-t border-slate-900/60 pt-2">
                            <span className="text-[9px] uppercase font-bold text-slate-500 block">Secondary Endpoint</span>
                            <p className="text-xs text-slate-300 font-inter leading-relaxed">{activeOutline.plot.act2.endpoint}</p>
                          </div>
                        </div>

                        <div className="border-t border-slate-900/60 pt-3 mt-3">
                          <span className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Decisions / Turning Points</span>
                          <ul className="text-xs text-slate-400 space-y-1 pl-4 list-disc font-inter">
                            {activeOutline.plot.act2.turningPoints.map((tp, idx) => (
                              <li key={idx}>{tp}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Act 3 */}
                      <div className="bg-slate-950/30 border border-slate-850 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded bg-amber-950/20 text-amber-400 border border-amber-900/30">
                            Act 3: Climax & End
                          </span>
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-bold text-slate-500 block">Tertiary Climax Incident</span>
                            <p className="text-xs text-slate-300 font-inter leading-relaxed">{activeOutline.plot.act3.incitingIncident}</p>
                          </div>
                          <div className="space-y-1 border-t border-slate-900/60 pt-2">
                            <span className="text-[9px] uppercase font-bold text-slate-500 block">Open Endpoint Resolution</span>
                            <p className="text-xs text-slate-300 font-inter leading-relaxed">{activeOutline.plot.act3.endpoint}</p>
                          </div>
                        </div>

                        <div className="border-t border-slate-900/60 pt-3 mt-3">
                          <span className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Key Player Outcomes</span>
                          <ul className="text-xs text-slate-400 space-y-1 pl-4 list-disc font-inter">
                            {activeOutline.plot.act3.turningPoints.map((tp, idx) => (
                              <li key={idx}>{tp}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* ACTIVE ENCOUNTERS GRID */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-cinzel font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
                      <Layers size={18} className="text-emerald-500" /> Active Table Encounters Grid
                    </h3>

                    <div className="grid grid-cols-1 gap-6">
                      {activeOutline.encounters.map((encounter, idx) => (
                        <div key={idx} className="bg-slate-950/30 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4 hover:translate-y-[-2px] transition-all duration-300">
                          
                          {/* Encounter Header */}
                          <div className="flex justify-between items-start gap-4 flex-wrap pb-3 border-b border-slate-900/80">
                            <div>
                              <h4 className="text-base font-cinzel font-bold text-slate-100">{encounter.name}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] uppercase font-extrabold tracking-wider bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                                  {encounter.type}
                                </span>
                                <span className="text-[9px] uppercase font-extrabold tracking-wider bg-emerald-950/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/30">
                                  {encounter.function}
                                </span>
                              </div>
                            </div>

                            <div className="text-right text-xs">
                              <span className="text-[9px] uppercase font-bold text-slate-500 block">Encounter Location</span>
                              <span className="font-semibold text-slate-300 font-cinzel">{encounter.location}</span>
                            </div>
                          </div>

                          {/* Encounter Narrative & Goals */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-inter pt-1">
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-bold text-slate-500 block">Significance / Associated Goal</span>
                              <p className="text-slate-300 leading-relaxed">{encounter.goal}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-bold text-slate-500 block">Plot Mystery Link</span>
                              <p className="text-slate-300 leading-relaxed">{encounter.plotElement}</p>
                            </div>
                          </div>

                          {/* Concrete Description Box */}
                          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900/80 text-xs">
                            <span className="text-[9px] uppercase font-bold text-cyan-400 block mb-1">Atmosphere & Concrete 3D Details</span>
                            <p className="text-slate-300 leading-relaxed font-inter font-light">
                              {encounter.description}
                            </p>
                          </div>

                          {/* Triggers & Stuck cues */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="bg-rose-950/10 border border-rose-950/30 p-4 rounded-xl space-y-1">
                              <span className="text-[9px] uppercase font-extrabold text-rose-400 flex items-center gap-1">
                                <AlertTriangle size={11} /> Bound Triggers (Player Actions)
                              </span>
                              <p className="text-rose-300/90 leading-relaxed font-inter">{encounter.boundTriggers}</p>
                            </div>

                            <div className="bg-cyan-950/10 border border-cyan-950/30 p-4 rounded-xl space-y-1">
                              <span className="text-[9px] uppercase font-extrabold text-cyan-400 flex items-center gap-1">
                                <Compass size={11} /> Unbound Triggers (GM Fallback/Stuck Cues)
                              </span>
                              <p className="text-cyan-300/90 leading-relaxed font-inter">{encounter.unboundTriggers}</p>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ADVENTURE GOALS & DILEMMAS */}
                  <div className="border-t border-slate-800/80 pt-6 space-y-4">
                    <h3 className="text-xl font-cinzel font-bold text-slate-200 flex items-center gap-2">
                      <AlertCircle size={18} className="text-amber-500" /> Operational Objectives & Moral Friction
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      <div className="space-y-4">
                        <div className="bg-slate-950/20 p-5 rounded-2xl border border-slate-800/40">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Primary Objective</span>
                          <p className="text-sm font-semibold text-slate-200 font-cinzel leading-relaxed">{activeOutline.goals.primary}</p>
                        </div>

                        <div className="bg-slate-950/20 p-5 rounded-2xl border border-slate-800/40">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Secondary Objectives</span>
                          <p className="text-xs text-slate-300 font-inter leading-relaxed">{activeOutline.goals.secondary}</p>
                        </div>
                      </div>

                      {/* Severe Moral Dilemma Callout */}
                      <div className="bg-amber-950/10 border border-amber-900/20 p-6 rounded-3xl space-y-3 flex flex-col justify-center">
                        <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 flex items-center gap-2">
                          <AlertTriangle size={15} /> Primary Moral Dilemma
                        </span>
                        <p className="text-sm text-amber-200 font-inter leading-relaxed italic font-light">
                          "{activeOutline.goals.moralDilemmas}"
                        </p>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* VAULT TAB */}
        {tab === 'vault' && (
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Search filter bar */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
              
              <div className="relative w-full md:flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search saved adventure titles, starting locations, or summaries..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:border-amber-500 outline-none transition-all"
                />
              </div>

              {/* Structure filter */}
              <div className="flex gap-2 items-center w-full md:w-auto">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Gameplay Loop</span>
                <select
                  value={filterStructure}
                  onChange={(e) => setFilterStructure(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-amber-500 outline-none cursor-pointer"
                >
                  <option value="All">All Structures</option>
                  <option value="mystery">Mystery</option>
                  <option value="dungeon">Dungeon</option>
                  <option value="fights">Chain of Fights</option>
                  <option value="survival">Survival</option>
                  <option value="intrigue">Intrigue</option>
                </select>
              </div>

            </div>

            {/* Empty state */}
            {filteredAdventures.length === 0 && (
              <div className="text-center py-16 px-4 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
                <Compass size={32} className="text-slate-600 mb-3 mx-auto" />
                <p className="text-slate-400 text-sm font-semibold">No adventure outlines saved</p>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  {adventures.length === 0
                    ? 'Use the Adventure Forge tab to generate a fully stable, table-playable outline, then archive it here.'
                    : 'Adjust your search queries to find matching vault records.'}
                </p>
              </div>
            )}

            {/* Vault Grid */}
            {filteredAdventures.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredAdventures.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleViewSaved(item)}
                    className="bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700/60 rounded-2xl p-5 hover:translate-y-[-2px] transition-all duration-300 cursor-pointer flex flex-col justify-between group shadow-lg"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[9px] uppercase font-mono text-slate-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
                              deleteAdventure(item.id);
                              if (viewingSavedId === item.id) {
                                handleCreateNew();
                              }
                            }
                          }}
                          className="text-slate-600 hover:text-red-400 p-1 hover:bg-slate-950/60 rounded-lg transition-all"
                          title="Purge record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-lg font-cinzel font-bold text-slate-100 tracking-wide group-hover:text-amber-500 transition-colors">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 block font-cinzel">
                          📍 {item.originationLocale.name} | {item.playerProgression}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 font-inter leading-relaxed line-clamp-3 italic">
                        "{item.summary}"
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-950/40 mt-4 text-[10px] uppercase font-bold">
                      <span className="text-slate-500">Theme: {item.themes.primary}</span>
                      <span className="text-cyan-400">Open Outline →</span>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
