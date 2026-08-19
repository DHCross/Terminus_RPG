import { FrameVaultWorkbench } from '../../../shared/frame-vault/FrameVaultWorkbench';
import { AUREL_SHEET_CHROME } from '../../sheetChrome';
import { AUREL_NPC_SEEDS } from './seeds';

export function AurelNpcVault() {
  return (
    <FrameVaultWorkbench
      packId="generic-fantasy"
      kind="npc"
      chrome={AUREL_SHEET_CHROME}
      title="Aurel NPC Vault"
      seeds={AUREL_NPC_SEEDS}
    />
  );
}
