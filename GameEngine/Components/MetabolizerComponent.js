import Component from '../Core/Component.js';

class MetabolizerComponent extends Component {
  constructor(options = {}) {
    super('MetabolizerComponent');

    // Existing properties
    this.metabolicRate = options.metabolicRate !== undefined ? options.metabolicRate : 1; // Passive energy decay rate
    this.efficiency = options.efficiency !== undefined ? options.efficiency : 0.7; // Nutrient to energy conversion efficiency

    // New properties from design
    this.maxRedAbsorption = options.maxRedAbsorption !== undefined ? options.maxRedAbsorption : 50;
    this.maxGreenAbsorption = options.maxGreenAbsorption !== undefined ? options.maxGreenAbsorption : 50;
    this.maxBlueAbsorption = options.maxBlueAbsorption !== undefined ? options.maxBlueAbsorption : 50;

    this.nutrientConversionRate = options.nutrientConversionRate !== undefined ? options.nutrientConversionRate : 10; // Nutrients per second converted to energy

    this.currentRedStored = options.currentRedStored !== undefined ? options.currentRedStored : 0;
    this.currentGreenStored = options.currentGreenStored !== undefined ? options.currentGreenStored : 0;
    this.currentBlueStored = options.currentBlueStored !== undefined ? options.currentBlueStored : 0;

    this.maxStorage = options.maxStorage !== undefined ? options.maxStorage : 200; // Max total nutrients that can be stored

    // Validation for existing properties
    if (typeof this.metabolicRate !== 'number' || isNaN(this.metabolicRate) || this.metabolicRate < 0) {
      throw new Error('Metabolic rate must be a non-negative number.');
    }
    if (typeof this.efficiency !== 'number' || isNaN(this.efficiency) || this.efficiency < 0 || this.efficiency > 1) {
      throw new Error('Efficiency must be a number between 0 and 1.');
    }

    // Validation for new properties
    if (typeof this.maxRedAbsorption !== 'number' || isNaN(this.maxRedAbsorption) || this.maxRedAbsorption < 0) {
      throw new Error('Max red absorption must be a non-negative number.');
    }
    if (typeof this.maxGreenAbsorption !== 'number' || isNaN(this.maxGreenAbsorption) || this.maxGreenAbsorption < 0) {
      throw new Error('Max green absorption must be a non-negative number.');
    }
    if (typeof this.maxBlueAbsorption !== 'number' || isNaN(this.maxBlueAbsorption) || this.maxBlueAbsorption < 0) {
      throw new Error('Max blue absorption must be a non-negative number.');
    }
    if (typeof this.nutrientConversionRate !== 'number' || isNaN(this.nutrientConversionRate) || this.nutrientConversionRate < 0) {
      throw new Error('Nutrient conversion rate must be a non-negative number.');
    }
    if (typeof this.currentRedStored !== 'number' || isNaN(this.currentRedStored) || this.currentRedStored < 0) {
      throw new Error('Current red stored must be a non-negative number.');
    }
    if (typeof this.currentGreenStored !== 'number' || isNaN(this.currentGreenStored) || this.currentGreenStored < 0) {
      throw new Error('Current green stored must be a non-negative number.');
    }
    if (typeof this.currentBlueStored !== 'number' || isNaN(this.currentBlueStored) || this.currentBlueStored < 0) {
      throw new Error('Current blue stored must be a non-negative number.');
    }
    if (typeof this.maxStorage !== 'number' || isNaN(this.maxStorage) || this.maxStorage < 0) {
      throw new Error('Max storage must be a non-negative number.');
    }
    this.currentRedStored = Math.min(this.currentRedStored, this.maxStorage);
    this.currentGreenStored = Math.min(this.currentGreenStored, this.maxStorage - this.currentRedStored);
    this.currentBlueStored = Math.min(this.currentBlueStored, this.maxStorage - this.currentRedStored - this.currentGreenStored);
  }

  // Getters and Setters for existing properties
  getMetabolicRate() {
    return this.metabolicRate;
  }

  setMetabolicRate(rate) {
    if (typeof rate !== 'number' || isNaN(rate) || rate < 0) {
      throw new Error('Metabolic rate must be a non-negative number.');
    }
    this.metabolicRate = rate;
  }

  getEfficiency() {
    return this.efficiency;
  }

  setEfficiency(efficiency) {
    if (typeof efficiency !== 'number' || isNaN(efficiency) || efficiency < 0 || efficiency > 1) {
      throw new Error('Efficiency must be a number between 0 and 1.');
    }
    this.efficiency = efficiency;
  }

  // Getters and Setters for new properties
  getMaxRedAbsorption() { return this.maxRedAbsorption; }
  setMaxRedAbsorption(value) {
    if (typeof value !== 'number' || isNaN(value) || value < 0) throw new Error('Max red absorption must be a non-negative number.');
    this.maxRedAbsorption = value;
  }

  getMaxGreenAbsorption() { return this.maxGreenAbsorption; }
  setMaxGreenAbsorption(value) {
    if (typeof value !== 'number' || isNaN(value) || value < 0) throw new Error('Max green absorption must be a non-negative number.');
    this.maxGreenAbsorption = value;
  }

