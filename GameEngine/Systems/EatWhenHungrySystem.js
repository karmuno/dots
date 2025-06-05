import System from '../Core/System.js';
import EatWhenHungryComponent from '../Components/EatWhenHungryComponent.js';
import SensorComponent from '../Components/SensorComponent.js';
import AcceleratorComponent from '../Components/AcceleratorComponent.js';
import EnergyComponent from '../Components/EnergyComponent.js';
import Transform from '../Components/Transform.js';

/**
 * @class EatWhenHungrySystem
 * @description AI system that drives hungry Dots to seek nearby Dits.
 * @extends System
 */
export default class EatWhenHungrySystem extends System {
    constructor() {
        super();
    }

    /**
     * @method update
     * @description Process entities with EatWhenHungryComponent, SensorComponent, AcceleratorComponent, and EnergyComponent.
     * Check if Dot is hungry (energy below threshold).
     * Find nearest Dit from sensor detections.
     * Apply thrust toward nearest Dit.
     * Stop thrust when energy is sufficient or no Dits are found.
     * @param {World} world - The game world.
     * @param {number} deltaTime - The time elapsed since the last update.
     */
    update(world, deltaTime) {
        const entities = world.getEntitiesByComponents([
            EatWhenHungryComponent,
            SensorComponent,
            AcceleratorComponent,
            EnergyComponent,
            Transform
        ]);

        for (const entity of entities) {
            const eatWhenHungry = entity.getComponent(EatWhenHungryComponent);
            const sensor = entity.getComponent(SensorComponent);
            const accelerator = entity.getComponent(AcceleratorComponent);
            const energy = entity.getComponent(EnergyComponent);
            const transform = entity.getComponent(Transform);

            if (!eatWhenHungry.isActive) {
                accelerator.stopThrust();
                eatWhenHungry.clearTarget();
                continue;
            }

            const currentEnergy = energy.getEnergy();

            if (eatWhenHungry.isHungry(currentEnergy)) {
                const detectedEntities = sensor.getDetectedEntities();
                // Assuming Dits are entities of type 'Dit'
                const detectedDits = detectedEntities.filter(e => e.constructor.name === 'Dit' && e.hasComponent(Transform));

                if (detectedDits.length > 0) {
                    const nearestDit = this.findNearestEntity(transform.position, detectedDits);

                    if (nearestDit) {
                        const nearestDitTransform = nearestDit.getComponent(Transform);
                        const direction = this.calculateDirection(transform.position, nearestDitTransform.position);

                        accelerator.setThrust(direction.x, direction.y, accelerator.getThrustPower());
                        eatWhenHungry.setTarget(nearestDit);
                    } else {
                        // Should not happen if detectedDits is not empty and they all have Transform
                        accelerator.stopThrust();
                        eatWhenHungry.clearTarget();
                    }
                } else {
                    accelerator.stopThrust();
                    eatWhenHungry.clearTarget();
                }
            } else {
                // Not hungry, stop seeking behavior
                accelerator.stopThrust();
                eatWhenHungry.clearTarget();
            }
        }
    }

    /**
     * @method findNearestEntity
     * @description Finds the nearest entity from a list to a given position.
     * @param {object} position - The source position { x, y }.
     * @param {Entity[]} entities - An array of entities to search.
     * @returns {Entity|null} The nearest entity or null if the list is empty.
     */
    findNearestEntity(position, entities) {
        let nearest = null;
        let minDistanceSq = Infinity;

        for (const entity of entities) {
            if (!entity.hasComponent(Transform)) continue;
            const entityTransform = entity.getComponent(Transform);
            const entityPosition = entityTransform.position;
            const distanceSq = (position.x - entityPosition.x) ** 2 + (position.y - entityPosition.y) ** 2;

            if (distanceSq < minDistanceSq) {
                minDistanceSq = distanceSq;
                nearest = entity;
            }
        }
        return nearest;
    }

    /**
     * @method calculateDirection
     * @description Calculates the normalized direction vector from a source to a target position.
     * @param {object} sourcePosition - The source position { x, y }.
     * @param {object} targetPosition - The target position { x, y }.
     * @returns {object} A normalized direction vector { x, y }.
     */
    calculateDirection(sourcePosition, targetPosition) {
        const dx = targetPosition.x - sourcePosition.x;
        const dy = targetPosition.y - sourcePosition.y;
        const magnitude = Math.sqrt(dx * dx + dy * dy);

        if (magnitude === 0) {
            return { x: 0, y: 0 }; // Avoid division by zero if positions are the same
        }
        return { x: dx / magnitude, y: dy / magnitude };
    }
}
