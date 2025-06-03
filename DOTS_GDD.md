# Dots - Game Design Document v0.3
## "Energy Management" Edition - Evolution Sim / Social Sim / Systems Sandbox

## Core Philosophy & Vision
"Dots is a sandbox for systems architects—watching simple rules evolve into complex behaviors as entities manage their core Energy resource."
**Genre:** Evolution Sim / Social Sim / Systems Sandbox
**Core Experience:** You're a systems architect. You don't play the world—you tune it by setting initial conditions and observing emergent energy management strategies.
**Starting Point:** One Dot. A single 3x3 pixel entity in an empty world, driven by its Energy level.

### Worldview
The world is a blank, gridded canvas. Every Dot is a tiny programmable agent in a massive, interlinked ecosystem. They're not cute—they're pure function, driven to acquire, conserve, and utilize Energy. But watching them develop strategies for survival is the charm. This is a Petri dish for digital evolution focused on energy dynamics.

### ONE Distinguishing Feature
**Systemic Clarity from Minimalism & Energy-Driven Behavior:** Every mechanic is bare-bones, every visual is pixel-level, but layered together they allow deep emergent behaviors as Dots strive to manage their Energy. A microcosmic, visual programming toy where dots "live" because their energy compels them.

## Core Game Loop
1.  **Observe the Dot** — Watch its behavior state (driven by Energy), movements, Dits (waste), and Dats (signals).
2.  **Tweak Parameters** — Modify initial Dot color (genetics influencing energy traits), speed, and potentially environmental energy sources.
3.  **Trigger Actions** — Click "Info" for the Dot Sheet or introduce environmental changes (e.g., new Energy Dat sources).
4.  **React to Emergence** — As Dots interact with Dats, Dits, and each other to manage Energy, unexpected survival patterns arise.

## Entity System
### Dots (3x3 pixel entities)
**Primary Characteristics:**
*   Color (RGB values - potentially influencing energy efficiency or interaction)
*   Behavior State (driven by internal Energy level; e.g., Low Energy -> Seek Energy, High Energy -> Active/Reproduce)
*   Movement Speed (0.0 - 1.0, affects energy consumption)
**Capabilities:**
*   Move across the grid (consumes Energy)
*   Excrete Dits (1x1 pixel waste material, byproduct of activity)
*   Emit Dats (1x3 pixel signal entities, e.g., to signal low energy)
*   Consume/Sense Dats (interpret signals, primarily for finding Energy sources)
*   Reproduce (split with inheritance and mutation, based on high Energy)
*   Age and die naturally or from Energy Depletion.

## Death System - "Life Cycle Pressure"
**Key Death Conditions:**
1.  **Energy Depletion Death**
    *   Occurs when Energy (from `EnergyComponent`) reaches 0 for an extended period (e.g., 5-10 seconds).
    *   Creates direct survival pressure based on energy management.
    *   Links mortality to successful energy acquisition and conservation.
    *   Drives evolution toward better energy strategies.
2.  **Natural Aging**
    *   Each Dot has a lifespan of 300-500 seconds (randomized).
    *   Age visible in Dot Sheet as "Age: 234/450 seconds".
    *   Older Dots may move slightly slower (age penalty, affects Energy use and acquisition).
    *   Creates natural generational turnover.
    *   Prevents population stagnation.
**Death Mechanics:**
*   Dying Dots emit final burst of Dits (inert waste).
*   Death location becomes temporary "graveyard" of Dits.
*   Other Dots generally ignore death sites unless Dits physically obstruct movement or energy sources.
*   Removes Dot from world, freeing up space and resources.
**Emergent Effects:**
*   Generational Waves: Youth replace elders in cycles.
*   Survival Strategies: Successful energy management traits spread.
*   Resource Pressure: Competition for Energy Dats/sources intensifies.
*   Evolutionary Selection: Only Dots that effectively manage their Energy pass on genes.

