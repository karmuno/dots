# Dots Metabolizer Design

## Overview
Dots metabolize Dits through a sophisticated nutrient absorption system where Dits contain RGB nutrients and Dots have metabolic preferences that determine what they can extract and how efficiently.

## Component Architecture

### NutrientComponent (for Dits)
Stores the nutritional content of a Dit as RGB values:
- `red`: Red nutrient content (0-255)
- `green`: Green nutrient content (0-255) 
- `blue`: Blue nutrient content (0-255)

### MetabolizerComponent (for Dots)
Manages a Dot's ability to process nutrients from Dits:
- `maxRedAbsorption`: Maximum red nutrients this Dot can extract from a single Dit
- `maxGreenAbsorption`: Maximum green nutrients this Dot can extract from a single Dit
- `maxBlueAbsorption`: Maximum blue nutrients this Dot can extract from a single Dit
- `absorptionRate`: Rate at which nutrients are converted to energy (nutrients per second)
- `currentRedStored`: Currently stored red nutrients being processed
- `currentGreenStored`: Currently stored green nutrients being processed  
- `currentBlueStored`: Currently stored blue nutrients being processed
- `maxStorage`: Maximum total nutrients that can be stored for processing

## Metabolism Process

### 1. Nutrient Collection (Collision Phase)
When an entity with a **MetabolizerComponent** (empty storage) crosses an entity with a **NutrientComponent**:

**Collision Detection**: 
- Check for entities with `MetabolizerComponent` AND `NutrientComponent` overlap
- Trigger only when metabolizer has available storage capacity
- Component-based detection rather than explicit Dot/Dit entity type checking

**Collection Process**:
1. **Check Storage Capacity**: If metabolizer is at max storage, collision is ignored
2. **Calculate Absorption**: For each RGB channel:
   - `absorbed = min(nutrient[channel], metabolizer.maxAbsorption[channel])`
3. **Extract Nutrients**: 
   - Add absorbed nutrients to metabolizer storage
   - Reduce nutrient entity's nutrients by absorbed amounts
4. **Create Waste**: 
   - If nutrient entity still has nutrients remaining, create new entity with remaining nutrients
   - Original nutrient entity is removed from world
   - New waste entity placed at same location

### 2. Energy Conversion (Processing Phase)
Handled by MetabolismSystem over time:

1. **Process Stored Nutrients**: Convert stored RGB nutrients to energy at `absorptionRate`
2. **Energy Calculation**: 
   - `energyGain = (red + green + blue) * conversionEfficiency`
   - Different RGB values may have different energy conversion rates
3. **Update Energy**: Add calculated energy to Dot's EnergyComponent
4. **Reduce Storage**: Decrease stored nutrients as they're converted

### 3. Waste Production
After metabolism, Dots produce waste Dits containing:
- Metabolic byproducts (low-value nutrients)
- Unprocessed nutrients that exceeded absorption capacity
- Visual indicator: Waste Dits appear darker/duller than original Dits

## Example Metabolism Scenario

### Initial State
- **Nutrient Entity**: RGB(150, 200, 100) nutrients
- **Metabolizer Entity**: Max absorption RGB(100, 150, 50), Rate: 10/sec, Empty storage

### Collection Phase
1. Metabolizer absorbs: RGB(100, 150, 50) 
2. Nutrient entity retains: RGB(50, 50, 50)
3. Waste entity created with RGB(50, 50, 50)
4. Original nutrient entity removed

### Processing Phase
1. Metabolizer stores: RGB(100, 150, 50) = 300 total nutrients
2. Energy conversion: 300 nutrients � 30 energy (10% efficiency)
3. Processing time: 300 nutrients � 10/sec = 30 seconds

## Visual Feedback
- **Dots**: Slight color tint based on currently stored nutrients
- **Dits**: Color intensity reflects nutrient content
- **Waste Dits**: Duller appearance, smaller size
- **Processing**: Subtle pulsing effect during active metabolism

## Genetic Inheritance
RGB-based genetics influence metabolizer traits:
- **Red Channel**: Affects red nutrient absorption capacity
- **Green Channel**: Affects green nutrient absorption capacity  
- **Blue Channel**: Affects blue nutrient absorption capacity
- **Overall Color**: Influences absorption rate and storage capacity

This system creates complex emergent behaviors where Dots evolve specialized diets and feeding strategies based on their genetic metabolic capabilities.