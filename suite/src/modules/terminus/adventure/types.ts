export interface NPCProfile {
  name: string;
  race: string;
  gender: string;
  class: string;
  socialClass: string;
  affiliations: string;
  goals: string;
  role: 'ally' | 'competitor' | 'hinderer' | 'patron' | 'wildcard' | string;
  relationship: string;
}

export interface MinorNPC {
  name: string;
  description: string;
  purpose: string;
}

export interface ThreatProfile {
  name: string;
  type: string;
  class?: string;
  role: string;
  goals: string;
}

export interface MinorThreat {
  name: string;
  role: string;
  description: string;
}

export interface ActTimeline {
  incitingIncident: string;
  endpoint: string;
  turningPoints: string[];
}

export interface EncounterElement {
  name: string;
  type: 'combat' | 'roleplay' | 'puzzle' | 'exploration' | 'mixed' | string;
  function: 'advance' | 'challenge' | 'information' | string;
  goal: string;
  plotElement: string;
  location: string;
  description: string;
  boundTriggers: string;
  unboundTriggers: string;
}

export interface AdventureOutline {
  id: string;
  createdAt: string;
  
  // Adventure Basics
  title: string;
  summary: string;
  realWorldDate: string;
  campaignContext: string;
  playerProgression: string; // Level range and estimated playtime

  // In-Game Setting
  campaignDate: string;
  originationLocale: {
    name: string;
    description: string;
    details: string; // Cultural, political, or geographical details
    tensions: string; // Relevant ongoing conflicts or tensions
  };
  themes: {
    primary: string;
    secondary: string;
  };

  // Milieu Events
  milieu: {
    pastEvents: string;
    ongoingEvents: string;
    consequences: string;
  };

  // NPCs
  npcs: {
    major: NPCProfile[];
    minor: MinorNPC[];
  };

  // Monsters/Threats
  threats: {
    major: ThreatProfile[];
    minor: MinorThreat[];
  };

  // Plot Structure
  plot: {
    act1: ActTimeline;
    act2: ActTimeline;
    act3: ActTimeline;
  };

  // Encounters
  encounters: EncounterElement[];

  // Adventure Goals
  goals: {
    primary: string;
    secondary: string;
    moralDilemmas: string;
  };
}

export interface AIAdventureRequest {
  premise: string;
  structure: 'dungeon' | 'mystery' | 'fights' | 'survival' | 'intrigue' | string;
  coreActivity?: string;
  campaignContext?: string;
  playerProgression?: string;
  culture: 'Welsh' | 'Norse' | 'Gaelic' | 'Egyptian' | 'Other';
}
