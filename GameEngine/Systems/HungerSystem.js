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

    // Future: Implement logic for starvation effects, e.g., applying damage or other penalties
    // when an entity's energy (or a separate hunger component) is critically low for too long.
    // This system will no longer directly decrease energy as that is handled by MetabolismSystem.
    // for (const entity of Object.values(this.world.entities)) {
    //   // Example: Check for a HungerComponent or critically low EnergyComponent
    //   // if (entity.hasComponent('HungerComponent') && entity.getComponent('HungerComponent').isStarving()) {
    //   //   // Apply starvation effects
    //   // }
    // }
  }
}
