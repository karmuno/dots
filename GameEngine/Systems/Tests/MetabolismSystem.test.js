import MetabolismSystem from '../MetabolismSystem.js';
import World from '../../Core/World.js';
import Entity from '../../Core/Entity.js';
import EnergyComponent from '../../Components/EnergyComponent.js';
import MetabolizerComponent from '../../Components/MetabolizerComponent.js';

describe('MetabolismSystem', () => {
  let world;
  let metabolismSystem;
  let entity;

  beforeEach(() => {
    world = new World();
    metabolismSystem = new MetabolismSystem(world);
    entity = new Entity('testEntity');
    world.addEntity(entity);
  });

  test('constructor initializes with world', () => {
    expect(metabolismSystem.world).toBe(world);
  });

  describe('update method', () => {
    test('should not affect entity without EnergyComponent', () => {
      entity.addComponent(new MetabolizerComponent({ metabolicRate: 2 }));
      // No EnergyComponent added

      const initialEnergyComponent = entity.getComponent('EnergyComponent'); // Should be undefined
      metabolismSystem.update(1); // deltaTime = 1 second

      expect(initialEnergyComponent).toBeUndefined();
      // No error should be thrown, and entity remains without EnergyComponent
    });

    test('should not affect entity without MetabolizerComponent', () => {
      entity.addComponent(new EnergyComponent({ initialEnergy: 100 }));
      // No MetabolizerComponent added

      const energyComponent = entity.getComponent('EnergyComponent');
      const initialEnergy = energyComponent.getEnergy();

      metabolismSystem.update(1); // deltaTime = 1 second

      expect(energyComponent.getEnergy()).toBe(initialEnergy); // Energy should not change
    });

    test('should decrease energy based on metabolicRate and deltaTime', () => {
      const initialEnergy = 100;
      const metabolicRate = 5;
      const deltaTime = 2; // seconds

      entity.addComponent(new EnergyComponent({ initialEnergy }));
      entity.addComponent(new MetabolizerComponent({ metabolicRate }));

      metabolismSystem.update(deltaTime);

      const energyComponent = entity.getComponent('EnergyComponent');
      const expectedEnergy = initialEnergy - (metabolicRate * deltaTime);
      expect(energyComponent.getEnergy()).toBe(expectedEnergy);
    });

    test('should handle zero metabolicRate correctly (no energy change)', () => {
      const initialEnergy = 100;
      entity.addComponent(new EnergyComponent({ initialEnergy }));
      entity.addComponent(new MetabolizerComponent({ metabolicRate: 0 }));

      metabolismSystem.update(1);

      const energyComponent = entity.getComponent('EnergyComponent');
      expect(energyComponent.getEnergy()).toBe(initialEnergy);
    });

    test('should handle zero deltaTime correctly (no energy change)', () => {
      const initialEnergy = 100;
      entity.addComponent(new EnergyComponent({ initialEnergy }));
      entity.addComponent(new MetabolizerComponent({ metabolicRate: 5 }));

      metabolismSystem.update(0);

      const energyComponent = entity.getComponent('EnergyComponent');
      expect(energyComponent.getEnergy()).toBe(initialEnergy);
    });

    test('should not decrease energy below zero', () => {
      entity.addComponent(new EnergyComponent({ initialEnergy: 5 }));
      entity.addComponent(new MetabolizerComponent({ metabolicRate: 10 }));

      metabolismSystem.update(1); // Attempt to decrease by 10

      const energyComponent = entity.getComponent('EnergyComponent');
      expect(energyComponent.getEnergy()).toBe(0);
    });

    test('should correctly update multiple entities', () => {
      const entity1 = new Entity('entity1');
      entity1.addComponent(new EnergyComponent({ initialEnergy: 50 }));
      entity1.addComponent(new MetabolizerComponent({ metabolicRate: 2 }));
      world.addEntity(entity1);

      const entity2 = new Entity('entity2');
      entity2.addComponent(new EnergyComponent({ initialEnergy: 70 }));
      entity2.addComponent(new MetabolizerComponent({ metabolicRate: 3 }));
      world.addEntity(entity2);

      // Remove the default 'entity' from this specific test if it might interfere
      // or ensure its components are set up not to cause issues.
      // For simplicity, we'll assume the initial `entity` doesn't affect this test if not properly componentized for it.
      // Or, re-initialize world for this test. Let's remove the default `entity` for clarity for this multi-entity test.
      world.removeEntity(entity.id); // Use removeEntity as per World.js


      metabolismSystem.update(1);

      const energy1 = entity1.getComponent('EnergyComponent').getEnergy();
      const energy2 = entity2.getComponent('EnergyComponent').getEnergy();

      expect(energy1).toBe(50 - 2 * 1);
      expect(energy2).toBe(70 - 3 * 1);
    });

    test('should not throw error if world.entities is empty or null', () => {
      world.entities = {}; // Empty entities
      expect(() => metabolismSystem.update(1)).not.toThrow();

      world.entities = null; // Null entities
      // console.warn = jest.fn(); // Mock console.warn for systems that might log this
      expect(() => metabolismSystem.update(1)).not.toThrow();
      // Systems should be robust to this, though ideally world.entities is always an object.
      // The system itself might log a warning if world or entities are not available.
    });
  });
});
