/* ── Print Layout: 4 scene cards per page (2×2 grid, US Letter) ── */

import type { Scene } from '../types';
import Card from './Card';

interface Props {
  scenes: Scene[];
}

/**
 * Renders scenes as printable pages.
 * Layout: 2×2 grid per US Letter page = 4 scene cards (3.75" × 5.25" each).
 * 2 cols × 3.75" = 7.5" + margins = 8.5" (fits US Letter width).
 * 2 rows × 5.25" = 10.5" + margins = 11" (fits US Letter height).
 */
export default function PrintLayout({ scenes }: Props) {
  // Group scenes into batches of 4 (2×2 grid per page)
  const pages: Scene[][] = [];
  for (let i = 0; i < scenes.length; i += 4) {
    pages.push(scenes.slice(i, i + 4));
  }

  // Build redundancy set — consecutive scenes with identical GWSD bodies
  const redundantIds = new Set<string>();
  for (let i = 0; i < scenes.length - 1; i++) {
    const bodyA = scenes[i].cards
      .map((card) => (card.cardText || card.text).trim())
      .join('|');
    const bodyB = scenes[i + 1].cards
      .map((card) => (card.cardText || card.text).trim())
      .join('|');
    if (bodyA === bodyB && bodyA !== '|||') {
      redundantIds.add(scenes[i].id);
      redundantIds.add(scenes[i + 1].id);
    }
  }

  return (
    <div className="print-layout">
      <style>{`
        /* Layout variables tuned for print separation on US Letter */
        .print-layout {
          --gwsd-page-width: 8.5in;
          --gwsd-page-height: 11in;
          --gwsd-margin-x: 0.5in;
          --gwsd-margin-y: 0.5in;
          --gwsd-gap: 0.2in;
          --gwsd-content-width: calc(var(--gwsd-page-width) - (2 * var(--gwsd-margin-x)));
          --gwsd-content-height: calc(var(--gwsd-page-height) - (2 * var(--gwsd-margin-y)));
          --gwsd-card-width: calc((var(--gwsd-content-width) - var(--gwsd-gap)) / 2);
          --gwsd-card-height: calc((var(--gwsd-content-height) - var(--gwsd-gap)) / 2);
        }

        @media print {
          @page { margin: 0; size: letter; }
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .print-layout, .print-page, .print-card {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-page {
            page-break-after: always;
            width: var(--gwsd-content-width);
            height: var(--gwsd-content-height);
            margin: var(--gwsd-margin-y) var(--gwsd-margin-x);
            padding: 0;
            box-sizing: border-box;
            position: relative;
            background:
              linear-gradient(to right,
                transparent calc(50% - 0.01in),
                #8c7a5f calc(50% - 0.01in),
                #8c7a5f calc(50% + 0.01in),
                transparent calc(50% + 0.01in)
              ),
              linear-gradient(to bottom,
                transparent calc(50% - 0.01in),
                #8c7a5f calc(50% - 0.01in),
                #8c7a5f calc(50% + 0.01in),
                transparent calc(50% + 0.01in)
              );
            background-repeat: no-repeat;
            background-size: 100% 100%, 100% 100%;
            outline: 1px dashed #9c8a70;
            outline-offset: 0.06in;
          }
          .print-page:last-child { page-break-after: auto; }
          /* Ensure cards receive the spacing in print */
          .print-page { gap: var(--gwsd-gap); }
          .print-card { box-sizing: border-box; }
        }
        @media screen {
          .print-page {
            width: var(--gwsd-content-width);
            min-height: var(--gwsd-content-height);
            margin: 24px auto;
            padding: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
        }
      `}</style>

      {pages.map((pageScenes, pageIdx) => (
        <div
          key={pageIdx}
          className="print-page"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, var(--gwsd-card-width))',
            gridTemplateRows: 'repeat(2, var(--gwsd-card-height))',
            gap: 'var(--gwsd-gap)',
            justifyContent: 'center',
            alignContent: 'center',
          }}
        >
          {pageScenes.map((scene) => (
            <Card
              key={scene.id}
              scene={scene}
              printMode
              redundant={redundantIds.has(scene.id)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
