import { FrameVaultWorkbench } from '../../../shared/frame-vault/FrameVaultWorkbench';
import { BASELINE_SHEET_CHROME } from '../../sheetChrome';

export function BaselineCharacterVault() {
  return (
    <FrameVaultWorkbench
      packId="coherence-baseline"
      kind="character"
      chrome={BASELINE_SHEET_CHROME}
      title="Character Vault"
    />
  );
}
