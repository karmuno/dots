import Component from '../Core/Component.js';

/**
 * @class EatWhenHungryComponent
 * @description AI behavior component for seeking food when energy is low.
 * @extends Component
 */
export default class EatWhenHungryComponent extends Component {
    /**
     * @constructor
     * @param {number} hungerThreshold - Energy level below which Dot becomes "hungry".
     */
    constructor(hungerThreshold) {
        super();
        this.hungerThreshold = hungerThreshold;
        this.isActive = true;
        this.targetEntity = null;
    }

    /**
     * @method getHungerThreshold
     * @description Get hunger threshold.
     * @returns {number} Hunger threshold.
     */
    getHungerThreshold() {
        return this.hungerThreshold;
    }

    /**
     * @method setHungerThreshold
     * @description Set hunger threshold.
     * @param {number} threshold - The new hunger threshold.
     */
    setHungerThreshold(threshold) {
        this.hungerThreshold = threshold;
    }

    /**
     * @method isHungry
     * @description Check if current energy is below threshold.
     * @param {number} currentEnergy - The current energy level of the entity.
     * @returns {boolean} True if hungry, false otherwise.
     */
    isHungry(currentEnergy) {
        return this.isActive && currentEnergy < this.hungerThreshold;
    }

    /**
     * @method setActive
     * @description Enable/disable this AI behavior.
     * @param {boolean} active - Whether the AI behavior should be active.
     */
    setActive(active) {
        this.isActive = active;
    }

    /**
     * @method setTarget
     * @description Set current target entity.
     * @param {Entity} entity - The target entity.
     */
    setTarget(entity) {
        this.targetEntity = entity;
    }

    /**
     * @method getTarget
     * @description Get current target entity.
     * @returns {Entity|null} The current target entity, or null if no target.
     */
    getTarget() {
        return this.targetEntity;
    }

    /**
     * @method clearTarget
     * @description Clear current target.
     */
    clearTarget() {
        this.targetEntity = null;
    }
}
