import Component from '../Core/Component.js';

class MetabolizerComponent extends Component {
  constructor(options = {}) {
    super('MetabolizerComponent');

    const initialRate = options.metabolicRate !== undefined ? options.metabolicRate : 1;
    const initialEfficiency = options.efficiency !== undefined ? options.efficiency : 0.7;

    if (typeof initialRate !== 'number' || isNaN(initialRate)) {
      throw new Error('Metabolic rate must be a number.');
    }
    if (initialRate < 0) {
      throw new Error('Metabolic rate must be non-negative.');
    }
    this.metabolicRate = initialRate;

    if (typeof initialEfficiency !== 'number' || isNaN(initialEfficiency)) {
      throw new Error('Efficiency must be a number.');
    }
    if (initialEfficiency < 0 || initialEfficiency > 1) {
      throw new Error('Efficiency must be between 0 and 1.');
    }
    this.efficiency = initialEfficiency;
  }

  getMetabolicRate() {
    return this.metabolicRate;
  }

  setMetabolicRate(rate) {
    if (typeof rate !== 'number' || isNaN(rate)) {
      throw new Error('Metabolic rate must be a number.');
    }
    if (rate < 0) {
      throw new Error('Metabolic rate must be non-negative.');
    }
    this.metabolicRate = rate;
  }

  getEfficiency() {
    return this.efficiency;
  }

  setEfficiency(efficiency) {
    if (typeof efficiency !== 'number' || isNaN(efficiency)) {
      throw new Error('Efficiency must be a number.');
    }
    if (efficiency < 0 || efficiency > 1) {
      throw new Error('Efficiency must be between 0 and 1.');
    }
    this.efficiency = efficiency;
  }
}

export default MetabolizerComponent;
