import Component from '../Core/Component.js';

class RadiusComponent extends Component {
  constructor(initialRadius = 100) {
    super();
    this.radius = initialRadius;
  }

  increaseRadius(amount) {
    if (amount > 0) {
      this.radius += amount;
    }
  }
}

export default RadiusComponent;
