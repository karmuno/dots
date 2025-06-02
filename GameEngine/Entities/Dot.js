import Entity from '../Core/Entity.js';
import Transform from '../Components/Transform.js';
import Movement from '../Components/Movement.js';
import Appearance from '../Components/Appearance.js';
import ColliderComponent from '../Components/ColliderComponent.js';

/**
 * @class Dot
 * @extends Entity
 * @description Represents a dot entity in the game.
 */
export default class Dot extends Entity {
  /**
   * @constructor
   * @param {string} id - The unique identifier for the entity.
   * @param {number} x - The initial x-coordinate.
   * @param {number} y - The initial y-coordinate.
   * @param {number} velocityX - The initial velocity in the x-axis.
   * @param {number} velocityY - The initial velocity in the y-axis.
   * @param {string} [color] - The color of the dot. Defaults to a random color.
   */
  constructor(id, x, y, velocityX, velocityY, color) {
    super(id);

    // Add Transform Component
    this.addComponent(new Transform(x, y));

    // Add Movement Component
    this.addComponent(new Movement(velocityX, velocityY));

    // Add Appearance Component
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    this.addComponent(new Appearance({
      color: color || randomColor,
      shape: 'sprite',
      spriteSize: { width: 3, height: 3 },
    }));

    // Add Collider Component
    this.addComponent(new ColliderComponent({
      type: 'rectangle',
      width: 3,
      height: 3,
    }));
  }
}
