/* ── Scene Detector — Pass A: Structural Segmentation ──
 *
 * Splits raw TRPG adventure text into discrete scene chunks using:
 *   1. Header markers (### Area N, ## Scene N, etc.)
 *   2. [sidebar] / [Sidebar Start] tags (priority Hoskbrew markers)
 *   3. Read-aloud blocks as secondary scene evidence
 *
 * Output: SceneChunk[] ready for Pass B extraction (heuristic or AI).
 */

import type { NarrativeDepth, SceneChunk } from './types';

const DEPTH_FROM_LEVEL: Record<number, NarrativeDepth> = {
  1: 'act',
  2: 'act',
  3: 'scene',
  4: 'state',
};

/** Headers that signal non-scene content (stat blocks, appendices) */
const SKIP_HEADERS = /\b(?:appendix|stat\s*blocks?|bestiary|index|monster\s*manual|signal\s*summary|findings|narrative\s*diagnostics)\b/i;

let _chunkSeq = 0;
function chunkUid(): string {
  return `chunk_${Date.now()}_${++_chunkSeq}`;
}

/* ── Sidebar extraction ── */

/**
 * Pull [sidebar]...[/sidebar] and [Sidebar Start]...[Sidebar End] blocks.
 */
export function extractSidebars(text: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;

  const re1 = /\[sidebar\]\s*([\s\S]*?)\s*\[\/sidebar\]/gi;
  while ((m = re1.exec(text)) !== null) {
    const c = m[1].trim();
    if (c) out.push(c);
  }

  const re2 = /\[Sidebar\s+Start\]\s*([\s\S]*?)\s*\[Sidebar\s+End\]/gi;
  while ((m = re2.exec(text)) !== null) {
    const c = m[1].trim();
    if (c) out.push(c);
  }

  return out;
}

/** Strip sidebar tags from text, leaving the prose. */
export function stripSidebars(text: string): string {
  return text
    .replace(/\[sidebar\]\s*[\s\S]*?\s*\[\/sidebar\]/gi, '')
    .replace(/\[Sidebar\s+Start\]\s*[\s\S]*?\s*\[Sidebar\s+End\]/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/* ── Read-aloud extraction ── */

/**
 * Pull blockquoted italic read-aloud text.
 * Matches lines starting with > followed by italicized text.
 */
export function extractReadAlouds(text: string): string[] {
  const out: string[] = [];

  // Collect contiguous blockquote runs
  const lines = text.split('\n');
  let buf: string[] = [];

  for (const line of lines) {
    const stripped = line.trim();
    if (/^>\s*/.test(stripped)) {
      buf.push(stripped.replace(/^>\s*/, '').replace(/^\*|\*$/g, '').trim());
    } else {
      if (buf.length > 0) {
        const joined = buf.join(' ').trim();
        if (joined) out.push(joined);
        buf = [];
      }
    }
  }
  if (buf.length > 0) {
    const joined = buf.join(' ').trim();
    if (joined) out.push(joined);
  }

  return out;
}

/* ── Main detector ── */

interface HeaderEntry {
  line: number;
  level: number;
  title: string;
  depth: NarrativeDepth;
}

/**
 * Detect discrete scenes from unstructured TRPG text.
 *
 * Strategy:
 *   1. Index all markdown headers
 *   2. Split at H3 boundaries (area/encounter = individual scenes)
 *   3. H1/H2 set act-level context (ancestor chain)
 *   4. Extract sidebars + read-alouds within each scene
 *   5. Skip appendix/stat-block sections
 */
export function detectScenes(text: string): SceneChunk[] {
  const lines = text.split('\n');
  const chunks: SceneChunk[] = [];

  // ── Collect headers ──
  const headers: HeaderEntry[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,4})\s+(.+)/);
    if (m) {
      headers.push({
        line: i,
        level: m[1].length,
        title: m[2].trim(),
        depth: DEPTH_FROM_LEVEL[m[1].length] || 'scene',
      });
    }
  }

  // ── No headers → treat entire text as one scene ──
  if (headers.length === 0) {
    const sidebars = extractSidebars(text);
    const readAlouds = extractReadAlouds(text);
    if (sidebars.length > 0 || text.trim().length > 100) {
      chunks.push({
        id: chunkUid(),
        title: 'Scene 1',
        depth: 'scene',
        prose: stripSidebars(text),
        sidebars,
        readAlouds,
        startLine: 0,
        ancestors: [],
        raw: text,
      });
    }
    return chunks;
  }

  // ── Walk headers, splitting at H3 scene boundaries ──
  let currentAct: { depth: NarrativeDepth; title: string } | null = null;
  let inSkipSection = false;

  for (let h = 0; h < headers.length; h++) {
    const header = headers[h];

    // Skip appendix / stat-block sections
    if (SKIP_HEADERS.test(header.title)) {
      inSkipSection = true;
      continue;
    }

    // H1/H2 → act-level context
    if (header.level <= 2) {
      currentAct = { depth: header.depth, title: header.title };
      inSkipSection = false;

      // Check if this H2 has sidebars directly (before the next header)
      const nextH = headers[h + 1];
      const endLine = nextH ? nextH.line : lines.length;
      const sectionText = lines.slice(header.line + 1, endLine).join('\n');
      const sectionSidebars = extractSidebars(sectionText);

      // H2 with sidebars → create an act-level chunk
      if (sectionSidebars.length > 0) {
        chunks.push({
          id: chunkUid(),
          title: header.title,
          depth: 'act',
          prose: stripSidebars(sectionText),
          sidebars: sectionSidebars,
          readAlouds: extractReadAlouds(sectionText),
          startLine: header.line,
          ancestors: [],
          raw: sectionText,
        });
      }
      continue;
    }

    if (inSkipSection) continue;

    // H3/H4 → scene-level chunk
    if (header.level >= 3) {
      // Collect text from this header to the next header at same or higher level
      const nextSameOrHigher = headers.find(
        (hh, idx) => idx > h && hh.level <= header.level,
      );
      const endLine = nextSameOrHigher ? nextSameOrHigher.line : lines.length;
      const sectionText = lines.slice(header.line + 1, endLine).join('\n');

      const sidebars = extractSidebars(sectionText);
      const readAlouds = extractReadAlouds(sectionText);

      // Build ancestor chain
      const ancestors: Array<{ depth: NarrativeDepth; title: string }> = [];
      if (currentAct) ancestors.push(currentAct);

      // Only create chunks with meaningful content
      if (sectionText.trim().length > 50 || sidebars.length > 0) {
        chunks.push({
          id: chunkUid(),
          title: header.title,
          depth: header.depth,
          prose: stripSidebars(sectionText),
          sidebars,
          readAlouds,
          startLine: header.line,
          ancestors,
          raw: sectionText,
        });
      }
    }
  }

  return chunks;
}
