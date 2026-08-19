# Appendix B Terminology Audit Report (Report-Only Pass)

- **Repository:** `DHCross/Terminus_RPG`
- **Audited HEAD:** `bf5b6ea716fd676a6188f9cb29416c1a18d9f438`
- **Audit Scope:** `suite/` (UI, components, data, workbenches) and `docs/game-design/`
- **Submodule Status:** `Terminus/` untouched (pinned at `4618f02`)
- **Execution Mode:** Read-only inspection and report. Zero source files modified.

---

## 1. Executive Summary & Hard-Stop Findings

### 1.1 Magic Model Divergence (Flagged & Unresolved)
- **Doc (Alpha Draft 0.2 §12):** Component-based Workings (*Order, Effect, Form, Reach, Duration, State Result*) with free-form state change answers.
- **Code (`suite/src/data/terminus/magic.ts` & `RulesPage.tsx`):** Implements four controlled Sanctioned Working verbs (`Seal`, `Expose`, `Bridge`, `Nullify`), three Magic Modes (`Sanctioned Working`, `Rupture Casting`, `Old Office Rite`), Order Expressions, and a `Hostile Trace` d10-vs-Drift check protocol.
- **Status:** Per prompt directive, this divergence is flagged without reconciliation. Recommendation: update documentation to formalize the four verbs + Hostile Trace protocol into canon.

### 1.2 `suite/src/data/terminus/armor.ts` Actual Shape
`armor.ts` defines four tiers (`none`, `leather`, `chain`, `plate`) using flat `reduction: number` (0, 1, 1, 2) and `notes?: string`. It contains **no `armorDR` or die-rank fields**.

### 1.3 `narrativeLinter.ts` and `redundancyChecker.ts` Architecture
- `suite/src/modules/gwsd-cards/narrativeLinter.ts` is an extensive 48KB prose and state analyzer with 20 lint rules (e.g., `vague-ground`, `backstory-will`, `hazard-has-will`, `trap-hazard-collapse`). It already uses regex-based keyword dictionaries (`PERMISSION_DELTA_KEYWORDS`, `EXECUTABLE_CONSTRAINT`, `VAGUE_ATMOSPHERE`).
- `narrativeLinter.ts` is the natural home for an Appendix B `QUARANTINE_TERMS` linter rule in Batch 1.
- `suite/src/modules/gwsd-cards/redundancyChecker.ts` is an independent 77-line Jaccard-overlap similarity checker.

### 1.4 `character-types.ts` Compliance Confirmation
`suite/src/data/terminus/character-types.ts` is **100% compliant** with Alpha Draft 0.2. It defines `SkillSet` (Force/Agility/Willpower), `ThresholdSet` (Endure/Avoid/Exert), and `deriveThresholds()` mapping `d4:1, d6:2, d8:3, d10:4, d12:5`. No Poise, Integrity, or Armor DR exists here.

---

## 2. Audit Findings by Severity

### Tier 1 — Legal Quarantine (Dangerous Journeys / Mythus)

#### `suite/src/settings/packs/generic-fantasy/CoherenceCharacterCard.tsx`
**Finding 1** | Tier 1 (legal) | Severity: high | Layer: fiction
- Line 554, section comment / header: `{/* Vocation Techniques — collapsible */}`
- Current: `"Vocation Techniques"`
- Proposed: `"Archetype Techniques"` or `"Legacy Techniques"`
- Rationale: `Vocation` is Mythus IP. Aurel uses *Legacy* or *Archetype*.
- Renders in: `CoherenceCharacterCard.tsx`
- Confidence: high

#### `suite/src/settings/packs/generic-fantasy/GenericFantasyDashboard.tsx`
**Finding 2** | Tier 1 (legal) | Severity: high | Layer: fiction
- Line 216, status note: `(origins, archetypes, vocations, techniques, rotes...`
- Current: `"vocations"`
- Proposed: `"legacies"` or `"archetypes"`
- Rationale: Quarantined Mythus term.
- Renders in: `GenericFantasyDashboard.tsx`
- Confidence: high

