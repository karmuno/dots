import MetabolizerComponent from '../MetabolizerComponent.js';
import Component from '../../Core/Component.js';

describe('MetabolizerComponent', () => {
  let metabolizer;

  beforeEach(() => {
    metabolizer = new MetabolizerComponent();
  });

  test('should be a subclass of Component', () => {
    expect(metabolizer instanceof Component).toBe(true);
  });

  test('should have the correct component type name', () => {
    expect(metabolizer.type).toBe('MetabolizerComponent');
  });

  describe('Constructor and Defaults', () => {
    test('should initialize with default metabolicRate if not provided', () => {
      expect(metabolizer.getMetabolicRate()).toBe(1);
    });

    test('should initialize with default efficiency if not provided', () => {
      expect(metabolizer.getEfficiency()).toBe(0.7);
    });

    test('should initialize with provided metabolicRate', () => {
      const customMetabolizer = new MetabolizerComponent({ metabolicRate: 5 });
      expect(customMetabolizer.getMetabolicRate()).toBe(5);
    });

    test('should initialize with provided efficiency', () => {
      const customMetabolizer = new MetabolizerComponent({ efficiency: 0.5 });
      expect(customMetabolizer.getEfficiency()).toBe(0.5);
    });

    test('should handle multiple options correctly', () => {
      const customMetabolizer = new MetabolizerComponent({ metabolicRate: 2, efficiency: 0.8 });
      expect(customMetabolizer.getMetabolicRate()).toBe(2);
      expect(customMetabolizer.getEfficiency()).toBe(0.8);
    });

    test('constructor should throw error for non-numeric metabolicRate', () => {
      expect(() => new MetabolizerComponent({ metabolicRate: 'invalid' })).toThrow('Metabolic rate must be a number.');
    });

    test('constructor should throw error for NaN metabolicRate', () => {
      expect(() => new MetabolizerComponent({ metabolicRate: NaN })).toThrow('Metabolic rate must be a number.');
    });

    test('constructor should throw error for negative metabolicRate', () => {
      expect(() => new MetabolizerComponent({ metabolicRate: -1 })).toThrow('Metabolic rate must be non-negative.');
    });

    test('constructor should throw error for non-numeric efficiency', () => {
      expect(() => new MetabolizerComponent({ efficiency: 'invalid' })).toThrow('Efficiency must be a number.');
    });

    test('constructor should throw error for NaN efficiency', () => {
      expect(() => new MetabolizerComponent({ efficiency: NaN })).toThrow('Efficiency must be a number.');
    });

    test('constructor should throw error for efficiency < 0', () => {
      expect(() => new MetabolizerComponent({ efficiency: -0.1 })).toThrow('Efficiency must be between 0 and 1.');
    });

    test('constructor should throw error for efficiency > 1', () => {
      expect(() => new MetabolizerComponent({ efficiency: 1.1 })).toThrow('Efficiency must be between 0 and 1.');
    });
  });

  describe('Getters', () => {
    test('getMetabolicRate should return the current metabolic rate', () => {
      metabolizer.metabolicRate = 2.5; // Direct access for testing setup
      expect(metabolizer.getMetabolicRate()).toBe(2.5);
    });

    test('getEfficiency should return the current efficiency', () => {
      metabolizer.efficiency = 0.9; // Direct access for testing setup
      expect(metabolizer.getEfficiency()).toBe(0.9);
    });
  });

  describe('Setters with Validation', () => {
    // setMetabolicRate
    test('setMetabolicRate should update the metabolic rate for valid positive values', () => {
      metabolizer.setMetabolicRate(3);
      expect(metabolizer.getMetabolicRate()).toBe(3);
    });

    test('setMetabolicRate should allow setting rate to 0', () => {
      metabolizer.setMetabolicRate(0);
      expect(metabolizer.getMetabolicRate()).toBe(0);
    });

    test('setMetabolicRate should throw error if rate is negative', () => {
      expect(() => metabolizer.setMetabolicRate(-1)).toThrow('Metabolic rate must be non-negative.');
    });

    test('setMetabolicRate should throw error for non-numeric value', () => {
      expect(() => metabolizer.setMetabolicRate('invalid')).toThrow('Metabolic rate must be a number.');
    });

    test('setMetabolicRate should throw error for NaN value', () => {
      expect(() => metabolizer.setMetabolicRate(NaN)).toThrow('Metabolic rate must be a number.');
    });


    // setEfficiency
    test('setEfficiency should update the efficiency for valid values between 0 and 1', () => {
      metabolizer.setEfficiency(0.6);
      expect(metabolizer.getEfficiency()).toBe(0.6);
      metabolizer.setEfficiency(0);
      expect(metabolizer.getEfficiency()).toBe(0);
      metabolizer.setEfficiency(1);
      expect(metabolizer.getEfficiency()).toBe(1);
    });

    test('setEfficiency should throw error if efficiency is less than 0', () => {
      expect(() => metabolizer.setEfficiency(-0.1)).toThrow('Efficiency must be between 0 and 1.');
    });

    test('setEfficiency should throw error if efficiency is greater than 1', () => {
      expect(() => metabolizer.setEfficiency(1.1)).toThrow('Efficiency must be between 0 and 1.');
    });

    test('setEfficiency should throw error for non-numeric value', () => {
      expect(() => metabolizer.setEfficiency('invalid')).toThrow('Efficiency must be a number.');
    });

    test('setEfficiency should throw error for NaN value', () => {
      expect(() => metabolizer.setEfficiency(NaN)).toThrow('Efficiency must be a number.');
    });
  });
});
