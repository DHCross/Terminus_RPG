import { FrameVaultWorkbench } from '../../../shared/frame-vault/FrameVaultWorkbench';
import { BASELINE_SHEET_CHROME } from '../../sheetChrome';

export function BaselineNpcVault() {
  return (
    <FrameVaultWorkbench
      packId="coherence-baseline"
      kind="npc"
      chrome={BASELINE_SHEET_CHROME}
      title="NPC Vault"
    />
  );
}
