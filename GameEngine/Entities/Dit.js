import Entity from '../Core/Entity.js';
import Transform from '../Components/Transform.js';
import Appearance from '../Components/Appearance.js';

class Dit extends Entity {
  constructor(id, x, y, color) {
    super();
    this.id = id;
    this.addComponent(new Transform(x, y));
    this.addComponent(new Appearance({ color, shape: 'sprite', spriteSize: { width: 1, height: 1 } }));
  }
}

export default Dit;
