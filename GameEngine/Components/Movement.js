import Component from '../Core/Component.js';

/**
 * @class Movement
 * @extends Component
 * @description Component that adds movement capabilities to an entity.
 */
export default class Movement extends Component {
  /**
   * @constructor
   * @param {number} velocityX - The initial velocity in the x-axis.
   * @param {number} velocityY - The initial velocity in the y-axis.
   */
  constructor(velocityX = 0, velocityY = 0) {
    super();
    this.velocityX = velocityX;
    this.velocityY = velocityY;
  }
}
