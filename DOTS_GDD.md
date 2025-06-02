# Dots - Game Design Document v0.1
## "One Dot" Edition - Evolution Sim / Social Sim / Systems Sandbox

## Core Philosophy & Vision
"Dots is a sandbox for systems architects—watching simple rules evolve into complex behaviors."
**Genre:** Evolution Sim / Social Sim / Systems Sandbox
**Core Experience:** You're a systems architect. You don't play the world—you tune it.
**Starting Point:** One Dot. A single 3x3 pixel entity in an empty world.

### Worldview
The world is a blank, gridded canvas. Every Dot is a tiny programmable agent in a massive, interlinked ecosystem. They're not cute—they're pure function. But watching them become something is the charm. This is a Petri dish for digital evolution, with rules you author and observe.

### ONE Distinguishing Feature
**Systemic Clarity from Minimalism:** Every mechanic is bare-bones, every visual is pixel-level, but layered together they allow deep emergent behaviors. A microcosmic, visual programming toy where dots "live" because you let them.

## Core Game Loop
1.  **Observe the Dot** — Watch its behavior state, movements, Dits (waste), and Dats (pheromones)
2.  **Tweak Parameters** — Modify color, speed, behavior state logic
3.  **Trigger Actions** — Click "Info" for the Dot Sheet or initiate an interaction
4.  **React to Emergence** — As it emits and reads Dats, begins moving and excreting Dits, unexpected patterns arise

## Entity System
### Dots (3x3 pixel entities)
**Primary Characteristics:**
*   Color (RGB values)
*   Behavior State (driven by internal needs)
*   Movement Speed (0.0 - 1.0)
**Capabilities:**
*   Move across the grid
*   Excrete Dits (1x1 pixel waste material)
*   Emit Dats (1x3 pixel pheromone entities)
*   Consume Dats (read pheromones and adjust behavior)
*   Reproduce (split with inheritance and mutation)
*   Age and die naturally

## Death System - "Life Cycle Pressure"
**Two Death Conditions:**
1.  **Starvation Death**
    *   Occurs when Hunger remains at 1.0 for extended period (30+ seconds)
    *   Creates survival pressure and resource competition
    *   Links mortality to environmental success
    *   Drives evolution toward better foraging strategies
2.  **Natural Aging**
    *   Each Dot has a lifespan of 300-500 seconds (randomized)
    *   Age visible in Dot Sheet as "Age: 234/450 seconds"
    *   Older Dots move slightly slower (age penalty)
    *   Creates natural generational turnover
    *   Prevents population stagnation
**Death Mechanics:**
*   Dying Dots emit final burst of Dits (corpse waste)
*   Death location becomes temporary "graveyard" of Dits
*   Other Dots may fear or avoid death sites
*   Removes Dot from world, freeing up space and resources
**Emergent Effects:**
*   Generational Waves: Youth replace elders in cycles
*   Survival Strategies: Successful traits spread through population
*   Resource Pressure: Competition for Green Dats intensifies
*   Social Memory: Death sites create cultural landmarks
*   Evolutionary Selection: Only fit Dots pass on genes

## Behavior State System - "Needs Drive Behavior"
Each Dot maintains 3 internal Need Meters (0.0 to 1.0):
*   🟡 **Hunger** — Drives consumption of Dats or seeking input
*   🔴 **Fear** — Drives avoidance of high-density Dits or aggressive colors
*   🔵 **Curiosity** — Drives exploration, pheromone-emission, and rule mutation
**Core Behavior Loop:**
1.  **Evaluate Needs:** Highest meter becomes "Dominant Need"
2.  **Select Action:**
    *   Hunger → Seek consumable Dats
    *   Fear → Move away from clusters or hostile dots
    *   Curiosity → Emit Dats or mutate own rules
3.  **Act:** Move, excrete Dit, emit Dat, or evolve state
4.  **Decay:** Needs decay over time and interactions