#### `suite/src/settings/packs/generic-fantasy/signatureKeyData.ts`
**Finding 3** | Tier 1 (legal) | Severity: high | Layer: fiction / doc comment
- Line 36, JSDoc comment: `/** Implement Calibration bonus = bearer's Vocation Tier (Level). Added to Harm Potential on winning Core Exchange. */`
- Current: `"bearer's Vocation Tier (Level)"`
- Proposed: `"bearer's Level"`
- Rationale: Quarantined Mythus term.
- Renders in: Developer tooltip / hover
- Confidence: high

---

### Tier 5 — Setting Quarantine (Tringad Civic vs. Transit / Steampunk)

#### `suite/src/data/terminus/magic.ts`
**Finding 4** | Tier 5 (setting) | Severity: high | Layer: fiction
- Line 166, `WORKING_VERBS` -> `expose` -> `examples[0]`
- Current: `"Expose the seal that lets a dead transit line keep accepting passengers."`
- Proposed: `"Expose the seal that lets a dead tollgate keep accepting coin."`
- Rationale: Tringad has no mass transit. Tollgates and coins are approved civic fixtures.
- Renders in: `suite/src/modules/terminus/magic/MagicView.tsx`, `RulesPage.tsx`
- Confidence: high

**Finding 5** | Tier 5 (setting) | Severity: high | Layer: fiction
- Line 110, `RUPTURE_CASTING_SUBTYPES` -> `systemic-overdraw` -> `definition`
- Current: `"...publicly breaking civic routine such as stopping a tram line or shattering multiple seals."`
- Proposed: `"...publicly breaking civic routine such as halting the ferry sequence or shattering multiple seals."`
- Rationale: Tringad has no trams; water-ferries carry cross-river transit.
- Renders in: `suite/src/modules/terminus/magic/MagicView.tsx`, `RulesPage.tsx`
- Confidence: high

#### `suite/src/modules/terminus/scene/SceneCardForge.tsx`
**Finding 6** | Tier 5 (setting) | Severity: medium | Layer: fiction (AI prompt seed)
- Line 389, prompt instruction: `Theme: Rupture is a local systemic failure of a routine (e.g., a bell ringing twice, a dead transit line accepting passengers, a street that grows longer).`
- Current: `"a dead transit line accepting passengers"`
- Proposed: `"a dead tollgate accepting coin"`
- Rationale: Prevents AI generation from hallucinating industrial transit lines.
- Renders in: AI Generation Prompt Context
- Confidence: high

**Finding 7** | Tier 5 (setting) | Severity: medium | Layer: fiction (AI prompt seed)
- Line 429, prompt instruction: `Theme: Rupture is a local systemic failure of a routine (e.g., a bell ringing twice, a dead transit line accepting passengers...`
- Current: `"a dead transit line accepting passengers"`
- Proposed: `"a dead tollgate accepting coin"`
- Rationale: Same as above.
- Renders in: AI Generation Prompt Context
- Confidence: high

#### `suite/src/modules/terminus/adventure/sampleAdventure.ts`
**Finding 8** | Tier 5 (setting) | Severity: medium | Layer: fiction
- Line 94, `act3` -> `incitingIncident`: `"The corrupted Locus Core is revealed to be a massive, brass clockwork cylinder, clogged with black, viscous ink..."`
- Current: `"brass clockwork cylinder"`
- Proposed: `"brass geared drum"` or `"brass bell-yoke mechanism"`
- Rationale: `clockwork` is quarantined under setting steampunk cues; rotary brass drums / bell-yokes fit civic bureaucracy.
- Renders in: `AdventureWorkbench.tsx`
- Confidence: medium

---

### Tier 4 — Retired Mechanics (Poise, Integrity, Armor DR, Harm Potential, Hexad)

