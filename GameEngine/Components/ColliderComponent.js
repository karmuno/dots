import Component from '../Core/Component.js';

class ColliderComponent extends Component {
  constructor() {
    super();
    // Future properties related to collision shape, type, etc. can be added here.
    // For now, its existence on an entity signifies it can be part of collision checks.
  }

  // Potential methods:
  // checkCollision(otherEntity) { ... }
  // onCollisionEnter(otherEntity) { ... }
  // onCollisionExit(otherEntity) { ... }
}

export default ColliderComponent;
