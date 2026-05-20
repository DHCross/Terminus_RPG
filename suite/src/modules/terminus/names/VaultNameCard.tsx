import { useState } from 'react';
import { Copy, Trash2, Check, Globe, HelpCircle, FileText } from 'lucide-react';
import type { GeneratedName } from '../../../data/terminus/names';

interface VaultNameCardProps {
  nameItem: GeneratedName;
  onDelete: () => void;
  detailMode: boolean;
}

export function VaultNameCard({ nameItem, onDelete, detailMode }: VaultNameCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      let copyText = `${nameItem.name} (${nameItem.phonetic})`;
      if (nameItem.shortMeaning) copyText += ` — "${nameItem.shortMeaning}"`;
      if (nameItem.publicDescription) copyText += `\nDescription: ${nameItem.publicDescription}`;
      if (detailMode) {
        if (nameItem.ipa) copyText += `\nIPA: /${nameItem.ipa}/`;
        if (nameItem.internalNote) copyText += `\nInternal Note: ${nameItem.internalNote}`;
      }
      
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy name details:', err);
    }
  };

  // Color mapping based on culture profile
  const getCultureBadgeStyle = (culture: string) => {
    switch (culture) {
      case 'Welsh':
        return { bg: 'rgba(14, 116, 144, 0.15)', text: '#22d3ee', border: 'rgba(14, 116, 144, 0.4)' }; // Cyan
      case 'Norse':
        return { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.4)' }; // Indigo
      case 'Gaelic':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.4)' }; // Emerald
      case 'Egyptian':
        return { bg: 'rgba(217, 119, 6, 0.15)', text: '#fbbf24', border: 'rgba(217, 119, 6, 0.4)' }; // Amber
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', text: '#cbd5e1', border: 'rgba(148, 163, 184, 0.4)' }; // Slate
    }
  };

  // Color mapping based on usage category
  const getUsageBadgeStyle = (usage: string) => {
    switch (usage) {
      case 'person':
        return 'rgba(236, 72, 153, 0.1) text-pink-400 border-pink-500/20';
      case 'place':
        return 'rgba(14, 165, 233, 0.1) text-sky-400 border-sky-500/20';
      case 'institution':
        return 'rgba(168, 85, 247, 0.1) text-purple-400 border-purple-500/20';
      case 'office':
        return 'rgba(59, 130, 246, 0.1) text-blue-400 border-blue-500/20';
      case 'threat':
        return 'rgba(239, 68, 68, 0.1) text-red-400 border-red-500/20';
      case 'ritual':
        return 'rgba(245, 158, 11, 0.1) text-amber-400 border-amber-500/20';
      case 'artifact':
        return 'rgba(20, 184, 166, 0.1) text-teal-400 border-teal-500/20';
      default:
        return 'rgba(100, 116, 139, 0.1) text-slate-400 border-slate-500/20';
    }
  };

  const cultureStyle = getCultureBadgeStyle(nameItem.cultureProfile);

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700/80 transition-all duration-300 shadow-lg flex flex-col justify-between group hover:translate-y-[-2px]">
      <div className="space-y-4">
        {/* Top Badges & Actions */}
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-1.5">
            <span
              className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border"
              style={{
                backgroundColor: cultureStyle.bg,
                color: cultureStyle.text,
                borderColor: cultureStyle.border,
              }}
            >
              {nameItem.cultureProfile}
            </span>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getUsageBadgeStyle(nameItem.usage)}`}>
              {nameItem.usage}
            </span>
          </div>
          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
              title="Copy name info to clipboard"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-red-950/30 rounded text-slate-400 hover:text-red-400 transition-colors"
              title="Remove from archive"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Display Format: Name, Pronunciation, Short description */}
        <div className="space-y-1">
          <h3 className="text-xl font-cinzel font-semibold text-slate-100 tracking-wide leading-tight">
            {nameItem.name}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-mono text-amber-500 font-bold uppercase tracking-widest bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-900/30">
              {nameItem.phonetic}
            </span>
            {nameItem.shortMeaning && (
              <span className="text-xs text-slate-400 italic">
                ({nameItem.shortMeaning})
              </span>
            )}
          </div>
        </div>

        {/* Public Description */}
        {nameItem.publicDescription ? (
          <p className="text-sm text-slate-300 leading-relaxed font-inter">
            {nameItem.publicDescription}
          </p>
        ) : (
          <p className="text-sm text-slate-500 italic">No public archive description.</p>
        )}

        {/* Nomenclator Detail Toggle Items */}
        {detailMode && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3 animation-fade-in">
            {nameItem.ipa && (
              <div className="space-y-1 bg-slate-950/40 p-2 rounded border border-slate-800/50">
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                  <Globe size={10} /> Technical IPA Spelling
                </span>
                <p className="text-xs font-mono text-cyan-400 pl-4">
                  /{nameItem.ipa}/
                </p>
              </div>
            )}

            {nameItem.internalNote && (
              <div className="space-y-1 bg-rose-950/10 p-2.5 rounded border border-rose-900/20">
                <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1 uppercase tracking-wider">
                  <FileText size={10} /> Internal Dev/GM Ledger
                </span>
                <p className="text-xs text-rose-300/90 leading-normal pl-4 font-inter">
                  {nameItem.internalNote}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {nameItem.createdAt && (
        <div className="mt-4 pt-2 text-[10px] text-slate-500 text-right border-t border-slate-800/30">
          Recorded: {new Date(nameItem.createdAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
