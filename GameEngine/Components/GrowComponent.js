import Component from '../Core/Component.js';

class GrowComponent extends Component {
  constructor(growthRate = 10, interval = 1000) { // growthRate in units per interval, interval in milliseconds
    super();
    this.growthRate = growthRate;
    this.interval = interval;
    this.timeSinceLastGrowth = 0; // Tracks time accumulation for growth events
  }
}

export default GrowComponent;
