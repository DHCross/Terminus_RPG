# Terminus RPG: Mental/Will Domain & Monster Stat Block Design

This document details the resolution of the Will Domain and Monster Stat Block gaps in the Terminus RPG engine. It addresses the asymmetry of Willpower, defines Will defeat states, and establishes a minimum viable monster structure designed for low-friction GM play.

## 1. The Mental/Will Domain

Will is central to the Terminus engine. To prevent it from feeling like a reskinned physical health track, its mechanics lean heavily into asymmetry between Player Characters and Monsters.

### Willpower Asymmetry (The Exert Threshold)
- **For Player Characters:** Exert is a dual-function system. It serves as a **spendable resource** (Strain) used to fuel abilities, push boundaries, or resist certain effects, while simultaneously acting as a **damage track** that absorbs incoming mental or social pressure.
- **For Monsters/NPCs:** Exert is **strictly an ablative damage track**. Monsters do not spend Willpower to fuel their abilities. Their actions are fueled by innate traits or active ability slots. This design choice guarantees low cognitive load for the Guide (GM).

### Symmetry of Will Pressure
Monsters are the primary source of Will pressure. Their existence, presence, and abilities push inward on the PCs' Exert thresholds. PCs generally push outward physically (Force/Agility), utilizing Exert defensively.
- **Exception (The Broker):** To respect the fiction of faction pressure and leverage, the **Broker** Order receives the singular outward Will pressure ability: **Foreclose**. This allows the Broker to attack an NPC's Exert threshold by invoking debts or irrefutable leverage, anchoring their identity without distributing Will attacks symmetrically across all Orders (e.g., Seekers remain investigative).

### Will Defeat State
Physical defeat has a clear fictional state: the body breaks. Will defeat requires an equally clear landing.
- **Default State:** The universal baseline for a broken Exert threshold is **Rout/Flee**. This is clean, requires zero mid-scene interpretation, and keeps play moving.
- **Exception Layer:** Specific monster abilities dictate exceptions to the default. The menu of alternative defeats (Compulsion, Behavioral Override, Forced Disclosure) exists solely in the text of those abilities. The Guide does not choose from a menu at the moment of defeat; the monster's design pre-selects the outcome.

---

## 2. Monster Stat Block Design

Monsters in Terminus are engines of pressure. They avoid complex action economies, recharge timers, or range increments (interface interaction) in favor of abilities that demand engagement with the fiction.

Every ability must answer:
1. **Can I do this at all?**
2. **Do I succeed?**
3. **How much does it matter?**
4. **What does the fiction allow afterward?**

### Target Structure
- **Concept:** A single evocative sentence defining what the monster is and how it pressures the scene.
- **Passive/Innate Trait:** One defining feature that enforces a fictional constraint just by existing.
- **Active Abilities (1-2):** What the monster actually *does*. These target physical (Endure/Avoid) or mental (Exert) thresholds and carry an Impact value.
- **Defensive Profile:** Threshold dice (Endure, Avoid, Exert) and their resulting Circles. For monsters, the Exert track lists its specific Will Defeat State (defaulting to Rout).
- **Scene Drift Contribution:** A passive escalation. What pressure does it generate just by being present? This increments Drift at the end of the round and gives the Warden's **Absorb the Drift** ability an explicit target.

---

## 3. Worked Example: The Ash-Walker

**Concept:** A scorched remnant of a failed civic seal that burns the air and forces panicked retreat.

### Passive/Innate Trait
**Smoldering Presence**
The air within close range is thick with choking ash. Any character ending their turn here without protection loses an Endure circle (Impact 1).
*(Answers: Can I stand near it? What happens if I do?)*

### Active Abilities
**Searing Lash (Force / Agility)**
- *Can I do this?* Yes, if the target is in reach.
- *Do I succeed?* Rolls d8 Force.
- *Impact?* 2.
- *Afterward?* The target is pushed back, opening their position and removing them from cover.

**Terror of the Burn (Willpower)**
- *Can I do this?* Yes, if the target can see the Ash-Walker ignite.
- *Do I succeed?* Rolls d8 Willpower.
- *Impact?* 1 to Exert.
- *Afterward?* Overrides the target's Will Defeat State to *Compulsion (Flee the Room)* instead of a generic Rout.

### Defensive Profile
- **Avoid:** d6 (2 Circles)
- **Endure:** d8 (3 Circles)
- **Exert:** d6 (2 Circles) — *Will Defeat State: Dissipates into harmless soot (Rout).*

### Scene Drift Contribution
- **Passive Escalation:** At the end of each round the Ash-Walker is active, add 1 to the Scene Drift. The ambient temperature rises, warping wooden doorframes and weakening stone pillars.
- *(Interaction: The Warden can use **Absorb the Drift**—suffering a loss to their Exert Threshold—to delay or negate this increase for the round, holding the room together with their will).*
