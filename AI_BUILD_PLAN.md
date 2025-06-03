# AI System Build Plan

## Overview
Implement basic AI for Dots using thrust-based movement toward food sources when hungry. This system introduces autonomous behavior where Dots can actively seek nutrition to maintain their energy levels.

## Components to Implement

### 1. AcceleratorComponent
**Purpose**: Provides directional thrust capability to entities
**Location**: `GameEngine/Components/AcceleratorComponent.js`

**Properties**:
- `thrustPower` (number): Maximum thrust force that can be applied
- `energyCost` (number): Energy cost per second when thrusting (default: 1)
- `currentThrust` (object): Current thrust vector `{ x: 0, y: 0 }`
- `isThrusting` (boolean): Whether thrust is currently being applied

**Methods**:
- `setThrust(directionX, directionY, power)`: Set thrust direction and power
- `stopThrust()`: Stop all thrust
- `getThrust()`: Get current thrust vector
- `getThrustPower()`: Get maximum thrust power
- `getEnergyCost()`: Get energy cost per second

### 2. SensorComponent
**Purpose**: Detects entities within a specified range
**Location**: `GameEngine/Components/SensorComponent.js`

**Properties**:
- `range` (number): Detection radius in world units
- `detectedEntities` (array): List of entities currently within range
- `filterTypes` (array): Optional filter for entity types to detect (e.g., ['Dit'])

**Methods**:
- `getRange()`: Get detection range
- `setRange(range)`: Set detection range
- `getDetectedEntities()`: Get array of detected entities
- `clearDetections()`: Clear the detected entities list
- `addDetectedEntity(entity)`: Add entity to detection list
- `removeDetectedEntity(entityId)`: Remove entity from detection list
- `setFilter(types)`: Set entity types to detect

### 3. EatWhenHungryComponent
**Purpose**: AI behavior component for seeking food when energy is low
**Location**: `GameEngine/Components/EatWhenHungryComponent.js`

**Properties**:
- `hungerThreshold` (number): Energy level below which Dot becomes "hungry"
- `isActive` (boolean): Whether this AI behavior is enabled
- `targetEntity` (object): Current target Dit being pursued (null if none)

**Methods**:
- `getHungerThreshold()`: Get hunger threshold
- `setHungerThreshold(threshold)`: Set hunger threshold
- `isHungry(currentEnergy)`: Check if current energy is below threshold
- `setActive(active)`: Enable/disable this AI behavior
- `setTarget(entity)`: Set current target entity
- `getTarget()`: Get current target entity
- `clearTarget()`: Clear current target

## Systems to Implement

### 1. AcceleratorSystem
**Purpose**: Apply thrust forces to entities with AcceleratorComponent
**Location**: `GameEngine/Systems/AcceleratorSystem.js`

**Functionality**:
- Process all entities with AcceleratorComponent and MovementComponent
- Apply thrust forces to entity velocity based on current thrust settings
- Consume energy from EnergyComponent based on thrust usage
- Update entity movement based on applied forces

**Update Logic**:
```javascript
for each entity with AcceleratorComponent and MovementComponent:
  if (accelerator.isThrusting):
    // Apply thrust to velocity
    movement.velocityX += accelerator.currentThrust.x * deltaTime
    movement.velocityY += accelerator.currentThrust.y * deltaTime
    
    // Consume energy if entity has EnergyComponent
    if (entity has EnergyComponent):
      energyCost = accelerator.energyCost * deltaTime
      energyComponent.decreaseEnergy(energyCost)
```

### 2. SensorSystem
**Purpose**: Update sensor detection lists for all entities with SensorComponent
**Location**: `GameEngine/Systems/SensorSystem.js`

**Functionality**:
- Scan all entities with SensorComponent
- For each sensor, detect entities within range
- Update detectedEntities list with current detections
- Apply entity type filters if specified

**Update Logic**:
```javascript
for each entity with SensorComponent and Transform:
  sensor.clearDetections()
  sensorPosition = entity.transform.position
  
  for each otherEntity in world:
    if (otherEntity != entity):
      distance = calculateDistance(sensorPosition, otherEntity.transform.position)
      if (distance <= sensor.range):
        if (sensor.filterTypes.length == 0 || sensor.filterTypes.includes(otherEntity.constructor.name)):
          sensor.addDetectedEntity(otherEntity)
```

