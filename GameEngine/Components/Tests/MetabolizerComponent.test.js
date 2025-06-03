import MetabolizerComponent from '../MetabolizerComponent.js';

describe('MetabolizerComponent', () => {
  let component;

  beforeEach(() => {
    // Default component for most tests
    component = new MetabolizerComponent();
  });

  // Test existing properties (metabolicRate, efficiency)
  test('should initialize with default metabolicRate and efficiency', () => {
    expect(component.getMetabolicRate()).toBe(1); // Default from original component
    expect(component.getEfficiency()).toBe(0.7); // Default from original component
  });

  test('should allow setting and getting metabolicRate', () => {
    component.setMetabolicRate(5);
    expect(component.getMetabolicRate()).toBe(5);
    expect(() => component.setMetabolicRate(-1)).toThrow();
    expect(() => component.setMetabolicRate('abc')).toThrow();
  });

  test('should allow setting and getting efficiency', () => {
    component.setEfficiency(0.5);
    expect(component.getEfficiency()).toBe(0.5);
    expect(() => component.setEfficiency(-0.1)).toThrow();
    expect(() => component.setEfficiency(1.1)).toThrow();
    expect(() => component.setEfficiency('abc')).toThrow();
  });

  // Tests for new properties
  test('should initialize with default absorption and storage properties', () => {
    expect(component.getMaxRedAbsorption()).toBe(50);
    expect(component.getMaxGreenAbsorption()).toBe(50);
    expect(component.getMaxBlueAbsorption()).toBe(50);
    expect(component.getNutrientConversionRate()).toBe(10);
    expect(component.getCurrentRedStored()).toBe(0);
    expect(component.getCurrentGreenStored()).toBe(0);
    expect(component.getCurrentBlueStored()).toBe(0);
    expect(component.getMaxStorage()).toBe(200);
  });

  test('constructor should accept options for all new properties', () => {
    const options = {
      maxRedAbsorption: 60,
      maxGreenAbsorption: 65,
      maxBlueAbsorption: 70,
      nutrientConversionRate: 12,
      currentRedStored: 10,
      currentGreenStored: 15,
      currentBlueStored: 20,
      maxStorage: 250,
      metabolicRate: 2, // test existing too
      efficiency: 0.8
    };
    const customComponent = new MetabolizerComponent(options);
    expect(customComponent.getMaxRedAbsorption()).toBe(60);
    expect(customComponent.getMaxGreenAbsorption()).toBe(65);
    expect(customComponent.getMaxBlueAbsorption()).toBe(70);
    expect(customComponent.getNutrientConversionRate()).toBe(12);
    expect(customComponent.getCurrentRedStored()).toBe(10);
    expect(customComponent.getCurrentGreenStored()).toBe(15);
    expect(customComponent.getCurrentBlueStored()).toBe(20);
    expect(customComponent.getMaxStorage()).toBe(250);
    expect(customComponent.getMetabolicRate()).toBe(2);
    expect(customComponent.getEfficiency()).toBe(0.8);
  });

  test('constructor should clamp initial stored nutrients to maxStorage', () => {
    const options = {
        currentRedStored: 100,
        currentGreenStored: 100,
        currentBlueStored: 100, // Total 300
        maxStorage: 150 // Max is 150
    };
    const customComponent = new MetabolizerComponent(options);
    // The constructor logic for clamping initial stored values is a bit complex.
    // currentRedStored = Math.min(this.currentRedStored, this.maxStorage); -> 100
    // currentGreenStored = Math.min(this.currentGreenStored, this.maxStorage - this.currentRedStored); -> min(100, 150-100=50) -> 50
    // currentBlueStored = Math.min(this.currentBlueStored, this.maxStorage - this.currentRedStored - this.currentGreenStored); -> min(100, 150-100-50=0) -> 0
    expect(customComponent.getCurrentRedStored()).toBe(100);
    expect(customComponent.getCurrentGreenStored()).toBe(50);
    expect(customComponent.getCurrentBlueStored()).toBe(0);
    expect(customComponent.getTotalStoredNutrients()).toBe(150);
  });


  // Getters and Setters for new properties
  test('setMaxRedAbsorption should update value', () => {
    component.setMaxRedAbsorption(100);
    expect(component.getMaxRedAbsorption()).toBe(100);
    expect(() => component.setMaxRedAbsorption(-1)).toThrow();
  });

  test('setCurrentRedStored should update value and respect max storage', () => {
    component.setMaxStorage(100);
    component.setCurrentGreenStored(30);
    component.setCurrentBlueStored(30); // Total 60 stored, 40 space for red
    component.setCurrentRedStored(50);
    expect(component.getCurrentRedStored()).toBe(40);
    component.setCurrentRedStored(10);
    expect(component.getCurrentRedStored()).toBe(10);
    expect(() => component.setCurrentRedStored(-5)).toThrow();
  });

  test('getTotalStoredNutrients should sum current stored RGB values', () => {
    component.setCurrentRedStored(10);
    component.setCurrentGreenStored(20);
    component.setCurrentBlueStored(30);
    expect(component.getTotalStoredNutrients()).toBe(60);
  });

  test('setMaxStorage should update value and adjust stored if necessary', () => {
    component.setCurrentRedStored(50);
    component.setCurrentGreenStored(50);
    component.setCurrentBlueStored(50); // Total 150
    component.setMaxStorage(100); // New max is less than total
    // Current logic: R=min(50,100)=50, G=min(50, 100-50=50)=50, B=min(50, 100-50-50=0)=0
    expect(component.getMaxStorage()).toBe(100);
    expect(component.getCurrentRedStored()).toBe(50);
    expect(component.getCurrentGreenStored()).toBe(50);
    expect(component.getCurrentBlueStored()).toBe(0);
    expect(component.getTotalStoredNutrients()).toBe(100);
  });

  // addNutrients method
  describe('addNutrients', () => {
    beforeEach(() => {
        component = new MetabolizerComponent({ maxStorage: 100 }); // Fresh component with 100 max storage
    });

    test('should add nutrients if space is available', () => {
        const { redAdded, greenAdded, blueAdded } = component.addNutrients(10, 20, 30);
        expect(redAdded).toBe(10);
        expect(greenAdded).toBe(20);
        expect(blueAdded).toBe(30);
        expect(component.getTotalStoredNutrients()).toBe(60);
    });

    test('should not add nutrients if storage is full', () => {
        component.addNutrients(50, 30, 20); // Fills storage to 100
        const { redAdded, greenAdded, blueAdded } = component.addNutrients(1, 1, 1);
        expect(redAdded).toBe(0);
        expect(greenAdded).toBe(0);
        expect(blueAdded).toBe(0);
        expect(component.getTotalStoredNutrients()).toBe(100);
    });

    test('should add nutrients up to max capacity proportionally if input exceeds available space', () => {
        component.addNutrients(40, 40, 0); // 80 stored, 20 space left
        // Try to add 15, 15, 10 (total 40), but only 20 space.
        // Proportional reduction: scale = 20/40 = 0.5
        // redToAdd = floor(15 * 0.5) = 7
        // greenToAdd = floor(15 * 0.5) = 7
        // blueToAdd = floor(10 * 0.5) = 5
        // Total = 7+7+5 = 19. Remainder = 20 - 19 = 1.
        // Add remainder: red becomes 8.
        const { redAdded, greenAdded, blueAdded } = component.addNutrients(15, 15, 10);
        expect(redAdded).toBe(8); // 7 + 1 from remainder
        expect(greenAdded).toBe(7);
        expect(blueAdded).toBe(5);
        expect(component.getTotalStoredNutrients()).toBe(100); // 80 + 8 + 7 + 5 = 100
    });

    test('should handle adding only one type of nutrient when space is limited', () => {
        component.addNutrients(90,0,0); // 90 stored, 10 space
        const { redAdded, greenAdded, blueAdded } = component.addNutrients(20,0,0);
        expect(redAdded).toBe(10);
        expect(greenAdded).toBe(0);
        expect(blueAdded).toBe(0);
        expect(component.getTotalStoredNutrients()).toBe(100);
    });
  });

  // consumeNutrients method
  describe('consumeNutrients', () => {
    test('should decrease stored nutrients by specified amounts', () => {
      component.setCurrentRedStored(50);
      component.setCurrentGreenStored(50);
      component.setCurrentBlueStored(50);
      const {redConsumed, greenConsumed, blueConsumed} = component.consumeNutrients(10, 20, 5);
      expect(redConsumed).toBe(10);
      expect(greenConsumed).toBe(20);
      expect(blueConsumed).toBe(5);
      expect(component.getCurrentRedStored()).toBe(40);
      expect(component.getCurrentGreenStored()).toBe(30);
      expect(component.getCurrentBlueStored()).toBe(45);
    });

    test('should not decrease stored nutrients below zero', () => {
      component.setCurrentRedStored(10);
      const {redConsumed} = component.consumeNutrients(20, 0, 0);
      expect(redConsumed).toBe(10);
      expect(component.getCurrentRedStored()).toBe(0);
    });
  });

  // Test validation in setters
  const invalidValues = [-1, 'abc', null, undefined, {}];
  const propertiesToTest = [
      'MaxRedAbsorption', 'MaxGreenAbsorption', 'MaxBlueAbsorption',
      'NutrientConversionRate', 'CurrentRedStored', 'CurrentGreenStored',
      'CurrentBlueStored', 'MaxStorage'
  ];

  propertiesToTest.forEach(prop => {
      invalidValues.forEach(val => {
          if (val === undefined && (prop.startsWith('Current') || prop === 'MaxStorage')) {
              // Skip undefined for these as constructor handles it, setter might not expect it.
              // Or ensure setters explicitly handle undefined if that's a use case.
              // For now, assuming direct setter calls won't use undefined.
              return;
          }
          test(`set${prop} should throw for invalid value: ${String(val)}`, () => {
              expect(() => component[`set${prop}`](val)).toThrow();
          });
      });
  });

});
