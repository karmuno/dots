import Component from '../Core/Component.js';

/**
 * @class AcceleratorComponent
 * @description Provides directional thrust capability to entities.
 * @extends Component
 */
export default class AcceleratorComponent extends Component {
    /**
     * @constructor
     * @param {number} thrustPower - Maximum thrust force that can be applied.
     * @param {number} energyCost - Energy cost per second when thrusting (default: 1).
     */
    constructor(thrustPower, energyCost = 1) {
        super();
        this.thrustPower = thrustPower;
        this.energyCost = energyCost;
        this.currentThrust = { x: 0, y: 0 };
        this.isThrusting = false;
    }

    /**
     * @method setThrust
     * @description Set thrust direction and power.
     * @param {number} directionX - X component of the thrust direction.
     * @param {number} directionY - Y component of the thrust direction.
     * @param {number} power - Magnitude of the thrust (will be capped by thrustPower).
     */
    setThrust(directionX, directionY, power) {
        const normalizedPower = Math.min(Math.abs(power), this.thrustPower);
        const magnitude = Math.sqrt(directionX * directionX + directionY * directionY);

        if (magnitude > 0) {
            this.currentThrust.x = (directionX / magnitude) * normalizedPower;
            this.currentThrust.y = (directionY / magnitude) * normalizedPower;
        } else {
            this.currentThrust.x = 0;
            this.currentThrust.y = 0;
        }
        // isThrusting should be true only if there's actual thrust applied in a valid direction.
        // If magnitude is 0, no thrust can be applied even if power > 0.
        this.isThrusting = normalizedPower > 0 && magnitude > 0;
    }

    /**
     * @method stopThrust
     * @description Stop all thrust.
     */
    stopThrust() {
        this.currentThrust.x = 0;
        this.currentThrust.y = 0;
        this.isThrusting = false;
    }

    /**
     * @method getThrust
     * @description Get current thrust vector.
     * @returns {object} Current thrust vector { x, y }.
     */
    getThrust() {
        return { ...this.currentThrust };
    }

    /**
     * @method getThrustPower
     * @description Get maximum thrust power.
     * @returns {number} Maximum thrust power.
     */
    getThrustPower() {
        return this.thrustPower;
    }

    /**
     * @method getEnergyCost
     * @description Get energy cost per second.
     * @returns {number} Energy cost per second.
     */
    getEnergyCost() {
        return this.energyCost;
    }
}
