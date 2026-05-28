import { useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { SceneCardForge } from './SceneCardForge';
import GWSDApp from '../../gwsd-cards/App';
import type { Scene } from '../../gwsd-cards/types';

type SceneTab = 'forge' | 'parser';

export function SceneCardsWorkbench() {
  const [activeTab, setActiveTab] = useState<SceneTab>('parser');
  const [pendingScene, setPendingScene] = useState<Scene | null>(null);
  const [pendingScenes, setPendingScenes] = useState<Scene[] | null>(null);

  const handleSceneForged = (scene: Scene) => {
    setPendingScene(scene);
    setPendingScenes(null);
    setActiveTab('parser');
  };

  const handleScenesForged = (scenes: Scene[]) => {
    setPendingScenes(scenes);
    setPendingScene(null);
    setActiveTab('parser');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-slate-700 bg-slate-950 px-6">
        <button
          onClick={() => setActiveTab('forge')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'forge'
              ? 'border-b-amber-500 text-amber-400 font-semibold'
              : 'border-b-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles size={18} /> AI Forge
        </button>
        <button
          onClick={() => setActiveTab('parser')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'parser'
              ? 'border-b-amber-500 text-amber-400 font-semibold'
              : 'border-b-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText size={18} /> Scene Cards
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'forge' ? (
          <div key="forge" className="h-full overflow-y-auto" data-scene-tab="forge">
            <SceneCardForge onSceneForged={handleSceneForged} onScenesForged={handleScenesForged} />
          </div>
        ) : (
          <div key="parser" className="h-full overflow-y-auto" data-scene-tab="parser">
            <GWSDApp
              pendingScene={pendingScene}
              pendingScenes={pendingScenes}
              onPendingSceneConsumed={() => {
                setPendingScene(null);
                setPendingScenes(null);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
