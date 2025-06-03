// GameEngine/Core/Tests/Entity.test.js
import Entity from '../Entity.js';
import Component from '../Component.js';

class TestComponent extends Component {
  constructor() {
    super();
    this.value = 'test';
  }
}

class AnotherTestComponent extends Component {
  constructor() {
    super();
    this.anotherValue = 123;
  }
}

describe('Entity', () => {
  test('Entity IDs should be unique', () => {
    const entity1 = new Entity();
    const entity2 = new Entity();
    expect(entity1.id).not.toBe(entity2.id);
  });

  test('should add and check for a component', () => {
    const entity = new Entity();
    entity.addComponent(new TestComponent());
    expect(entity.hasComponent('TestComponent')).toBe(true);
  });

  // Test 3: getComponent
  // Note: entity1 from previous test structure is not available here.
  // Each test should be self-contained or use beforeEach for setup.
  // For this refactor, I will adapt Test 3 to be self-contained.
  test('should retrieve a component and its data', () => {
    const entityForTest3 = new Entity();
    entityForTest3.addComponent(new TestComponent());
    const retrievedComponent = entityForTest3.getComponent('TestComponent');
    expect(retrievedComponent).toBeInstanceOf(TestComponent);
    expect(retrievedComponent.value).toBe('test');
  });

  // Test 4: removeComponent
  // Adapting Test 4 similarly
  test('should remove a component', () => {
    const entityForTest4 = new Entity();
    entityForTest4.addComponent(new TestComponent());
    entityForTest4.removeComponent('TestComponent');
    expect(entityForTest4.hasComponent('TestComponent')).toBe(false);
  });

  // Test 5: getComponent for non-existent component
  test('getComponent for non-existent component should return undefined', () => {
    const entityForTest5 = new Entity();
    const nonExistent = entityForTest5.getComponent('NonExistentComponent');
    expect(nonExistent).toBeUndefined();
  });

  // Test 6: Adding multiple components
  test('should add and retrieve multiple components', () => {
    const entityForTest6 = new Entity();
    entityForTest6.addComponent(new TestComponent());
    entityForTest6.addComponent(new AnotherTestComponent());
    expect(entityForTest6.hasComponent('TestComponent')).toBe(true);
    expect(entityForTest6.hasComponent('AnotherTestComponent')).toBe(true);
    expect(entityForTest6.getComponent('AnotherTestComponent').anotherValue).toBe(123);
  });
});
// Old test logs and structure will be removed below.
// Test 3: getComponent
const retrievedComponent = new Entity().getComponent('TestComponent'); // This line is problematic and will be removed.
