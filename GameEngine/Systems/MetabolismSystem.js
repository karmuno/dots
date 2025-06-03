import MetabolizerComponent from '../Components/MetabolizerComponent.js';
import EnergyComponent from '../Components/EnergyComponent.js';

class MetabolismSystem {
  constructor(world) {
    this.world = world;
  }

  update(deltaTime) {
    if (!this.world || !this.world.entities) {
      return;
    }

    for (const entity of Object.values(this.world.entities)) {
      if (!entity.hasComponent('MetabolizerComponent') || !entity.hasComponent('EnergyComponent')) {
        continue;
      }

      const metabolizer = entity.getComponent('MetabolizerComponent');
      const energyComponent = entity.getComponent('EnergyComponent');

      // 1. Passive Energy Decay (if still applicable from original MetabolizerComponent.metabolicRate)
      // The design doc focuses on energy *gain* from nutrients.
      // If passive decay is still desired, it can be handled here.
      // For now, let's assume metabolizer.metabolicRate is for passive decay as per its original name.
      const passiveDecayRate = metabolizer.getMetabolicRate(); // Original 'metabolicRate'
      if (passiveDecayRate > 0) {
        energyComponent.decreaseEnergy(passiveDecayRate * deltaTime);
      }

      // 2. Nutrient Conversion to Energy
      const conversionRate = metabolizer.getNutrientConversionRate(); // Nutrients per second
      const efficiency = metabolizer.getEfficiency();

      let nutrientsToProcessThisTick = conversionRate * deltaTime;

      const storedRed = metabolizer.getCurrentRedStored();
      const storedGreen = metabolizer.getCurrentGreenStored();
      const storedBlue = metabolizer.getCurrentBlueStored();
      const totalStored = storedRed + storedGreen + storedBlue;

      if (totalStored <= 0 || nutrientsToProcessThisTick <= 0) {
        continue; // No nutrients to process or no time passed
      }

      // Determine how much of each nutrient to process proportionally
      // if attempting to process more than available.
      let processFactor = 1;
      if (nutrientsToProcessThisTick > totalStored) {
        processFactor = totalStored / nutrientsToProcessThisTick; // Scale down processing to what's available
        nutrientsToProcessThisTick = totalStored; // Process all available nutrients
      }

      const redToProcess = Math.min(storedRed, storedRed / totalStored * nutrientsToProcessThisTick) || 0;
      const greenToProcess = Math.min(storedGreen, storedGreen / totalStored * nutrientsToProcessThisTick) || 0;
      const blueToProcess = Math.min(storedBlue, storedBlue / totalStored * nutrientsToProcessThisTick) || 0;

      // Ensure we don't process more than available due to floating point issues
      // And also, that we consume specified amounts from the component
      const {redConsumed, greenConsumed, blueConsumed} = metabolizer.consumeNutrients(redToProcess, greenToProcess, blueToProcess);

      const totalNutrientsProcessed = redConsumed + greenConsumed + blueConsumed;

      if (totalNutrientsProcessed > 0) {
        const energyGained = totalNutrientsProcessed * efficiency;
        energyComponent.increaseEnergy(energyGained);

        // console.log(`Entity ${entity.id} processed ${totalNutrientsProcessed.toFixed(2)} nutrients for ${energyGained.toFixed(2)} energy. Stored: R${metabolizer.getCurrentRedStored()} G${metabolizer.getCurrentGreenStored()} B${metabolizer.getCurrentBlueStored()}`);
      }
    }
  }
}

export default MetabolismSystem;
