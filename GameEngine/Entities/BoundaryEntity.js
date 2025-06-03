import Entity from '../Core/Entity.js';
import RadiusComponent from '../Components/RadiusComponent.js';
import ColliderComponent from '../Components/ColliderComponent.js';
import Transform from '../Components/Transform.js';
import Appearance from '../Components/Appearance.js';
import DrawLayer from '../Components/DrawLayer.js';
import GrowComponent from '../Components/GrowComponent.js'; // Import GrowComponent

class BoundaryEntity extends Entity {
  constructor(initialRadius = 100, growOptions = {}) {
    super(); // ID will be auto-generated as string

    // Default grow options
    const defaultGrowOptions = {
      growthRate: 20, // Default growthRate
      interval: 10000,  // Default interval in ms
      maxRadius: 500    // Default max radius
    };
    const finalGrowOptions = { ...defaultGrowOptions, ...growOptions };

    // Add Transform and Appearance components
    this.addComponent(new Transform(0, 0));
    this.addComponent(new Appearance({ shape: 'circle', color: '#FFFFFF' }));

    this.addComponent(new RadiusComponent(initialRadius));
    this.addComponent(new ColliderComponent({ type: 'circle', radius: initialRadius, fill: false }));
    // Pass growthRate and interval directly as per GrowComponent's constructor
    this.addComponent(new GrowComponent(finalGrowOptions.growthRate, finalGrowOptions.interval));
    // Note: GrowComponent doesn't currently use maxRadius from its constructor.
    // If it needs to, its constructor and property assignment would need to be updated.
    
    // Add DrawLayer Component (layer 0 - below dots but above entities without DrawLayer)
    this.addComponent(new DrawLayer(0));
  }
}

export default BoundaryEntity;
