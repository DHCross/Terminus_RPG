import { useState } from 'react';
import {
  Sparkles, 
  Save, 
  Eye, 
  X,
  FileText,
  Activity,
  MapPin,
  Swords,
  Gauge
} from 'lucide-react';

// API Key and Endpoint from environment variables
const apiKey = import.meta.env.VITE_AI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";
const apiEndpoint = import.meta.env.VITE_AI_ENDPOINT || "https://api.deepseek.com/chat/completions";
const apiModel = import.meta.env.VITE_AI_MODEL || "deepseek-chat";
// Give the browser time to start the download before revoking the blob URL.
const BLOB_URL_REVOCATION_DELAY_MS = 250;

export function SceneCardForge() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState('');
  const [previewMarkdown, setPreviewMarkdown] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    sceneTitle: "Crumbling Bridge",
    adventure: "Custom Adventure",
    act: "1",
    location: "The bridge region",
    sceneMode: "Confrontation",
    stateType: "Active Scene",
    ground: "",
    will: "",
    shift: "",
    drift: "",
    pressureType: "Escalating",
    scenePressure: 3,
    readAloud: "",
    driftLadder: "",
    mapHooks: "",
    orderHooks: {
      Seeker: "",
      Breaker: "",
      Warden: "",
      Rival: "",
      Broker: "",
      Shade: ""
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, section: string | null = null, fieldName: string | null = null) => {
    const { name, value } = e.target;
    if (section === 'orderHooks' && fieldName) {
      setFormData(prev => ({
        ...prev,
        orderHooks: { ...prev.orderHooks, [fieldName]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'scenePressure' ? Number(value) : value
      }));
    }
  };

  const buildSceneCardMarkdown = () => {
    const safePressure = Math.max(1, Math.min(5, Number(formData.scenePressure) || 1));
    const orderLines = Object.entries(formData.orderHooks)
      .filter(([, hook]) => hook.trim())
      .map(([order, hook]) => `- **${order}:** ${hook.trim()}`)
      .join('\n');

    return `# ${formData.sceneTitle.trim() || 'Untitled Scene'}

## Metadata
- **Adventure:** ${formData.adventure.trim() || 'Custom Adventure'}
- **Act:** ${formData.act.trim() || '1'}
- **Location:** ${formData.location.trim() || 'Unknown'}
- **Scene Mode:** ${formData.sceneMode}
- **State Type:** ${formData.stateType}
- **Pressure Type:** ${formData.pressureType}
- **Scene Pressure:** ${safePressure}/5

## Engine Layer (GWSD)
- **Ground:** ${formData.ground.trim() || 'TBD'}
- **Will:** ${formData.will.trim() || 'TBD'}
- **Shift:** ${formData.shift.trim() || 'TBD'}
- **Drift:** ${formData.drift.trim() || 'TBD'}

## Read-Aloud
${formData.readAloud.trim() || 'No read-aloud text provided.'}

## Drift Ladder / Transition State
${formData.driftLadder.trim() || 'No drift ladder provided.'}

## Map Hooks / Nouns
${formData.mapHooks.trim() || 'No map hooks provided.'}

## Order Hooks
${orderLines || '- No order hooks provided.'}
`;
  };

  const getMissingRequiredFields = () => {
    const missing: string[] = [];
    if (!formData.sceneTitle.trim()) missing.push('Scene Title');
    if (!formData.location.trim()) missing.push('Location');
    if (!formData.ground.trim()) missing.push('Ground');
    if (!formData.will.trim()) missing.push('Will');
    if (!formData.shift.trim()) missing.push('Shift');
    if (!formData.drift.trim()) missing.push('Drift');
    return missing;
  };

  const handlePreviewExport = () => {
    const markdown = buildSceneCardMarkdown();
    setPreviewMarkdown(markdown);
    setShowPreview(true);
    setGenerationMessage('✓ Preview generated. Review it below before forging scene cards.');
  };

  const handleForgeSceneCard = () => {
    const missingFields = getMissingRequiredFields();
    if (missingFields.length > 0) {
      setGenerationMessage(`⚠️ Complete required fields before forging: ${missingFields.join(', ')}`);
      return;
    }

    const markdown = buildSceneCardMarkdown();
    setPreviewMarkdown(markdown);
    setShowPreview(true);

    const slug = (formData.sceneTitle || 'scene-cards')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const filename = `${slug || 'scene-cards'}.md`;

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), BLOB_URL_REVOCATION_DELAY_MS);

    setGenerationMessage(`✓ Scene cards forged and downloaded as ${filename}`);
  };

  const handleToggleState = (type: string) => {
    setFormData(prev => ({ ...prev, stateType: type }));
  };

  // Exponential backoff fetch for Gemini API
  const fetchWithRetry = async (url: string, options: RequestInit, retries: number = 5) => {
    const delays = [1000, 2000, 4000, 8000, 16000];
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

  // LLM Generation Logic
  const handleAutoFill = async () => {
    if (!apiKey) {
      setGenerationMessage('⚠️ API key not configured. Set VITE_AI_API_KEY in your environment (.env.local).');
      return;
    }

    setIsGenerating(true);
    setGenerationMessage('');
    
    const prompt = `
      You are an expert tabletop RPG designer building a "Scene Card" for the Terminus RPG.
      Terminus is a dark fantasy world where reality fractures (Ruptures) when civic routines and systems fail. The players are "Orders" who respond to these systemic failures.
      
      Based on the following scene information, generate the operational and narrative text for the scene.
      
      Scene Title: ${formData.sceneTitle}
      Adventure: ${formData.adventure}
      Location: ${formData.location}
      Scene Mode: ${formData.sceneMode}
      Pressure Level (1-5): ${formData.scenePressure}
      
      Please provide rich, concise, and game-actionable text for the following fields:
      - ground: What is currently reliable, permissions, and physical constraints. (Operational, bullet points style)
      - will: The active pressure/enemy intent already acting on the situation. (Operational)
      - shift: Immediate consequences of a player's action/interrupt. (Operational)
      - drift: The executable Else statement: "At the end of each round, [specific state change]." It answers what changes if players do nothing. Do not write vague urgency.
      - readAloud: A short atmospheric description to read to players. Focus on sensory cues of systemic strain.
      - driftLadder: A brief executable transition ladder. Each step must change what players can safely do next.
      - mapHooks: Key interactive nouns or features in the environment.
      - orderHooks: Provide one specific actionable opportunity for each of the 6 Orders:
          * Seeker: Reveals hidden/forgotten truth.
          * Breaker: Forces openings through wards/deadlocks.
          * Warden: Holds collapse at bay/protects.
          * Rival: Turns conflict into formal contest/duel.
          * Broker: Turns obligation into motion/leverage.
          * Shade: Moves through concealment/misdirection.
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
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(payload)
        }
      );

      const generatedData = JSON.parse(result.choices[0].message.content);
      
      setFormData(prev => ({
        ...prev,
        ground: generatedData.ground || prev.ground,
        will: generatedData.will || prev.will,
        shift: generatedData.shift || prev.shift,
        drift: generatedData.drift || prev.drift,
        readAloud: generatedData.readAloud || prev.readAloud,
        driftLadder: generatedData.driftLadder || prev.driftLadder,
        mapHooks: generatedData.mapHooks || prev.mapHooks,
        orderHooks: {
          Seeker: generatedData.orderHooks?.Seeker || prev.orderHooks.Seeker,
          Breaker: generatedData.orderHooks?.Breaker || prev.orderHooks.Breaker,
          Warden: generatedData.orderHooks?.Warden || prev.orderHooks.Warden,
          Rival: generatedData.orderHooks?.Rival || prev.orderHooks.Rival,
          Broker: generatedData.orderHooks?.Broker || prev.orderHooks.Broker,
          Shade: generatedData.orderHooks?.Shade || prev.orderHooks.Shade,
        }
      }));
      setGenerationMessage('✓ Scene content generated successfully');
    } catch (error) {
      console.error("Failed to generate content:", error);
      setGenerationMessage('✗ Failed to generate scene content. Check your VITE_AI_API_KEY and endpoint.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="max-w-5xl mx-auto bg-slate-900 rounded-lg border border-slate-700 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-800/30">
          <h3 className="text-lg font-medium text-slate-100 flex items-center gap-2">
            <FileText size={20} className="text-amber-500"/>
            Create Scene Cards
          </h3>
          <button className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* 1. Basic Information */}
          <section>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">1. Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Scene Title</label>
                <input type="text" name="sceneTitle" value={formData.sceneTitle} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-xs text-slate-400">Adventure</label>
                  <input type="text" name="adventure" value={formData.adventure} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Act</label>
                  <input type="text" name="act" value={formData.act} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={12}/> Location / Map Reference</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 flex items-center gap-1"><Swords size={12}/> Scene Mode / Resolver</label>
                <select name="sceneMode" value={formData.sceneMode} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none">
                  <option>Confrontation</option>
                  <option>Discovery</option>
                  <option>Social</option>
                  <option>Hazard</option>
                  <option>Trap</option>
                </select>
              </div>
            </div>
          </section>

          {/* 2. State Type */}
          <section>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">2. Execution State</h4>
            <div className="flex bg-slate-950 border border-slate-700 rounded p-1 max-w-md">
              <button 
                onClick={() => handleToggleState('Active Scene')}
                className={`flex-1 py-1.5 text-sm rounded ${formData.stateType === 'Active Scene' ? 'bg-amber-900/30 text-amber-400 font-medium border border-amber-800/50' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Active Scene
              </button>
              <button 
                onClick={() => handleToggleState('Latent Condition')}
                className={`flex-1 py-1.5 text-sm rounded ${formData.stateType === 'Latent Condition' ? 'bg-slate-800 text-slate-200 font-medium' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Latent Condition
              </button>
            </div>
          </section>

          {/* 3. Scene State Fields (GWSD) */}
          <section>
            <div className="flex justify-between items-end mb-4 border-b border-slate-800 pb-2">
              <h4 className="text-xs font-semibold text-amber-500 uppercase tracking-wider">3. The Engine Layer (GWSD)</h4>
              <button 
                onClick={handleAutoFill}
                disabled={isGenerating || !apiKey}
                className="flex items-center gap-1 text-xs bg-indigo-900/30 hover:bg-indigo-800/40 text-indigo-300 border border-indigo-700/50 px-3 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? <Activity size={14} className="animate-pulse" /> : <Sparkles size={14} />}
                {isGenerating ? 'Generating...' : 'Auto-Fill with AI'}
              </button>
            </div>
            
            {generationMessage && (
              <div className={`text-xs mb-4 p-2 rounded ${generationMessage.includes('✓') ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                {generationMessage}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Ground <span className="text-slate-600 font-normal ml-1">What is currently reliable/legal</span></label>
                <textarea name="ground" value={formData.ground} onChange={handleInputChange} rows={3} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none resize-none font-mono text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-red-400">Will <span className="text-slate-600 font-normal ml-1">What pressure is already acting</span></label>
                <textarea name="will" value={formData.will} onChange={handleInputChange} rows={3} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none resize-none font-mono text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-blue-400">Shift <span className="text-slate-600 font-normal ml-1">What changes when characters act</span></label>
                <textarea name="shift" value={formData.shift} onChange={handleInputChange} rows={3} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none resize-none font-mono text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-purple-400">Drift <span className="text-slate-600 font-normal ml-1">Else statement: what changes if no one acts</span></label>
                <textarea name="drift" value={formData.drift} onChange={handleInputChange} rows={3} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none resize-none font-mono text-xs" placeholder="At the end of each round, ..." />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 border border-slate-800 rounded p-3 text-slate-400">
                <strong className="block text-amber-400 mb-1">Else Statement</strong>
                Drift answers what happens if the players do nothing.
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded p-3 text-slate-400">
                <strong className="block text-amber-400 mb-1">Executable State</strong>
                Write an end-of-round trigger with a visible state change.
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded p-3 text-slate-400">
                <strong className="block text-amber-400 mb-1">Threat Shape</strong>
                Hazard worsens environment. Trap escalates response or intent.
              </div>
            </div>
          </section>

          {/* 4. Scene Settings */}
          <section>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">4. Scene Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Pressure Type</label>
                <select name="pressureType" value={formData.pressureType} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none">
                  <option>Escalating</option>
                  <option>Static Constraint</option>
                  <option>Degrading</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 flex items-center gap-1"><Gauge size={12}/> Scene Pressure (1-5)</label>
                <input type="number" min="1" max="5" name="scenePressure" value={formData.scenePressure} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none" />
              </div>
            </div>
          </section>

          {/* 5. Additional Scene Data */}
          <section>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">5. Atmospheric & Map Data (Optional)</h4>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 italic">Read-Aloud Box</label>
                <textarea name="readAloud" value={formData.readAloud} onChange={handleInputChange} rows={2} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-slate-300 italic focus:border-amber-500 outline-none resize-none" placeholder="The crossing is loud and exact..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Drift Ladder / Transition State</label>
                  <textarea name="driftLadder" value={formData.driftLadder} onChange={handleInputChange} rows={2} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none resize-none" placeholder="1. Water reaches ankles -> 2. Lower exits flood -> 3. Bridge buckles" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Map Hooks / Nouns</label>
                  <textarea name="mapHooks" value={formData.mapHooks} onChange={handleInputChange} rows={2} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none resize-none" />
                </div>
              </div>
            </div>
          </section>

          {/* 6. Order Hooks */}
          <section>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">6. Order Hooks (Specific Opportunities)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {['Seeker', 'Breaker', 'Warden', 'Rival', 'Broker', 'Shade'].map((order) => (
                <div key={order} className="flex gap-3">
                  <div className="w-20 pt-2 text-xs font-medium text-slate-400 text-right">{order}</div>
                  <input 
                    type="text" 
                    value={formData.orderHooks[order as keyof typeof formData.orderHooks]} 
                    onChange={(e) => handleInputChange(e, 'orderHooks', order)} 
                    className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-300 focus:border-amber-500 outline-none" 
                    placeholder={`Opportunity for the ${order}...`}
                  />
                </div>
              ))}
            </div>
          </section>

          {showPreview && (
            <section>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">7. Export Preview</h4>
              <pre className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-xs text-slate-200 whitespace-pre-wrap overflow-x-auto max-h-80">{previewMarkdown}</pre>
            </section>
          )}

        </div>

        {/* 8. Action Buttons */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              setGenerationMessage('');
              setPreviewMarkdown('');
              setShowPreview(false);
            }}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePreviewExport}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-800 text-slate-300 border border-slate-700 rounded hover:bg-slate-700 transition-colors"
            >
              <Eye size={16} /> Preview Export
            </button>
            <button
              type="button"
              onClick={handleForgeSceneCard}
              className="flex items-center gap-2 px-6 py-2 text-sm bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold rounded shadow-lg shadow-amber-900/20 transition-colors"
            >
              <Save size={16} /> Forge Scene Cards
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
