import { useState } from 'react';
import { Users } from 'lucide-react';
import { CharacterGenerator } from './CharacterGenerator';

export function CharacterWorkbench() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-950 to-slate-900">
        <CharacterGenerator />
      </div>
    </div>
  );
}