## Energy State System - Energy Drives Behavior
Each Dot possesses an `EnergyComponent` which tracks its core resource.
*   **Energy Level:** A value (e.g., 0-100, where 100 is max). High energy is desirable.
    *   `currentEnergy`: The Dot's current energy reserve.
    *   `maxEnergy`: The maximum energy a Dot can store.
    *   `naturalDecayRate`: The amount of energy the Dot loses per second passively. This is managed by the `HungerSystem`.

The **`HungerSystem`** is responsible for applying the `naturalDecayRate` from each Dot's `EnergyComponent` to its `currentEnergy` every game tick (scaled by `deltaTime`). This simulates metabolic cost or basic energy drain over time.

**Core Behavior Loop (Simplified):**
1.  **Evaluate Energy Level:** The Dot checks its `currentEnergy` via its `EnergyComponent`.
2.  **Select Action (Examples):**
    *   Low Energy (e.g., < 30%) → Actively seek known energy sources (Green Dats), reduce non-essential activity, may enter a dormant state to conserve energy if critically low.
    *   Sufficient/High Energy (e.g., > 70%) → Explore new areas (potential for finding new energy), engage in reproduction if conditions are met, perform other specialized actions if evolved.
3.  **Act:** Move, excrete Dit, emit Dat (e.g., Yellow Dat if low on energy), interact with environment or other Dots. Actions themselves might consume additional energy (e.g., movement cost handled by MovementSystem potentially increasing decay or making a direct call to `decreaseEnergy`).
4.  **Energy Change:**
    *   **Decrease:** Primarily via `HungerSystem` applying `naturalDecayRate`. Specific actions (like fast movement, reproduction) could also directly call `decreaseEnergy` on the `EnergyComponent`.
    *   **Increase:** By consuming Green Dats (energy sources) or through other specialized game mechanics (e.g., absorbing ambient energy in certain zones, if implemented).

## Communication System
### Dats (1x3 pixel signals)
**Structure:** Vertical 1x3 pixel sprites with color-encoded meanings. Primarily used for energy-related signaling.
**Standard Color Language (v0.3):**
*   🟢 **Green** (Environmental): Energy Source / Replenishing Zone. Dots are attracted to these to increase their `currentEnergy`.
*   🟡 **Yellow** (Emitted by Dot): Signals Low Energy. May serve as a warning to the emitting Dot (if it has self-preservation logic) or as a signal to other Dots (e.g., for pack behavior or attracting aid, depending on evolved social rules).
*   🔴 **Red** (Environmental/Emitted): Danger / Hazard. Not tied to a "Safety" need. Red Dats or zones might directly cause rapid energy drain, damage, or destroy Dots on contact. Dots may evolve a hardcoded avoidance to these as a survival trait.
*   ⚪ **White** (Emitted by Dot, Optional): Generic signal for reproduction readiness if Energy is high. Could replace more complex mating signals from previous GDD versions.
**Mechanics:**
*   Persist in environment or fade over time.
*   Sensed by Dots to trigger behaviors (e.g., move towards Green Dat, away from Red Dat).
*   Interpretation of Dats is largely hardcoded for these basic functions, but nuances could evolve.

## Waste System
### Dits (1x1 pixel waste)
**Properties:**
*   Color: Dull, organic tones (brown, gray).
*   Decay Timer: Disappears after X seconds.
*   Effect: Largely inert. May physically block movement in high concentrations or slightly reduce the appeal of an area for energy foraging if they cover energy sources. Not directly toxic or tied to a "Safety" need.
**Emission Triggers:**
*   Movement (passive byproduct of energy expenditure).
*   Processing consumed Energy Dats (metabolic waste).
**Behavioral Impact:**
*   Dots generally ignore Dits unless they form significant obstacles.
*   May avoid Dit-heavy zones if those zones offer no energy benefits or if Dits obscure energy sources.

