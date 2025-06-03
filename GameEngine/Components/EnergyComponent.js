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
   */
  constructor(options = {}) {
    super('EnergyComponent'); // Component type name

    this.maxEnergy = options.maxEnergy !== undefined ? options.maxEnergy : 100;
    this.currentEnergy = options.initialEnergy !== undefined ? options.initialEnergy : this.maxEnergy;

    // Debug constructor inputs
    if (isNaN(this.maxEnergy)) {
      console.error('EnergyComponent: maxEnergy is NaN in constructor', { options, maxEnergy: this.maxEnergy });
      console.trace();
      this.maxEnergy = 100; // fallback
    }
    if (isNaN(this.currentEnergy)) {
      console.error('EnergyComponent: currentEnergy is NaN in constructor', { options, currentEnergy: this.currentEnergy, maxEnergy: this.maxEnergy });
      console.trace();
      this.currentEnergy = this.maxEnergy; // fallback
    }

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
    if (isNaN(amount)) {
      console.error('EnergyComponent: increaseEnergy called with NaN amount:', amount);
      console.trace();
      return;
    }
    const newEnergy = Math.min(this.currentEnergy + amount, this.maxEnergy);
    if (isNaN(newEnergy)) {
      console.error('EnergyComponent: increaseEnergy resulted in NaN. currentEnergy:', this.currentEnergy, 'amount:', amount);
      console.trace();
      return;
    }
    this.currentEnergy = newEnergy;
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
    if (isNaN(amount)) {
      console.error('EnergyComponent: decreaseEnergy called with NaN amount:', amount);
      console.trace();
      return;
    }
    const newEnergy = Math.max(this.currentEnergy - amount, 0);
    if (isNaN(newEnergy)) {
      console.error('EnergyComponent: decreaseEnergy resulted in NaN. currentEnergy:', this.currentEnergy, 'amount:', amount);
      console.trace();
      return;
    }
    this.currentEnergy = newEnergy;
  }

  /**
   * Sets the energy to a specific value, clamped between 0 and maxEnergy.
   * @param {number} value - The value to set energy to.
   */
  setEnergy(value) {
    if (isNaN(value)) {
      console.error('EnergyComponent: setEnergy called with NaN value:', value);
      console.trace();
      return;
    }
    this.currentEnergy = Math.max(0, Math.min(value, this.maxEnergy));
  }
}
