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
   * @param {number} targetX - The target x-coordinate for movement.
   * @param {number} targetY - The target y-coordinate for movement.
   * @param {number} speed - The maximum speed of the entity.
   * @param {number} acceleration - The acceleration rate of the entity.
   */
  constructor(velocityX = 0, velocityY = 0, targetX = 0, targetY = 0, speed = 100, acceleration = 200) {
    super();
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.speed = speed;
    this.acceleration = acceleration;
    this.currentSpeedX = velocityX;
    this.currentSpeedY = velocityY;
  }
}
