import RadiusComponent from '../../Components/RadiusComponent.js';

describe('RadiusComponent', () => {
  test('constructor initializes radius correctly with default value', () => {
    const component = new RadiusComponent();
    expect(component.radius).toBe(100); // Default initialRadius
  });

  test('constructor initializes radius correctly with provided value', () => {
    const component = new RadiusComponent(50);
    expect(component.radius).toBe(50);
  });

  test('increaseRadius increases the radius by the specified amount', () => {
    const component = new RadiusComponent(50);
    component.increaseRadius(25);
    expect(component.radius).toBe(75);
  });

  test('increaseRadius does not change radius if amount is zero', () => {
    const component = new RadiusComponent(50);
    component.increaseRadius(0);
    expect(component.radius).toBe(50);
  });

  test('increaseRadius does not change radius if amount is negative', () => {
    const component = new RadiusComponent(50);
    component.increaseRadius(-10);
    expect(component.radius).toBe(50);
  });

  test('increaseRadius handles multiple increases correctly', () => {
    const component = new RadiusComponent(10);
    component.increaseRadius(10);
    component.increaseRadius(10);
    expect(component.radius).toBe(30);
  });
});
