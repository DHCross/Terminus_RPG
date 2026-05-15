import { useState, useEffect } from 'react';
import { generateSceneFromPrompt } from '../../../services/aiService';
import { useToast } from '../../../components/Toast';
import { Sparkles, Settings } from 'lucide-react';

interface AIGeneratorProps {
  onGenerate: (data: any) => void;
  adventure?: string;
  act?: string;
}

export function AIGenerator({ onGenerate, adventure, act }: AIGeneratorProps) {
  const { addToast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [model, setModel] = useState('gpt-4o-mini');

  // Load settings on mount
  useEffect(() => {
    setApiKey(localStorage.getItem('terminus_ai_key') || '');
    setBaseUrl(localStorage.getItem('terminus_ai_base_url') || 'https://api.openai.com/v1');
    setModel(localStorage.getItem('terminus_ai_model') || 'gpt-4o-mini');
  }, []);

  const saveSettings = () => {
    localStorage.setItem('terminus_ai_key', apiKey);
    localStorage.setItem('terminus_ai_base_url', baseUrl);
    localStorage.setItem('terminus_ai_model', model);
    setShowSettings(false);
    addToast('success', 'AI Settings saved');
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      addToast('warning', 'Please enter a prompt first.');
      return;
    }
    if (!apiKey) {
      setShowSettings(true);
      addToast('error', 'Please configure your API Key first.');
      return;
    }

    setIsGenerating(true);
    addToast('info', 'Coherence Engine is compiling...');
    
    try {
      const data = await generateSceneFromPrompt(
        { prompt, adventure, act },
        apiKey,
        baseUrl,
        model
      );
      onGenerate(data);
      addToast('success', 'Scene compilation complete.');
      setPrompt('');
    } catch (error: any) {
      addToast('error', error.message || 'Generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#0f172a',
      border: '1px solid #3b82f6',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      marginBottom: '2rem',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.125rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} />
          Coherence Engine (AI Gen)
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem'
          }}
        >
          <Settings size={14} /> Settings
        </button>
      </div>

      {showSettings ? (
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#1e293b', borderRadius: '0.375rem' }}>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>API Key</label>
              <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} 
                style={{ width: '100%', padding: '0.5rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.25rem', color: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Base URL</label>
              <input type="text" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} 
                style={{ width: '100%', padding: '0.5rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.25rem', color: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Model</label>
              <input type="text" value={model} onChange={e => setModel(e.target.value)} 
                style={{ width: '100%', padding: '0.5rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.25rem', color: '#fff' }} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button onClick={saveSettings} style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>Save Settings</button>
            <button onClick={() => setShowSettings(false)} style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '0.25rem', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the scene, location, or tension you want to build... (e.g. A flooded library guarded by a Deep Alfar archivist)"
          rows={2}
          style={{
            flex: 1,
            padding: '0.75rem',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '0.375rem',
            color: '#f8fafc',
            fontSize: '0.9375rem',
            resize: 'vertical',
          }}
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{
            padding: '0 1.5rem',
            backgroundColor: isGenerating ? '#1e40af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {isGenerating ? (
            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
          ) : (
            <Sparkles size={18} />
          )}
          {isGenerating ? 'Compiling...' : 'Generate'}
        </button>
      </div>
    </div>
  );
}
