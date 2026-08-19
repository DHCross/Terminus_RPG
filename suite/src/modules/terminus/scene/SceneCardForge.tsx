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
import type { Scene, GWSDCard, ActiveGWSDCard, ActiveGWSDState, SceneMode, StoryFunction } from '../../gwsd-cards/types';
import type { OrderId } from '../../../data/terminus/orders';

// API Key and Endpoint from environment variables
const apiKey = import.meta.env.VITE_AI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";
const apiEndpoint = import.meta.env.VITE_AI_ENDPOINT || "https://api.deepseek.com/chat/completions";
const apiModel = import.meta.env.VITE_AI_MODEL || "deepseek-chat";
// Give the browser time to start the download before revoking the blob URL.
const BLOB_URL_REVOCATION_DELAY_MS = 250;

interface SceneCardForgeProps {
  onSceneForged?: (scene: Scene) => void;
  onScenesForged?: (scenes: Scene[]) => void;
  onCancel?: () => void;
}

interface SceneCardFormData {
  id: string;
  sceneTitle: string;
  adventure: string;
  act: string;
  location: string;
  sceneMode: string;
  stateType: string;
  sceneFunction: string;
  encounterType: string;
  terminusElement: string;
  anomalyDetails: string;
  ground: string;
  will: string;
  shift: string;
  drift: string;
  pressureType: string;
  scenePressure: number;
  readAloud: string;
  driftLadder: string;
  mapHooks: string;
  orderHooks: {
    Seeker: string;
    Breaker: string;
    Warden: string;
    Rival: string;
    Broker: string;
    Shade: string;
  };
}

