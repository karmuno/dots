import Component from '../Core/Component.js';

/**
 * @class EnergyComponent
 * @extends Component
 * @description Represents the energy level of an entity and its natural decay rate.
 */
export default class EnergyComponent extends Component {
  /**
   * @constructor
   * @param {object} [options={}] - Optional initial values for energy.
   * @param {number} [options.initialEnergy=100] - Initial energy level.
   * @param {number} [options.maxEnergy=100] - Maximum energy level.
   * @param {number} [options.naturalDecayRate=1] - Rate at which energy decays per second.
   */
  constructor(options = {}) {
    super('EnergyComponent'); // Component type name

    this.maxEnergy = options.maxEnergy !== undefined ? options.maxEnergy : 100;
    this.currentEnergy = options.initialEnergy !== undefined ? options.initialEnergy : this.maxEnergy;
    this.naturalDecayRate = options.naturalDecayRate !== undefined ? options.naturalDecayRate : 1;

    // Ensure initial energy is within bounds
    this.currentEnergy = Math.max(0, Math.min(this.currentEnergy, this.maxEnergy));
  }

  /**
   * Gets the current energy level.
   * @returns {number} The current energy.
   */
  getEnergy() {
    return this.currentEnergy;
  }

  /**
   * Increases energy by a given amount, up to maxEnergy.
   * @param {number} amount - The amount to increase energy by.
   */
  increaseEnergy(amount) {
    if (amount < 0) {
      console.warn('EnergyComponent: Amount to increase should be positive.');
      return;
    }
    this.currentEnergy = Math.min(this.currentEnergy + amount, this.maxEnergy);
  }

  /**
   * Decreases energy by a given amount, down to 0.
   * @param {number} amount - The amount to decrease energy by.
   */
  decreaseEnergy(amount) {
    if (amount < 0) {
      console.warn('EnergyComponent: Amount to decrease should be positive.');
      return;
    }
    this.currentEnergy = Math.max(this.currentEnergy - amount, 0);
  }

  /**
   * Sets the energy to a specific value, clamped between 0 and maxEnergy.
   * @param {number} value - The value to set energy to.
   */
  setEnergy(value) {
    this.currentEnergy = Math.max(0, Math.min(value, this.maxEnergy));
  }

  /**
   * Gets the natural decay rate.
   * @returns {number} The natural decay rate per second.
   */
  getDecayRate() {
    return this.naturalDecayRate;
  }

  /**
   * Sets the natural decay rate.
   * @param {number} rate - The new natural decay rate per second.
   */
  setDecayRate(rate) {
    if (rate < 0) {
      console.warn('EnergyComponent: Decay rate cannot be negative.');
      this.naturalDecayRate = 0;
    } else {
      this.naturalDecayRate = rate;
    }
  }
}
