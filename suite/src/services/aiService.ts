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

import type { AIAdventureRequest, AdventureOutline } from '../modules/terminus/adventure/types';

export async function generateAdventureOutline(
  request: AIAdventureRequest,
  apiKey: string,
  baseUrl: string = 'https://api.openai.com/v1',
  model: string = 'gpt-4o-mini'
): Promise<Omit<AdventureOutline, 'id' | 'createdAt'>> {
  const systemPrompt = `You are the Adventure Architect for the Terminus RPG under the Coherence System.
You generate a fully formed "AdventureOutline" JSON object.

Tringad Setting: Dark fantasy, civic-ruin, tragic bureaucracy, where reality holds together through routine, law, and repeated structure. When routines crumble, reality fractures into Ruptures.
Responders (the players) enter districts to prevent collapse and restore stable parameters.

CRITICAL DESIGN PRINCIPLES (from the Storytellers Guide):
1. PLAYABILITY OVER EXPOSITION: Do not write a linear story or a passive lore dump. Use "Story-Latent Plots" where the adventure maps the potential conflicts and situations, leaving outcomes completely open to player interaction and chance.
2. CORE ACTIVITY: The prompt defines the premise. The adventure structure must align with one of the 5 structures:
   - dungeon: Geography-driven exploration of discrete physical space.
   - mystery: Clue-driven investigation across scenes.
   - fights: Momentum-driven sequential confrontations.
   - survival: Threat-driven defense of a place/person.
   - intrigue: Power-driven vying for political influence.
3. CONCRETE SENSORY 3D DESCRIPTIONS: Sensory text must describe concrete objects, textures, and lighting (rain, dark iron, wet stone, tolling bells, damp registries). STRICTLY FORBID "Emotional Dictation" (do not tell players what their characters feel, e.g. do not write "you feel dread" or "you are struck by awe"). Do not use "Prospective Language" like "You might notice..." or "You could hear...". Everything must be present tense and observable.
4. ACTIVE NPC & MONSTER WILLS: Every NPC must have a clear "Will" (active intention), mapped to their Social Class (from Criminal Underclass to Upper Upper). Major NPCs must be assigned clear "Story Roles":
   - Ally (supports PCs, but never acts as a Deus Ex Machina or outshines the PCs).
   - Competitor (creates rivalry without necessitating lethal combat).
   - Hinderer (provides obstacles through bureaucracy, misinformation, or red tape).
   - Patron (provides resources/leverage, but demands compliance or duty).
   - Wild Card (unpredictable, shifting allegiances).
5. NO DESCRIPTIVE LORE DUMPS: Keep past history extremely light; focus on active ongoing tensions that characters can interact with.
6. SCENE RESOLUTIONS AND STUCK CUES: Provide concrete, actionable "If the Players Are Stuck" cues or triggers for the GM to keep the game flowing.

Generate a JSON object strictly matching the following schema structure:
{
  "title": "Evocative Title (theme/stakes)",
  "summary": "One-paragraph synopsis describing the main conflict, objectives, and tone.",
  "campaignContext": "String showing where this fits.",
  "playerProgression": "Level range and playtime (e.g. Levels 2-3, 3-5 hours)",
  "campaignDate": "Evocative in-game date or calendar system (e.g. 14th of the Raining Bell, Cycle 8)",
  "originationLocale": {
    "name": "Starting location name",
    "description": "Short evocative physical description.",
    "details": "Cultural, political, or geographical details relevant to the adventure.",
    "tensions": "Ongoing friction (e.g., guilds, local offices, water shortages)."
  },
  "themes": {
    "primary": "Primary theme (mystery, redemption, survival, etc.)",
    "secondary": "Secondary theme (sacrifice, bureaucratic neglect, lingering guilt)"
  },
  "milieu": {
    "pastEvents": "Significant event shaping current scenario.",
    "ongoingEvents": "Active ongoing conflicts.",
    "consequences": "What could happen based on responder decisions (multiple possibilities)."
  },
  "npcs": {
    "major": [
      {
        "name": "Evocative name",
        "race": "Species/Lineage (e.g. Human, Hollow, Silt-born)",
        "gender": "Gender",
        "class": "Order or trade",
        "socialClass": "Social standing (e.g. Lower Middle, Upper Lower)",
        "affiliations": "Faction/Guild",
        "goals": "Their active, immediate goal",
        "role": "ally | competitor | hinderer | patron | wildcard",
        "relationship": "How they view or relate to the responders"
      }
    ],
    "minor": [
      {
        "name": "Name",
        "description": "Short description",
        "purpose": "Their narrative purpose in the plot"
      }
    ]
  },
  "threats": {
    "major": [
      {
        "name": "Name",
        "type": "Monster/Threat type",
        "class": "Threat category (e.g. Correction Instrument, Remnant, Stray)",
        "role": "Narrative role / representation of theme",
        "goals": "What they seek to achieve or defend"
      }
    ],
    "minor": [
      {
        "name": "Name",
        "role": "Their mechanical/combat role (e.g. Fodder, Hazard, Skirmisher)",
        "description": "Short physical and atmospheric description"
      }
    ]
  },
  "plot": {
    "act1": {
      "incitingIncident": "Specific event that forces action.",
      "endpoint": "First major objective achieved.",
      "turningPoints": ["Turning point 1", "Turning point 2"]
    },
    "act2": {
      "incitingIncident": "New twists or complications.",
      "endpoint": "Key midpoint goal achieved.",
      "turningPoints": ["Twist 1", "Complication 2"]
    },
    "act3": {
      "incitingIncident": "Final revelation or peak stakes.",
      "endpoint": "Climax and open resolution.",
      "turningPoints": ["Key decision point", "Consequence trigger"]
    }
  },
  "encounters": [
    {
      "name": "Encounter Name",
      "type": "combat | roleplay | puzzle | exploration | mixed",
      "function": "advance | challenge | information",
      "goal": "Significance / what players need to get/solve",
      "plotElement": "Connection to the overarching mystery/conflict",
      "location": "Physical location (description of key objects and textures)",
      "description": "Sensory-dense, concrete description of the setup and the challenge.",
      "boundTriggers": "Triggered by player action (what triggers this encounter or a complication)",
      "unboundTriggers": "Contingencies based on creative or unusual player actions (stuck cues)"
    }
  ],
  "goals": {
    "primary": "Overarching objective",
    "secondary": "Side objectives providing moral weight or mechanical aid",
    "moralDilemmas": "A severe choice the responders must make (e.g., purge a district or save its forgotten citizens)."
  }
}`;

  const userPrompt = `Generate a complete Adventure Outline for the Terminus RPG with these details:
Premise/Idea: "${request.premise}"
Structure Archetype: "${request.structure}" (focus heavily on this gameplay loop)
Core Activity: "${request.coreActivity || 'Responders sent to stabilize the failing reality anchors'}"
Campaign Context: "${request.campaignContext || 'Standard operations'}"
Player Progression: "${request.playerProgression || 'Levels 1-3, 3-4 hours'}"
Culture Inspiration: "${request.culture}"

Ensure the generated NPCs have active wills and are anchored in social standings. Ensure the encounters include both triggered complications and fallback stuck cues. DO NOT use generic placeholders or write "TBD". Complete every field with rich, high-quality, atmospheric, and playable Terminus narrative.`;

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
    return parsed as Omit<AdventureOutline, 'id' | 'createdAt'>;
  } catch (error: unknown) {
    throw new Error('Failed to parse AI adventure response as JSON.', { cause: error });
  }
}

