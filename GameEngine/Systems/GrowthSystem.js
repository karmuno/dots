import RadiusComponent from '../Components/RadiusComponent.js';
import GrowComponent from '../Components/GrowComponent.js';

class GrowthSystem {
  constructor() {
    // System-specific initialization, if any
  }

  update(world, dt) {
    // dt is delta time in seconds, convert to milliseconds for interval checking
    const dtMs = dt * 1000;

    for (const entityId in world.entities) {
      const entity = world.entities[entityId];

      if (entity.hasComponent('GrowComponent') && entity.hasComponent('RadiusComponent')) {
        const growComponent = entity.getComponent('GrowComponent');
        const radiusComponent = entity.getComponent('RadiusComponent');

        growComponent.timeSinceLastGrowth += dtMs;

        if (growComponent.timeSinceLastGrowth >= growComponent.interval) {
          const growthCycles = Math.floor(growComponent.timeSinceLastGrowth / growComponent.interval);
          const amountToGrow = growComponent.growthRate * growthCycles;
          radiusComponent.increaseRadius(amountToGrow);
          growComponent.timeSinceLastGrowth -= growComponent.interval * growthCycles; // Reset timer, carrying over excess time
        }
      }
    }
  }
}

export default GrowthSystem;
