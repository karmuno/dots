// GameEngine/Systems/Tests/HungerSystem.test.js
import HungerSystem from '../HungerSystem.js';
import EnergyComponent from '../../Components/EnergyComponent.js'; // Adjust path

// Mock Entity and World classes for testing purposes
class MockEntity {
  constructor(id, components = {}) {
    this.id = id;
    this.components = components;
  }

  hasComponent(componentName) {
    // Assuming componentName is the class name string, e.g., "EnergyComponent"
    return !!this.components[componentName];
  }

  getComponent(componentName) {
    return this.components[componentName];
  }

  addComponent(component) {
    // Store component by its explicit type or constructor name
    this.components[component.type || component.constructor.name] = component;
  }
}

class MockWorld {
  constructor() {
    this.entities = {};
  }

  addEntity(entity) {
    this.entities[entity.id] = entity;
  }
}

describe('HungerSystem', () => {
  let hungerSystem;
  let mockWorld;
  let entityWithEnergy;
  let entityWithoutEnergy;

  beforeEach(() => {
    mockWorld = new MockWorld();
    hungerSystem = new HungerSystem(mockWorld);

    // Entity with EnergyComponent
    entityWithEnergy = new MockEntity('dotWithEnergy');
    // Explicitly naming the component 'EnergyComponent' for keying in mock
    entityWithEnergy.addComponent(new EnergyComponent({ initialEnergy: 50, maxEnergy: 100, naturalDecayRate: 10 }));
    mockWorld.addEntity(entityWithEnergy);

    // Entity without EnergyComponent
    entityWithoutEnergy = new MockEntity('dotWithoutEnergy');
    mockWorld.addEntity(entityWithoutEnergy);
  });

  test('should decrease energy for entities with EnergyComponent based on decayRate and deltaTime', () => {
    const energyComp = entityWithEnergy.getComponent('EnergyComponent');
    const initialEnergy = energyComp.getEnergy(); // 50
    const decayRate = energyComp.getDecayRate(); // 10
    const deltaTime = 0.5; // seconds

    hungerSystem.update(deltaTime);

    const expectedEnergy = initialEnergy - (decayRate * deltaTime); // 50 - (10 * 0.5) = 45
    expect(energyComp.getEnergy()).toBe(expectedEnergy);
  });

  test('energy should not drop below 0 due to decay', () => {
    const energyComp = entityWithEnergy.getComponent('EnergyComponent');
    energyComp.setEnergy(5); // Set energy low
    const decayRate = energyComp.getDecayRate(); // 10
    const deltaTime = 1; // seconds. Decay would be 10. 5 - 10 = -5, should be 0.

    hungerSystem.update(deltaTime);
    expect(energyComp.getEnergy()).toBe(0);
  });

  test('should not affect entities without an EnergyComponent', () => {
    const initialEnergyOnOtherEntity = entityWithEnergy.getComponent('EnergyComponent').getEnergy();

    // Call update - entityWithoutEnergy should not cause errors or be processed
    expect(() => hungerSystem.update(0.5)).not.toThrow();

    // Verify entityWithEnergy was still processed (its energy should change)
    expect(entityWithEnergy.getComponent('EnergyComponent').getEnergy()).not.toBe(initialEnergyOnOtherEntity);
  });

  test('should not decrease energy if decayRate is 0', () => {
    const energyComp = entityWithEnergy.getComponent('EnergyComponent');
    energyComp.setEnergy(50);
    energyComp.setDecayRate(0); // Set decay rate to 0
    const initialEnergy = energyComp.getEnergy();
    const deltaTime = 1;

    hungerSystem.update(deltaTime);
    expect(energyComp.getEnergy()).toBe(initialEnergy); // Energy should not change
  });

  test('should handle world or entities not being available gracefully', () => {
    const systemWithEmptyWorld = new HungerSystem({}); // World without entities object
    expect(() => systemWithEmptyWorld.update(1)).not.toThrow(); // Expect console warning

    const systemWithNullWorld = new HungerSystem(null); // Null world
    expect(() => systemWithNullWorld.update(1)).not.toThrow(); // Expect console warning
  });
});
