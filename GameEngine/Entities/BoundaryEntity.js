import Entity from '../Core/Entity.js';
import RadiusComponent from '../Components/RadiusComponent.js';
import ColliderComponent from '../Components/ColliderComponent.js';
import Transform from '../Components/Transform.js';
import Appearance from '../Components/Appearance.js';
import DrawLayer from '../Components/DrawLayer.js';

class BoundaryEntity extends Entity {
  constructor(initialRadius = 100) {
    super(); // ID will be auto-generated as string

    // Add Transform and Appearance components
    this.addComponent(new Transform(0, 0));
    this.addComponent(new Appearance({ shape: 'circle', color: '#FFFFFF' }));

    this.addComponent(new RadiusComponent(initialRadius));
    this.addComponent(new ColliderComponent({ type: 'circle', radius: initialRadius, fill: false }));
    
    // Add DrawLayer Component (layer 0 - below dots but above entities without DrawLayer)
    this.addComponent(new DrawLayer(0));
  }
}

export default BoundaryEntity;
