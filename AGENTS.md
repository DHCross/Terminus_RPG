# Agent Guide — Terminus RPG (Multi-Genre Coherence System)

## User Collaboration Profile

I am a vibe coder and creative writer and systems thinker, not a trained coder.
When assisting in this repository:
- prioritize plain-language explanations of code decisions
- present concrete next actions instead of assuming advanced coding fluency
- preserve creative/system-level intent while translating it into safe, testable steps

## Architecture: Engine vs. Setting Packs

The game is **multi-genre**. The underlying engine is the **Coherence System**
(`suite/src/modules/coherence-engine/`, package `@coherence-system/engine`).
It is genre-agnostic: dice, character frames, scene cards, resolution, campaign,
validation. Each setting is a **Setting Pack** that supplies vocabulary, data,
UI workbenches, branding, and (backend) lore/prompts.

- **Terminus** is one pack (civic dark fantasy / Tringad).
- **Aurel** (Generic Fantasy) is another pack (in progress). In-canon, Aurel is
  the Coherence Engine's first candidate build — warmer, smoother, and more luminous
  than Tringad. Quarantined as a high-entropy Sword & Sorcery sandbox where the engine
  lets Drift run as the default state to stress-test legacy archetypes and harvest
  stable spell loops (Rotes). See
  `docs/settings/generic-fantasy/design-bible.md` for the full lore bridge.
- The Coherence baseline (`DEFAULT_PACK`) is the no-flavor default.

Engine mechanical vocabulary (action stats `force/agility/willpower`, defense
stats `endure/avoid/exert`, weapon vectors) is **fixed** — that is how the
resolution engine works. Packs provide display labels for those, and define
**content vocabulary** (armor types, consequence names, pressure types, threat
roles, build budgets, simulation template) the engine carries but does not
mechanically branch on. See `coherence-engine/src/pack.ts`.

`Campaign.packId` declares which pack a campaign belongs to. Validation accepts
an optional `SettingPack` (`validateCharacter(char, pack?)`,
`validateCampaign(campaign, pack?)`) and uses pack vocabulary when provided,
falling back to engine defaults.

## Build & Verify (frontend suite)

```bash
cd suite
npx tsc -b          # typecheck (primary verification gate)
npm run dev         # dev server at http://localhost:5173
npm run build       # tsc -b && vite build
```

`bun test` is configured but bun is not installed in this environment; vitest
is the intended runner. The only existing test is
`src/components/LoadingSpinner.test.tsx`.

## Module Layout

- `suite/src/modules/coherence-engine/` — genre-agnostic state engine (setting-free)
- `suite/src/modules/terminus/` — Terminus UI workbenches (consume engine)
- `suite/src/modules/gwsd-cards/` — GWSD card tooling (projects GWSD cards
  into engine SceneCards via `coherenceAdapter.ts`). Setting-neutral types use
  `Coherence*` names; scene metadata lives in `scene.meta?` (was `scene.terminus?`).
- `suite/src/data/terminus/` — Terminus-specific data (orders, species, magic,
  names, weapons, archetypes, drift, advancement). `OrderId` lives here.
- `suite/src/settings/` — Setting Pack registry + React context (`SettingContext.tsx`),
  UI types (`types.ts`), and per-pack dirs (`packs/terminus/`, `packs/default/`).
  Each pack exports branding, nav, routes, and a dashboard component.
- `suite/src/shared/useVaultStorage.ts` — generic localStorage vault hook for
  any `VaultRecord`; setting packs compose it with their own record shapes.
- `suite/src/services/aiService.ts` — generic `completeJSON()` HTTP utility
  (setting-free). Pack-specific AI prompts/generators live in
  `settings/packs/terminus/ai.ts`.
- `suite/src/data/generic-fantasy/` — (planned) Generic Fantasy data
- `suite/src/modules/generic-fantasy/` — (planned) Generic Fantasy workbenches
- `Terminus/backend/` — Python AI GM (Claude). Setting lore is data-driven,
  living in `Terminus/sapphire-data/prompts/context/` and `prompt_pieces.json`.
  Backend setting-awareness is planned (per-pack lore dirs).

## Extraction Status (Phase 3)

Setting-free and verified by `tsc -b`:
- `coherence-engine` — no Terminus refs; `RuptureType`/`rupture` renamed to
  `BreachType`/`breach` (mechanical track-depletion concept).
- `services/aiService.ts` — generic `completeJSON()`; Terminus generators moved
  to `settings/packs/terminus/ai.ts`.
- `gwsd-cards` types/parser/App — `Terminus*` types renamed to `Coherence*`/
  `SceneMode`/`SceneMeta`; `scene.terminus?` -> `scene.meta?`; `orderTags`
  genericized to `string[]`; `TerminusOrder` moved to Terminus pack as `OrderId`.
- `gwsd-cards/App.tsx` no longer imports `SceneCardForge` from the Terminus
  pack; it accepts an optional `sceneForge` component prop (dependency inversion).
- `narrativeLinter.ts` `terminusNote` -> `settingNote`; Terminus example/comment
  text de-branded.

Remaining Phase 3 work (presentation components still Terminus-flavored in
`gwsd-cards/components/`): `CharacterSheetPreview` (+css), `FullSpreadPrintLayout`,
`CharacterStudio`, `MonsterStudio`. These should move to the Terminus pack using
the same injection pattern as `SceneCardForge` (pass components in as props),
leaving `gwsd-cards` as pure GWSD parse/projection tooling.

## Renaming History

The engine was previously named "Silhouette" (`@silhouette-rpg/engine`,
folder `silhouette-engine/`). It was renamed to the Coherence System. GWSD
card tooling symbols were renamed accordingly: `SilhouetteProjection` ->
`CoherenceProjection`, `SILHOUETTE_SECTION_ORDER` -> `COHERENCE_SECTION_ORDER`,
`buildSilhouetteProjection` -> `buildCoherenceProjection`,
`silhouetteStudio.ts` -> `coherenceStudio.ts`,
`silhouetteAdapter.ts` -> `coherenceAdapter.ts`,
`SilhouetteStudioCommon.tsx` -> `CoherenceStudioCommon.tsx`,
`scene.silhouette` -> `scene.coherence`.
`TerminusThreshold`/`TerminusSkill`/`TerminusSceneMode`/`TerminusSceneMeta`/
`TerminusVector`/`TerminusConflictData` -> `Coherence*`/`SceneMode`/`SceneMeta`/
`ConflictData`. `scene.terminus?` -> `scene.meta?`. `RuptureType` -> `BreachType`.
`terminus-sheet` CSS classes -> `coherence-sheet`.
