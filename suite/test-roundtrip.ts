import { exportCanonicalMarkdown } from './src/modules/terminus/scene/exportScene';
import { smartParse } from './src/modules/gwsd-cards/parser';
import type { Scene } from './src/modules/gwsd-cards/types';

const testScene: Scene = {
  id: 'test_scene',
  title: 'Test Latent Condition',
  adventure: 'Test Adventure',
  order: 1,
  stateType: 'latent',
  storyFunction: 'latent',
  cards: [
    { id: '1', sceneId: 'test_scene', stateType: 'latent', state: 'ground', text: 'Surface appears normal.', source: 'manual' },
    { id: '2', sceneId: 'test_scene', stateType: 'latent', state: 'will', text: 'Hidden pressure lurks.', source: 'manual' },
    { id: '3', sceneId: 'test_scene', stateType: 'latent', state: 'trigger', text: 'Players touch the orb.', source: 'manual' },
    { id: '4', sceneId: 'test_scene', stateType: 'latent', state: 'accumulation', text: 'The orb glows brighter.', source: 'manual' },
  ],
  raw: '',
};

console.log('--- ORIGINAL SCENE ---');
console.log(JSON.stringify({ stateType: testScene.stateType, storyFunction: testScene.storyFunction, cards: testScene.cards }, null, 2));

console.log('\n--- EXPORTED CANONICAL MARKDOWN ---');
const markdown = exportCanonicalMarkdown(testScene);
console.log(markdown);

console.log('\n--- PARSED RESULT ---');
const parsed = smartParse(markdown);
console.log(JSON.stringify(parsed.scenes[0] ? {
  title: parsed.scenes[0].title,
  stateType: parsed.scenes[0].stateType,
  storyFunction: parsed.scenes[0].storyFunction,
  cards: parsed.scenes[0].cards
} : 'Failed to parse', null, 2));

console.log('\n--- DYNAMIC STATE MACHINE CONNECTIVITY TEST ---');
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

console.log('\n--- PARSING COMPLEX MARKDOWN ---');
const complexParsed = smartParse(complexMarkdown);
const parsedScene = complexParsed.scenes[0];

if (parsedScene) {
  console.log('Successfully parsed complex state machine node:');
  console.log(`Title: ${parsedScene.title}`);
  console.log(`Story Function: ${parsedScene.storyFunction}`);
  console.log(`Scene Pressure: ${parsedScene.terminus?.scenePressure}`);
  console.log(`Location: ${parsedScene.terminus?.location}`);
  console.log(`Act: ${parsedScene.act}`);
  console.log(`Scene Mode: ${parsedScene.terminus?.sceneMode}`);
  console.log('\nParsed Connective Triggers:');
  console.log(JSON.stringify(parsedScene.connectiveTriggers, null, 2));
} else {
  console.log('Failed to parse complex markdown.');
}