## Communication System
### Dats (1x3 pixel pheromones)
**Structure:** Vertical 1x3 pixel sprites with color-encoded meanings
**Standard Color Language (v0.1):**
*   🔴 Red = Danger/Fear — Dots steer away, Fear increases
*   🟢 Green = Food/Safety — Dots drawn toward it, Hunger decreases
*   🔵 Blue = Social Signal/Mating — Dots slow down, Curiosity rises
*   ⚪ White = Curiosity Beacon — Draws attention, encourages exploration
**Mechanics:**
*   Persist in environment like breadcrumbs
*   Can be consumed by Dots to alter Need Meters
*   Create emergent meaning through color patterns
*   Interpretations can mutate over generations

## Waste System
### Dits (1x1 pixel waste)
**Properties:**
*   Color: Dull, organic tones (brown, gray, acidic yellow)
*   Decay Timer: Disappears after X seconds unless interacted with
*   Toxicity: Increases Fear when nearby
*   Trail Logic: Left behind as movement trails
**Emission Triggers:**
*   Movement
*   Fear meter spikes
*   Dat consumption (metabolic waste)
**Behavioral Impact:**
*   High Fear Dots → avoid Dit-heavy zones
*   High Curiosity Dots → may approach and analyze
*   Territory mapping through waste trails

## Evolution System
### Reproduction & Inheritance
**Trigger Conditions (All Must Be Met):**
*   Individual Readiness: Hunger and Fear both low, Curiosity high
*   Social Proximity: Another Dot within 10-pixel radius also in breeding state
*   Breeding State Recognition: Dots emit special Blue Dats when ready to reproduce
**Social Breeding Mechanics:**
*   Breeding State Detection: Dots in reproductive mood emit bright Blue Dats
*   Proximity Requirement: Must be near (5-15 pixels) another breeding-ready Dot
*   Social Synchronization: Breeding Dots tend to cluster and synchronize timing
*   Reproductive Isolation: Completely isolated Dots cannot reproduce (prevents runaway growth)
**Breeding Behavior:**
*   Dots actively seek other Blue Dat emitters when ready
*   May form temporary "breeding clusters"
*   Social Dots (high Curiosity) become reproductive hubs
*   Antisocial Dots (high Fear) struggle to find mates

### Advanced Evolution System - "From One to Many"
**Speciation Mechanics**
**Core Goal:** Enable natural divergence from single ancestor into distinct breeding populations
**RGB-Based Genetic System:** Each Dot's traits encoded in RGB values with granular rules:
*   Red Channel: Fear sensitivity, aggression, territorial behavior
*   Green Channel: Foraging efficiency, food preferences, metabolism
*   Blue Channel: Social bonding, reproduction triggers, curiosity patterns
**Species Formation Drivers:**
1.  **Color-Based Attraction**
    *   Dots preferentially approach similar-colored individuals
    *   Breeding compatibility decreases with color distance
    *   RGB similarity threshold for successful reproduction (default: within 30 RGB units)
    *   Creates natural reproductive isolation over generations
2.  **Specialized Dat Breeding Triggers**
    *   Each Dot lineage evolves preferred "aphrodisiac Dats"
    *   Some attracted to Red-heavy Dats (RGB: 200,50,50)
    *   Others to Blue-dominant Dats (RGB: 50,50,200)
    *   Creates species-specific breeding seasons and territories
3.  **RGB-Component Behavioral Rules** Dots can evolve granular responses:
    *   "If Red > 150, trigger Fear regardless of other colors"
    *   "If Blue < 100 AND Green > 180, increase Curiosity"
    *   "Only breed near Dats with Red:Green ratio > 2:1"
**Advanced Reproduction Evolution:**
*   **Phase 1: Asexual Reproduction (Early game)**
    *   Single Dot splits with mutation
    *   Color-based mate selection begins
*   **Phase 2: Mate-Seeking Behavior (Mid game)**
    *   Dots actively seek similar-colored partners
    *   Breeding requires two compatible individuals
    *   Children inherit blended RGB traits + mutations
*   **Phase 3: Sexual Reproduction (Late game)**
    *   Distinct male/female behavioral roles emerge
    *   Complex courtship behaviors around specific Dat colors
    *   Genetic crossover creates more dramatic mutations