  getMaxBlueAbsorption() { return this.maxBlueAbsorption; }
  setMaxBlueAbsorption(value) {
    if (typeof value !== 'number' || isNaN(value) || value < 0) throw new Error('Max blue absorption must be a non-negative number.');
    this.maxBlueAbsorption = value;
  }

  getNutrientConversionRate() { return this.nutrientConversionRate; }
  setNutrientConversionRate(value) {
    if (typeof value !== 'number' || isNaN(value) || value < 0) throw new Error('Nutrient conversion rate must be a non-negative number.');
    this.nutrientConversionRate = value;
  }

  getCurrentRedStored() { return this.currentRedStored; }
  setCurrentRedStored(value) {
    if (typeof value !== 'number' || isNaN(value) || value < 0) throw new Error('Current red stored must be a non-negative number.');
    this.currentRedStored = Math.min(value, this.maxStorage - this.currentGreenStored - this.currentBlueStored);
  }

  getCurrentGreenStored() { return this.currentGreenStored; }
  setCurrentGreenStored(value) {
    if (typeof value !== 'number' || isNaN(value) || value < 0) throw new Error('Current green stored must be a non-negative number.');
    this.currentGreenStored = Math.min(value, this.maxStorage - this.currentRedStored - this.currentBlueStored);
  }

  getCurrentBlueStored() { return this.currentBlueStored; }
  setCurrentBlueStored(value) {
    if (typeof value !== 'number' || isNaN(value) || value < 0) throw new Error('Current blue stored must be a non-negative number.');
    this.currentBlueStored = Math.min(value, this.maxStorage - this.currentRedStored - this.currentGreenStored);
  }

  getTotalStoredNutrients() {
    return this.currentRedStored + this.currentGreenStored + this.currentBlueStored;
  }

  getMaxStorage() { return this.maxStorage; }
  setMaxStorage(value) {
    if (typeof value !== 'number' || isNaN(value) || value < 0) throw new Error('Max storage must be a non-negative number.');
    this.maxStorage = value;
    // Adjust current stored if new maxStorage is less than total stored
    const totalStored = this.getTotalStoredNutrients();
    if (totalStored > this.maxStorage) {
        // This case needs careful handling. For simplicity, we might scale down,
        // or clamp at the new max, potentially losing some nutrients.
        // For now, let's just log an error or warning, as reducing stored nutrients
        // without a clear rule (e.g. which color to reduce) is tricky.
        // A better approach might be to prevent setting maxStorage below totalStored,
        // or define a strategy for nutrient reduction.
        // For this iteration, we'll assume this is handled by game logic or not a frequent case.
        // Clamping individual values on set should prevent exceeding.
         this.currentRedStored = Math.min(this.currentRedStored, this.maxStorage);
         this.currentGreenStored = Math.min(this.currentGreenStored, this.maxStorage - this.currentRedStored);
         this.currentBlueStored = Math.min(this.currentBlueStored, this.maxStorage - this.currentRedStored - this.currentGreenStored);
    }
  }

  addNutrients(red, green, blue) {
    const totalCurrentStorage = this.getTotalStoredNutrients();
    const availableStorage = this.maxStorage - totalCurrentStorage;

    if (availableStorage <= 0) {
      return { redAdded: 0, greenAdded: 0, blueAdded: 0 }; // No space
    }

    let canAddRed = Math.max(0, red);
    let canAddGreen = Math.max(0, green);
    let canAddBlue = Math.max(0, blue);

    let totalCanAdd = canAddRed + canAddGreen + canAddBlue;

    let redToAdd = 0;
    let greenToAdd = 0;
    let blueToAdd = 0;

    if (totalCanAdd <= availableStorage) {
        redToAdd = canAddRed;
        greenToAdd = canAddGreen;
        blueToAdd = canAddBlue;
    } else {
        // Prioritize adding based on proportion if exceeding available storage
        // This is a simple proportional reduction. More complex logic could be used.
        const scale = availableStorage / totalCanAdd;
        redToAdd = Math.floor(canAddRed * scale);
        greenToAdd = Math.floor(canAddGreen * scale);
        blueToAdd = Math.floor(canAddBlue * scale);

        // Distribute remaining due to floor (if any)
        let remainder = availableStorage - (redToAdd + greenToAdd + blueToAdd);
        if (remainder > 0 && canAddRed > 0) { redToAdd++; remainder--; }
        if (remainder > 0 && canAddGreen > 0) { greenToAdd++; remainder--; }
        if (remainder > 0 && canAddBlue > 0) { blueToAdd++; }
    }

    this.currentRedStored += redToAdd;
    this.currentGreenStored += greenToAdd;
    this.currentBlueStored += blueToAdd;

    return { redAdded: redToAdd, greenAdded: greenToAdd, blueAdded: blueToAdd };
  }

  consumeNutrients(redAmount, greenAmount, blueAmount) {
    const redConsumed = Math.min(this.currentRedStored, redAmount);
    const greenConsumed = Math.min(this.currentGreenStored, greenAmount);
    const blueConsumed = Math.min(this.currentBlueStored, blueAmount);

    this.currentRedStored -= redConsumed;
    this.currentGreenStored -= greenConsumed;
    this.currentBlueStored -= blueConsumed;

    return { redConsumed, greenConsumed, blueConsumed };
  }
}

export default MetabolizerComponent;
