import Component from '../Core/Component.js';

class Transform extends Component {
  constructor(x = 0, y = 0) {
    super();
    this.position = { x, y };
  }
}

export default Transform;
