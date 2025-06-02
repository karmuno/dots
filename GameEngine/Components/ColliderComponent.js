import Component from '../Core/Component.js';

class ColliderComponent extends Component {
  constructor(config = {}) {
    super();
    this.type = config.type;
    console.log('ColliderComponent config:', config);

    if (this.type === 'rectangle') {
      this.width = config.width || 1;
      this.height = config.height || 1;
    } else if (this.type === 'circle') {
      this.radius = config.radius || 1;
    } else {
      // Default to a small rectangle if type is not specified or invalid
      this.type = 'rectangle';
      this.width = config.width || 1;
      this.height = config.height || 1;
      console.warn('ColliderComponent: Invalid or unspecified type. Defaulting to rectangle 1x1.');
    }
  }

  // Potential methods:
  // checkCollision(otherEntity) { ... }
  // onCollisionEnter(otherEntity) { ... }
  // onCollisionExit(otherEntity) { ... }
}

export default ColliderComponent;
