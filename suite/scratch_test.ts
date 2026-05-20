import { parseCanonicalMarkdown } from './src/modules/gwsd-cards/parser';

const complexMarkdown = `
# Abyssal Hazard
**Adventure:** The Descent
**Location:** Core Fissure
**Act:** Act II
**Mode:** Hazard
**Scene Pressure:** 4
**Story Function:** obstacle

## Ground
Dark waters churn below, threatening to swallow any who slip.

## Will
The shifting tectonic plates grind against each other.

## Shift
If the golem drops the bridge (despite the Warden's efforts) -> Go to #abyssal-hazard-02 (Pressure: +2, Ground: "Rubble (and dust) chokes the air.", Inject: #latent-rubble)

## Drift
If they decide to retreat -> Go to #abyssal-camp (Pressure: -1)
`;

console.log("--- START DEBUG ---");
const searchBlock = complexMarkdown;

const adventureMatch = searchBlock.match(/(?:-\s*)?\*\*(?:Adventure)\*\*:\s*([^\n\r]+)/i);
console.log("Adventure Match:", adventureMatch);

const locationMatch = searchBlock.match(/(?:-\s*)?\*\*(?:Location)\*\*:\s*([^\n\r]+)/i);
console.log("Location Match:", locationMatch);

const actMatch = searchBlock.match(/(?:-\s*)?\*\*(?:Act)\*\*:\s*([^\n\r]+)/i);
console.log("Act Match:", actMatch);

const modeMatch = searchBlock.match(/(?:-\s*)?\*\*(?:Scene\s+Mode|Mode)\*\*:\s*([^\n\r]+)/i);
console.log("Mode Match:", modeMatch);

const pressureMatch = searchBlock.match(/(?:-\s*)?\*\*(?:Scene\s+Pressure|Pressure)\*\*:\s*(\d+)/i);
console.log("Pressure Match:", pressureMatch);

console.log("\nRunning parseCanonicalMarkdown:");
const parsed = parseCanonicalMarkdown(complexMarkdown);
console.log(JSON.stringify(parsed[0]?.terminus, null, 2));
