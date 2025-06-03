import EnergyComponent from '../Components/EnergyComponent.js';

/**
 * @class HungerSystem
 * @description Manages the natural decay of energy for entities with an EnergyComponent.
 */
export default class HungerSystem {
  /**
   * @constructor
   * @param {World} world - The game world.
   */
  constructor(world) {
    this.world = world;
  }

  /**
   * Updates the energy of all relevant entities based on their natural decay rate.
   * @param {number} deltaTime - The time elapsed since the last update, in seconds.
   */
  update(deltaTime) {
    if (!this.world || !this.world.entities) {
      console.warn("HungerSystem: World or entities not available.");
      return;
    }

    for (const entity of Object.values(this.world.entities)) {
      if (entity.hasComponent('EnergyComponent')) {
        const energyComponent = entity.getComponent('EnergyComponent');

        const decayAmount = energyComponent.getDecayRate() * deltaTime;

        if (decayAmount > 0) {
          energyComponent.decreaseEnergy(decayAmount);
        }

        // Optional: Log when an entity's energy reaches zero due to decay
        // if (energyComponent.getEnergy() === 0 && decayAmount > 0) {
        //   console.log(`HungerSystem: Entity ${entity.id} has depleted its energy.`);
        // }
      }
    }
  }
}