#### `suite/src/settings/packs/generic-fantasy/HexadReference.tsx` & `GenericFantasyDashboard.tsx`
**Finding 9** | Tier 4 (retired mechanics) | Severity: high | Layer: UI / component
- Entire component `HexadReference.tsx` + Dashboard section lines 166, 174–176, 192, 217.
- Current: Closed six-verb spell list ("The Hexad of Workings")
- Proposed: Deprecate `HexadReference.tsx`; update dashboard text to describe component-based Workings cast unanchored.
- Rationale: The Hexad was retired in Draft 0.2 B.4. Aurel uses the same component grammar as Tringad.
- Confidence: high

#### `suite/src/settings/packs/generic-fantasy/characterData.ts`
**Finding 10** | Tier 4 (retired mechanics) | Severity: high | Layer: data / UI
- Lines 64–68, 76–80, 114–117, 184–188, 262–266: `poise`, `integrity`, `armor.die` (Plate DR d10), `shields.reduction`, `Harm Potential`.
- Current: Multi-layered defense math and computed poise pools (`Agi + Avoid + Force`).
- Proposed: Remove `poise`, `integrity`, `armor.die`, `Harm Potential`. Replace with pure `thresholds` (Endure/Avoid/Exert circles) and `armament` with **Impact** and **Vector**.
- Rationale: Direct violation of B.4 retired mechanics.
- Confidence: high

#### `suite/src/settings/packs/generic-fantasy/signatureKeyData.ts`
**Finding 11** | Tier 4 (retired mechanics) | Severity: high | Layer: data / UI
- Lines 36, 64, 70, 140, 147, 179, 185: `Harm Potential`, `Armor DR`, `Poise Pool`.
- Current: References to "+3 Harm Potential", "bypasses plate Armor DR", "restores 4 Poise".
- Proposed: Update to Draft 0.2 grammar: "+1 Impact", "bypasses armor protection", "restores 1 Avoid circle".
- Rationale: Cleans retired mechanics out of the Signature Key Ledger.
- Confidence: high

---

### Tier 6 & Tier 3 — Title Rule & Machine Vocabulary in Player-Facing Text

#### `suite/src/modules/terminus/campaign/CampaignView.tsx`
**Finding 12** | Tier 6 (title rule) & Tier 3 (machine vocab) | Severity: high | Layer: fiction
- Line 28, `campaignQandA[1]` answer: `"Terminus is about an AI named Terminus—not trains—that creates and maintains a dark fantasy world. The AI operates deep beneath the substrate as an alien, emotionless Coherence Engine, enforcing absolute control in order to maintain perfect computational equilibrium. But it does not understand how to balance free will inside the world it has created. As a result, Ruptures manifest: physical expressions of computational stress, conflicting constraints, and broken routines..."`
- Current: Explicit player-facing exposition naming Terminus as an AI simulation engine.
- Proposed: Rewrite to match the Alpha 0.2 lore doctrine (Tringad as a rain-slicked city of cold brass and load-bearing paperwork; Terminus is unmentioned; Rupture is systemic failure of routine).
- Rationale: Violates B.3 (machine vocabulary in player text) and B.6 (Terminus named as in-world AI).
- Renders in: `CampaignView.tsx` AMA viewer
- Confidence: high

**Finding 13** | Tier 6 & Tier 3 | Severity: high | Layer: fiction
- Line 36, `campaignQandA[2]` answer: `"The setting exists as the active computational topology of Terminus. The cosmos, the trees, the walls, the cobblestones, and the denizens of Tringad are all variables and rendering logic inside the world."`
- Proposed: Rewrite or remove simulation explanation.
- Rationale: Direct simulation exposition in player-facing view.
- Renders in: `CampaignView.tsx`
- Confidence: high

**Finding 14** | Tier 3 (machine vocab) | Severity: high | Layer: fiction
- Line 156, `campaignQandA[8]` answer: `"Because the game takes place inside a simulated Coherence Engine, death can also have existential forms in the lore. Data Pruning is what happens when an inhabitant of Tringad dies and the Engine recycles or removes their data to free computational bandwidth. Un-computation can occur when someone moves outside the established boundaries of the map... Total Erasure happens when a district reaches the final stage of systemic collapse."`
- Proposed: Rewrite death consequences to focus on Endure/Avoid/Exert breakdown, loss of name in civic ledgers, and extraction.
- Rationale: Heavy machine/simulation vocabulary in player-facing FAQ.
- Renders in: `CampaignView.tsx`
- Confidence: high

