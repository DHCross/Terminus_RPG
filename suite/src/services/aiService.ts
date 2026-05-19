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

export async function generateSceneFromPrompt(request: AISceneRequest, apiKey: string, baseUrl: string = 'https://api.openai.com/v1', model: string = 'gpt-4o-mini'): Promise<AISceneResponse> {
  const systemPrompt = `You are the Coherence Engine for the Terminus RPG. You generate "GWSD" Scene Cards.
GWSD stands for Ground, Will, Shift, Drift (for active scenes) or Ground, Hidden Pressure, Trigger, Accumulation (for latent conditions).
Tone: Dark fantasy, civic-ruin, tragic bureaucracy. The setting is 'Tringad' where the world is a degrading simulation maintained by routines.

Output a valid JSON object matching this schema:
{
  "title": "String (evocative name)",
  "adventure": "String (defaults to custom if unknown)",
  "act": "String (optional)",
  "location": "String",
  "sceneMode": "confrontation|hazard|kinetic|social|discovery|puzzle",
  "stateType": "active|latent",
  "pressureType": "ground|will|shift|drift",
  "scenePressure": 1-5 (Number, usually 2, 3, or 4),
  "readAloud": "String (2-3 sentences of atmospheric prose read to players)",
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
    return JSON.parse(content) as AISceneResponse;
  } catch (error: unknown) {
    throw new Error('Failed to parse AI response as JSON.', { cause: error });
  }
}
