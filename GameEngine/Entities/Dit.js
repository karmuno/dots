import Entity from '../Core/Entity.js';
import Transform from '../Components/Transform.js';
import Appearance from '../Components/Appearance.js';
import DrawLayer from '../Components/DrawLayer.js';
import NutrientComponent from '../Components/NutrientComponent.js'; // Import NutrientComponent
import ColliderComponent from '../Components/ColliderComponent.js'; // Import ColliderComponent for Dits

// Helper to convert RGB to hex
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

class Dit extends Entity {
  /**
   * @constructor
   * @param {string} id - The unique identifier for the entity.
   * @param {number} x - The initial x-coordinate.
   * @param {number} y - The initial y-coordinate.
   * @param {object} [nutrientOptions={}] - Options for NutrientComponent.
   * @param {number} [nutrientOptions.red=100] - Initial red nutrient content.
   * @param {number} [nutrientOptions.green=100] - Initial green nutrient content.
   * @param {number} [nutrientOptions.blue=100] - Initial blue nutrient content.
   * @param {object} [appearanceOptions={}] - Options for AppearanceComponent.
   * @param {string} [appearanceOptions.shape='sprite'] - Shape of the Dit.
   * @param {object} [appearanceOptions.spriteSize={ width: 1, height: 1 }] - Size of the sprite if shape is 'sprite'.
   */
  constructor(id, x, y, nutrientOptions = {}, appearanceOptions = {}) {
    super(id); // Pass id to Entity constructor

    // Default nutrient values if not provided
    const r = nutrientOptions.red !== undefined ? nutrientOptions.red : 100;
    const g = nutrientOptions.green !== undefined ? nutrientOptions.green : 100;
    const b = nutrientOptions.blue !== undefined ? nutrientOptions.blue : 100;

    this.addComponent(new Transform(x, y));
    
    // Add NutrientComponent
    const nutrientComp = new NutrientComponent({ red: r, green: g, blue: b });
    this.addComponent(nutrientComp);

    // Set Appearance based on NutrientComponent's color
    const ditColor = rgbToHex(nutrientComp.getRed(), nutrientComp.getGreen(), nutrientComp.getBlue());
    this.addComponent(new Appearance({
      color: ditColor,
      shape: appearanceOptions.shape || 'sprite',
      spriteSize: appearanceOptions.spriteSize || { width: 1, height: 1 }
    }));

    // Add DrawLayer Component (layer 1 - same level as Dots by default)
    this.addComponent(new DrawLayer(appearanceOptions.drawLayer === undefined ? 1 : appearanceOptions.drawLayer));

    // Add ColliderComponent for Dits to be detected by EatingSystem/CollisionSystem
    // Dits are typically small, so a small collider is appropriate.
    this.addComponent(new ColliderComponent({
        type: 'rectangle', // Or 'circle' depending on desired shape
        width: appearanceOptions.spriteSize ? appearanceOptions.spriteSize.width : 1,
        height: appearanceOptions.spriteSize ? appearanceOptions.spriteSize.height : 1,
    }));
  }

  // Optional: Add a method to update color if nutrients change during runtime (e.g., for waste dits)
  updateAppearanceColor() {
    const nutrientComp = this.getComponent('NutrientComponent');
    const appearanceComp = this.getComponent('Appearance');
    if (nutrientComp && appearanceComp) {
      const newColor = rgbToHex(nutrientComp.getRed(), nutrientComp.getGreen(), nutrientComp.getBlue());
      appearanceComp.setColor(newColor);
    }
  }
}

export default Dit;
