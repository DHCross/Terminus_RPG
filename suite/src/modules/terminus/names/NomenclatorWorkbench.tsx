import { useState, useMemo } from 'react';
import { Sparkles, Archive, Search, Eye, EyeOff, Trash2, BookOpen } from 'lucide-react';
import { useNameStorage } from './useNameStorage';
import { NomenclatorGenerator } from './NomenclatorGenerator';
import { VaultNameCard } from './VaultNameCard';

export function NomenclatorWorkbench() {
  const [tab, setTab] = useState<'generator' | 'vault'>('generator');
  const { names, saveName, deleteName, clearVault } = useNameStorage();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Search and filter state for Vault
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCulture, setFilterCulture] = useState<string>('All');
  const [filterUsage, setFilterUsage] = useState<string>('All');

  // "Nomenclator Detail" mode (advanced pronunciation / developer notes toggle)
  const [detailMode, setDetailMode] = useState(false);

  const handleSave = (nameData: Omit<typeof names[0], 'id' | 'createdAt'>) => {
    const saved = saveName(nameData);
    setSaveMessage(`✓ "${saved.name}" registered to the Nomenclator Archive.`);
    window.setTimeout(() => setSaveMessage(null), 3000);
  };

  // Filtered vault names memo
  const filteredNames = useMemo(() => {
    return names.filter((n) => {
      const matchesSearch = 
        n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.phonetic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.shortMeaning && n.shortMeaning.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (n.publicDescription && n.publicDescription.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCulture = filterCulture === 'All' || n.cultureProfile === filterCulture;
      const matchesUsage = filterUsage === 'All' || n.usage === filterUsage;

      return matchesSearch && matchesCulture && matchesUsage;
    });
  }, [names, searchQuery, filterCulture, filterUsage]);

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-6rem)]">
      
      {/* Sub Header & Tabs */}
      <div className="tab-bar flex justify-between items-center bg-slate-900 border-b border-slate-800 px-6 py-2">
        <div className="flex gap-2">
          <button
            onClick={() => setTab('generator')}
            className={`tab-button ${tab === 'generator' ? 'active' : ''}`}
          >
            <Sparkles size={16} /> Nomenclator Forge
          </button>
          <button
            onClick={() => setTab('vault')}
            className={`tab-button ${tab === 'vault' ? 'active' : ''}`}
          >
            <Archive size={16} /> Archive Vault ({names.length})
          </button>
        </div>

        {/* Global Detail Mode Toggle */}
        <button
          onClick={() => setDetailMode(!detailMode)}
          className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
            detailMode
              ? 'bg-cyan-950/20 text-cyan-400 border-cyan-800/40 shadow-[0_0_10px_rgba(34,211,238,0.05)]'
              : 'bg-slate-950 hover:bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
          }`}
          title="Toggle advanced pronunciation (IPA) and developer-only lore/notes"
        >
          {detailMode ? <Eye size={14} /> : <EyeOff size={14} />}
          {detailMode ? 'Nomenclator Detail Active' : 'Nomenclator Detail Off'}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* Intro Branding Panel */}
        <div className="panel max-w-5xl mx-auto mb-6 bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <span className="eyebrow flex items-center gap-1.5 text-xs text-amber-500 font-bold uppercase tracking-widest">
                <BookOpen size={12} /> The Nomenclator Ledger
              </span>
              <h2 className="text-2xl font-cinzel font-semibold text-slate-100 mt-1">
                Tringad Nomenclature Registry
              </h2>
              <p className="muted text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Reality degrades where civic names and labels dissolve. Use this registry to forge stable names, trace their correct vocal pronunciations, and record lore tags to anchors of active districts.
              </p>
            </div>
            {names.length > 0 && tab === 'vault' && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to purge the local Nomenclator archive?')) {
                    clearVault();
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-950/10 border border-red-900/30 hover:border-red-900/50 px-3 py-2 rounded-xl transition-all"
              >
                <Trash2 size={13} /> Clear Archive
              </button>
            )}
          </div>
          
          {saveMessage && (
            <div className="mt-4 p-3 bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 rounded-xl text-xs font-semibold animation-fade-in flex justify-between items-center">
              <span>{saveMessage}</span>
              <button onClick={() => setTab('vault')} className="underline hover:text-emerald-200">
                Open Vault
              </button>
            </div>
          )}
        </div>

        {/* Generator Tab */}
        {tab === 'generator' && (
          <div className="max-w-5xl mx-auto">
            <NomenclatorGenerator onSave={handleSave} detailMode={detailMode} />
          </div>
        )}

        {/* Vault Tab */}
        {tab === 'vault' && (
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Search and Filters Bar */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
              
              {/* Search Field */}
              <div className="relative w-full md:flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search saved names, phonetic help, or description tags..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:border-amber-500 outline-none transition-all"
                />
              </div>

              {/* Culture Filter */}
              <div className="flex gap-2 items-center w-full md:w-auto">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Culture</span>
                <select
                  value={filterCulture}
                  onChange={(e) => setFilterCulture(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-amber-500 outline-none cursor-pointer"
                >
                  <option value="All">All Cultures</option>
                  <option value="Welsh">Welsh</option>
                  <option value="Norse">Norse</option>
                  <option value="Gaelic">Gaelic</option>
                  <option value="Egyptian">Egyptian</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Usage Filter */}
              <div className="flex gap-2 items-center w-full md:w-auto">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Usage</span>
                <select
                  value={filterUsage}
                  onChange={(e) => setFilterUsage(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-amber-500 outline-none cursor-pointer"
                >
                  <option value="All">All Usages</option>
                  <option value="person">Person</option>
                  <option value="place">Place</option>
                  <option value="institution">Institution</option>
                  <option value="office">Office</option>
                  <option value="threat">Threat</option>
                  <option value="ritual">Ritual</option>
                  <option value="artifact">Artifact</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

            </div>

            {/* Empty State */}
            {filteredNames.length === 0 && (
              <div className="text-center py-16 px-4 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
                <Archive size={32} className="text-slate-600 mb-3 mx-auto" />
                <p className="text-slate-400 text-sm font-semibold">No registered names found</p>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  {names.length === 0 
                    ? 'Forge names in the Nomenclator Forge tab and save them to seed your local campaign archive.'
                    : 'Adjust your search queries or filter attributes to reveal matching entries.'}
                </p>
              </div>
            )}

            {/* Names Grid */}
            {filteredNames.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredNames.map((item) => (
                  <VaultNameCard
                    key={item.id}
                    nameItem={item}
                    detailMode={detailMode}
                    onDelete={() => deleteName(item.id)}
                  />
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
