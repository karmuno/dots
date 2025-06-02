// GameEngine/Core/Tests/Entity.test.js
const Entity = require('../Entity');
const Component = require('../Component'); // Assuming Component is needed if TestComponent extends it

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

console.log('Running Entity Tests...');

// Test 1: Entity ID uniqueness (simple check for two entities)
const entity1 = new Entity();
const entity2 = new Entity();
console.assert(entity1.id !== entity2.id, 'Test Failed: Entity IDs are not unique.');
console.log('Test 1 Passed: Entity IDs are unique.');

// Test 2: addComponent and hasComponent
entity1.addComponent(new TestComponent());
console.assert(entity1.hasComponent('TestComponent'), 'Test Failed: Entity should have TestComponent after adding.');
console.log('Test 2 Passed: addComponent and hasComponent.');

// Test 3: getComponent
const retrievedComponent = entity1.getComponent('TestComponent');
console.assert(retrievedComponent instanceof TestComponent, 'Test Failed: getComponent should return TestComponent instance.');
console.assert(retrievedComponent.value === 'test', 'Test Failed: TestComponent data not retrieved correctly.');
console.log('Test 3 Passed: getComponent retrieves component and data.');

// Test 4: removeComponent
entity1.removeComponent('TestComponent');
console.assert(!entity1.hasComponent('TestComponent'), 'Test Failed: Entity should not have TestComponent after removing.');
console.log('Test 4 Passed: removeComponent.');

// Test 5: getComponent for non-existent component
const nonExistent = entity1.getComponent('NonExistentComponent');
console.assert(typeof nonExistent === 'undefined', 'Test Failed: getComponent for non-existent should return undefined.');
console.log('Test 5 Passed: getComponent for non-existent component.');

// Test 6: Adding multiple components
entity2.addComponent(new TestComponent());
entity2.addComponent(new AnotherTestComponent());
console.assert(entity2.hasComponent('TestComponent') && entity2.hasComponent('AnotherTestComponent'), 'Test Failed: Entity should have multiple components.');
console.assert(entity2.getComponent('AnotherTestComponent').anotherValue === 123, 'Test Failed: Data from second component incorrect.');
console.log('Test 6 Passed: Adding and retrieving multiple components.');

console.log('Entity Tests Finished.');
