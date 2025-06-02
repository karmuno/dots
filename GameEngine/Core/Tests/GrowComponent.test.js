import GrowComponent from '../../Components/GrowComponent.js';

describe('GrowComponent', () => {
  test('constructor initializes properties correctly with default values', () => {
    const component = new GrowComponent();
    expect(component.growthRate).toBe(10); // Default growthRate
    expect(component.interval).toBe(1000); // Default interval
    expect(component.timeSinceLastGrowth).toBe(0);
  });

  test('constructor initializes properties correctly with provided values', () => {
    const component = new GrowComponent(25, 500);
    expect(component.growthRate).toBe(25);
    expect(component.interval).toBe(500);
    expect(component.timeSinceLastGrowth).toBe(0);
  });

  test('constructor handles zero values for growthRate and interval', () => {
    const component = new GrowComponent(0, 0);
    expect(component.growthRate).toBe(0);
    expect(component.interval).toBe(0);
  });

  // timeSinceLastGrowth is managed by the GrowthSystem, so direct tests here are minimal.
  // We are mainly testing the data storage aspect of this component.
});