**Emergent Speciation Outcomes**
**Predicted Species Examples:**
*   Red-Doms: High-aggression, territorial, fear-based survival
*   Green-Seekers: Efficient foragers, peaceful, food-focused
*   Blue-Bonders: Highly social, complex breeding rituals
*   Color-Blind Hybrids: Rare individuals who can cross-breed between species
*   RGB-Extremists: Pure-color populations (255,0,0) vs (0,255,0) vs (0,0,255)
**Reproductive Isolation Mechanisms:**
*   Geographic separation during world expansion
*   Temporal isolation (different breeding seasons)
*   Behavioral isolation (incompatible courtship rituals)
*   Genetic incompatibility (RGB distance thresholds)

## User Interface
### Dot Sheet (Diagnostic Panel)
Accessed by clicking on any Dot
**Sections:**
*   **Identity**
    *   Name/ID (auto-generated: Dot-0047)
    *   Generation number
    *   Color (RGB, modifiable)
    *   Parent link
*   **Traits**
    *   Movement Speed (0.0 - 1.0)
    *   Mutation Rate
    *   Size (future expansion)
*   **Needs (Live Meters)**
    *   Hunger: ███████░░ 0.7
    *   Fear: ███░░░░░░ 0.3
    *   Curiosity: ██████░░ 0.6
    *   Dominant Need highlighted
*   **Behavior Biases**
    *   Hunger Sensitivity: 0.6
    *   Fear Response: 0.4
    *   Curiosity Drive: 0.8
*   **Dat Preferences**
    *   Color interpretations (can mutate)
    *   Custom evolved meanings
*   **Optional Features**
    *   Toggle Autonomous/Manual Override
    *   Last Dit Emission timestamp
    *   Dit Sensitivity rating

## Technical Specifications
**Visual Style:** Pure pixel art, minimal aesthetic
**Grid System:** Blank canvas with pixel-perfect positioning
**Entity Sizes:**
*   Dots: 3x3 pixels
*   Dats: 1x3 pixels (vertical)
*   Dits: 1x1 pixels
**Core Values:**
*   Transparency of all systems
*   Real-time behavior observation
*   Emergent complexity from simple rules
*   Player as observer/architect, not controller

## Victory Conditions & Player Goals
### Victory Conditions & Player Goals
**Survival Milestones System**
**Core Philosophy:** Success is measured by civilization's endurance and diversification
**Primary Victory Conditions:**
*   🧬 **Lineage Survival**
    *   Bronze Achievement: Keep original Dot's lineage alive for 10 generations
    *   Silver Achievement: 25 generations of continuous ancestry
    *   Gold Achievement: 50 generations without lineage extinction
    *   Legendary: 100+ generations with multiple distinct species
*   👥 **Population Milestones**
    *   Growing Colony: Reach 25 simultaneous living Dots
    *   Thriving Society: Maintain 50+ Dots for 5+ minutes
    *   Mega-Civilization: Achieve 100+ Dots without collapse
    *   Species Master: Maintain 3+ distinct species simultaneously
*   🌈 **Speciation Achievements**
    *   First Split: Two populations that can no longer interbreed
    *   Trinity: Three distinct species coexisting
    *   Rainbow World: 5+ species with different color dominances
    *   Evolution Master: Sexual reproduction emerges naturally
    *   Hybrid Discovery: Cross-species breeding creates new lineage
*   🌍 **Expansion Survival**
    *   Pioneer Spirit: Survive 5 world expansion cycles
    *   Colonial Success: Different species establish in different regions
    *   Expansion Expert: Survive 20+ expansion cycles with species diversity
    *   Master Architect: Guide multiple species through 50+ expansions
**Tracking System:**
*   Lineage Tree: Visual family tree showing generational connections
*   Statistics Panel: Live counters for current goals
*   Achievement Notifications: Celebrate milestones as they happen
*   Historical Records: Track peak populations, longest lineages, expansion records
**Failure States:**
*   Extinction Event: All Dots die (restart required)
*   Lineage Break: Original ancestry line dies out (partial failure)
*   Population Collapse: Fewer than 5 Dots remaining (warning state)
**Meta-Goal Philosophy**
Success isn't about control—it's about creating conditions where life perseveres. Players become gardeners of digital evolution, succeeding when their systems prove robust enough to survive the chaos of emergence.

"Dots don't think—they want. And from wanting, civilizations emerge."