## Evolution System
### Reproduction & Inheritance
**Trigger Conditions (Simplified):**
*   Individual Readiness: `currentEnergy` is high (e.g., > 70% of `maxEnergy`). This signals the Dot has surplus energy to invest in reproduction.
*   Optional: Proximity to another Dot also in a ready state, if sexual reproduction is modeled. For asexual, only high energy is needed.
*   If using mating signals: Dot may emit a White Dat (or other designated color) when ready.
**Social Breeding Mechanics (If Sexual Reproduction is Kept):**
*   Simplified: Dots ready to reproduce (high energy) may seek out other high-energy Dots emitting the mating signal.
*   Focus is on energy availability as the primary driver for reproduction.
**Breeding Behavior:**
*   Dots with high energy might allocate a portion of that energy to create offspring.

### Advanced Evolution System - "From One to Many"
**Speciation Mechanics (Simplified around Energy Strategies):**
**Core Goal:** Enable natural divergence based on different strategies for acquiring, conserving, and utilizing energy.
**RGB-Based Genetic System (Re-purposed or Simplified):**
*   **Option 1 (Simplified Genetics):** Color (RGB) primarily influences:
    *   **Energy Absorption:** Efficiency of absorbing energy from Green Dats (e.g., certain shades of green are better for certain Dot colors).
    *   **Natural Decay Rate:** Base `naturalDecayRate` in `EnergyComponent` could be inherited and mutated, influenced by one of the RGB channels.
    *   **Movement Cost:** Energy cost of movement could be tied to an RGB channel.
*   **Option 2 (Retain some complexity):**
    *   🔴 Red Channel: Influences activity level vs. dormancy thresholds. High Red might mean Dot becomes dormant more easily at low energy.
    *   🟢 Green Channel: Core influence on `naturalDecayRate` (lower is better), efficiency of energy absorption from sources.
    *   🔵 Blue Channel: Influences movement patterns (e.g., tendency to explore vs. stay near known sources), or energy cost of specific actions like Dat emission.
**Species Formation Drivers:**
1.  **Energy Niche Specialization:** Dots evolve to be more efficient in specific energy conditions (e.g., low-density energy patches vs. rich, contested patches).
2.  **Mutation of Energy Traits:** `naturalDecayRate`, energy storage (`maxEnergy`), movement energy cost, and absorption efficiency are key heritable traits that drive speciation.
**Advanced Reproduction Evolution:**
*   Focus on how energy traits are passed on and mutated. Sexual reproduction, if kept, would blend these energy-related genetic traits.
**Emergent Speciation Outcomes (Energy-Focused Examples):**
*   ⚡ **Sprinters:** High movement speed, high energy consumption, effective at reaching sparse energy quickly but need frequent refueling. May have higher `maxEnergy` but also higher `naturalDecayRate`.
*   🐢 **Conservers:** Low `naturalDecayRate`, slow movement, highly efficient energy absorption. Thrive in low-energy environments.
*   💡 **Prospectors:** Efficient explorers, perhaps with lower energy cost for movement or better sensing range for Green Dats.
*   🔋 **Storers:** Evolved to have very high `maxEnergy`, allowing them to survive long periods without external energy sources.

**Reproductive Isolation Mechanisms:**
*   Mainly through divergence of energy strategies making certain environments more or less viable for different "species."
*   If sexual, mating preferences might still be tied to similar energy profiles (e.g. similar RGB if it codes for energy traits).

## User Interface
### Dot Sheet (Diagnostic Panel)
Accessed by clicking on any Dot
**Sections:**
*   **Identity**
    *   Name/ID (auto-generated: Dot-0047)
    *   Generation number
    *   Color (RGB, modifiable by player for initial Dot, then by evolution)
    *   Parent link(s)
*   **Traits (Genetically Influenced)**
    *   Movement Speed (0.0 - 1.0, impacts energy use)
    *   `naturalDecayRate` (from `EnergyComponent`)
    *   `maxEnergy` (from `EnergyComponent`)
*   **Energy Status**
    *   Energy: ███████░░ 70 / 100
    *   (Progress bar for `currentEnergy` vs `maxEnergy`)
*   **Behavior Biases (Simplified or Removed):**
    *   If RGB genetics are simple (Option 1), this section might be removed.
    *   If Option 2 for RGB, could show:
        *   Energy Conservation Tendency (e.g., from Red Channel)
        *   Energy Efficiency Score (e.g., from Green Channel)
        *   Exploration Drive (e.g., from Blue Channel)
