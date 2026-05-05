/**
 * Parser for Narrative Diagnostics Report markdown files.
 * Extracts structured data from the report format produced by
 * narrativeDiagnosticsReportToMarkdown().
 */

export interface ParsedSignal {
  index: number;
  icon: string;
  name: string;
  severity: 'high' | 'medium' | 'low';
  confidence: 'high' | 'medium' | 'low';
  scene: string;
  relatedScene?: string;
  diagnosis: string;
  evidence: string;
  suggestedFix: string;
}

export interface ParsedSignalSummary {
  icon: string;
  name: string;
  count: number;
}

export interface ParsedDiagnosticsReport {
  title: string;
  generatedAt: string;
  sceneCount: number;
  signalCount: number;
  summary: ParsedSignalSummary[];
  signals: ParsedSignal[];
}

/**
 * Parse a Narrative Diagnostics Report from its markdown format.
 * Returns null if the text doesn't look like a diagnostics report.
 */
export function parseDiagnosticsReport(text: string): ParsedDiagnosticsReport | null {
  const lines = text.split('\n');
  if (lines.length < 5) return null;

  // Title from H1
  const titleMatch = lines[0]?.match(/^#\s+(.+)/);
  if (!titleMatch) return null;
  const title = titleMatch[1].replace(/\s*—\s*Narrative Diagnostics Report\s*$/, '').trim();

  // Metadata
  let generatedAt = '';
  let sceneCount = 0;
  let signalCount = 0;

  for (const line of lines.slice(1, 10)) {
    const genMatch = line.match(/^-\s*Generated:\s*(.+)/i);
    if (genMatch) generatedAt = genMatch[1].trim();

    const sceneMatch = line.match(/^-\s*Scene Cards:\s*(\d+)/i);
    if (sceneMatch) sceneCount = parseInt(sceneMatch[1], 10);

    const sigMatch = line.match(/^-\s*Total Signals:\s*(\d+)/i);
    if (sigMatch) signalCount = parseInt(sigMatch[1], 10);
  }

  // Signal Summary
  const summary: ParsedSignalSummary[] = [];
  const summaryStart = lines.findIndex((l) => /^##\s+Signal Summary/i.test(l));
  if (summaryStart >= 0) {
    for (let i = summaryStart + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('##')) break; // next section
      // e.g. "- 🔗 The Echo: 0"
      const m = line.match(/^-\s*(\S+)\s+(.+?):\s*(\d+)\s*$/);
      if (m) {
        summary.push({ icon: m[1], name: m[2].trim(), count: parseInt(m[3], 10) });
      }
    }
  }

  // Findings
  const signals: ParsedSignal[] = [];
  const findingsStart = lines.findIndex((l) => /^##\s+Findings/i.test(l));
  if (findingsStart >= 0) {
    let current: Partial<ParsedSignal> | null = null;

    for (let i = findingsStart + 1; i < lines.length; i++) {
      const line = lines[i];

      // New finding header: ### 1. 🧹 Unreachable Code
      const headerMatch = line.match(/^###\s+(\d+)\.\s+(\S+)\s+(.+)/);
      if (headerMatch) {
        if (current && current.index != null) {
          signals.push(current as ParsedSignal);
        }
        current = {
          index: parseInt(headerMatch[1], 10),
          icon: headerMatch[2],
          name: headerMatch[3].trim(),
          severity: 'medium',
          confidence: 'medium',
          scene: '',
          diagnosis: '',
          evidence: '',
          suggestedFix: '',
        };
        continue;
      }

      if (!current) continue;

      // Field lines
      const sevMatch = line.match(/^-\s*Severity:\s*(\w+)/i);
      if (sevMatch) {
        current.severity = sevMatch[1].toLowerCase() as 'high' | 'medium' | 'low';
        continue;
      }

      const confMatch = line.match(/^-\s*Confidence:\s*(\w+)/i);
      if (confMatch) {
        current.confidence = confMatch[1].toLowerCase() as 'high' | 'medium' | 'low';
        continue;
      }

      const sceneMatch = line.match(/^-\s*Scene:\s*(.+)/i);
      if (sceneMatch) {
        current.scene = sceneMatch[1].trim();
        continue;
      }

      const relMatch = line.match(/^-\s*Related Scene:\s*(.+)/i);
      if (relMatch) {
        current.relatedScene = relMatch[1].trim();
        continue;
      }

      const diagMatch = line.match(/^-\s*Diagnosis:\s*(.+)/i);
      if (diagMatch) {
        current.diagnosis = diagMatch[1].trim();
        continue;
      }

      const evMatch = line.match(/^-\s*Evidence:\s*(.+)/i);
      if (evMatch) {
        current.evidence = evMatch[1].trim();
        continue;
      }

      const fixMatch = line.match(/^-\s*Suggested Fix:\s*(.+)/i);
      if (fixMatch) {
        current.suggestedFix = fixMatch[1].trim();
        continue;
      }
    }

    // Push final finding
    if (current && current.index != null) {
      signals.push(current as ParsedSignal);
    }
  }

  // Validate we got something useful
  if (signalCount === 0 && signals.length === 0 && summary.length === 0) return null;

  return {
    title,
    generatedAt,
    sceneCount,
    signalCount,
    summary,
    signals,
  };
}
