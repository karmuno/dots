import MetabolizerComponent from '../Components/MetabolizerComponent.js';
import EnergyComponent from '../Components/EnergyComponent.js';

class MetabolismSystem {
  constructor(world) {
    this.world = world;
  }

  update(deltaTime) {
    if (!this.world || !this.world.entities) {
      // Optional: log a warning if entities are not available, or handle as appropriate.
      // console.warn('MetabolismSystem: World or entities not available for update.');
      return;
    }
    for (const entity of Object.values(this.world.entities)) {
      const metabolizer = entity.getComponent('MetabolizerComponent');
      const energyComponent = entity.getComponent('EnergyComponent');

      if (metabolizer && energyComponent) {
        const metabolicRate = metabolizer.getMetabolicRate();
        let currentEnergy = energyComponent.getEnergy();
        currentEnergy -= metabolicRate * deltaTime;
        energyComponent.setEnergy(currentEnergy);
      }
    }
  }
}

export default MetabolismSystem;
