import System from '../Core/System.js';
import SensorComponent from '../Components/SensorComponent.js';
import Transform from '../Components/Transform.js'; // Assuming Transform component holds position

/**
 * @class SensorSystem
 * @description Update sensor detection lists for all entities with SensorComponent.
 * @extends System
 */
export default class SensorSystem extends System {
    constructor() {
        super();
    }

    /**
     * @method update
     * @description Scan all entities with SensorComponent.
     * For each sensor, detect entities within range.
     * Update detectedEntities list with current detections.
     * Apply entity type filters if specified.
     * @param {World} world - The game world.
     * @param {number} deltaTime - The time elapsed since the last update (not directly used but common for systems).
     */
    update(world, deltaTime) {
        const entitiesWithSensors = world.getEntitiesByComponents([SensorComponent, Transform]);
        const allEntities = world.getEntities(); // Assuming world.getEntities() returns all entities

        for (const entity of entitiesWithSensors) {
            const sensor = entity.getComponent(SensorComponent);
            const transform = entity.getComponent(Transform);
            const sensorPosition = transform.position;

            sensor.clearDetections();

            for (const otherEntity of allEntities) {
                if (entity.id === otherEntity.id) {
                    continue; // Don't detect self
                }

                if (!otherEntity.hasComponent(Transform)) {
                    continue; // Other entity must have a position
                }

                const otherTransform = otherEntity.getComponent(Transform);
                const otherPosition = otherTransform.position;

                const distanceSq = (sensorPosition.x - otherPosition.x) ** 2 +
                                 (sensorPosition.y - otherPosition.y) ** 2;

                const rangeSq = sensor.getRange() ** 2;

                if (distanceSq <= rangeSq) {
                    if (sensor.filterTypes.length === 0 || sensor.filterTypes.includes(otherEntity.constructor.name)) {
                        sensor.addDetectedEntity(otherEntity);
                    }
                }
            }
        }
    }
}
