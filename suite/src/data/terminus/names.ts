export interface GeneratedName {
  id: string;
  name: string;
  phonetic: string;        // player-facing pronunciation
  ipa?: string;            // optional advanced/internal
  cultureProfile: 'Welsh' | 'Norse' | 'Gaelic' | 'Egyptian' | 'Other';
  usage: 'person' | 'place' | 'institution' | 'office' | 'threat' | 'ritual' | 'artifact' | 'custom';
  shortMeaning?: string;
  publicDescription?: string;
  internalNote?: string;   // hidden/dev only
  createdAt?: string;
}

export type CultureProfile = 'Welsh' | 'Norse' | 'Gaelic' | 'Egyptian';
export type NameUsage = 'person' | 'place' | 'institution' | 'office' | 'threat' | 'ritual' | 'artifact' | 'custom';

// Curated high-fidelity database of names matching the exact schema requirements
export const PRE_CURATED_NAMES: Omit<GeneratedName, 'id'>[] = [
  // --- WELSH INSPIRATION ---
  {
    name: "Rhudd-Sarn",
    phonetic: "HRITH sahrn",
    ipa: "r̥ɨð saːrn",
    cultureProfile: "Welsh",
    usage: "place",
    shortMeaning: "Red Causeway",
    publicDescription: "A dilapidated flagstone causeway spanning the grey marshes of Tringad's western edge, known for bleeding salt when the local bells chime.",
    internalNote: "A local locus of temporal drag. Responders crossing Rhudd-Sarn must maintain unified march speed or risk drift accumulation."
  },
  {
    name: "Maerwyn",
    phonetic: "MIRE-win",
    ipa: "maɪrwɪn",
    cultureProfile: "Welsh",
    usage: "person",
    shortMeaning: "Bright Steward",
    publicDescription: "A registrar of the Civic Archive whose eyes have been stained black by overexposure to temporal ink.",
    internalNote: "Maerwyn holds the key to the Sub-level 4 registry but is slowly succumbing to the Hollow state. Highly suspicious of Resonants."
  },
  {
    name: "Cadfan-Gell",
    phonetic: "KAD-van gethl",
    ipa: "kadvan ɡeɬ",
    cultureProfile: "Welsh",
    usage: "institution",
    shortMeaning: "Battle-Steward Cell",
    publicDescription: "An auxiliary guild of local militia that monitors the pressure inside coal mines.",
    internalNote: "Officially disbanded by the central bureaucracy in Act I, but still operating secretly to prevent the mines from collapsing into a latent hazard."
  },
  {
    name: "Creuddyn-Orb",
    phonetic: "KREY-thin awrb",
    ipa: "krəɨðɪn ɔːrb",
    cultureProfile: "Welsh",
    usage: "artifact",
    shortMeaning: "Core of Scarring",
    publicDescription: "A heavy sphere of dark iron that vibrates slightly when reality's coherence fluctuates.",
    internalNote: "Can be used as a focusing lens to stabilize a Rupture, but raises local Drift pressure by +1 for each round of continuous use."
  },
  {
    name: "Llan-Drift",
    phonetic: "LHAN-drift",
    ipa: "ɬan drɪft",
    cultureProfile: "Welsh",
    usage: "threat",
    shortMeaning: "Enclosure of the Slow Fade",
    publicDescription: "A moving fog that slowly encapsulates buildings, rendering their structures non-physical and transparent.",
    internalNote: "A Level 3 latent hazard. Items touched by the Llan-Drift lose physical mass and drift into the local simulation's memory stack."
  },

  // --- NORSE INSPIRATION ---
  {
    name: "Valdr-Vard",
    phonetic: "VAL-der vahrd",
    ipa: "valdr vɑːrd",
    cultureProfile: "Norse",
    usage: "place",
    shortMeaning: "Ruler's Guard / Strong Bastion",
    publicDescription: "An ancient watchtower constructed of black basalt. The structure does not cast a shadow even under direct noon sun.",
    internalNote: "The tower acts as a sovereign anchor. Inside, active scenes have their pressure capped at 3, but the drift ladder increments twice as fast."
  },
  {
    name: "Saint Latimer",
    phonetic: "SAYNT LAT-ih-mer",
    ipa: "seɪnt lætɪmər",
    cultureProfile: "Norse",
    usage: "person",
    shortMeaning: "Holy Interpreter",
    publicDescription: "A stoic, silver-bearded high responder who wears an iron yoke over his shoulders to stabilize his physical coordinate.",
    internalNote: "Latimer has survived three deep Ruptures but can no longer perceive color. He speaks only in formal liturgical jargon."
  },
  {
    name: "Gild-Kross",
    phonetic: "GILD kross",
    ipa: "ɡɪld krɒs",
    cultureProfile: "Norse",
    usage: "office",
    shortMeaning: "Office of the Tribute Scale",
    publicDescription: "A department tasked with weighing the physical density of coins to ensure they haven't suffered structural decay.",
    internalNote: "Corruption runs rampant here. They routinely cover up the 'softening' of metal in central vaults to keep public order."
  },
  {
    name: "Hrafn-Sorg",
    phonetic: "HRAHN-sorg",
    ipa: "r̥ɑvn sɔrɡ",
    cultureProfile: "Norse",
    usage: "threat",
    shortMeaning: "Raven's Grief",
    publicDescription: "A collective swarm of mechanical bird hulls that emit a high-pitched grinding sound, disrupting spell work.",
    internalNote: "A social hazard when nesting in cities; they mimic dead relatives' voices to lure residents out after curfew."
  },
  {
    name: "Skuld-Run",
    phonetic: "SKOOLD-roon",
    ipa: "skuld ruːn",
    cultureProfile: "Norse",
    usage: "custom",
    shortMeaning: "Debt Inscription",
    publicDescription: "The local tradition of branding one's civic debt onto the left forearm to keep count of required community service.",
    internalNote: "A tool of control by the Wardens. Erasing a Skuld-Run requires a complex ritual and triggers hostile response from nearby Synth guards."
  },

  // --- GAELIC INSPIRATION ---
  {
    name: "Cairn-Tala",
    phonetic: "KAIRN TAH-lah",
    ipa: "kæːrn tælə",
    cultureProfile: "Gaelic",
    usage: "place",
    shortMeaning: "Silent Memorial",
    publicDescription: "A heap of flat stones erected at the crossroads where the district of Oakhaven used to exist.",
    internalNote: "A memory sink. Characters can retrieve lost details of the district by spending 1 Willpower, but gain 1 temporal scar."
  },
  {
    name: "Fionn-Glas",
    phonetic: "FINN glahss",
    ipa: "fjʊn ɡlæs",
    cultureProfile: "Gaelic",
    usage: "artifact",
    shortMeaning: "Pale Mirror",
    publicDescription: "A sheet of polished green glass that shows reflections exactly ten seconds behind the present moment.",
    internalNote: "Extremely useful for solving puzzle-mode scene triggers that rely on rapid visual cues, but cannot reflect moving objects."
  },
  {
    name: "Deoch-Anis",
    phonetic: "DOCK AH-nish",
    ipa: "djɔx ænɪʃ",
    cultureProfile: "Gaelic",
    usage: "ritual",
    shortMeaning: "The Last Pour",
    publicDescription: "A formal toast administered to responders before they enter a fractured zone, ensuring their names remain in the local registry.",
    internalNote: "Grants +1 to Willpower checks when facing existential dread, but locks the character's physical appearance in place."
  },
  {
    name: "Sluagh-Weir",
    phonetic: "SLOO-ah weer",
    ipa: "sluːə wɪər",
    cultureProfile: "Gaelic",
    usage: "threat",
    shortMeaning: "Host Barrier / Ghost Wall",
    publicDescription: "A shimmering curtain of cold air that bars entry to the Old Docks, filled with whispering faces of missing citizens.",
    internalNote: "Requires a social-mode scene resolution to pass without injury. The faces will bargain for physical tokens of active memories."
  },
  {
    name: "Cailleach-Call",
    phonetic: "KAHL-yakh kawl",
    ipa: "kaɪljæx kɔːl",
    cultureProfile: "Gaelic",
    usage: "custom",
    shortMeaning: "Hag's Lament",
    publicDescription: "The practice of keeping a fire burning in a hearth even after the house has been abandoned, to ward off physical dissolution.",
    internalNote: "Provides safe shelter inside a latent district. If the fire goes out, the house immediately succumbs to the district's drift state."
  },

  // --- EGYPTIAN INSPIRATION ---
  {
    name: "Khamat-Maat",
    phonetic: "KAH-mat MAHT",
    ipa: "xæmæt mɑːt",
    cultureProfile: "Egyptian",
    usage: "institution",
    shortMeaning: "Rising Balance / Solar Council",
    publicDescription: "The high tribunal of judicial record-keepers who verify the coherence of legal statutes and mathematical frameworks.",
    internalNote: "The central guild hall is built around an immense water clock that has dripped at the exact same rate since the First Dynasty."
  },
  {
    name: "Sutekh-Ur",
    phonetic: "SOO-tekh OOR",
    ipa: "suːtɛx ʊər",
    cultureProfile: "Egyptian",
    usage: "threat",
    shortMeaning: "The Great Storm of Dissolution",
    publicDescription: "A localized sandstorm of rusted iron filings that strips the memory from structural foundations.",
    internalNote: "Confrontation-mode hazard. Every round of exposure reduces armor rating by 1 and changes building walls from solid to sand."
  },
  {
    name: "Mer-Wer",
    phonetic: "MAIR WAIR",
    ipa: "mɛər wɛər",
    cultureProfile: "Egyptian",
    usage: "place",
    shortMeaning: "Great Canal / River of Coherence",
    publicDescription: "A deep, stone-lined canal through the city center. Its water remains perfectly still even in high winds.",
    internalNote: "Used to carry heavy slate tablets of law. Swimming in the canal restores 1 Coherence point but inflicts temporary muteness."
  },
  {
    name: "Sekhem-Amu",
    phonetic: "SEK-hem AH-moo",
    ipa: "sɛxɛm aːmuː",
    cultureProfile: "Egyptian",
    usage: "artifact",
    shortMeaning: "Vessel of Bound Force",
    publicDescription: "A clay jar sealed with gold wire. Inside is a spark of physical light harvested from a collapsing star.",
    internalNote: "Can be shattered to cast a tier-3 Working instantly, but permanently stains the caster's hands with obsidian burns."
  },
  {
    name: "Netjer-Hept",
    phonetic: "NET-jer HEPT",
    ipa: "nɛtʒɛr hɛpt",
    cultureProfile: "Egyptian",
    usage: "office",
    shortMeaning: "The Divine Measure Office",
    publicDescription: "The department that maps land boundaries after the seasonal temporal floods alter Tringad's topography.",
    internalNote: "They use golden measuring ropes. If a surveyor's rope is cut, all boundaries they mapped since the last solstice revert to raw sand."
  }
];

// Offline procedural generator helpers
export function generateOfflineName(
  culture: CultureProfile,
  usage: NameUsage
): Omit<GeneratedName, 'id'> {
  // First, look for an exact match in our high-fidelity pre-curated list
  const matches = PRE_CURATED_NAMES.filter(
    (n) => n.cultureProfile === culture && n.usage === usage
  );

  if (matches.length > 0) {
    const randomIndex = Math.floor(Math.random() * matches.length);
    return matches[randomIndex];
  }

  // Fallback to random element recombination if exact match is exhausted
  const backupMatches = PRE_CURATED_NAMES.filter((n) => n.cultureProfile === culture);
  if (backupMatches.length > 0) {
    const randomMatch = backupMatches[Math.floor(Math.random() * backupMatches.length)];
    return {
      ...randomMatch,
      usage: usage, // Adapt usage dynamically
    };
  }

  // Ultimate safe fallback
  return {
    name: `${culture} Element`,
    phonetic: "EL-eh-ment",
    cultureProfile: culture,
    usage: usage,
    shortMeaning: "Constructed offline name",
    publicDescription: `A stable local noun of ${culture} cultural origin.`,
    internalNote: "Procedural offline generation fallback."
  };
}