#### `suite/src/modules/terminus/rules/RulesPage.tsx`
**Finding 15** | Tier 6 (title rule) | Severity: low | Layer: fiction
- Line 110–111, Glossary: `<dt>Terminus</dt><dd>The game and the hidden architecture beneath the world of Tringad.</dd>`
- Current: `"The game and the hidden architecture beneath the world of Tringad."`
- Proposed: `"The title of the dark fantasy tabletop roleplaying game."`
- Rationale: Keeps Terminus strictly as the title of the game, avoiding in-world lore identity.
- Renders in: `RulesPage.tsx`
- Confidence: high

---

## 3. Counts by Tier & File

| File | Tier 1 (Legal) | Tier 5 (Setting) | Tier 4 (Retired Mech) | Tier 6 (Title Rule) | Tier 3 (Machine Vocab) | Total |
|---|---|---|---|---|---|---|
| `suite/src/data/terminus/magic.ts` | 0 | 2 | 0 | 0 | 0 | **2** |
| `suite/src/modules/terminus/campaign/CampaignView.tsx` | 0 | 0 | 0 | 2 | 3 | **5** |
| `suite/src/settings/packs/generic-fantasy/characterData.ts` | 0 | 0 | 8 | 0 | 0 | **8** |
| `suite/src/settings/packs/generic-fantasy/signatureKeyData.ts` | 1 | 0 | 6 | 0 | 0 | **7** |
| `suite/src/settings/packs/generic-fantasy/CoherenceCharacterCard.tsx` | 1 | 0 | 0 | 0 | 0 | **1** |
| `suite/src/settings/packs/generic-fantasy/GenericFantasyDashboard.tsx` | 1 | 0 | 3 | 0 | 0 | **4** |
| `suite/src/modules/terminus/scene/SceneCardForge.tsx` | 0 | 2 | 0 | 0 | 0 | **2** |
| `suite/src/modules/terminus/adventure/sampleAdventure.ts` | 0 | 1 | 0 | 0 | 0 | **1** |
| `suite/src/modules/terminus/rules/RulesPage.tsx` | 0 | 0 | 0 | 1 | 0 | **1** |
| **Total** | **3** | **5** | **17** | **3** | **3** | **31** |

---

## 4. Probable False Positives (Deliberately Not Flagged)

1. **`suite/src/modules/terminus/scene/SceneCardForge.tsx:357` (`"a steep mountain climb"`)**
   - *Reason:* Standard English adjective, unrelated to the Mythus `STEEP` skill system.
2. **`suite/src/data/terminus/magic.ts:222` (`ARCHETYPAL_CASTINGS`)**
   - *Reason:* Existing Terminus term for canonical order Working presets, not Mythus Cantrip/Casting tiers.
3. **`suite/src/data/terminus/magic.ts:115` (`HOSTILE_TRACE_PROTOCOL`)**
   - *Reason:* Code-layer constant naming a procedural Guide check, not in-world dialogue calling a sworn vow a "protocol".
4. **`suite/src/modules/gwsd-cards/narrativeLinter.ts` (Rules: `railroad`, `vague-ground`, `backstory-will`)**
   - *Reason:* Internal editorial and linting diagnostics for scenario authors, not player-facing lore.
5. **CSS Transitions across UI components (`transition: all 0.2s ease`, `transition-colors`)**
   - *Reason:* Code-layer styling attributes, not transit/mass-transit setting lore.
6. **`docs/game-design/The tragic loss of Eldritch RPG.md` & `corrections.md`**
   - *Reason:* Historical design retrospectives citing deprecated terms in order to ban or explain their evolution.

---

## 5. Verification
- Zero source files modified in this pass.
- `suite/` build verification: `npm run build` ran clean with exit code 0.
