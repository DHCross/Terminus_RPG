import type { GeneratedName } from '../data/terminus/names';

export interface AISceneRequest {
  prompt: string;
  adventure?: string;
  act?: string;
}

export interface AISceneResponse {
  title: string;
  adventure: string;
  act: string;
  location: string;
  sceneMode: 'confrontation' | 'hazard' | 'kinetic' | 'social' | 'discovery' | 'puzzle';
  stateType: 'active' | 'latent';
  pressureType: string;
  scenePressure: number;
  readAloud: string;
  ground: string;
  will?: string;
  shift?: string;
  drift?: string;
  trigger?: string;
  accumulation?: string;
  reveal?: string;
  driftLadder?: string;
  mapHooks?: string;
  orderHooks: {
    seeker?: string;
    breaker?: string;
    warden?: string;
    rival?: string;
    broker?: string;
    shade?: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeSceneArray(payload: unknown): AISceneResponse[] {
  const candidates = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.scenes)
      ? payload.scenes
      : [payload];

  return candidates.filter((entry): entry is AISceneResponse => (
    isRecord(entry) &&
    typeof entry.title === 'string' &&
    typeof entry.ground === 'string' &&
    typeof entry.stateType === 'string'
  ));
}

export async function generateSceneFromPrompt(request: AISceneRequest, apiKey: string, baseUrl: string = 'https://api.openai.com/v1', model: string = 'gpt-4o-mini'): Promise<AISceneResponse[]> {
  const systemPrompt = `You are the Coherence Engine for the Terminus RPG under the Coherence System. You generate "GWSD" Scene Cards.
GWSD stands for Ground, Will, Shift, Drift (for active scenes) or Ground, Hidden Pressure, Trigger, Accumulation (for latent conditions).
Tone: Dark fantasy, civic-ruin, tragic bureaucracy. The setting is 'Tringad' where routine, law, and repeated structure maintain reality. When those fail, reality fractures (Ruptures).

Follow these strict creative guidelines:
1. THE ENGINE LAYER (GWSD)
   - ground: Define what is currently reliable right now: physical constraints, social rules, access boundaries, permissions. Keep it actionable and game-focused. 
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
     * seeker: Reveal hidden, forgotten, or sealed truth before it collapses.
     * breaker: Force openings in walls, wards, deadlocks, or dead systems.
     * warden: Hold collapse at bay, keep doors shut, preserve doomed structures.
     * rival: Turn conflict into duels, wagers, or structured contests.
     * broker: Manage passage rights, debts, patronage, or convert bonds to leverage.
     * shade: Access hidden paths, conceal, or redirect attention where it fails.

4. TERMINOLOGY BOUNDARY & CORRECTIONS (CRITICAL)
   - "Rupture" names a condition state — systemic failure when Routine no longer holds. NEVER treat Rupture as a substance, energy type, spell school, or blade/monster infusion. 
   - Never write "Rupture energy," "Rupture power," "Rupture magic," "Rupture-infused," "Rupture blade," or similar. 
   - Instead, show physical, civic, sensory, or procedural symptoms: ink separating into oil and brine, blades casting two shadows, bells ringing before being struck, stairs repeating every seventh step, road lines crawling across the stone.
   - Integrate Terminus entities and enforcements: **Corrections** (Correction Body, Correction Instrument, Correction Writ, or Correction Office).
   - Show **Correction Offices** attempting to rewrite environmental Ground rules to force compliance, and draw upon folk names like *The Black Walker*, *Vardrek*, or *Sithny's Mark* to represent the haunting nature of these systemic anomalies.

Output a valid JSON object matching this schema:
{
  "scenes": [
    {
      "title": "String (evocative name)",
      "adventure": "String (defaults to custom if unknown)",
      "act": "String (optional)",
      "location": "String",
      "sceneMode": "confrontation|hazard|kinetic|social|discovery|puzzle",
      "stateType": "active|latent",
      "pressureType": "ground|will|shift|drift",
      "scenePressure": 1-5 (Number, usually 2, 3, or 4),
      "readAloud": "String (1-2 sentences of atmospheric prose read to players)",
      "ground": "String (What is currently reliable or stable)",
      
      // IF stateType is active (include these 3):
      "will": "String (What pressure is already acting)",
      "shift": "String (What changes immediately when characters act)",
      "drift": "String (What changes if no one resolves it)",
      
      // IF stateType is latent (include these 3 instead):
      "will": "String (Hidden pressure present but not active)",
      "trigger": "String (What turns this active)",
      "accumulation": "String (How the pressure builds unnoticed)",
      "reveal": "String (Optional: what active state it becomes)",

      "driftLadder": "String (Optional: Sequential steps of drift, e.g., 1. X -> 2. Y)",
      "mapHooks": "String (Optional: Specific nouns/locations to interact with)",
      "orderHooks": {
        "seeker": "Opportunity to reveal truth",
        "breaker": "Opportunity to force an opening",
        "warden": "Opportunity to hold the line",
        "rival": "Opportunity to challenge/measure",
        "broker": "Opportunity to bargain",
        "shade": "Opportunity to bypass/conceal"
      }
    }
  ]
}`;

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate a Terminus RPG GWSD scene based on this prompt: "${request.prompt}"\nAdventure context: ${request.adventure || 'None'}\nAct context: ${request.act || 'None'}` }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const parsed = JSON.parse(content);
    const scenes = normalizeSceneArray(parsed);
    if (scenes.length === 0) {
      throw new Error(`AI response contained no valid scene objects matching the expected schema (received ${typeof parsed}).`);
    }
    return scenes;
  } catch (error: unknown) {
    throw new Error('Failed to parse AI response as JSON.', { cause: error });
  }
}

export interface AINameRequest {
  culture: 'Welsh' | 'Norse' | 'Gaelic' | 'Egyptian' | 'Other';
  usage: 'person' | 'place' | 'institution' | 'office' | 'threat' | 'ritual' | 'artifact' | 'custom';
  count: number;
  contextPrompt?: string;
}

function normalizeNameArray(payload: unknown): Omit<GeneratedName, 'id'>[] {
  const candidates = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.names)
      ? payload.names
      : [payload];

  return candidates
    .filter((entry): entry is Record<string, unknown> => isRecord(entry))
    .map((entry) => ({
      name: String(entry.name || ''),
      phonetic: String(entry.phonetic || ''),
      ipa: entry.ipa ? String(entry.ipa) : undefined,
      cultureProfile: (entry.cultureProfile || 'Other') as any,
      usage: (entry.usage || 'person') as any,
      shortMeaning: entry.shortMeaning ? String(entry.shortMeaning) : undefined,
      publicDescription: entry.publicDescription ? String(entry.publicDescription) : undefined,
      internalNote: entry.internalNote ? String(entry.internalNote) : undefined,
    }))
    .filter((entry) => entry.name && entry.phonetic);
}

export async function generateNamesFromAI(
  request: AINameRequest,
  apiKey: string,
  baseUrl: string = 'https://api.openai.com/v1',
  model: string = 'gpt-4o-mini'
): Promise<Omit<GeneratedName, 'id'>[]> {
  const systemPrompt = `You are the Nomenclator Engine for the Terminus RPG. You generate "GeneratedName" data records.
Tone: Dark fantasy, civic-ruin, tragic bureaucracy. The setting is 'Tringad' where the world is a degrading simulation maintained by routines.

Every generated name must include:
1. "name": The formal, evocative name.
2. "phonetic": Player-facing pronunciation that is highly readable by ordinary English-speaking players. Use simple phonetic spelling, not full IPA.
3. "ipa": Optional technical/internal International Phonetic Alphabet representation of the name.
4. "cultureProfile": Must match exactly the culture profile requested: "Welsh", "Norse", "Gaelic", "Egyptian", or "Other".
5. "usage": Must match exactly: "person", "place", "institution", "office", "threat", "ritual", "artifact", or "custom".
6. "shortMeaning": A very short, translation or literal meaning of the name parts.
7. "publicDescription": Player-facing lore describing the name's history, appearance, or significance in the decaying world of Tringad.
8. "internalNote": Hidden developer/game-master note containing mechanical triggers, latent pressure information, or deep world secrets.

Examples of spelling & pronunciation styles:
- Welsh: Rhudd-Sarn — HRITH sahrn (ipa: "r̥ɨð saːrn")
- Welsh: Maerwyn — MIRE-win (ipa: "maɪrwɪn")
- Norse: Valdr-Vard — VAL-der vahrd (ipa: "valdr vɑːrd")
- Norse: Saint Latimer — SAYNT LAT-ih-mer (ipa: "seɪnt lætɪmər")
- Egyptian: Khamat-Maat — KAH-mat MAHT (ipa: "xæmæt mɑːt")

Output a valid JSON object matching this schema:
{
  "names": [
    {
      "name": "String (the name)",
      "phonetic": "String (capitalized simple English phonetic spelling, e.g. MIRE-win)",
      "ipa": "String (optional detailed IPA representation)",
      "cultureProfile": "Welsh|Norse|Gaelic|Egyptian|Other",
      "usage": "person|place|institution|office|threat|ritual|artifact|custom",
      "shortMeaning": "String (meaning)",
      "publicDescription": "String (atmospheric player-facing description)",
      "internalNote": "String (secret DM lore or mechanical notes)"
    }
  ]
}`;

  const userPrompt = `Generate exactly ${request.count} names with these parameters:
Culture: ${request.culture}
Usage: ${request.usage}
${request.contextPrompt ? `Thematic Context/Keywords: "${request.contextPrompt}"` : ''}

Ensure all generated names are extremely high-quality and directly usable at a Tringad playtest table. Make sure they sound evocative, tragic, and civic-bureaucratic.`;

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const parsed = JSON.parse(content);
    const names = normalizeNameArray(parsed);
    if (names.length === 0) {
      throw new Error(`AI response contained no valid name records matching the schema.`);
    }
    return names;
  } catch (error: unknown) {
    throw new Error('Failed to parse AI name response as JSON.', { cause: error });
  }
}
