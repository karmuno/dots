import Entity from '../Core/Entity.js';
import RadiusComponent from '../Components/RadiusComponent.js';
import ColliderComponent from '../Components/ColliderComponent.js';
import GrowComponent from '../Components/GrowComponent.js';
import Transform from '../Components/Transform.js';
import Appearance from '../Components/Appearance.js';

class BoundaryEntity extends Entity {
  constructor(initialRadius = 500, growthRate = 20, growthInterval = 1000) {
    super();

    // Add Transform and Appearance components
    this.addComponent(new Transform(0, 0));
    this.addComponent(new Appearance({ shape: 'circle', color: '#CCCCCC' }));

    this.addComponent(new RadiusComponent(initialRadius));
    this.addComponent(new ColliderComponent());
    this.addComponent(new GrowComponent(growthRate, growthInterval));
  }
}

export default BoundaryEntity;