export function SceneCardForge({ onSceneForged, onScenesForged, onCancel }: SceneCardForgeProps) {
  const { addToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAllGenerating, setIsAllGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState('');
  const [previewMarkdown, setPreviewMarkdown] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [seedIdea, setSeedIdea] = useState('');
  const [isBasicGenerating, setIsBasicGenerating] = useState(false);
  
  // Batch Mode States
  const [generationMode, setGenerationMode] = useState<'single' | 'sequence'>('single');
  const [numScenesInSequence, setNumScenesInSequence] = useState<number>(3);
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);

  const createEmptySceneForm = (index: number = 0, adventureName: string = "Custom Adventure", actName: string = "1"): SceneCardFormData => ({
    id: crypto.randomUUID(),
    sceneTitle: `Scene ${index + 1}`,
    adventure: adventureName,
    act: actName,
    location: "River Crossing",
    sceneMode: "Confrontation",
    stateType: "Active Scene",
    sceneFunction: index === 0 ? "Hook" : index === 1 ? "Obstacle" : "Confrontation",
    encounterType: "Mixed",
    terminusElement: "None / ordinary scene",
    anomalyDetails: "",
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

  const [scenesList, setScenesList] = useState<SceneCardFormData[]>(() => [createEmptySceneForm(0)]);
  
  // Helper updater for active form data state
  const setFormData = (updater: (prev: SceneCardFormData) => SceneCardFormData) => {
    setScenesList(prev => prev.map((item, idx) => {
      if (idx !== activeSceneIndex) return item;
      return updater(item);
    }));
  };

  const formData = scenesList[activeSceneIndex] || createEmptySceneForm(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, section: string | null = null, fieldName: string | null = null) => {
    const { name, value } = e.target;
    setScenesList(prev => prev.map((item, idx) => {
      if (idx !== activeSceneIndex) return item;
      
      if (section === 'orderHooks' && fieldName) {
        return {
          ...item,
          orderHooks: { ...item.orderHooks, [fieldName]: value }
        };
      } else {
        return {
          ...item,
          [name]: name === 'scenePressure' ? Number(value) : value
        };
      }
    }));
  };

  const buildSingleSceneCardMarkdown = (scene: SceneCardFormData) => {
    const safePressure = Math.max(1, Math.min(5, Number(scene.scenePressure) || 1));
    const orderLines = Object.entries(scene.orderHooks)
      .filter(([, hook]) => hook.trim())
      .map(([order, hook]) => `- **${order}:** ${hook.trim()}`)
      .join('\n');

    return `# ${scene.sceneTitle.trim() || 'Untitled Scene'}

## Metadata
- **Adventure:** ${scene.adventure.trim() || 'Custom Adventure'}
- **Act:** ${scene.act.trim() || '1'}
- **Location:** ${scene.location.trim() || 'Unknown'}
- **Scene Mode:** ${scene.sceneMode}
- **State Type:** ${scene.stateType}
- **Scene Function:** ${scene.sceneFunction}
- **Encounter Type:** ${scene.encounterType}
- **Terminus Element:** ${scene.terminusElement}
${scene.terminusElement !== "None / ordinary scene" ? `- **Anomaly Details:** ${scene.anomalyDetails.trim() || 'None'}\n` : ''}- **Pressure Type:** ${scene.pressureType}
- **Scene Pressure:** ${safePressure}/5

## Engine Layer (GWSD)
- **Ground:** ${scene.ground.trim() || 'TBD'}
- **Will:** ${scene.will.trim() || 'TBD'}
- **Shift:** ${scene.shift.trim() || 'TBD'}
- **Drift:** ${scene.drift.trim() || 'TBD'}

## Read-Aloud
${scene.readAloud.trim() || 'No read-aloud text provided.'}

## Drift Ladder / Transition State
${scene.driftLadder.trim() || 'No drift ladder provided.'}

## Map Hooks / Nouns
${scene.mapHooks.trim() || 'No map hooks provided.'}

## Order Hooks
${orderLines || '- No order hooks provided.'}
`;
  };

  const buildSceneCardMarkdown = () => {
    return scenesList.map(scene => buildSingleSceneCardMarkdown(scene)).join('\n---\n\n');
  };

  const getMissingRequiredFieldsForScene = (scene: SceneCardFormData) => {
    const missing: string[] = [];
    if (!scene.sceneTitle.trim()) missing.push('Scene Title');
    if (!scene.location.trim()) missing.push('Location');
    if (!scene.ground.trim()) missing.push('Ground');
    if (!scene.will.trim()) missing.push('Will');
    if (!scene.shift.trim()) missing.push('Shift');
    if (!scene.drift.trim()) missing.push('Drift');
    return missing;
  };

  const handlePreviewExport = () => {
    const markdown = buildSceneCardMarkdown();
    setPreviewMarkdown(markdown);
    setShowPreview(true);
    setGenerationMessage('✓ Preview generated. Review it below before forging scene cards.');
  };

  const handleForgeSceneCard = () => {
    // Validate all scenes in the list
    for (let idx = 0; idx < scenesList.length; idx++) {
      const missingFields = getMissingRequiredFieldsForScene(scenesList[idx]);
      if (missingFields.length > 0) {
        setActiveSceneIndex(idx);
        setGenerationMessage(`⚠️ Scene ${idx + 1} ("${scenesList[idx].sceneTitle}") is incomplete. Required: ${missingFields.join(', ')}`);
        addToast('error', `Scene "${scenesList[idx].sceneTitle}" requires: ${missingFields.join(', ')}`);
        return;
      }
    }

    const markdown = buildSceneCardMarkdown();
    setPreviewMarkdown(markdown);
    setShowPreview(true);

    // Download the single aggregated markdown file containing all cards
    const deckSlug = (scenesList[0].adventure || 'scene-deck')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const filename = `${deckSlug || 'scene-deck'}.md`;

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), BLOB_URL_REVOCATION_DELAY_MS);

    // Map forms into full Scene objects
    const parsedScenes: Scene[] = scenesList.map((scene, index) => {
      const sceneId = scene.id || crypto.randomUUID();
      const safePressure = Math.max(1, Math.min(5, Number(scene.scenePressure) || 1));

      const sceneModeMap: Record<string, SceneMode> = {
        'Confrontation': 'confrontation',
        'Discovery': 'discovery',
        'Social': 'social',
        'Hazard': 'hazard',
        'Trap': 'hazard',
      };
      const terminusSceneMode: SceneMode =
        sceneModeMap[scene.sceneMode] ?? 'confrontation';

      const orderKeyMap: Record<string, OrderId> = {
        Seeker: 'seeker', Breaker: 'breaker', Warden: 'warden',
        Rival: 'rival', Broker: 'broker', Shade: 'shade',
      };
      const orderTags: OrderId[] = Object.entries(scene.orderHooks)
        .filter(([, hook]) => hook.trim())
        .map(([order]) => orderKeyMap[order])
        .filter((o): o is OrderId => Boolean(o));

      const makeCard = (state: ActiveGWSDState, text: string): ActiveGWSDCard => ({
        id: crypto.randomUUID(),
        sceneId,
        stateType: 'active',
        state,
        text: text.trim(),
        source: 'manual',
      });

      const cards: [GWSDCard, GWSDCard, GWSDCard, GWSDCard] = [
        makeCard('ground', scene.ground),
        makeCard('will', scene.will),
        makeCard('shift', scene.shift),
        makeCard('drift', scene.drift),
      ];

      const storyFunctionMap: Record<string, StoryFunction> = {
        'Hook': 'hook',
        'Obstacle': 'obstacle',
        'Prospect': 'prospect',
        'Transition': 'hook',
        'Setup': 'hook',
        'Confrontation': 'hook',
        'Recovery': 'hook',
        'Discovery': 'hook',
        'Custom': 'hook',
      };
      const mappedStoryFunction = storyFunctionMap[scene.sceneFunction] ?? 'hook';

      return {
        id: sceneId,
        title: (scene.sceneTitle || `Scene ${index + 1}`).trim(),
        adventure: (scene.adventure || 'Custom Adventure').trim(),
        act: scene.act.trim() || undefined,
        order: index + 1,
        stateType: 'active',
        scenePressure: safePressure,
        cards,
        raw: buildSingleSceneCardMarkdown(scene),
        storyFunction: mappedStoryFunction,
        terminus: {
          scenePressure: safePressure,
          location: scene.location.trim(),
          sceneMode: terminusSceneMode,
          driftLadder: scene.driftLadder.trim(),
          mapHooks: scene.mapHooks.trim(),
          readAloud: scene.readAloud.trim(),
          orderTags,
          storyFunction: mappedStoryFunction,
        },
      };
    });

    // Notify the parent callback
    if (onScenesForged) {
      onScenesForged(parsedScenes);
    } else if (onSceneForged && parsedScenes.length > 0) {
      onSceneForged(parsedScenes[0]);
    }

    setGenerationMessage(`✓ ${scenesList.length} Scene Card(s) forged and downloaded as ${filename}`);
    addToast('success', `Forged ${scenesList.length} scene cards successfully!`);
  };

  const handleToggleState = (type: string) => {
    setScenesList(prev => prev.map((item, idx) => {
      if (idx !== activeSceneIndex) return item;
      return { ...item, stateType: type };
    }));
  };

  // Exponential backoff fetch for Gemini/Deepseek API
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

    let defaultSeed = "";
    if (formData.terminusElement === "None / ordinary scene") {
      defaultSeed = "An ordinary dark-fantasy RPG encounter (e.g. a toll bridge obstacle, a tavern high-stakes negotiation, a steep mountain climb, a tense border checkpoint).";
    } else {
      defaultSeed = "A mysterious failure of civic routine in a dark fantasy town, such as a repeating street, a gate that refuses mourners, or records dated tomorrow.";
    }
    const seedPrompt = seedIdea.trim() || defaultSeed;

    const isSequence = generationMode === 'sequence';

    const prompt = isSequence ? `
      You are an expert game designer for the Terminus RPG, a dark fantasy tabletop game powered by the Coherence System.
      In this world, reality is maintained through civic routine, law, memory, and repeated structure. When patterns fail, reality fractures (Ruptures) in localized, civic-procedural anomalies.
      
      Generate a cohesive narrative sequence of exactly ${numScenesInSequence} themed Terminus RPG scene setups based on the following:
      Terminus Element: ${formData.terminusElement}
      ${formData.terminusElement !== 'None / ordinary scene' && formData.anomalyDetails ? `Anomaly Details: ${formData.anomalyDetails}` : ''}
      User Seed/Concept: "${seedPrompt}"
      
      The sequence of ${numScenesInSequence} scenes should form a mini-campaign act or adventure session:
      - Scene 1: Hook / Setup (introduces the situation, stakes, and environment)
      - Middle scenes (2 to ${numScenesInSequence - 1}): Obstacles, Hazards, Discoveries, or Social interactions
      - Final scene (${numScenesInSequence}): Climax / Confrontation or tense resolution
      
      Requirements for each scene in the sequence:
      1. sceneTitle: Must be atmospheric and evocative of Terminus theme. Use Welsh, Norse, Gaelic, or Egyptian naming elements if appropriate (e.g. Rhudd-Sarn, Maerwyn, Valdr-Vard, Khamat-Maat) or mysterious civic/environmental terms.
      2. adventure: A fitting dark-fantasy adventure/campaign segment title (keep this identical across all scenes).
      3. act: A number or Roman numeral (keep this identical across all scenes).
      4. location: A specific geographic or architectural place fitting the scene function and location type (e.g. "Rhudd-Sarn Crossing", "Maerwyn Archive Gate 3", "The Ash-Chamber").
      5. sceneMode: Must be one of the following exact strings: "Confrontation", "Discovery", "Social", "Hazard", "Trap".
      
      Guidelines:
      - Aesthetic: Civic ruin, cold black stone, wet masonry, expired public works, rusted brass gears, celestial infrastructure, dried oxblood, bone paper.
      ${formData.terminusElement !== 'None / ordinary scene' ? `
      - Theme: Rupture is a local systemic failure of a routine (e.g., a bell ringing twice, a dead transit line accepting passengers, a street that grows longer).
      - Core Entities/Anomalies: Utilize Terminus lore such as **Corrections** (reality-enforcing manifestations of routine failure: Correction Body, Correction Instrument, Correction Writ, or Correction Office), **Correction Offices** that override Ground rules, and chilling folk designations like *The Black Walker*, *Vardrek*, or *Sithny's Mark*.
      ` : `
      - Theme: This is an ordinary dark-fantasy encounter with NO active reality fracture or supernatural anomaly. Focus on human pressures, physical obstacles, civic rules, or local conflicts.
      `}
      
      Return ONLY a valid JSON object matching this TypeScript interface exactly:
      {
        "scenes": [
          {
            "sceneTitle": "string",
            "adventure": "string",
            "act": "string",
            "location": "string",
            "sceneMode": "Confrontation" | "Discovery" | "Social" | "Hazard" | "Trap"
          }
        ]
      }
      Do not include any extra text, explanations, or markdown. Only the JSON object. The scenes array must have exactly ${numScenesInSequence} elements.
    ` : `
      You are an expert game designer for the Terminus RPG, a dark fantasy tabletop game powered by the Coherence System.
      In this world, reality is maintained through civic routine, law, memory, and repeated structure. When patterns fail, reality fractures (Ruptures) in localized, civic-procedural anomalies.
      
      Generate a themed Terminus RPG scene setup based on the following:
      Scene Function: ${formData.sceneFunction}
      Primary Encounter Type: ${formData.encounterType}
      Terminus Element: ${formData.terminusElement}
      ${formData.terminusElement !== 'None / ordinary scene' && formData.anomalyDetails ? `Anomaly Details: ${formData.anomalyDetails}` : ''}
      User Seed/Concept: "${seedPrompt}"
      
      Requirements:
      1. sceneTitle: Must be atmospheric and evocative of Terminus theme. Use Welsh, Norse, Gaelic, or Egyptian naming elements if appropriate (e.g. Rhudd-Sarn, Maerwyn, Valdr-Vard, Khamat-Maat) or mysterious civic/environmental terms.
      2. adventure: A fitting dark-fantasy adventure/campaign segment title.
      3. act: A number or Roman numeral (e.g., "1", "2", "3", "I", "II", "III").
      4. location: A specific geographic or architectural place fitting the scene function and location type (e.g. "Rhudd-Sarn Crossing", "Maerwyn Archive Gate 3", "The Ash-Chamber").
      5. sceneMode: Must be one of the following exact strings: "Confrontation", "Discovery", "Social", "Hazard", "Trap".
      
      Guidelines:
      - Aesthetic: Civic ruin, cold black stone, wet masonry, expired public works, rusted brass gears, celestial infrastructure, dried oxblood, bone paper.
      ${formData.terminusElement !== 'None / ordinary scene' ? `
      - Theme: Rupture is a local systemic failure of a routine (e.g., a bell ringing twice, a dead transit line accepting passengers, a street that grows longer, a bridge rejecting mourners, court verdicts changing based on who enters first).
      - Core Entities/Anomalies: Utilize Terminus lore such as **Corrections** (reality-enforcing manifestations of routine failure: Correction Body, Correction Instrument, Correction Writ, or Correction Office), **Correction Offices** that override Ground rules, and chilling folk designations like *The Black Walker*, *Vardrek*, or *Sithny's Mark*.
      ` : `
      - Theme: This is an ordinary dark-fantasy encounter with NO active reality fracture or supernatural anomaly. Focus on human pressures, physical obstacles, civic rules, or local conflicts.
      `}
      
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
      
      if (isSequence) {
        const generatedScenes = generatedData.scenes;
        if (Array.isArray(generatedScenes) && generatedScenes.length > 0) {
          setScenesList(generatedScenes.map((g, i) => {
            const base = createEmptySceneForm(i, g.adventure || formData.adventure, g.act || formData.act);
            return {
              ...base,
              sceneTitle: g.sceneTitle || base.sceneTitle,
              adventure: g.adventure || base.adventure,
              act: g.act || base.act,
              location: g.location || base.location,
              sceneMode: g.sceneMode || base.sceneMode,
              sceneFunction: i === 0 ? "Hook" : i === generatedScenes.length - 1 ? "Confrontation" : "Obstacle",
              encounterType: i === 0 ? "Exploration" : i === generatedScenes.length - 1 ? "Combat" : "Mixed",
              terminusElement: formData.terminusElement,
              anomalyDetails: formData.anomalyDetails,
            };
          }));
          setActiveSceneIndex(0);
          setGenerationMessage(`✓ Sequence of ${generatedScenes.length} scenes generated successfully.`);
          addToast('success', `Generated ${generatedScenes.length} scenes in sequence! Click active tabs to view.`);
        } else {
          throw new Error("Invalid scenes array returned from AI");
        }
      } else {
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
      }
    } catch (error) {
      console.error("Failed to generate basic info:", error);
      setGenerationMessage('✗ Failed to generate basic info. Check VITE_AI_API_KEY and endpoint.');
      addToast('error', 'Failed to generate basic info.');
    } finally {
      setIsBasicGenerating(false);
    }
  };

  // LLM Generation Logic for a single scene data structure (reusable for single and batch auto-fills)
  const handleAutoFillSingle = async (sceneIndex: number, currentList: SceneCardFormData[]) => {
    const scene = currentList[sceneIndex];
    if (!scene) return null;

    let defaultSeed = "";
    if (scene.terminusElement === "None / ordinary scene") {
      defaultSeed = "An ordinary dark-fantasy RPG encounter.";
    } else {
      defaultSeed = "A mysterious failure of civic routine in a dark fantasy town.";
    }
    const seedPrompt = seedIdea.trim() || defaultSeed;

    const sequenceContext = currentList.length > 1
      ? `Sequence Context: This scene is part of a sequence of ${currentList.length} scenes:\n` +
        currentList.map((s, idx) => `${idx + 1}. "${s.sceneTitle}" (${s.sceneFunction} - ${s.location})`).join('\n') +
        `\nCurrently generating content for Scene ${sceneIndex + 1} ("${scene.sceneTitle}"). Ensure the details flow logically in this narrative sequence.`
      : "";
    
    const prompt = `
      You are an expert game designer building a "Scene Card" for the Terminus RPG under the Coherence System.
      In this world, reality holds together through routine, law, memory, and repeated structure. When those patterns fail, a localized Rupture (systemic breakdown of reality) occurs.
      
      Based on the following basic scene metadata, generate the operational and narrative text for this scene card:
      
      Scene Title: ${scene.sceneTitle}
      Adventure: ${scene.adventure}
      Act: ${scene.act}
      Location: ${scene.location}
      Scene Mode: ${scene.sceneMode}
      Pressure Level (1-5): ${scene.scenePressure}
      State Type: ${scene.stateType}
      Scene Function: ${scene.sceneFunction}
      Primary Encounter Type: ${scene.encounterType}
      Terminus Element: ${scene.terminusElement}
      ${scene.terminusElement !== 'None / ordinary scene' && scene.anomalyDetails ? `Anomaly Details: ${scene.anomalyDetails}` : ''}

      ${sequenceContext}

      Follow these strict creative guidelines:
      1. THE ENGINE LAYER (GWSD)
         ${scene.terminusElement === 'None / ordinary scene' ? `
         - THIS IS AN ORDINARY SCENE with no supernatural or Rupture/Correction element. Do NOT use magical, supernatural, or reality-breaking terminology (e.g. no "reality fractures", "Rupture symptoms", "Correction Offices", etc.). Focus on purely physical, social, or historical stakes.
         - GWSD for Grounded Play:
           * ground: Define what is currently physically reliable or legally possible: physical constraints, social rules, access boundaries, permissions. Avoid vague flavor. Keep it actionable and game-focused.
             Good Ground example: "The bridge is guarded and payment is required to cross."
           * will: What pressure is already acting (e.g., goals of NPCs, physical momentum, time limits).
             Good Will example: "The toll captain wants coin, papers, or leverage before opening the gate."
           * shift: What changes immediately when characters act.
             Good Shift example: "If the party offers valid authority or payment, the gate opens; if they threaten force, guards close ranks."
           * drift: The executable "Else statement" — passive consequence of delay or inaction (what changes if no one resolves the situation).
             Good Drift example: "Delay draws other travelers, witnesses, and possible competitors."
         ` : `
         - THIS IS A TERMINUS ANOMALY SCENE (strain, symptoms, correction, old office pressure, etc.). Incorporate reality-breaking or procedural failure details.
         - GWSD for Supernatural/Anomaly Play:
           * ground: Define what is currently reliable: physical or metaphysical rules. Keep it actionable and game-focused.
             Good Ground example: "No one can hear speech beyond arm's reach, and the eastern door only opens for names recorded in the ward ledger."
           * will: The active pressure already acting on the situation before characters intervene, or the anomaly's momentum.
             Good Will example: "The lich is maintaining the ritual shield and will abandon any attack that risks breaking concentration."
           * shift: What changes immediately when characters act, interfere, or make an attempt.
             Good Shift example: "If anyone touches the sealed bell, every door in the room locks and the nearest dead name is read aloud."
           * drift: The executable "Else statement" — what worsens, advances, closes, or decays if no one acts at the end of a round.
             Good Drift example: "At the end of each round, another citizen's name vanishes from the civic register."
         `}
      
      2. OPTIONAL MECHANICS & FLAVOR
         - readAloud: Atmospheric, sensory, concrete, and short (1-2 sentences). Focus on rain, stone, bells, cold brass, wet masonry, sealed gates, smoke, old public works, or shifting structures. NEVER dictate player emotions or explain the metaphysics too early. Let the failure speak for itself.
           If this is an ordinary scene, focus on the mundane atmosphere (e.g., creaking wood, suspicious guards, wet road, flickering torches, mud).
         - driftLadder: If Drift is a sequence, specify 3 incremental steps (e.g. 1. Water reaches ankles -> 2. Lower exits flood -> 3. Bridge buckles).
           For an ordinary scene, use natural physical/social escalation (e.g. 1. Guard calls for reinforcement -> 2. Gate is barred completely -> 3. Local patrol arrives).
         - mapHooks: 2-3 specific interactive map elements (e.g. "The crumbling pillar," "The iron ledger grate").

      3. ORDER HOOKS (SPECIFIC OPPORTUNITIES)
         - Generate a table-facing opportunity for each of the 6 Orders using bounded, practical game terms (e.g., reveal, delay, expose, hold, block, reduce impact, act before next Drift, force hesitation, open a passage).
         - Keep these opportunities strictly grounded in the scene context. If this is an ordinary scene (e.g. Toll Bridge obstacle), make them ordinary (e.g. Seeker: reveal the toll captain's hidden debt; Breaker: force open the side gate lock; Warden: block guards from closing the gate; Rival: challenge the champion guard to a wager; Broker: leverage local merchant papers; Shade: sneak past the watchtower).
         - Avoid software or internal developer jargon (no references to "runtime", "simulation", "state machine", "code", "AI", "text blocks"). These are player-facing tools.
         - Avoid over-absolute terms ("automatically", "completely", "guarantee", "without a roll", "entire party", "rewrite the scene").
         - Specific order goals:
           * Seeker: Reveal hidden, forgotten, or sealed truth before it collapses.
           * Breaker: Force openings in walls, wards, deadlocks, or dead systems.
           * Warden: Hold collapse at bay, keep doors shut, preserve doomed structures.
           * Rival: Turn conflict into duels, wagers, or structured contests.
           * Broker: Manage passage rights, debts, patronage, or convert bonds to leverage.
           * Shade: Access hidden paths, conceal, or redirect attention where it fails.

      4. TERMINOLOGY BOUNDARY & CORRECTIONS (CRITICAL - ONLY APPLY IF NOT AN ORDINARY SCENE)
         - If this is NOT an ordinary scene:
           * "Rupture" names a condition state — systemic failure when Routine no longer holds. NEVER treat Rupture as a substance, energy type, spell school, or blade/monster infusion. 
           * Never write "Rupture energy," "Rupture power," "Rupture magic," "Rupture-infused," "Rupture blade," or similar. 
           * Instead, show physical, civic, sensory, or procedural symptoms: ink separating into oil and brine, blades casting two shadows, bells ringing before being struck, stairs repeating every seventh step, road lines crawling across the stone.
           * Integrate Terminus enforcements: **Corrections** (Correction Body, Correction Instrument, Correction Writ, or Correction Office).
           * Show **Correction Offices** attempting to rewrite environmental Ground rules to force compliance, and draw upon folk names like *The Black Walker*, *Vardrek*, or *Sithny's Mark* to represent the haunting nature of these systemic anomalies.
         - If this IS an ordinary scene, avoid all mention of Ruptures, Corrections, supernatural details, or reality breakdown.
      
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
    return {
      ground: generatedData.ground || "",
      will: generatedData.will || "",
      shift: generatedData.shift || "",
      drift: generatedData.drift || "",
      readAloud: generatedData.readAloud || "",
      driftLadder: generatedData.driftLadder || "",
      mapHooks: generatedData.mapHooks || "",
      orderHooks: {
        Seeker: generatedData.orderHooks?.Seeker || "",
        Breaker: generatedData.orderHooks?.Breaker || "",
        Warden: generatedData.orderHooks?.Warden || "",
        Rival: generatedData.orderHooks?.Rival || "",
        Broker: generatedData.orderHooks?.Broker || "",
        Shade: generatedData.orderHooks?.Shade || "",
      }
    };
  };

  const handleAutoFill = async () => {
    if (!apiKey) {
      setGenerationMessage('⚠️ API key not configured. Set VITE_AI_API_KEY in your environment (.env.local).');
      addToast('error', 'AI API key not configured. Set VITE_AI_API_KEY in your .env.local file.');
      return;
    }

    setIsGenerating(true);
    setGenerationMessage('');
    
    try {
      const generated = await handleAutoFillSingle(activeSceneIndex, scenesList);
      if (generated) {
        setFormData(prev => ({
          ...prev,
          ...generated
        }));
        setGenerationMessage('✓ Scene content generated successfully');
        addToast('success', 'Scene content generated — fill in any remaining fields and click Forge Scene Cards');
      }
    } catch (error) {
      console.error("Failed to generate content:", error);
      setGenerationMessage('✗ Failed to generate scene content. Check your VITE_AI_API_KEY and endpoint.');
      addToast('error', 'Failed to generate scene content.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAutoFillAll = async () => {
    if (!apiKey) {
      setGenerationMessage('⚠️ API key not configured. Set VITE_AI_API_KEY in your environment (.env.local).');
      addToast('error', 'AI API key not configured. Set VITE_AI_API_KEY in your .env.local file.');
      return;
    }

    setIsAllGenerating(true);
    setGenerationMessage('Generating content for all scenes in sequence...');
    addToast('info', `Starting auto-fill for all ${scenesList.length} scenes. This might take a few moments...`);

    try {
      const updatedScenesList = [...scenesList];
      for (let i = 0; i < updatedScenesList.length; i++) {
        setGenerationMessage(`Generating scene ${i + 1} of ${updatedScenesList.length}...`);
        const generated = await handleAutoFillSingle(i, updatedScenesList);
        if (generated) {
          updatedScenesList[i] = {
            ...updatedScenesList[i],
            ...generated
          };
          // Update state step-by-step so the user sees live progress!
          setScenesList([...updatedScenesList]);
        }
      }
      setGenerationMessage(`✓ Content generated for all ${scenesList.length} scenes successfully.`);
      addToast('success', `Successfully auto-filled all ${scenesList.length} scenes in the sequence!`);
    } catch (error) {
      console.error("Failed to generate all content:", error);
      setGenerationMessage('✗ Failed during multi-card generation. Some scenes might have been completed.');
      addToast('error', 'Failed to auto-fill all scenes.');
    } finally {
      setIsAllGenerating(false);
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
          
          {/* A. Premium Batch Controls */}
          <div className="bg-slate-950/50 backdrop-blur-md border border-slate-800 rounded-lg p-5 mb-2 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Forge Mode</label>
              <div className="flex gap-2 p-1 bg-slate-900 border border-slate-850 rounded-lg inline-flex">
                <button
                  type="button"
                  onClick={() => {
                    setGenerationMode('single');
                    if (scenesList.length > 1) {
                      setScenesList([scenesList[0]]);
                      setActiveSceneIndex(0);
                    }
                  }}
                  className={`px-4 py-1.5 text-xs font-semibold rounded transition-all ${
                    generationMode === 'single'
                      ? 'bg-amber-600 text-amber-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  Single Card
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGenerationMode('sequence');
                    if (scenesList.length === 1) {
                      setScenesList([
                        scenesList[0],
                        createEmptySceneForm(1, scenesList[0].adventure, scenesList[0].act),
                        createEmptySceneForm(2, scenesList[0].adventure, scenesList[0].act),
                      ]);
                      setActiveSceneIndex(0);
                    }
                  }}
                  className={`px-4 py-1.5 text-xs font-semibold rounded transition-all ${
                    generationMode === 'sequence'
                      ? 'bg-amber-600 text-amber-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  Card Sequence (Session Deck)
                </button>
              </div>
            </div>

            {generationMode === 'sequence' && (
              <div className="flex flex-wrap items-center gap-4 animate-fadeIn">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Sequence Size</label>
                  <select
                    value={numScenesInSequence}
                    onChange={(e) => {
                      const newSize = Number(e.target.value);
                      setNumScenesInSequence(newSize);
                      setScenesList(prev => {
                        const next = [...prev];
                        if (next.length < newSize) {
                          for (let i = next.length; i < newSize; i++) {
                            next.push(createEmptySceneForm(i, prev[0]?.adventure || "Custom Adventure", prev[0]?.act || "1"));
                          }
                        } else if (next.length > newSize) {
                          next.splice(newSize);
                        }
                        return next;
                      });
                      if (activeSceneIndex >= newSize) {
                        setActiveSceneIndex(newSize - 1);
                      }
                    }}
                    className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 outline-none"
                  >
                    <option value={2}>2 Scenes</option>
                    <option value={3}>3 Scenes</option>
                    <option value={4}>4 Scenes</option>
                    <option value={5}>5 Scenes</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Manual Builder</label>
                  <button
                    type="button"
                    onClick={() => {
                      setScenesList(prev => [
                        ...prev,
                        createEmptySceneForm(prev.length, prev[0]?.adventure || "Custom Adventure", prev[0]?.act || "1")
                      ]);
                      setActiveSceneIndex(scenesList.length);
                    }}
                    className="px-4 py-1.5 text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold rounded hover:bg-slate-800 transition-all"
                  >
                    + Add Card
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* B. Cards Tab Selector */}
          <div className="flex flex-wrap items-end gap-1.5 border-b border-slate-800 bg-slate-950/20 px-2 pt-2 rounded-t-lg">
            {scenesList.map((scene, index) => {
              const isActive = index === activeSceneIndex;
              return (
                <div
                  key={scene.id}
                  className={`group relative flex items-center gap-2 px-4 py-2.5 text-xs border-t border-x rounded-t transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 border-slate-700 text-amber-400 font-semibold shadow-[0_-2px_10px_-3px_rgba(245,158,11,0.15)] z-10'
                      : 'bg-slate-950/40 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                  }`}
                  onClick={() => setActiveSceneIndex(index)}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-amber-500' : 'bg-slate-600'}`} />
                  <span className="max-w-[120px] truncate">
                    {scene.sceneTitle || `Scene ${index + 1}`}
                  </span>
                  {scenesList.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setScenesList(prev => prev.filter((_, idx) => idx !== index));
                        if (activeSceneIndex >= scenesList.length - 1) {
                          setActiveSceneIndex(Math.max(0, scenesList.length - 2));
                        }
                      }}
                      className="text-slate-500 hover:text-red-400 transition-colors ml-1 p-0.5 rounded hover:bg-slate-800"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          
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
                {isBasicGenerating ? 'Forging Info...' : generationMode === 'sequence' ? 'Generate Scene Sequence' : 'Generate Basic Info'}
              </button>
            </div>

            {/* Foundational Authoring Questions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">1. Scene Function</label>
                <select 
                  name="sceneFunction" 
                  value={formData.sceneFunction} 
                  onChange={handleInputChange} 
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none"
                >
                  <option>Hook</option>
                  <option>Obstacle</option>
                  <option>Prospect</option>
                  <option>Transition</option>
                  <option>Setup</option>
                  <option>Confrontation</option>
                  <option>Recovery</option>
                  <option>Discovery</option>
                  <option>Custom</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">2. Encounter Type</label>
                <select 
                  name="encounterType" 
                  value={formData.encounterType} 
                  onChange={handleInputChange} 
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none"
                >
                  <option>Combat</option>
                  <option>Role-playing</option>
                  <option>Problem-solving</option>
                  <option>Exploration</option>
                  <option>Hazard</option>
                  <option>Social</option>
                  <option>Mixed</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">3. Terminus Element</label>
                <select 
                  name="terminusElement" 
                  value={formData.terminusElement} 
                  onChange={handleInputChange} 
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none"
                >
                  <option>None / ordinary scene</option>
                  <option>Low strain</option>
                  <option>Rupture symptoms</option>
                  <option>Correction influence</option>
                  <option>Old Office pressure</option>
                  <option>Broken routine</option>
                  <option>Custom</option>
                </select>
              </div>
            </div>

            {/* Conditionally show Anomaly details if Terminus element is selected */}
            {formData.terminusElement !== "None / ordinary scene" && (
              <div className="mb-4 space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Anomaly / Rupture / Correction Details</label>
                <textarea
                  name="anomalyDetails"
                  value={formData.anomalyDetails}
                  onChange={handleInputChange}
                  placeholder="Enter details about the reality fracture, routine failure, or Correction influence..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-amber-500 outline-none resize-none transition-all font-mono"
                />
              </div>
            )}

            {/* AI Generator Seed Box */}
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
                {formData.terminusElement === "None / ordinary scene" ? (
                  <>
                    Type a grounded scene concept (e.g. <em>"A toll bridge guarded by a corrupt sergeant"</em>) or leave empty for a random seed, then click <strong>{generationMode === 'sequence' ? 'Generate Scene Sequence' : 'Generate Basic Info'}</strong>.
                  </>
                ) : (
                  <>
                    Type an anomaly concept (e.g. <em>"A street that grows longer the faster you run"</em>) or leave empty for a random seed, then click <strong>{generationMode === 'sequence' ? 'Generate Scene Sequence' : 'Generate Basic Info'}</strong>.
                  </>
                )}
              </p>
              <textarea
                value={seedIdea}
                onChange={(e) => setSeedIdea(e.target.value)}
                placeholder={formData.terminusElement === "None / ordinary scene" ? "Enter ordinary scene concept or story hook..." : "Enter scene concept, anomaly description, or story hook..."}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-amber-500 outline-none resize-none font-mono transition-all"
              />
            </div>

            {/* General Metadata Fields */}
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
              <div className="flex gap-2">
                {generationMode === 'sequence' && (
                  <button 
                    type="button"
                    onClick={handleAutoFillAll}
                    disabled={isGenerating || isAllGenerating || !apiKey}
                    className="flex items-center gap-1.5 text-xs bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-800/50 px-3 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAllGenerating ? <Activity size={14} className="animate-pulse" /> : <Sparkles size={14} />}
                    {isAllGenerating ? 'Generating All...' : 'Auto-Fill All Scenes'}
                  </button>
                )}
                <button 
                  type="button"
                  onClick={handleAutoFill}
                  disabled={isGenerating || isAllGenerating || !apiKey}
                  className="flex items-center gap-1.5 text-xs bg-indigo-900/30 hover:bg-indigo-800/40 text-indigo-300 border border-indigo-700/50 px-3 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? <Activity size={14} className="animate-pulse" /> : <Sparkles size={14} />}
                  {isGenerating ? 'Generating Current...' : generationMode === 'sequence' ? 'Auto-Fill Current Scene' : 'Auto-Fill with AI'}
                </button>
              </div>
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
                <textarea name="drift" value={formData.drift} onChange={handleInputChange} rows={3} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-amber-500 outline-none resize-none font-mono text-xs" placeholder="Type: Hesitation. If the cell stalls, ..." />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 border border-slate-800 rounded p-3 text-slate-400">
                <strong className="block text-amber-400 mb-1">Fill Drift first</strong>
                Four boxes is real prep. If you only fill one, fill Drift. Choose a type (hesitation, ambient, alert, entropy).
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded p-3 text-slate-400">
                <strong className="block text-amber-400 mb-1">Who profits</strong>
                Will is not only the monster. Name who needs this Rupture to stay thin.
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded p-3 text-slate-400">
                <strong className="block text-amber-400 mb-1">Type, then shape</strong>
                Type is why the clock moves. Hazard/Trap is only what the tick looks like.
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
                    value={formData.orderHooks[order as keyof typeof formData.orderHooks] || ""} 
                    onChange={(e) => handleInputChange(e, 'orderHooks', order)} 
                    className="flex-1 bg-slate-950 border border-slate-880 rounded p-2 text-sm text-slate-300 focus:border-amber-500 outline-none" 
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
              className="flex items-center gap-2 px-6 py-2 text-sm bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold rounded shadow-lg shadow-amber-900/20 transition-colors animate-pulse-slow"
            >
              <Save size={16} /> {generationMode === 'sequence' ? `Forge ${scenesList.length} Scene Cards` : 'Forge Scene Card'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
