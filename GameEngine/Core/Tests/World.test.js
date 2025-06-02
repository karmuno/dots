// GameEngine/Core/Tests/World.test.js
import World from '../World.js';
import Entity from '../Entity.js';
import BoundaryEntity from '../../Entities/BoundaryEntity.js';
import GrowthSystem from '../../Systems/GrowthSystem.js';
import RadiusComponent from '../../Components/RadiusComponent.js';

// Mock a generic system for some tests
class TestSystem {
  constructor() {
    this.updated = false;
    this.worldInstance = null;
    this.dtPassed = 0;
  }
  update(world, dt) {
    this.updated = true;
    this.worldInstance = world;
    this.dtPassed = dt;
  }
}

describe('World', () => {
  let world;

  beforeEach(() => {
    world = new World(); // Creates a new world before each test
  });

  describe('Core Entity Management', () => {
    test('createEntity should return an Entity instance and store it', () => {
      const entity = world.createEntity();
      expect(entity).toBeInstanceOf(Entity);
      expect(world.entities[entity.id]).toBe(entity);
    });

    test('getEntityById should retrieve the correct entity', () => {
      const entity = world.createEntity();
      const retrievedEntity = world.getEntityById(entity.id);
      expect(retrievedEntity).toBe(entity);
    });

    test('getEntityById should return undefined for a non-existent ID', () => {
      const retrievedEntity = world.getEntityById('nonExistentId');
      expect(retrievedEntity).toBeUndefined();
    });
    
    test('destroyEntity should remove the entity from the world', () => {
      const entity = world.createEntity();
      const entityId = entity.id;
      world.destroyEntity(entityId);
      expect(world.entities[entityId]).toBeUndefined();
      expect(world.getEntityById(entityId)).toBeUndefined();
    });
  });

  describe('System Management', () => {
    test('addSystem should add a system to the world', () => {
      const testSystem = new TestSystem();
      world.addSystem(testSystem);
      expect(world.systems).toContain(testSystem);
    });

    test('removeSystem should remove a system from the world', () => {
      const testSystem = new TestSystem();
      world.addSystem(testSystem);
      world.removeSystem(testSystem);
      expect(world.systems).not.toContain(testSystem);
    });

    test('update should call system.update on all added systems', () => {
      const testSystem1 = new TestSystem();
      const testSystem2 = new TestSystem();
      world.addSystem(testSystem1);
      world.addSystem(testSystem2);

      world.update(16.67);

      expect(testSystem1.updated).toBe(true);
      expect(testSystem1.worldInstance).toBe(world);
      expect(testSystem1.dtPassed).toBe(16.67);

      expect(testSystem2.updated).toBe(true);
      expect(testSystem2.worldInstance).toBe(world);
      expect(testSystem2.dtPassed).toBe(16.67);
    });

    test('update should not fail with no systems', () => {
      expect(() => world.update(10)).not.toThrow();
    });

    test('update should handle systems without an update method or where update is not a function', () => {
      world.addSystem({}); // System without an update method
      world.addSystem({ update: "not a function" }); // System with update not a function
      expect(() => world.update(10)).not.toThrow();
    });
  });

  describe('BoundaryEntity and GrowthSystem Integration', () => {
    test('constructor should create a BoundaryEntity', () => {
      // The world constructor itself creates a BoundaryEntity.
      // We need to find it among the entities.
      let foundBoundary = null;
      for (const id in world.entities) {
        if (world.entities[id] instanceof BoundaryEntity) {
          foundBoundary = world.entities[id];
          break;
        }
      }
      expect(foundBoundary).toBeInstanceOf(BoundaryEntity);
      expect(world.boundary).toBe(foundBoundary); // Check direct reference
    });

    test('constructor should add GrowthSystem to its systems', () => {
      const growthSystemInstance = world.systems.find(system => system instanceof GrowthSystem);
      expect(growthSystemInstance).toBeInstanceOf(GrowthSystem);
    });

    test('world.update should trigger boundary growth via GrowthSystem', () => {
      const boundaryEntity = world.boundary;
      const initialRadius = boundaryEntity.getComponent('RadiusComponent').radius;
      const growComponent = boundaryEntity.getComponent('GrowComponent');
      
      // Simulate enough time for one growth cycle
      const dtForOneCycle = growComponent.interval / 1000; // Convert ms to s

      world.update(dtForOneCycle);

      const newRadius = boundaryEntity.getComponent('RadiusComponent').radius;
      expect(newRadius).toBe(initialRadius + growComponent.growthRate);
    });

    test('destroyEntity should nullify world.boundary if the boundary entity is destroyed', () => {
      const boundaryEntity = world.boundary;
      expect(boundaryEntity).not.toBeNull();
      world.destroyEntity(boundaryEntity.id);
      expect(world.boundary).toBeNull();
      expect(world.entities[boundaryEntity.id]).toBeUndefined();
    });

    test('destroyEntity on a non-boundary entity should not nullify world.boundary', () => {
        const otherEntity = world.createEntity();
        const boundaryBeforeDestroy = world.boundary;
        expect(boundaryBeforeDestroy).not.toBeNull(); // Boundary exists

        world.destroyEntity(otherEntity.id); // Destroy a different entity

        expect(world.boundary).toBe(boundaryBeforeDestroy); // Boundary reference should be unchanged
        expect(world.boundary).not.toBeNull();
        expect(world.entities[otherEntity.id]).toBeUndefined(); // Other entity is gone
    });
  });
});
