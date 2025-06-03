import Component from '../Core/Component.js';

/**
 * @class NutrientComponent
 * @extends Component
 * @description Stores the nutritional content of an entity as RGB values.
 */
class NutrientComponent extends Component {
  /**
   * @constructor
   * @param {object} [options={}] - Optional initial values for nutrients.
   * @param {number} [options.red=0] - Red nutrient content (0-255).
   * @param {number} [options.green=0] - Green nutrient content (0-255).
   * @param {number} [options.blue=0] - Blue nutrient content (0-255).
   */
  constructor(options = {}) {
    super('NutrientComponent');

    this.red = Math.max(0, Math.min(255, options.red || 0));
    this.green = Math.max(0, Math.min(255, options.green || 0));
    this.blue = Math.max(0, Math.min(255, options.blue || 0));
  }

  /**
   * Gets the red nutrient content.
   * @returns {number} The red nutrient value.
   */
  getRed() {
    return this.red;
  }

  /**
   * Sets the red nutrient content.
   * @param {number} value - The new red nutrient value (0-255).
   */
  setRed(value) {
    this.red = Math.max(0, Math.min(255, value));
  }

  /**
   * Gets the green nutrient content.
   * @returns {number} The green nutrient value.
   */
  getGreen() {
    return this.green;
  }

  /**
   * Sets the green nutrient content.
   * @param {number} value - The new green nutrient value (0-255).
   */
  setGreen(value) {
    this.green = Math.max(0, Math.min(255, value));
  }

  /**
   * Gets the blue nutrient content.
   * @returns {number} The blue nutrient value.
   */
  getBlue() {
    return this.blue;
  }

  /**
   * Sets the blue nutrient content.
   * @param {number} value - The new blue nutrient value (0-255).
   */
  setBlue(value) {
    this.blue = Math.max(0, Math.min(255, value));
  }

  /**
   * Gets the total nutrient value.
   * @returns {number} The sum of red, green, and blue nutrient values.
   */
  getTotalNutrients() {
    return this.red + this.green + this.blue;
  }

  /**
   * Sets all nutrient values.
   * @param {number} red - The new red nutrient value (0-255).
   * @param {number} green - The new green nutrient value (0-255).
   * @param {number} blue - The new blue nutrient value (0-255).
   */
  setNutrients(red, green, blue) {
    this.setRed(red);
    this.setGreen(green);
    this.setBlue(blue);
  }

  /**
   * Decreases nutrient values.
   * @param {number} redAmount - The amount to decrease red nutrient by.
   * @param {number} greenAmount - The amount to decrease green nutrient by.
   * @param {number} blueAmount - The amount to decrease blue nutrient by.
   */
  decreaseNutrients(redAmount, greenAmount, blueAmount) {
    this.setRed(this.red - redAmount);
    this.setGreen(this.green - greenAmount);
    this.setBlue(this.blue - blueAmount);
  }
}

export default NutrientComponent;
