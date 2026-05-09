import { exportCanonicalMarkdown } from './src/modules/terminus/scene/exportScene';
import { smartParse } from './src/modules/gwsd-cards/parser';
import type { Scene } from './src/modules/gwsd-cards/types';

const testScene: Scene = {
  id: 'test_scene',
  title: 'Test Latent Condition',
  adventure: 'Test Adventure',
  order: 1,
  stateType: 'latent',
  cards: [
    { id: '1', sceneId: 'test_scene', stateType: 'latent', state: 'ground', text: 'Surface appears normal.', source: 'manual' },
    { id: '2', sceneId: 'test_scene', stateType: 'latent', state: 'will', text: 'Hidden pressure lurks.', source: 'manual' },
    { id: '3', sceneId: 'test_scene', stateType: 'latent', state: 'trigger', text: 'Players touch the orb.', source: 'manual' },
    { id: '4', sceneId: 'test_scene', stateType: 'latent', state: 'accumulation', text: 'The orb glows brighter.', source: 'manual' },
  ],
  raw: '',
};

console.log('--- ORIGINAL SCENE ---');
console.log(JSON.stringify({ stateType: testScene.stateType, cards: testScene.cards }, null, 2));

console.log('\n--- EXPORTED CANONICAL MARKDOWN ---');
const markdown = exportCanonicalMarkdown(testScene);
console.log(markdown);

console.log('\n--- PARSED RESULT ---');
const parsed = smartParse(markdown);
console.log(JSON.stringify(parsed.scenes[0] ? {
  title: parsed.scenes[0].title,
  stateType: parsed.scenes[0].stateType,
  cards: parsed.scenes[0].cards
} : 'Failed to parse', null, 2));
