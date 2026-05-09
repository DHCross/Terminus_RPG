/* ── Text Input: paste markdown or upload files ── */

import { useRef, useState } from 'react';

interface Props {
  onParse: (text: string, name?: string) => void;
  showEditor?: boolean;
}

export default function TextInput({ onParse, showEditor = true }: Props) {
  const [text, setText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const canParse = text.trim().length > 0;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const content = await file.text();
    setText(content);
    onParse(content, file.name.replace(/\.\w+$/, ''));
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            padding: '8px 16px',
            background: '#374151',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          📂 Open Markdown
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".md,.txt"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
        <button
          onClick={() => canParse && onParse(text)}
          disabled={!canParse}
          title="Re-run GWSD extraction on the current text"
          style={{
            padding: '8px 16px',
            background: canParse ? '#2563EB' : '#9CA3AF',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: canParse ? 'pointer' : 'default',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {canParse ? 'Re-Parse GWSD' : 'Parse GWSD'}
        </button>
        <span style={{ fontSize: 11, color: '#6B7280' }}>
          Opening a file parses immediately; use Re-Parse after edits
        </span>
      </div>
      {showEditor && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste adventure manuscript here — supports [gwsd] tags, [sidebar] blocks, and scene headers..."
          style={{
            width: '100%',
            height: 180,
            padding: 12,
            fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
            fontSize: 12,
            lineHeight: 1.5,
            border: '1px solid #374151',
            borderRadius: 6,
            background: '#111827',
            color: '#E5E7EB',
            resize: 'vertical',
            outline: 'none',
          }}
        />
      )}
    </div>
  );
}
