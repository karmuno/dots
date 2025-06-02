# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dots is an evolution simulation sandbox where players observe and architect emergent behaviors from simple rules. The core philosophy is "watching simple rules evolve into complex behaviors" through a systems-based approach.

**Genre:** Evolution Sim / Social Sim / Systems Sandbox  
**Core Experience:** Player as systems architect and observer, not controller  
**Starting Point:** One 3x3 pixel Dot entity in an expanding world

## Architecture

### Entity-Component-System (ECS) Design
The game uses ECS architecture for maximum extensibility and emergent behavior support:

```
GameEngine/
├── Core/           # Base ECS framework
├── Entities/       # Game objects (Dot, Dat, Dit)
├── Components/     # Reusable behaviors (Movement, Appearance, etc.)
├── Systems/        # Update logic (Movement, Render, World, UI)
└── UI/            # Interface components
```

### Core Entity Types
- **Dots:** 3x3 pixel entities with RGB-based genetics, needs system (Hunger/Fear/Curiosity), and social behaviors
- **Dats:** 1x3 pixel pheromones for communication (Red=Danger, Green=Food, Blue=Social, White=Curiosity)  
- **Dits:** 1x1 pixel waste material that creates environmental pressure

### Key Systems
- **Needs-Driven Behavior:** Three internal meters (Hunger/Fear/Curiosity) drive all Dot actions
- **RGB Genetics:** Color channels encode behavioral traits and breeding compatibility
- **Social Reproduction:** Requires proximity and compatible genetics, creates natural speciation
- **Death System:** Both starvation and natural aging create evolutionary pressure

## Development Commands

This project currently has no build system or package manager configured. Based on the JavaScript architecture outlined in DOTS_MVP_PLAN.md, you would typically run:

```bash
# Development server (when implemented)
# npm run dev

# Testing (when implemented)  
# npm test

# Build (when implemented)
# npm run build
```

## Current State

The project is in early planning/design phase with:
- Complete game design document (DOTS_GDD.md)
- Detailed MVP plan and architecture (DOTS_MVP_PLAN.md)
- Basic file structure for ECS architecture
- Empty implementation files ready for development

## MVP Scope

The first iteration focuses on a single customizable Dot with:
- Random movement in expanding circular world
- RGB color customization UI
- Basic Dot Sheet info panel
- Foundation for all future game systems

## Key Design Principles

1. **Systemic Clarity from Minimalism:** Every mechanic is bare-bones but creates deep emergent behaviors
2. **Transparent Systems:** All behavior should be observable and understandable
3. **Evolution Through Constraint:** Death, reproduction requirements, and resource competition drive natural selection
4. **Player as Gardener:** Success comes from creating conditions where digital life perseveres, not direct control

## Future Expansion Path

1. Needs system implementation
2. Dat emission and consumption 
3. Social reproduction mechanics
4. Death and aging systems
5. Multiple Dots and speciation
6. Achievement/milestone system