import type { AdventureOutline } from './types';

export const sampleAdventureOutline: Omit<AdventureOutline, 'id' | 'createdAt'> = {
  title: "The Ink-Locked Archive of Rhudd-Sarn",
  summary: "In the degrading border district of Rhudd-Sarn, the civic registry ledger is slowly purging its own pages. With each leaf of parchment that dissolves into oil and black brine, the corresponding citizens are erased from the memories of their neighbors. The Responders must enter the damp, repeating chambers of the district archives, navigate the bureaucratic blockades of a desperate clerk, and find the corrupted Locus Core before the entire neighborhood is forgotten.",
  realWorldDate: new Date().toISOString().split('T')[0],
  campaignContext: "A standalone mission or a prelude to the regional collapse of the Eastern Marches.",
  playerProgression: "Levels 2-3, 3-4 hours of playtime",
  campaignDate: "17th of the Raining Bell, Cycle 12",
  originationLocale: {
    name: "The Lower Ward of Rhudd-Sarn",
    description: "A cramped district of slate roofs and wet basalt roads that seem to crawl two inches to the west every night.",
    details: "Originally a proud mining center, now recovering from a silent administrative decay where district boundaries keep shrinking.",
    tensions: "Rising friction between the Responders' Order and the local Registry Clerks who refuse to acknowledge that their books are bleeding."
  },
  themes: {
    primary: "The fragility of memory and structure",
    secondary: "Bureaucracy as a futile shield against systemic failure"
  },
  milieu: {
    pastEvents: "A localized rupture occurred in the central registrar's vault two weeks ago, introducing a recursive transcription error.",
    ongoingEvents: "Clerks are actively executing old compliance writs that no longer match the shifting geography of the streets.",
    consequences: "If the responders fail to stabilize the core, 400 families will be permanently unrecorded, dissolving their physical houses into salt flats."
  },
  npcs: {
    major: [
      {
        name: "Registrar Saint Latimer",
        race: "Human",
        gender: "Male",
        class: "Bureaucrat / Scribe",
        socialClass: "Middle Middle",
        affiliations: "Ministry of Stable Boundaries",
        goals: "Protect the registry files from 'outside contamination' and execute standard administrative procedures at all costs, denying any anomaly.",
        role: "hinderer",
        relationship: "Suspicious of Responders, viewing them as armed agitators trying to disrupt official civic accounting."
      },
      {
        name: "Maerwyn of the Slate",
        race: "Hollow",
        gender: "Female",
        class: "Breaker / Informant",
        socialClass: "Lower Lower",
        affiliations: "The Unbound Scribes",
        goals: "Recover the names of her forgotten kin before her own chest-tattoos (which record her ancestry) flake off into ash.",
        role: "ally",
        relationship: "Desperate for help; offers hidden keys to the archive's lower basement in exchange for recovering the family ledger."
      }
    ],
    minor: [
      {
        name: "Scribe Khamat",
        description: "A sweating, junior copier who secretly notices that his inkwell is bubbling with warm sea-water.",
        purpose: "Can provide a map of the repeating vault layout if bribed or comforted."
      }
    ]
  },
  threats: {
    major: [
      {
        name: "The Correction Instrument (The Ink-Strainer)",
        type: "Systemic Abnormality",
        class: "Correction Instrument",
        role: "The physical manifestation of Terminus trying to 'clean up' the database discrepancy by erasing the physical citizens.",
        goals: "Scrape all ink, blood, and records from the archive basement, neutralizing any non-authorized personnel (PCs)."
      }
    ],
    minor: [
      {
        name: "Ink-Stray Sentinels",
        role: "Fodder / Skirmishers",
        description: "Shifting silhouettes of wet paper and black brine, wearing the vague shapes of old soldiers."
      }
    ]
  },
  plot: {
    act1: {
      incitingIncident: "A frantic mother collapses in the Responder vault, weeping because her husband left for the market and when she asked neighbors, they claimed she has lived alone for ten years. Her wedding ring's inscription is fading to blank silver.",
      endpoint: "Responders force entry into the basement of the Rhudd-Sarn Archives, bypassing Saint Latimer's protective lockouts.",
      turningPoints: [
        "A sudden road shift loops the path to the archives, forcing responders to solve a geographical riddle using old tax maps.",
        "Saint Latimer threatens to summon the Correction Office if the players take one step past the lobby."
      ]
    },
    act2: {
      incitingIncident: "Inside the archives, the stairs repeat themselves every seventh step, and the black ink on the scrolls begins to drip off the parchment, forming pools that crawl like spiders.",
      endpoint: "Recovering the bleeding ledger and identifying the room containing the corrupted Locus Core.",
      turningPoints: [
        "Maerwyn starts losing her memory of the plan as her arm-tattoos begin flaking off, forcing responders to act quickly.",
        "Ink-Strays ambush the party in the damp file-catalogue stacks, where any loud sound triggers a localized ceiling collapse."
      ]
    },
    act3: {
      incitingIncident: "The corrupted Locus Core is revealed to be a massive, brass clockwork cylinder, clogged with black, viscous ink that is writing contradictory laws onto the floor tiles.",
      endpoint: "Purging or recalibrating the Core, choosing whether to restore the forgotten names or let the district dissolve peacefully.",
      turningPoints: [
        "The Ink-Strainer emerges from the central reservoir, rewriting the environmental Ground rules mid-fight to make iron weapons soft as wax.",
        "Responders must choose: sacrifice Maerwyn's remaining memories to feed the Core's stable routine, or risk a wider Rupture."
      ]
    }
  },
  encounters: [
    {
      name: "The Repeating Basalt Way",
      type: "exploration",
      function: "challenge",
      goal: "Reach the archives despite the local geographic street loop.",
      plotElement: "First contact with the district's structural degradation.",
      location: "A wet, narrow road between tall basalt tenements. Rain water flows uphill in the gutters. Every lamppost casts two shadows.",
      description: "Responders walk past the same butcher shop three times. The cobblestones feel spongy underfoot. A silent child sits on a crate, drawing a map on the wet slate with a piece of chalk that never runs out.",
      boundTriggers: "If a character tries to run backwards or force their way through an alley, the street stretches, separating them from the party until they ring the nearest fire-bell.",
      unboundTriggers: "Stuck cue: If players spend too much time walking in circles, a local street-sweeper offers to guide them through the 'loose seams' if they give him a silver coin or a memory of their childhood."
    },
    {
      name: "The Registry Lobby Confrontation",
      type: "social",
      function: "information",
      goal: "Gain access to the secure basement vaults.",
      plotElement: "Understanding the institutional denial of the collapse.",
      location: "A high-ceilinged chamber smelling of old paper and damp wool. Tall teller windows with iron grates block the path.",
      description: "Saint Latimer stands behind the central window, furiously stamping blank pages. Black brine stains the cuffs of his grey tunic. A pile of iron writs sits beside him, each marked with a red seal.",
      boundTriggers: "Attempting to bribe Latimer with coin angers him, adding +1 Drift as he files a 'bribery report' to the nonexistent High Ministry.",
      unboundTriggers: "Stuck cue: If social negotiations break down, Junior Scribe Khamat drops a ledger 'by accident' containing the keycode for the side entrance while trying to escape the building."
    },
    {
      name: "The Sinking Ledger Stacks",
      type: "combat",
      function: "advance",
      goal: "Defeat the Ink-Strays and secure the bleeding registry files.",
      plotElement: "Immediate physical threat and direct contact with corrupted ink.",
      location: "Chamber of tall oaken filing cabinets. The floor is covered in two inches of dark, oily water.",
      description: "Rows of damp files stretch into the shadows. The water on the floor ripples without wind. Ink-Strays emerge from the lower drawers, their bodies composed of legal sentences and dripping wax.",
      boundTriggers: "If anyone uses fire magic or loud explosives, the rotten ceiling beams buckle, trapping one responder beneath heavy cabinets.",
      unboundTriggers: "Stuck cue: If the combat goes poorly, Maerwyn exposes a ventilation grate, allowing the responders to retreat to the lower furnace room immediately."
    }
  ],
  goals: {
    primary: "Calibrate and stabilize the corrupted Locus Core in the archive vault.",
    secondary: "Save Maerwyn's kin's records and secure Saint Latimer's signature on a stable administrative writ.",
    moralDilemmas: "To stabilize the district, the Core requires a coherent anchor: Responders must either feed all of Maerwyn's remaining memories to the device (erasing her personality completely but saving the district), or let the district's outer boundaries collapse (destroying 100 homes but saving her life)."
  }
};
