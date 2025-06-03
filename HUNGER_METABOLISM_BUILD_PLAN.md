# Hunger & Dit Metabolism - Simplified Build Plan

## Overview
Minimal implementation of hunger/energy mechanics with Dit consumption. Focus on core survival loop: energy decays → Dot gets hungry → Dot eats Dits → energy restored.

## Phase 1: Basic Hunger Integration

### 1.1 Integrate Existing HungerSystem
- [ ] **Add HungerSystem to main.js** - Include in game loop after MovementSystem
- [ ] **Verify energy decay works** - Confirm Dots lose energy over time
- [ ] **Add energy to DotSheet** - Display current energy as "Energy: 75/100"


## Phase 2: Dit Consumption

### 2.1 Dit Collection System
- [ ] **Create simple collision check** - When Dot touches Dit, consume it
- [ ] **Add to existing CollisionSystem** - Extend to handle Dot-Dit collisions
- [ ] **Remove Dit on consumption** - Delete Dit from world entities
- [ ] **Add energy on consumption** - Increase Dot energy by fixed amount (e.g., +10)

### 2.2 Consumption Mechanics
- [ ] **Implement Metabolizer component** - AS in DOTS_METABOLIZER_DESIGN
- [ ] **Set energy gain per Dit** - Each Dit restores 10 energy points
- [ ] **Add consumption limit** - Can't eat if already at max energy
- [ ] **Add visual feedback** - Brief flash when Dit is consumed

## Phase 3: Death from Starvation

### 3.1 Energy Depletion Death
- [ ] **Add death check to HungerSystem** - If energy = 0 for 5 seconds, Dot dies
- [ ] **Track zero-energy time** - Add timer to track how long at zero energy
- [ ] **Remove dead Dots** - Delete from world.entities and clear selection if needed
- [ ] **Spawn Dits on death** - Create 3-5 Dits at death location

## Testing Checklist
- [ ] **Energy decays over time** - Dots lose energy via HungerSystem
- [ ] **Dots can eat Dits** - Collision with Dit restores energy
- [ ] **Dits are removed when eaten** - No duplicate consumption
- [ ] **Energy display updates** - DotSheet shows current energy
- [ ] **Visual feedback works** - Opacity changes with energy level
- [ ] **Death from starvation** - Dots die after 5 seconds at zero energy
- [ ] **Death creates Dits** - Dead Dots spawn waste at death location

## Implementation Notes
- Use existing EnergyComponent and HungerSystem
- Extend CollisionSystem for Dot-Dit interactions
- Add energy display to existing DotSheet
- Modify RenderSystem for visual energy feedback
- Keep all mechanics simple and observable

This creates a basic survival loop where Dots must eat Dits to avoid starvation death, establishing the foundation for more complex energy-driven behaviors later.