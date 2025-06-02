import Entity from '../Core/Entity.js';
import RadiusComponent from '../Components/RadiusComponent.js';
import ColliderComponent from '../Components/ColliderComponent.js';
import GrowComponent from '../Components/GrowComponent.js';

class BoundaryEntity extends Entity {
  constructor(initialRadius = 500, growthRate = 20, growthInterval = 1000) {
    super();

    this.addComponent(new RadiusComponent(initialRadius));
    this.addComponent(new ColliderComponent());
    this.addComponent(new GrowComponent(growthRate, growthInterval));
  }
}

export default BoundaryEntity;
