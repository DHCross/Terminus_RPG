import { useState } from 'react';
import { Skull } from 'lucide-react';
import { MonsterGenerator } from './MonsterGenerator';
import { VaultMonsterCard } from './VaultMonsterCard';
import { useMonsterStorage } from './useMonsterStorage';

export function MonsterWorkbench() {
  const [activeTab, setActiveTab] = useState<'generator' | 'bestiary'>('generator');
  const { monsters, saveMonster, deleteMonster } = useMonsterStorage();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="page-header">
        <h1 className="flex items-center gap-3">
          <Skull className="text-red-500" size={32} />
          Bestiary & Threats
        </h1>
        <p>
          Generate hostile actors, monsters, and complex hazards. Statblocks are 
          automatically scaled to Terminus rules (Force, Agility, Willpower) and output 
          thresholds and drift triggers.
        </p>
      </header>

      <div className="tab-bar">
        <button
          className={`tab-button ${activeTab === 'generator' ? 'active' : ''}`}
          onClick={() => setActiveTab('generator')}
        >
          Threat Generator
        </button>
        <button
          className={`tab-button ${activeTab === 'bestiary' ? 'active' : ''}`}
          onClick={() => setActiveTab('bestiary')}
        >
          Local Bestiary
          <span className="badge bg-slate-800 ml-2 border-slate-700 text-slate-300">
            {monsters.length}
          </span>
        </button>
      </div>

      <div className="tab-content mt-6">
        {activeTab === 'generator' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <MonsterGenerator 
              onSave={(monster) => {
                saveMonster(monster);
                setActiveTab('bestiary');
              }} 
            />
          </div>
        )}

        {activeTab === 'bestiary' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {monsters.length === 0 ? (
              <div className="empty-state">
                <Skull size={48} className="mx-auto mb-4 opacity-20" />
                <p>The bestiary is empty.</p>
                <button 
                  className="btn btn-primary mt-4"
                  onClick={() => setActiveTab('generator')}
                >
                  Generate a Threat
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {monsters.map((monster) => (
                  <VaultMonsterCard
                    key={monster.id}
                    monster={monster}
                    onDelete={() => deleteMonster(monster.id)}
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
