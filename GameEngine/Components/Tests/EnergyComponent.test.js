// GameEngine/Components/Tests/EnergyComponent.test.js
import EnergyComponent from '../EnergyComponent.js'; // Adjust path as necessary

describe('EnergyComponent', () => {
  let energyComponent;
  const defaultMaxEnergy = 100;
  const defaultInitialEnergy = 100;
  // const defaultDecayRate = 1; // Removed

  beforeEach(() => {
    energyComponent = new EnergyComponent(); // Uses default options
  });

  test('should initialize with default values if none provided', () => {
    expect(energyComponent.currentEnergy).toBe(defaultInitialEnergy);
    expect(energyComponent.maxEnergy).toBe(defaultMaxEnergy);
    // expect(energyComponent.naturalDecayRate).toBe(defaultDecayRate); // Removed
  });

  test('should initialize with provided options', () => {
    const options = { initialEnergy: 50, maxEnergy: 150 }; // Removed naturalDecayRate
    const customEC = new EnergyComponent(options);
    expect(customEC.currentEnergy).toBe(50);
    expect(customEC.maxEnergy).toBe(150);
    // expect(customEC.naturalDecayRate).toBe(0.5); // Removed
  });

  test('initialEnergy should be capped at maxEnergy during construction', () => {
    const options = { initialEnergy: 120, maxEnergy: 100 };
    const customEC = new EnergyComponent(options);
    expect(customEC.currentEnergy).toBe(100);
  });

  test('initialEnergy should not be less than 0 during construction', () => {
    const options = { initialEnergy: -20, maxEnergy: 100 };
    const customEC = new EnergyComponent(options);
    expect(customEC.currentEnergy).toBe(0);
  });

  test('getEnergy should return the current energy', () => {
    energyComponent.currentEnergy = 75;
    expect(energyComponent.getEnergy()).toBe(75);
  });

  test('increaseEnergy should increase currentEnergy correctly', () => {
    energyComponent.setEnergy(50);
    energyComponent.increaseEnergy(20);
    expect(energyComponent.currentEnergy).toBe(70);
  });

  test('increaseEnergy should not exceed maxEnergy', () => {
    energyComponent.increaseEnergy(defaultMaxEnergy + 50); // Try to go way over
    expect(energyComponent.currentEnergy).toBe(defaultMaxEnergy);
  });

  test('increaseEnergy should ignore negative amounts', () => {
    energyComponent.setEnergy(50);
    energyComponent.increaseEnergy(-10); // Should log warning and do nothing
    expect(energyComponent.currentEnergy).toBe(50);
  });

  test('decreaseEnergy should decrease currentEnergy correctly', () => {
    energyComponent.setEnergy(50);
    energyComponent.decreaseEnergy(20);
    expect(energyComponent.currentEnergy).toBe(30);
  });

  test('decreaseEnergy should not go below 0', () => {
    energyComponent.decreaseEnergy(defaultInitialEnergy + 50); // Try to go way below 0
    expect(energyComponent.currentEnergy).toBe(0);
  });

  test('decreaseEnergy should ignore negative amounts', () => {
    energyComponent.setEnergy(50);
    energyComponent.decreaseEnergy(-10); // Should log warning and do nothing
    expect(energyComponent.currentEnergy).toBe(50);
  });

  test('setEnergy should set currentEnergy directly', () => {
    energyComponent.setEnergy(65);
    expect(energyComponent.currentEnergy).toBe(65);
  });

  test('setEnergy should clamp value to maxEnergy if above', () => {
    energyComponent.setEnergy(defaultMaxEnergy + 50);
    expect(energyComponent.currentEnergy).toBe(defaultMaxEnergy);
  });

  test('setEnergy should clamp value to 0 if below', () => {
    energyComponent.setEnergy(-50);
    expect(energyComponent.currentEnergy).toBe(0);
  });
});
