import Entity from '../Core/Entity.js';
import Transform from '../Components/Transform.js';
import Movement from '../Components/Movement.js';
import Appearance from '../Components/Appearance.js';
import ColliderComponent from '../Components/ColliderComponent.js';
import DrawLayer from '../Components/DrawLayer.js';
import InspectableComponent from '../Components/InspectableComponent.js';
import EnergyComponent from '../Components/EnergyComponent.js';
import MetabolizerComponent from '../Components/MetabolizerComponent.js';
import AcceleratorComponent from '../Components/AcceleratorComponent.js';
import SensorComponent from '../Components/SensorComponent.js';
import EatWhenHungryComponent from '../Components/EatWhenHungryComponent.js';

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
   * @param {object} [energyOptions={}] - Options for EnergyComponent.
   * @param {object} [metabolizerOptions={}] - Options for MetabolizerComponent.
 * @param {boolean} [aiEnabled=false] - Whether AI components should be added.
 * @param {number} [sensorRange=50] - Range for the SensorComponent.
 * @param {number} [hungerThreshold=30] - Threshold for EatWhenHungryComponent.
 * @param {number} [thrustPower=25] - Power for AcceleratorComponent.
 * @param {number} [thrustEnergyCost=1] - Energy cost for AcceleratorComponent.
   */
  constructor(id, x, y, velocityX, velocityY, color,
              energyOptions = {}, metabolizerOptions = {},
              aiEnabled = false, sensorRange = 50, hungerThreshold = 30,
              thrustPower = 25, thrustEnergyCost = 1) {
    super(id);

    // Add Transform Component
    this.addComponent(new Transform(x, y));

    // Add Movement Component
    this.addComponent(new Movement(velocityX, velocityY));

    // Add Appearance Component
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    this.addComponent(new Appearance({
      color: color || randomColor,
      shape: 'sprite', // Assuming Dots are sprites
      spriteSize: { width: 3, height: 3 }, // Default Dot size
    }));

    // Add Collider Component
    this.addComponent(new ColliderComponent({
      type: 'rectangle', // Or 'circle'
      width: 3,  // Match spriteSize typically
      height: 3, // Match spriteSize typically
    }));

    // Add DrawLayer Component (layer 1 - on top of boundary)
    this.addComponent(new DrawLayer(1));

    // Add Inspectable Component
    this.addComponent(new InspectableComponent());

    // Add Energy Component
    this.addComponent(new EnergyComponent(energyOptions));

    // Add Metabolizer Component with potentially new defaults
    // The MetabolizerComponent constructor now handles its own defaults for the new properties.
    // We pass metabolizerOptions which might override these defaults.
    this.addComponent(new MetabolizerComponent(metabolizerOptions));

    // Optionally add AI components
    if (aiEnabled) {
      this.addComponent(new AcceleratorComponent(thrustPower, thrustEnergyCost));
      this.addComponent(new SensorComponent(sensorRange, ['Dit'])); // Dots look for Dits
      this.addComponent(new EatWhenHungryComponent(hungerThreshold));
    }
  }
}
