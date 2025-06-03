import { jest } from '@jest/globals';
// GameEngine/Core/Tests/World.test.js
import World from '../World.js';
import Entity from '../Entity.js';
import BoundaryEntity from '../../Entities/BoundaryEntity.js';
import GrowthSystem from '../../Systems/GrowthSystem.js';
import RadiusComponent from '../../Components/RadiusComponent.js';
import Dot from '../../Entities/Dot.js'; // Added for createDot tests

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
    // Mock console functions for each test
    global.console.log = jest.fn();
    global.console.warn = jest.fn();
    global.console.error = jest.fn(); // Also mock error in case
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
    
    test('removeEntity should remove the entity from the world', () => {
      const entity = world.createEntity();
      const entityId = entity.id;
      world.removeEntity(entityId);
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
      expect(Number(newRadius)).toBe(Number(initialRadius) + Number(growComponent.growthRate));
    });

    test('removeEntity should nullify world.boundary if the boundary entity is destroyed', () => {
      const boundaryEntity = world.boundary;
      expect(boundaryEntity).not.toBeNull();
      world.removeEntity(boundaryEntity.id);
      expect(world.boundary).toBeNull();
      expect(world.entities[boundaryEntity.id]).toBeUndefined();
    });

    test('removeEntity on a non-boundary entity should not nullify world.boundary', () => {
        const otherEntity = world.createEntity();
        const boundaryBeforeDestroy = world.boundary;
        expect(boundaryBeforeDestroy).not.toBeNull(); // Boundary exists

        world.removeEntity(otherEntity.id); // Destroy a different entity

        expect(world.boundary).toBe(boundaryBeforeDestroy); // Boundary reference should be unchanged
        expect(world.boundary).not.toBeNull();
        expect(world.entities[otherEntity.id]).toBeUndefined(); // Other entity is gone
    });
  });

  // New tests for createDot
  describe('createDot', () => {
    test('should create a new dot, add it to entities, and return it', () => {
      const initialEntityCount = Object.keys(world.entities).length;
      const newDot = world.createDot();

      expect(newDot).toBeInstanceOf(Dot);
      expect(Object.keys(world.entities).length).toBe(initialEntityCount + 1);
      expect(world.entities[newDot.id]).toBe(newDot);
      expect(newDot.id).toMatch(/^dot\d+$/); // e.g., dot1, dot2
    });

    test('created dot should have essential components', () => {
      const newDot = world.createDot();
      expect(newDot.components.Transform).toBeDefined();
      expect(newDot.components.Movement).toBeDefined();
      expect(newDot.components.Appearance).toBeDefined();
      expect(newDot.components.InspectableComponent).toBeDefined(); // Assuming Dot constructor adds this
    });

    test('created dot should have numerical position and velocity', () => {
      const newDot = world.createDot();
      expect(typeof newDot.components.Transform.position.x).toBe('number');
      expect(typeof newDot.components.Transform.position.y).toBe('number');
      expect(typeof newDot.components.Movement.velocityX).toBe('number');
      expect(typeof newDot.components.Movement.velocityY).toBe('number');
    });

    test('should increment dotCounter and generate unique IDs for multiple dots', () => {
      const dot1 = world.createDot();
      expect(dot1.id).toBe(`dot${world.dotCounter}`);
      const currentCounter = world.dotCounter;

      const dot2 = world.createDot();
      expect(dot2.id).toBe(`dot${world.dotCounter}`);
      expect(world.dotCounter).toBe(currentCounter + 1);
      expect(dot1.id).not.toBe(dot2.id);
    });

    test('should log the creation of a new dot', () => {
      const newDot = world.createDot();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(`World: Created new dot - ID: ${newDot.id}`)
      );
    });
  });

  // New tests for deleteDot
  describe('deleteDot', () => {
    test('should delete an existing dot and return true', () => {
      const newDot = world.createDot(); // Use createDot to ensure it's a known entity type
      const entityId = newDot.id;
      const initialEntityCount = Object.keys(world.entities).length;

      expect(world.entities[entityId]).toBeDefined();
      const result = world.deleteDot(entityId);

      expect(result).toBe(true);
      expect(world.entities[entityId]).toBeUndefined();
      expect(Object.keys(world.entities).length).toBe(initialEntityCount - 1);
      expect(console.log).toHaveBeenCalledWith(`World: Entity with ID '${entityId}' has been deleted.`);
    });

    test('should return false and log a warning for a non-existent entityId', () => {
      const nonExistentId = 'dot-nonexistent';
      const initialEntityCount = Object.keys(world.entities).length;
      const result = world.deleteDot(nonExistentId);

      expect(result).toBe(false);
      expect(Object.keys(world.entities).length).toBe(initialEntityCount); // No change
      expect(console.warn).toHaveBeenCalledWith(
        `World: Attempted to delete entity with ID '${nonExistentId}', but it was not found.`
      );
    });

    test('should correctly handle deleting the boundary entity and nullify world.boundary', () => {
      // The world constructor creates a boundary. We need its ID.
      const boundaryEntity = world.boundary;
      expect(boundaryEntity).not.toBeNull();
      const boundaryId = boundaryEntity.id;

      const result = world.deleteDot(boundaryId);

      expect(result).toBe(true);
      expect(world.entities[boundaryId]).toBeUndefined();
      expect(world.boundary).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        `World: The boundary entity (ID: ${boundaryId}) is being deleted. The world edge will be removed.`
      );
      expect(console.log).toHaveBeenCalledWith(`World: Entity with ID '${boundaryId}' has been deleted.`);
    });

    test('deleting a non-boundary dot should not affect world.boundary', () => {
      const boundaryEntity = world.boundary; // Keep reference
      const dotToDelete = world.createDot();
      const dotId = dotToDelete.id;

      expect(dotId).not.toBe(boundaryEntity.id); // Ensure we are not deleting boundary by mistake

      const result = world.deleteDot(dotId);

      expect(result).toBe(true);
      expect(world.entities[dotId]).toBeUndefined();
      expect(world.boundary).toBe(boundaryEntity); // Boundary should remain untouched
      expect(console.log).toHaveBeenCalledWith(`World: Entity with ID '${dotId}' has been deleted.`);
      expect(console.warn).not.toHaveBeenCalledWith( // Should not log boundary deletion warning
        expect.stringContaining('The boundary entity')
      );
    });
  });
});
