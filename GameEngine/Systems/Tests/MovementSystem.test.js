import MovementSystem from '../MovementSystem.js';
import Transform from '../../Components/Transform.js';
import Movement from '../../Components/Movement.js';

// --- Mocks ---
const mockEntity = (id, components) => {
  const entity = {
    id,
    components: {},
    hasComponent: (componentName) => !!entity.components[componentName.toLowerCase()],
    getComponent: (componentName) => entity.components[componentName.toLowerCase()],
    addComponent: (component) => {
      entity.components[component.constructor.name.toLowerCase()] = component;
    }
  };
  if (components) {
    components.forEach(comp => entity.addComponent(comp));
  }
  return entity;
};

const mockWorld = (entities = []) => {
  const world = {
    entities: {},
    addEntity: (entity) => {
      world.entities[entity.id] = entity;
    }
  };
  entities.forEach(entity => world.addEntity(entity));
  return world;
};

// Helper for Transform component
const createTransform = (x, y) => new Transform(x, y);

// Helper for Movement component - simplified for velocity-only implementation
const createMovement = (velocityX = 0, velocityY = 0) => {
  return new Movement(velocityX, velocityY);
};

describe('MovementSystem', () => {
  let movementSystem;

  beforeEach(() => {
    movementSystem = new MovementSystem();
  });

  test('entity moves with positive velocity', () => {
    const transform = createTransform(0, 0);
    const movement = createMovement(10, 5); // velocityX=10, velocityY=5
    const entity = mockEntity('e1', [transform, movement]);
    const world = mockWorld([entity]);

    // Initial state
    expect(transform.position.x).toBe(0);
    expect(transform.position.y).toBe(0);

    movementSystem.update(world, 0.1); // dt = 0.1s

    // Position should change based on velocity
    expect(transform.position.x).toBe(1); // 0 + 10 * 0.1
    expect(transform.position.y).toBe(0.5); // 0 + 5 * 0.1
  });

  test('entity moves with negative velocity', () => {
    const transform = createTransform(10, 10);
    const movement = createMovement(-5, -2); // negative velocities
    const entity = mockEntity('e1', [transform, movement]);
    const world = mockWorld([entity]);

    movementSystem.update(world, 0.2); // dt = 0.2s

    expect(transform.position.x).toBe(9); // 10 + (-5) * 0.2
    expect(transform.position.y).toBe(9.6); // 10 + (-2) * 0.2
  });

  test('entity with zero velocity does not move', () => {
    const transform = createTransform(5, 5);
    const movement = createMovement(0, 0); // no velocity
    const entity = mockEntity('e1', [transform, movement]);
    const world = mockWorld([entity]);

    movementSystem.update(world, 1.0); // large dt

    expect(transform.position.x).toBe(5); // no change
    expect(transform.position.y).toBe(5); // no change
  });

  test('multiple entities move independently', () => {
    const transform1 = createTransform(0, 0);
    const movement1 = createMovement(10, 0);
    const entity1 = mockEntity('e1', [transform1, movement1]);

    const transform2 = createTransform(0, 0);
    const movement2 = createMovement(0, 20);
    const entity2 = mockEntity('e2', [transform2, movement2]);

    const world = mockWorld([entity1, entity2]);

    movementSystem.update(world, 0.1);

    expect(transform1.position.x).toBe(1); // 10 * 0.1
    expect(transform1.position.y).toBe(0); // 0 * 0.1
    expect(transform2.position.x).toBe(0); // 0 * 0.1
    expect(transform2.position.y).toBe(2); // 20 * 0.1
  });

  test('system ignores entities without Movement component', () => {
    const transform = createTransform(0, 0);
    const entity = mockEntity('e1', [transform]); // no Movement component
    const world = mockWorld([entity]);

    movementSystem.update(world, 0.1);

    expect(transform.position.x).toBe(0); // no change
    expect(transform.position.y).toBe(0); // no change
  });

  test('system ignores entities without Transform component', () => {
    const movement = createMovement(10, 10);
    const entity = mockEntity('e1', [movement]); // no Transform component
    const world = mockWorld([entity]);

    // Should not throw an error
    expect(() => {
      movementSystem.update(world, 0.1);
    }).not.toThrow();
  });

  test('handles empty world', () => {
    const world = mockWorld([]);

    expect(() => {
      movementSystem.update(world, 0.1);
    }).not.toThrow();
  });
});