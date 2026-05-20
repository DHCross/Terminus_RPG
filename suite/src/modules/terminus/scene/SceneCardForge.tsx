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
import { useToast } from '../../../components/Toast';
import type { Scene, GWSDCard, ActiveGWSDCard, ActiveGWSDState, TerminusOrder, TerminusSceneMode } from '../../gwsd-cards/types';

// API Key and Endpoint from environment variables
const apiKey = import.meta.env.VITE_AI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";
const apiEndpoint = import.meta.env.VITE_AI_ENDPOINT || "https://api.deepseek.com/chat/completions";
const apiModel = import.meta.env.VITE_AI_MODEL || "deepseek-chat";
// Give the browser time to start the download before revoking the blob URL.
const BLOB_URL_REVOCATION_DELAY_MS = 250;

interface SceneCardForgeProps {
  onSceneForged?: (scene: Scene) => void;
  onCancel?: () => void;
}

export function SceneCardForge({ onSceneForged, onCancel }: SceneCardForgeProps) {
  const { addToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState('');
  const [previewMarkdown, setPreviewMarkdown] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [seedIdea, setSeedIdea] = useState('');
  const [isBasicGenerating, setIsBasicGenerating] = useState(false);
  
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
      addToast('error', `Complete required fields: ${missingFields.join(', ')}`);
      return;
    }

    const markdown = buildSceneCardMarkdown();
    setPreviewMarkdown(markdown);
    setShowPreview(true);

    // Download the markdown file
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

    // Build a Scene object and notify the parent so it can display in the workbench
    if (onSceneForged) {
      const sceneId = crypto.randomUUID();
      const safePressure = Math.max(1, Math.min(5, Number(formData.scenePressure) || 1));

      const sceneModeMap: Record<string, TerminusSceneMode> = {
        'Confrontation': 'confrontation',
        'Discovery': 'discovery',
        'Social': 'social',
        'Hazard': 'hazard',
        'Trap': 'hazard',
      };
      const terminusSceneMode: TerminusSceneMode =
        sceneModeMap[formData.sceneMode] ?? 'confrontation';

      const orderKeyMap: Record<string, TerminusOrder> = {
        Seeker: 'seeker', Breaker: 'breaker', Warden: 'warden',
        Rival: 'rival', Broker: 'broker', Shade: 'shade',
      };
      const orderTags: TerminusOrder[] = Object.entries(formData.orderHooks)
        .filter(([, hook]) => hook.trim())
        .map(([order]) => orderKeyMap[order])
        .filter((o): o is TerminusOrder => Boolean(o));

      const makeCard = (state: ActiveGWSDState, text: string): ActiveGWSDCard => ({
        id: crypto.randomUUID(),
        sceneId,
        stateType: 'active',
        state,
        text: text.trim(),
        source: 'manual',
      });

      const cards: [GWSDCard, GWSDCard, GWSDCard, GWSDCard] = [
        makeCard('ground', formData.ground),
        makeCard('will', formData.will),
        makeCard('shift', formData.shift),
        makeCard('drift', formData.drift),
      ];

      const newScene: Scene = {
        id: sceneId,
        title: (formData.sceneTitle || 'Untitled Scene').trim(),
        adventure: (formData.adventure || 'Custom Adventure').trim(),
        act: formData.act.trim() || undefined,
        order: 1,
        stateType: 'active',
        scenePressure: safePressure,
        cards,
        raw: markdown,
        terminus: {
          scenePressure: safePressure,
          location: formData.location.trim(),
          sceneMode: terminusSceneMode,
          driftLadder: formData.driftLadder.trim(),
          mapHooks: formData.mapHooks.trim(),
          readAloud: formData.readAloud.trim(),
          orderTags,
        },
      };

      onSceneForged(newScene);
    }

    setGenerationMessage(`✓ Scene cards forged and downloaded as ${filename}`);
    addToast('success', `Scene "${formData.sceneTitle || 'Untitled'}" forged successfully`);
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

  // LLM Generation for Basic Information
  const handleGenerateBasicInfo = async () => {
    if (!apiKey) {
      setGenerationMessage('⚠️ API key not configured. Set VITE_AI_API_KEY in your environment (.env.local).');
      addToast('error', 'AI API key not configured. Set VITE_AI_API_KEY in your .env.local file.');
      return;
    }

    setIsBasicGenerating(true);
    setGenerationMessage('');

    const seedPrompt = seedIdea.trim() || "A mysterious failure of civic routine in a dark fantasy town, such as a repeating street, a gate that refuses mourners, or records dated tomorrow.";

    const prompt = `
      You are an expert game designer for the Terminus RPG, a dark fantasy tabletop game powered by the Coherence System.
      In this world, reality is maintained through civic routine, law, memory, and repeated structure. When patterns fail, reality fractures (Ruptures) in localized, civic-procedural anomalies.
      
      Generate a themed Terminus RPG scene setup based on the following user seed premise:
      "${seedPrompt}"
      
      Requirements:
      1. sceneTitle: Must be atmospheric and evocative of Terminus theme. Use Welsh, Norse, Gaelic, or Egyptian naming elements if appropriate (e.g. Rhudd-Sarn, Maerwyn, Valdr-Vard, Khamat-Maat) or mysterious civic/environmental terms.
      2. adventure: A fitting dark-fantasy adventure/campaign segment title.
      3. act: A number or Roman numeral (e.g., "1", "2", "3", "I", "II", "III").
      4. location: A specific geographic or architectural place showing civic strain (e.g. "Rhudd-Sarn Crossing", "Maerwyn Archive Gate 3", "The Ash-Chamber").
      5. sceneMode: Must be one of the following exact strings: "Confrontation", "Discovery", "Social", "Hazard", "Trap".
      
      Guidelines:
      - Aesthetic: Civic ruin, cold black stone, wet masonry, expired public works, rusted brass gears, celestial infrastructure, dried oxblood, bone paper.
      - Theme: Rupture is a local systemic failure of a routine (e.g., a bell ringing twice, a dead transit line accepting passengers, a street that grows longer, a bridge rejecting mourners, court verdicts changing based on who enters first).
      - Core Entities/Anomalies: Utilize Terminus lore such as **Corrections** (reality-enforcing manifestations of routine failure: Correction Body, Correction Instrument, Correction Writ, or Correction Office), **Correction Offices** that override Ground rules, and chilling folk designations like *The Black Walker*, *Vardrek*, or *Sithny's Mark*.
      
      Return ONLY a valid JSON object matching this TypeScript interface exactly:
      {
        "sceneTitle": "string",
        "adventure": "string",
        "act": "string",
        "location": "string",
        "sceneMode": "Confrontation" | "Discovery" | "Social" | "Hazard" | "Trap"
      }
      Do not include any extra text, explanations, or markdown. Only the JSON object.
    `;

    const systemInstruction = "You are a specialized game design assistant for Terminus RPG. Return ONLY a valid JSON object matching the requested schema. No conversational filler, no markdown codeblocks.";

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
        sceneTitle: generatedData.sceneTitle || prev.sceneTitle,
        adventure: generatedData.adventure || prev.adventure,
        act: generatedData.act || prev.act,
        location: generatedData.location || prev.location,
        sceneMode: generatedData.sceneMode || prev.sceneMode
      }));
      setGenerationMessage('✓ Basic information generated successfully.');
      addToast('success', 'Basic information generated! Review fields, then click Auto-Fill with AI below.');
    } catch (error) {
      console.error("Failed to generate basic info:", error);
      setGenerationMessage('✗ Failed to generate basic info. Check VITE_AI_API_KEY and endpoint.');
      addToast('error', 'Failed to generate basic info.');
    } finally {
      setIsBasicGenerating(false);
    }
  };

  // LLM Generation Logic
  const handleAutoFill = async () => {
    if (!apiKey) {
      setGenerationMessage('⚠️ API key not configured. Set VITE_AI_API_KEY in your environment (.env.local).');
      addToast('error', 'AI API key not configured. Set VITE_AI_API_KEY in your .env.local file.');
      return;
    }

    setIsGenerating(true);
    setGenerationMessage('');
    
    const prompt = `
      You are an expert game designer building a "Scene Card" for the Terminus RPG under the Coherence System.
      In this world, reality holds together through routine, law, memory, and repeated structure. When those patterns fail, a localized Rupture (systemic breakdown of reality) occurs.
      
      Based on the following basic scene metadata, generate the operational and narrative text for this scene card:
      
      Scene Title: ${formData.sceneTitle}
      Adventure: ${formData.adventure}
      Act: ${formData.act}
      Location: ${formData.location}
      Scene Mode: ${formData.sceneMode}
      Pressure Level (1-5): ${formData.scenePressure}
      State Type: ${formData.stateType}

      Follow these strict creative guidelines:
      1. THE ENGINE LAYER (GWSD)
         - ground: Define what is currently reliable right now: physical constraints, social rules, access boundaries, permissions. Avoid vague flavor. Keep it actionable and game-focused. 
           * Good Ground example: "No one can hear speech beyond arm's reach, and the eastern door only opens for names recorded in the ward ledger."
         - will: The active pressure already acting on the situation before characters intervene.
           * Good Will example: "The lich is maintaining the ritual shield and will abandon any attack that risks breaking concentration."
         - shift: What changes immediately when characters act, interfere, or make an attempt. 
           * Good Shift example: "If anyone touches the sealed bell, every door in the room locks and the nearest dead name is read aloud."
         - drift: The executable "Else statement" — what worsens, advances, closes, or decays if no one acts at the end of a round.
           * Good Drift example: "At the end of each round, another citizen's name vanishes from the civic register."
      
      2. OPTIONAL MECHANICS & FLAVOR
         - readAloud: Atmospheric, sensory, concrete, and short (1-2 sentences). Focus on rain, stone, bells, cold brass, wet masonry, sealed gates, smoke, old public works, or shifting structures. NEVER dictate player emotions or explain the metaphysics too early. Let the failure speak for itself.
         - driftLadder: If Drift is a sequence, specify 3 incremental steps (e.g. 1. Water reaches ankles -> 2. Lower exits flood -> 3. Bridge buckles).
         - mapHooks: 2-3 specific interactive map elements (e.g. "The crumbling pillar," "The iron ledger grate").

      3. ORDER HOOKS (SPECIFIC OPPORTUNITIES)
         - Generate a table-facing opportunity for each of the 6 Orders using bounded, practical game terms (e.g., reveal, delay, expose, hold, block, reduce impact, act before next Drift, force hesitation, open a passage).
         - Avoid software or internal developer jargon (no references to "runtime", "simulation", "state machine", "code", "AI", "text blocks"). These are player-facing tools.
         - Avoid over-absolute terms ("automatically", "completely", "guarantee", "without a roll", "entire party", "rewrite the scene").
         - Specific order goals:
           * Seeker: Reveal hidden, forgotten, or sealed truth before it collapses.
           * Breaker: Force openings in walls, wards, deadlocks, or dead systems.
           * Warden: Hold collapse at bay, keep doors shut, preserve doomed structures.
           * Rival: Turn conflict into duels, wagers, or structured contests.
           * Broker: Manage passage rights, debts, patronage, or convert bonds to leverage.
           * Shade: Access hidden paths, conceal, or redirect attention where it fails.

      4. TERMINOLOGY BOUNDARY & CORRECTIONS (CRITICAL)
         - "Rupture" names a condition state — systemic failure when Routine no longer holds. NEVER treat Rupture as a substance, energy type, spell school, or blade/monster infusion. 
         - Never write "Rupture energy," "Rupture power," "Rupture magic," "Rupture-infused," "Rupture blade," or similar. 
         - Instead, show physical, civic, sensory, or procedural symptoms: ink separating into oil and brine, blades casting two shadows, bells ringing before being struck, stairs repeating every seventh step, road lines crawling across the stone.
         - Integrate Terminus entities and enforcements: **Corrections** (Correction Body, Correction Instrument, Correction Writ, or Correction Office).
         - Show **Correction Offices** attempting to rewrite environmental Ground rules to force compliance, and draw upon folk names like *The Black Walker*, *Vardrek*, or *Sithny's Mark* to represent the haunting nature of these systemic anomalies.
      
      Return ONLY a valid JSON object matching this TypeScript interface exactly:
      {
        "ground": "string",
        "will": "string",
        "shift": "string",
        "drift": "string",
        "readAloud": "string",
        "driftLadder": "string",
        "mapHooks": "string",
        "orderHooks": {
          "Seeker": "string",
          "Breaker": "string",
          "Warden": "string",
          "Rival": "string",
          "Broker": "string",
          "Shade": "string"
        }
      }
      Ensure no markdown formatting or backticks outside the JSON.
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
      addToast('success', 'Scene content generated — fill in any remaining fields and click Forge Scene Cards');
    } catch (error) {
      console.error("Failed to generate content:", error);
      setGenerationMessage('✗ Failed to generate scene content. Check your VITE_AI_API_KEY and endpoint.');
      addToast('error', 'Failed to generate scene content. Check your API key and endpoint.');
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
          <button 
            type="button"
            onClick={() => {
              if (onCancel) {
                onCancel();
              } else {
                setGenerationMessage('');
                setPreviewMarkdown('');
                setShowPreview(false);
              }
            }}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* 1. Basic Information */}
          <section>
            <div className="flex justify-between items-end mb-4 border-b border-slate-800 pb-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">1. Basic Information</h4>
              <button 
                type="button"
                onClick={handleGenerateBasicInfo}
                disabled={isBasicGenerating || !apiKey}
                className="flex items-center gap-1.5 text-xs bg-amber-900/30 hover:bg-amber-800/40 text-amber-300 border border-amber-700/50 px-3 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBasicGenerating ? <Activity size={14} className="animate-pulse" /> : <Sparkles size={14} />}
                {isBasicGenerating ? 'Forging Info...' : 'Generate Basic Info'}
              </button>
            </div>

            <div className="mb-6 p-4 bg-slate-950/40 border border-slate-800 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-amber-500 flex items-center gap-1.5">
                  <Sparkles size={13} />
                  AI Basic Info Generator (Premise / Seed)
                </span>
                {seedIdea && (
                  <button 
                    type="button" 
                    onClick={() => setSeedIdea('')}
                    className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Clear Seed
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Type an anomaly concept (e.g. <em>"A street that grows longer the faster you run"</em>) or leave empty for a random seed, then click <strong>Generate Basic Info</strong>.
              </p>
              <textarea
                value={seedIdea}
                onChange={(e) => setSeedIdea(e.target.value)}
                placeholder="Enter scene concept, anomaly description, or story hook..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-amber-500 outline-none resize-none font-mono transition-all"
              />
            </div>

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
              if (onCancel) {
                onCancel();
              } else {
                setGenerationMessage('');
                setPreviewMarkdown('');
                setShowPreview(false);
              }
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