*   **Dat Preferences & Emissions**
    *   Primary Dat(s) emitted (e.g., Yellow for low Energy, White for reproduction).
*   **Optional Features**
    *   Toggle Autonomous/Manual Override (for debugging/seeding)
    *   Last Dit Emission timestamp
    *   Current primary action/goal (e.g., "Seeking Energy", "Conserving Energy", "Reproducing")

## Technical Specifications
**Visual Style:** Pure pixel art, minimal aesthetic
**Grid System:** Blank canvas with pixel-perfect positioning
**Entity Sizes:**
*   Dots: 3x3 pixels
*   Dats: 1x3 pixels (vertical)
*   Dits: 1x1 pixels
**Core Values:**
*   Transparency of energy systems.
*   Real-time behavior observation based on energy levels.
*   Emergent complexity from simple energy management rules.
*   Player as observer/architect of energy ecosystems.

## Victory Conditions & Player Goals
### Victory Conditions & Player Goals
**Survival Milestones System**
**Core Philosophy:** Success is measured by the civilization's ability to efficiently manage energy, survive, adapt, and diversify its energy strategies.
**Primary Victory Conditions:**
*   🧬 **Lineage Survival & Energy Efficiency**
    *   Bronze Achievement: Keep original Dot's lineage alive for 10 generations, demonstrating basic energy management.
    *   Silver Achievement: 25 generations, showing adaptation in energy acquisition or conservation (e.g., lower average `naturalDecayRate`).
    *   Gold Achievement: 50 generations, with clear evidence of evolved, efficient energy strategies.
    *   Legendary: 100+ generations with multiple distinct species, each mastering energy management in unique, sustainable ways.
*   👥 **Population Milestones & Stability (Energy-Based)**
    *   Growing Colony: Reach 25 simultaneous living Dots with stable average energy levels (e.g., >50%).
    *   Thriving Society: Maintain 50+ Dots for 5+ minutes with high average energy levels.
    *   Mega-Civilization: Achieve 100+ Dots, all effectively managing their Energy.
    *   Species Master: Maintain 3+ distinct species simultaneously, each with unique and successful energy management strategies.
*   🌈 **Speciation & Energy Strategy Diversity Achievements**
    *   First Split: Two populations emerge with demonstrably different primary energy strategies (e.g., one Sprinter type, one Conserver type).
    *   Energy Strategy Trinity: Three distinct species coexisting, each specializing in a different aspect of energy management (e.g., acquisition, conservation, storage).
    *   Adaptive Radiation: A single lineage diversifies into multiple forms, each exploiting different environmental energy niches.
*   🌍 **Environmental Mastery & Resilience (Energy Focus)**
    *   Pioneer Spirit: Successfully populate a new, challenging area by adapting energy strategies to its specific resource availability.
    *   Resilience Expert: Guide species to survive significant environmental changes in energy availability.
    *   Master Architect: Create a self-sustaining ecosystem where multiple species coexist and thrive, their interactions forming a stable energy web.
**Tracking System:**
*   Lineage Tree: Visual family tree showing generational connections and key evolved energy traits (e.g., `naturalDecayRate`, `maxEnergy`).
*   Statistics Panel: Live counters for current goals, average energy levels across populations, dominant energy strategies.
*   Achievement Notifications: Celebrate milestones as they happen.
*   Historical Records: Track peak populations, longest lineages, successful adaptations in energy traits.
**Failure States:**
*   Extinction Event: All Dots die (typically due to inability to acquire sufficient Energy).
*   Lineage Break: Original ancestry line dies out.
*   Population Collapse: Fewer than 5 Dots remaining, often due to systemic failure in energy management across the population.
**Meta-Goal Philosophy**
Success isn't about direct control—it's about designing initial Dot(s) and observing/understanding the environmental parameters that allow life to persevere and flourish by effectively managing its core Energy resource. Players become gardeners of digital evolution, succeeding when their populations develop robust strategies for energy sustainability.

"Dots don't just exist—they endure. And from managing Energy, civilizations emerge."
