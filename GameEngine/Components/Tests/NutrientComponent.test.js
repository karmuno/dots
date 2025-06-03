import NutrientComponent from '../NutrientComponent.js';

describe('NutrientComponent', () => {
  let nutrientComponent;

  beforeEach(() => {
    nutrientComponent = new NutrientComponent();
  });

  test('should initialize with default nutrient values (0, 0, 0)', () => {
    expect(nutrientComponent.getRed()).toBe(0);
    expect(nutrientComponent.getGreen()).toBe(0);
    expect(nutrientComponent.getBlue()).toBe(0);
  });

  test('should initialize with provided nutrient values', () => {
    const customNutrients = new NutrientComponent({ red: 100, green: 150, blue: 200 });
    expect(customNutrients.getRed()).toBe(100);
    expect(customNutrients.getGreen()).toBe(150);
    expect(customNutrients.getBlue()).toBe(200);
  });

  test('should clamp nutrient values to min 0', () => {
    const customNutrients = new NutrientComponent({ red: -50, green: -10, blue: -1 });
    expect(customNutrients.getRed()).toBe(0);
    expect(customNutrients.getGreen()).toBe(0);
    expect(customNutrients.getBlue()).toBe(0);
  });

  test('should clamp nutrient values to max 255', () => {
    const customNutrients = new NutrientComponent({ red: 300, green: 256, blue: 500 });
    expect(customNutrients.getRed()).toBe(255);
    expect(customNutrients.getGreen()).toBe(255);
    expect(customNutrients.getBlue()).toBe(255);
  });

  test('setRed should update red nutrient value and clamp it', () => {
    nutrientComponent.setRed(120);
    expect(nutrientComponent.getRed()).toBe(120);
    nutrientComponent.setRed(300);
    expect(nutrientComponent.getRed()).toBe(255);
    nutrientComponent.setRed(-50);
    expect(nutrientComponent.getRed()).toBe(0);
  });

  test('setGreen should update green nutrient value and clamp it', () => {
    nutrientComponent.setGreen(120);
    expect(nutrientComponent.getGreen()).toBe(120);
    nutrientComponent.setGreen(300);
    expect(nutrientComponent.getGreen()).toBe(255);
    nutrientComponent.setGreen(-50);
    expect(nutrientComponent.getGreen()).toBe(0);
  });

  test('setBlue should update blue nutrient value and clamp it', () => {
    nutrientComponent.setBlue(120);
    expect(nutrientComponent.getBlue()).toBe(120);
    nutrientComponent.setBlue(300);
    expect(nutrientComponent.getBlue()).toBe(255);
    nutrientComponent.setBlue(-50);
    expect(nutrientComponent.getBlue()).toBe(0);
  });

  test('getTotalNutrients should return the sum of RGB values', () => {
    nutrientComponent.setNutrients(10, 20, 30);
    expect(nutrientComponent.getTotalNutrients()).toBe(60);
  });

  test('setNutrients should update all nutrient values', () => {
    nutrientComponent.setNutrients(50, 60, 70);
    expect(nutrientComponent.getRed()).toBe(50);
    expect(nutrientComponent.getGreen()).toBe(60);
    expect(nutrientComponent.getBlue()).toBe(70);
  });

  test('setNutrients should clamp values correctly', () => {
    nutrientComponent.setNutrients(-10, 300, 255);
    expect(nutrientComponent.getRed()).toBe(0);
    expect(nutrientComponent.getGreen()).toBe(255);
    expect(nutrientComponent.getBlue()).toBe(255);
  });

  test('decreaseNutrients should decrease values correctly', () => {
    nutrientComponent.setNutrients(100, 100, 100);
    nutrientComponent.decreaseNutrients(20, 30, 10);
    expect(nutrientComponent.getRed()).toBe(80);
    expect(nutrientComponent.getGreen()).toBe(70);
    expect(nutrientComponent.getBlue()).toBe(90);
  });

  test('decreaseNutrients should clamp to 0 if decreased by more than available', () => {
    nutrientComponent.setNutrients(10, 20, 30);
    nutrientComponent.decreaseNutrients(100, 100, 100);
    expect(nutrientComponent.getRed()).toBe(0);
    expect(nutrientComponent.getGreen()).toBe(0);
    expect(nutrientComponent.getBlue()).toBe(0);
  });
});
