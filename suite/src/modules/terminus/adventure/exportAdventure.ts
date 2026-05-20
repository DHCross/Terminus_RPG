import type { AdventureOutline } from './types';

export function exportAdventureToMarkdown(adventure: AdventureOutline): string {
  return `# ${adventure.title}

> **Outline & Summary:**
> ${adventure.summary}

## Adventure Basics
- **Real-World Date:** ${adventure.realWorldDate}
- **Campaign Context:** ${adventure.campaignContext}
- **Player Progression:** ${adventure.playerProgression}
- **In-Game Date:** ${adventure.campaignDate}

---

## In-Game Setting
### Origination Locale
- **Name:** ${adventure.originationLocale.name}
- **Description:** ${adventure.originationLocale.description}
- **Cultural, Political, or Geographical Details:** ${adventure.originationLocale.details}
- **Ongoing Conflicts/Tensions:** ${adventure.originationLocale.tensions}

### Adventure Themes
- **Primary Theme:** ${adventure.themes.primary}
- **Secondary Theme:** ${adventure.themes.secondary}

---

## Milieu Events
- **Past Events:** ${adventure.milieu.pastEvents}
- **Ongoing Events:** ${adventure.milieu.ongoingEvents}
- **Potential Consequences of Player Actions:** ${adventure.milieu.consequences}

---

## Non-Player Characters (NPCs)

### Major NPCs
${adventure.npcs.major.map((npc) => `
#### ${npc.name} (${npc.gender} ${npc.race} ${npc.class})
- **Social Class & Affiliations:** ${npc.socialClass} | ${npc.affiliations}
- **Story Role:** ${npc.role.toUpperCase()}
- **Goals & Motivations:** ${npc.goals}
- **Relationship to Players:** ${npc.relationship}
`).join('\n')}

### Minor NPCs
${adventure.npcs.minor.map((npc) => `
- **${npc.name}:** ${npc.description} *(Purpose: ${npc.purpose})*
`).join('\n')}

---

## Threats & Monsters

### Major Threats
${adventure.threats.major.map((threat) => `
#### ${threat.name} (${threat.type} ${threat.class ? `| ${threat.class}` : ''})
- **Narrative Role:** ${threat.role}
- **Goals & Motivations:** ${threat.goals}
`).join('\n')}

### Minor Threats
${adventure.threats.minor.map((threat) => `
- **${threat.name} (${threat.role}):** ${threat.description}
`).join('\n')}

---

## Plot Structure

### Act 1: Introduction
- **Inciting Incident:** ${adventure.plot.act1.incitingIncident}
- **Primary Endpoint:** ${adventure.plot.act1.endpoint}
- **Turning Points / Complications:**
${adventure.plot.act1.turningPoints.map((tp) => `  * ${tp}`).join('\n')}

### Act 2: Rising Action
- **Secondary Incident:** ${adventure.plot.act2.incitingIncident}
- **Secondary Endpoint:** ${adventure.plot.act2.endpoint}
- **Turning Points / Decision Points:**
${adventure.plot.act2.turningPoints.map((tp) => `  * ${tp}`).join('\n')}

### Act 3: Climax & Resolution
- **Tertiary Incident:** ${adventure.plot.act3.incitingIncident}
- **Tertiary Endpoint:** ${adventure.plot.act3.endpoint}
- **Turning Points / Outcomes:**
${adventure.plot.act3.turningPoints.map((tp) => `  * ${tp}`).join('\n')}

---

## Encounters

${adventure.encounters.map((enc) => `
### ${enc.name} (${enc.type.toUpperCase()} | ${enc.function.toUpperCase()})
- **Location:** ${enc.location}
- **Significance / Associated Goal:** ${enc.goal}
- **Connection to Plot:** ${enc.plotElement}
- **Description (Concrete 3D Sensory Details):**
  ${enc.description}
- **Bound Triggers (Complications initiated by player action):**
  ${enc.boundTriggers}
- **Unbound Triggers / stuck cues (GM fallbacks):**
  ${enc.unboundTriggers}
`).join('\n')}

---

## Adventure Goals

- **Primary Goal (Overarching Objective):** ${adventure.goals.primary}
- **Secondary Goals (Side objectives with moral depth):** ${adventure.goals.secondary}
- **Moral Dilemma:** ${adventure.goals.moralDilemmas}

---
*Synthesized using the Terminus Adventure Architect under the Coherence System.*
`;
}
