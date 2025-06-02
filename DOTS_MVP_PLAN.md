# Dots MVP - Build Plan & Architecture

## "Single Dot Explorer" - Vertical Slice Prototype

## MVP Scope Definition

**Core Goal:** One customizable Dot moving randomly in an expanding world
**User Experience:** Click to customize Dot color, watch it explore, observe basic behaviors
**Technical Goal:** Establish architecture for all future game systems

**What's IN the MVP:**
- ✅ Single 3x3 pixel Dot entity
- ✅ Random movement system
- ✅ RGB color customization UI
- ✅ Expanding circular world boundary
- ✅ Basic Dot Sheet (info panel)
- ✅ Clean pixel-art rendering
- ✅ Extensible system architecture

**What's OUT (Next Iterations):**
- ❌ Multiple Dots
- ❌ Needs system (Hunger/Fear/Curiosity)
- ❌ Dats & Dits
- ❌ Reproduction & Death
- ❌ Achievement system

## Technical Architecture

### Core System Design (Future-Proof)

```
GameEngine/
├── Core/
│   ├── Entity.js          // Base class for all game objects
│   ├── Component.js       // Component system for behaviors
│   ├── World.js           // World state and boundaries
│   └── GameLoop.js        // Main update/render loop
├── Entities/
│   ├── Dot.js             // Dot-specific logic
│   ├── Dat.js             // (Future) Pheromone entities
│   └── Dit.js             // (Future) Waste entities  
├── Components/
│   ├── Transform.js       // Position, rotation
│   ├── Movement.js        // Movement behaviors
│   ├── Appearance.js      // Color, visual properties
│   ├── Needs.js           // (Future) Hunger/Fear/Curiosity
│   └── Genetics.js        // (Future) RGB-based traits
├── Systems/
│   ├── MovementSystem.js  // Handles all movement logic
│   ├── RenderSystem.js    // Drawing and visual updates
│   ├── WorldSystem.js     // World expansion, boundaries
│   └── UISystem.js        // Interface management
└── UI/
    ├── DotSheet.js        // Dot information panel
    ├── ColorPicker.js     // RGB customization
    └── WorldView.js       // Main game canvas
```

### Entity-Component-System (ECS) Architecture

**Why ECS?** Perfect for emergent behavior - easily add/remove behaviors without changing core entities

**Example Dot Structure:**
```javascript
dot = {
  id: "dot-001",
  components: {
    transform: { x: 250, y: 250, rotation: 0 },
    movement: { speed: 1.0, direction: Math.random() * 2 * Math.PI },
    appearance: { r: 255, g: 100, b: 50, size: 3 },
    // Future: needs: { hunger: 0.5, fear: 0.2, curiosity: 0.8 }
  }
}
```

## Implementation Plan - Week by Week

### Week 1: Foundation (Days 1-2)

**Day 1: Core Architecture**
- Set up ECS framework
- Create Entity base class
- Implement Component system
- Basic GameLoop with update/render cycle

**Day 2: World & Rendering**
- World class with expanding boundary
- Canvas rendering system
- Pixel-perfect drawing utilities
- Basic camera/viewport setup

### Week 2: Dot Entity (Days 3-4)

**Day 3: Dot Creation**
- Dot entity with Transform, Movement, Appearance components
- Random movement algorithm
- Boundary collision detection
- 3x3 pixel sprite rendering

**Day 4: Movement Polish**
- Smooth movement interpolation
- Direction change algorithms
- Speed variation testing
- Visual debugging tools

### Week 3: User Interface (Days 5-6)

**Day 5: Color Customization**
- RGB color picker component
- Real-time Dot color updates
- Color validation and limits
- UI styling and layout

**Day 6: Dot Sheet Panel**
- Click-to-inspect Dot functionality
- Information display (ID, color, position, speed)
- Real-time stat updates
- Expandable panel design for future features

### Week 4: Polish & Testing (Day 7)

**Day 7: MVP Completion**
- Performance optimization
- Visual polish and effects
- Bug fixing and edge cases
- User testing and feedback collection

## MVP Feature Specifications

### 1. Single Dot Entity
```javascript
// Dot Specifications
size: 3x3 pixels
initialPosition: center of world (250, 250)
movement: random walk algorithm
speed: 0.5-2.0 pixels per frame (adjustable)
collision: bounces off world boundary
visual: solid color squares with 1px black border
```

### 2. Random Movement Algorithm
```javascript
// Movement Logic (per frame)
1. Continue current direction for 30-120 frames
2. Random chance (5%) to change direction each frame  
3. When changing: new direction = random angle 0-360°
4. Boundary collision: reflect angle off wall
5. Speed variation: ±20% of base speed randomly
```

### 3. World System
```javascript
// Expanding World
startRadius: 100 pixels
expansionRate: 1 pixel per 5 seconds
maxRadius: 500 pixels (for MVP)
boundaryVisual: subtle gray circle outline
centerPoint: (250, 250) - canvas center
```

### 4. Color Customization UI
```javascript
// RGB Controls
redSlider: 0-255 range
greenSlider: 0-255 range  
blueSlider: 0-255 range
colorPreview: live preview square
applyButton: updates Dot color immediately
presets: 8 preset colors for quick selection
```

### 5. Dot Sheet Panel
```javascript
// Information Display
dotID: "Dot-001"
position: "X: 245, Y: 267"
color: "RGB(255, 100, 50)"
speed: "1.2 px/frame"
age: "34 seconds"
worldRadius: "156 pixels"
// Future expansion slots ready
```

## Technical Implementation Details

### Canvas Setup
```javascript
canvas: 500x500 pixels
pixelRatio: 1 (crisp pixel art)
rendering: 2D context, no antialiasing
backgroundColor: #f0f0f0 (light gray)
updateRate: 60 FPS
```

### Performance Targets
- 60 FPS consistent frame rate
- <10ms update cycle time
- Scalable to 100+ entities (future)
- Memory usage <50MB
- Responsive UI interactions

### Extensibility Hooks
```javascript
// Ready for expansion
ComponentRegistry.register('needs', NeedsComponent);
SystemManager.add(new ReproductionSystem());
EntityFactory.createDat(position, color);
EventBus.emit('dotReproduced', { parent, child });
```

## Development Tools & Testing

### Debugging Features
- Console logging for all entity updates
- Visual position/velocity vectors
- Frame rate monitor
- Boundary visualization toggle
- Movement path trails

### Testing Plan
- Unit tests for movement algorithms
- Integration tests for UI interactions
- Performance benchmarks
- Cross-browser compatibility
- Mobile responsiveness testing

## Success Metrics for MVP

### Technical Success
- ✅ Stable 60 FPS performance
- ✅ Smooth Dot movement and boundary collision
- ✅ Responsive color customization
- ✅ Clean, expandable codebase architecture

### User Experience Success
- ✅ Intuitive color picker interface
- ✅ Satisfying Dot movement patterns
- ✅ Clear information display in Dot Sheet
- ✅ "I want to see what happens next" feeling

### Architecture Success
- ✅ Easy to add new Component types
- ✅ Simple to create additional entity types
- ✅ Clean separation between systems
- ✅ Ready for needs/reproduction/death systems

## Next Steps After MVP
- Iteration 2: Add Needs system (Hunger/Fear/Curiosity)
- Iteration 3: Implement Dat emission and consumption
- Iteration 4: Add social reproduction mechanics
- Iteration 5: Introduce death and aging
- Iteration 6: Multiple Dots and speciation

_"Build the foundation right, and evolution will surprise you."_
