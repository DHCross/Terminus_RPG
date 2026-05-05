/* ── Scene Row: ONE unified card per scene ── */

import type { Scene } from '../types';
import Card from './Card';

interface Props {
  scene: Scene;
  editable?: boolean;
  onEditCard?: (sceneId: string, cardIdx: number, text: string) => void;
  printMode?: boolean;
  /** Flag when this scene has identical GWSD body to adjacent scene */
  redundant?: boolean;
  lintWarnings?: Array<{ icon: string; name: string; severity: 'high' | 'medium' | 'low' }>;
  sceneMode?: { icon: string; label: string; verb: string };
}

export default function SceneRow({ scene, editable, onEditCard, printMode, redundant, lintWarnings, sceneMode }: Props) {
  return (
    <div>
      <Card
        scene={scene}
        editable={editable}
        onEditCard={(cardIdx, text) => onEditCard?.(scene.id, cardIdx, text)}
        printMode={printMode}
        redundant={redundant}
        lintWarnings={lintWarnings}
        sceneMode={sceneMode}
        validationWarnings={scene.validationWarnings}
      />
    </div>
  );
}
