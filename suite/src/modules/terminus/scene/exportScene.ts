/**
 * Scene Card Export — Three canonical output formats.
 *
 * The round-trip contract: Forge → Export → Reimport → Same State.
 * If the card changes meaning during round-trip, the ontology is not stable.
 */

import type { Scene } from '../../gwsd-cards/types';

/** ── 1. Canonical Markdown ──
 * The structural source of truth. Each GWSD state gets its own heading.
 * This is the format the Extract tab should be able to reimport cleanly.
 */
export function exportCanonicalMarkdown(scene: Scene): string {
  const lines: string[] = [];
  const meta = scene.terminus;

  // Header block
  lines.push(`# ${scene.title}`);
  if (scene.adventure) lines.push(`**Adventure:** ${scene.adventure}`);
  if (scene.act) lines.push(`**Act:** ${scene.act}`);
  if (meta?.location) lines.push(`**Location:** ${meta.location}`);
  if (meta?.sceneMode) lines.push(`**Mode:** ${meta.sceneMode.charAt(0).toUpperCase() + meta.sceneMode.slice(1)}`);
  if (scene.storyFunction) lines.push(`**Story Function:** ${scene.storyFunction}`);
  lines.push(`**State:** ${scene.stateType === 'active' ? 'Active Scene' : 'Latent Condition'}`);
  lines.push('');

  // Read-aloud box (if present)
  if (meta?.readAloud) {
    lines.push('> *' + meta.readAloud.replace(/\n/g, '*\n> *') + '*');
    lines.push('');
  }

  // GWSD body
  const cardText = (state: string): string => {
    const card = scene.cards.find(c => c.state === state);
    return card?.text || '';
  };

  if (scene.stateType === 'active') {
    lines.push('## Ground');
    lines.push(cardText('ground'));
    lines.push('');
    lines.push('## Will');
    lines.push(cardText('will'));
    lines.push('');
    lines.push('## Shift');
    lines.push(cardText('shift'));
    lines.push('');
    lines.push('## Drift');
    lines.push(cardText('drift'));
  } else {
    lines.push('## Ground');
    lines.push(cardText('ground'));
    lines.push('');
    lines.push('## Hidden Pressure');
    lines.push(cardText('will'));
    lines.push('');
    lines.push('## Trigger');
    lines.push(cardText('trigger'));
    lines.push('');
    lines.push('## Accumulation');
    lines.push(cardText('accumulation'));
    // Reveal condition is optional
     const revealText = (scene.cards as Array<{ state: string; text: string }>).find((card) => card.state === 'reveal')?.text;
    if (revealText) {
      lines.push('');
      lines.push('## Reveal Condition');
      lines.push(revealText);
    }
  }

  // Optional trailing metadata
  if (meta?.driftLadder) {
    lines.push('');
    lines.push('## Drift Ladder');
    lines.push(meta.driftLadder);
  }

  if (meta?.mapHooks) {
    lines.push('');
    lines.push('## Map Hooks');
    lines.push(meta.mapHooks);
  }

  if (meta?.orderTags && meta.orderTags.length > 0) {
    lines.push('');
    lines.push(`**Orders:** ${meta.orderTags.join(', ')}`);
  }

  lines.push('');
  return lines.join('\n');
}

/** ── 2. Inline [gwsd] Paragraph ──
 * The in-book format. A single paragraph wrapped in [gwsd]...[/gwsd] tags.
 * Each GWSD state becomes one sentence. Used for manuscript embedding.
 */
export function exportInlineGWSD(scene: Scene): string {
  const cardText = (state: string): string => {
    const card = scene.cards.find(c => c.state === state);
    return card?.text?.trim() || '';
  };

  const sentences: string[] = [];

  if (scene.stateType === 'active') {
    sentences.push(cardText('ground'));
    sentences.push(cardText('will'));
    sentences.push(cardText('shift'));
    sentences.push(cardText('drift'));
  } else {
    sentences.push(cardText('ground'));
    sentences.push(cardText('will'));
    sentences.push(cardText('trigger'));
    sentences.push(cardText('accumulation'));
  }

  // Ensure each sentence ends with a period
  const normalized = sentences
    .filter(s => s.length > 0)
    .map(s => s.endsWith('.') ? s : s + '.')
    .join(' ');

  return `[gwsd] ${normalized} [/gwsd]`;
}

/** ── 3. Visual Card Layout ──
 * A compact ASCII representation for physical card printing or quick reference.
 * Header band → GWSD body → optional footer.
 */
export function exportVisualCard(scene: Scene): string {
  const meta = scene.terminus;
  const w = 60;
  const hr = '─'.repeat(w);
  const lines: string[] = [];

  const cardText = (state: string): string => {
    const card = scene.cards.find(c => c.state === state);
    return card?.text?.trim() || '';
  };

  // Header
  lines.push(`┌${hr}┐`);
  lines.push(`│ ${scene.title.toUpperCase().padEnd(w - 1)}│`);
  if (meta?.location || meta?.sceneMode) {
    const locMode = [meta?.location, meta?.sceneMode].filter(Boolean).join(' │ ');
    lines.push(`│ ${locMode.padEnd(w - 1)}│`);
  }
  lines.push(`├${hr}┤`);

  // GWSD body
  const renderState = (label: string, text: string) => {
    lines.push(`│ ${label.padEnd(w - 1)}│`);
    // Wrap text at ~56 chars
    const words = text.split(' ');
    let line = '│   ';
    for (const word of words) {
      if (line.length + word.length + 1 > w) {
        lines.push(line.padEnd(w + 1) + '│');
        line = '│   ' + word;
      } else {
        line += (line.length > 4 ? ' ' : '') + word;
      }
    }
    if (line.length > 4) lines.push(line.padEnd(w + 1) + '│');
  };

  if (scene.stateType === 'active') {
    renderState('GROUND', cardText('ground'));
    renderState('WILL', cardText('will'));
    renderState('SHIFT', cardText('shift'));
    renderState('DRIFT', cardText('drift'));
  } else {
    renderState('GROUND', cardText('ground'));
    renderState('HIDDEN PRESSURE', cardText('will'));
    renderState('TRIGGER', cardText('trigger'));
    renderState('ACCUMULATION', cardText('accumulation'));
  }

  // Footer
  if (meta?.sceneMode) {
    lines.push(`├${hr}┤`);
    lines.push(`│ Mode: ${meta.sceneMode.toUpperCase().padEnd(w - 7)}│`);
  }
  lines.push(`└${hr}┘`);

  return lines.join('\n');
}