### 3. EatWhenHungrySystem
**Purpose**: AI system that drives hungry Dots to seek nearby Dits
**Location**: `GameEngine/Systems/EatWhenHungrySystem.js`

**Functionality**:
- Process entities with EatWhenHungryComponent, SensorComponent, AcceleratorComponent, and EnergyComponent
- Check if Dot is hungry (energy below threshold)
- Find nearest Dit from sensor detections
- Apply thrust toward nearest Dit
- Stop thrust when energy is sufficient

**Update Logic**:
```javascript
for each entity with EatWhenHungryComponent, SensorComponent, AcceleratorComponent, EnergyComponent:
  currentEnergy = energyComponent.getEnergy()
  
  if (eatWhenHungry.isHungry(currentEnergy)):
    detectedDits = sensor.getDetectedEntities().filter(e => e.constructor.name === 'Dit')
    
    if (detectedDits.length > 0):
      nearestDit = findNearestEntity(entity.transform.position, detectedDits)
      direction = calculateDirection(entity.transform.position, nearestDit.transform.position)
      
      // Apply thrust toward nearest Dit
      accelerator.setThrust(direction.x, direction.y, accelerator.thrustPower)
      eatWhenHungry.setTarget(nearestDit)
    else:
      accelerator.stopThrust()
      eatWhenHungry.clearTarget()
  else:
    // Not hungry, stop seeking behavior
    accelerator.stopThrust()
    eatWhenHungry.clearTarget()
```

## Implementation Phases

### Phase 1: Core Components (1-2 hours)
1. Create AcceleratorComponent with basic thrust functionality
2. Create SensorComponent with range detection
3. Create EatWhenHungryComponent with hunger threshold logic
4. Add comprehensive tests for each component

### Phase 2: Systems Implementation (2-3 hours)
1. Implement AcceleratorSystem for thrust application and energy consumption
2. Implement SensorSystem for entity detection within range
3. Implement EatWhenHungrySystem for AI seeking behavior
4. Add systems to World's system collection in correct order

### Phase 3: Integration with Dots (1 hour)
1. Update Dot entity constructor to optionally include AI components
2. Add AI components to Dot creation in World.createDot()
3. Configure default values for AI behavior (hunger threshold, sensor range, thrust power)

### Phase 4: Testing and Refinement (1-2 hours)
1. Test AI behavior with multiple Dots and Dits
2. Tune parameters for realistic behavior (thrust power, energy costs, sensor range)
3. Verify energy consumption and AI decision-making
4. Add debugging logs for AI state visualization

## System Integration Order
Add systems to World in this order:
1. SensorSystem (detect entities first)
2. EatWhenHungrySystem (make AI decisions)
3. AcceleratorSystem (apply thrust forces)
4. MovementSystem (existing - apply velocities)
5. MetabolismSystem (existing - energy consumption)
6. EatingSystem (existing - consume Dits)
7. CollisionSystem (existing - handle collisions)

## Configuration Parameters
**Default AI Settings for Dots**:
- Sensor range: 50 world units
- Hunger threshold: 30 energy
- Thrust power: 25 units/second
- Thrust energy cost: 1 energy/second

## Expected Behavior
1. **Idle State**: Dots with sufficient energy (>30) move randomly as before
2. **Hungry State**: Dots with low energy (<30) actively seek nearest Dits
3. **Seeking**: Hungry Dots apply thrust toward detected Dits, consuming energy
4. **Energy Management**: Dots balance energy consumption from thrust vs. energy gain from eating
5. **Emergent Behavior**: Dots may compete for limited Dit resources, creating natural selection pressure

## Testing Scenarios
1. **Single Hungry Dot**: Verify thrust toward single nearby Dit
2. **Multiple Dits**: Verify selection of nearest Dit target
3. **Energy Depletion**: Test behavior when thrust cost exceeds energy available
4. **Competition**: Multiple Dots seeking same Dit resources
5. **Sensor Range**: Verify detection and targeting within specified range only

## Success Criteria
- Dots successfully detect Dits within sensor range
- Hungry Dots apply thrust toward nearest detected Dit
- Energy consumption from thrust is properly calculated
- AI behavior transitions smoothly between hungry/satisfied states
- System performance remains stable with multiple AI entities