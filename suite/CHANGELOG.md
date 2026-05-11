# Changelog & Road Map

All notable changes to the Terminus RPG Digital Companion Suite will be documented here.

## [Unreleased] - Intention & Roadmap

### Architecture & Data Integrity
- [ ] **Unify Character Data Model**: Consolidate fragmented state schemas into a single source of truth `Character` interface.
- [ ] **Centralized State Management**: Replace 17+ individual `useState` hooks in `CharacterCard` with a single `useReducer` or slice store for reliable, consistent updates.
- [ ] **Static Threshold Derivation**: Remove manually stored threshold tracking and auto-derive circles dynamically from current Skill Die Ranks (`d4=1` ... `d12=5`).
- [ ] **Design Token Consistency**: Remove disparate inline styles and strict adhere to Tailwind CSS utility config and standard CSS variables.

### Feature Completeness
- [ ] **Rebuild Generator Wizard**: Implement formal 5-step character creation matching the rulebook:
    1. **Species Selection** (Apply passive traits)
    2. **Order Selection**
    3. **Origin Discovery** (Species-dependent region filtration)
    4. **Upgrade Matrix** (Assign d10, d8, d6 to Force/Agility/Willpower)
    5. **Archetype Refinement** (Approach, Signature, Initial Equipment)
- [ ] **Order Ability Integration**: Allow explicit selection of subset Order Abilities (3 of 5) in Character Generator and Card.
- [ ] **Starter Kit Provisioning**: Implement automatic and chosen starting weapon, armor, and pack provision during step-five generation.

### Experience Enhancement
- [ ] **Dice Roller & Conflict Comparator**: Add native HUD element to roll skill dice vs threshold targets with instant comparison log.
- [ ] **Working (Magic) Constructor**: Introduce componentized spells selector (Effect, Form, Reach, Duration, Result) for arcane characters.
- [ ] **Scene Card Acceleration**: Refactor massive builder into modular sub-screens; implement "Quick Mode" for real-time game pacing.

### Industrial Mysticism Aesthetic
- [ ] **Visual overhaul**: Standardize palette around Cold Brass (#b8860b), Bone Paper (#f5f0e8), and Black Stone (#1a1a1a).
- [ ] **Typography injection**: Formally import and enforce Cinzel (headings) and Lora/Merriweather (body) serifs.
- [ ] **Themed Elements**: Apply inner-shadow card lift, parchment backdrop texturing, and mechanical cog animation states.
