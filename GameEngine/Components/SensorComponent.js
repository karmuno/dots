import Component from '../Core/Component.js';

/**
 * @class SensorComponent
 * @description Detects entities within a specified range.
 * @extends Component
 */
export default class SensorComponent extends Component {
    /**
     * @constructor
     * @param {number} range - Detection radius in world units.
     * @param {string[]} [filterTypes=[]] - Optional filter for entity types to detect (e.g., ['Dit']).
     */
    constructor(range, filterTypes = []) {
        super();
        this.range = range;
        this.filterTypes = filterTypes;
        this.detectedEntities = [];
    }

    /**
     * @method getRange
     * @description Get detection range.
     * @returns {number} Detection range.
     */
    getRange() {
        return this.range;
    }

    /**
     * @method setRange
     * @description Set detection range.
     * @param {number} range - The new detection range.
     */
    setRange(range) {
        this.range = range;
    }

    /**
     * @method getDetectedEntities
     * @description Get array of detected entities.
     * @returns {Entity[]} Array of detected entities.
     */
    getDetectedEntities() {
        return [...this.detectedEntities];
    }

    /**
     * @method clearDetections
     * @description Clear the detected entities list.
     */
    clearDetections() {
        this.detectedEntities = [];
    }

    /**
     * @method addDetectedEntity
     * @description Add entity to detection list.
     * @param {Entity} entity - The entity to add.
     */
    addDetectedEntity(entity) {
        if (entity && !this.detectedEntities.find(e => e.id === entity.id)) {
            this.detectedEntities.push(entity);
        }
    }

    /**
     * @method removeDetectedEntity
     * @description Remove entity from detection list by its ID.
     * @param {string} entityId - The ID of the entity to remove.
     */
    removeDetectedEntity(entityId) {
        this.detectedEntities = this.detectedEntities.filter(e => e.id !== entityId);
    }

    /**
     * @method setFilter
     * @description Set entity types to detect.
     * @param {string[]} types - Array of entity type names.
     */
    setFilter(types) {
        this.filterTypes = Array.isArray(types) ? types : [];
    }
}
