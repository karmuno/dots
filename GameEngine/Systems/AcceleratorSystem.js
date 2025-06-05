import System from '../Core/System.js';
import AcceleratorComponent from '../Components/AcceleratorComponent.js';
import MovementComponent from '../Components/Movement.js'; // Corrected path
import EnergyComponent from '../Components/EnergyComponent.js';

/**
 * @class AcceleratorSystem
 * @description Apply thrust forces to entities with AcceleratorComponent.
 * @extends System
 */
export default class AcceleratorSystem extends System {
    constructor() {
        super();
    }

    /**
     * @method update
     * @description Process all entities with AcceleratorComponent and MovementComponent.
     * Apply thrust forces to entity velocity based on current thrust settings.
     * Consume energy from EnergyComponent based on thrust usage.
     * Update entity movement based on applied forces.
     * @param {World} world - The game world.
     * @param {number} deltaTime - The time elapsed since the last update.
     */
    update(world, deltaTime) {
        const entities = world.getEntitiesByComponents([AcceleratorComponent, MovementComponent]);

        for (const entity of entities) {
            const accelerator = entity.getComponent(AcceleratorComponent);
            const movement = entity.getComponent(MovementComponent);

            if (accelerator.isThrusting) {
                // Apply thrust to velocity
                movement.velocityX += accelerator.currentThrust.x * deltaTime;
                movement.velocityY += accelerator.currentThrust.y * deltaTime;

                // Consume energy if entity has EnergyComponent
                if (entity.hasComponent(EnergyComponent)) {
                    const energy = entity.getComponent(EnergyComponent);
                    const energyCost = accelerator.getEnergyCost() * deltaTime;
                    energy.decreaseEnergy(energyCost);

                    // If energy runs out, stop thrusting
                    if (energy.getEnergy() <= 0) {
                        accelerator.stopThrust();
                    }
                }
            }
        }
    }
}
