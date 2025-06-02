// GameEngine/Core/Tests/World.test.js
const World = require('../World');
// Entity is used by World, but we might not need to require it directly in tests if World's methods are black-boxed
// However, for verification (like checking instance type), it can be useful.
const Entity = require('../Entity');

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
    // console.log(`TestSystem update called. World entities: ${Object.keys(world.entities).length}, dt: ${dt}`);
  }
}

console.log('Running World Tests...');
const world = new World();

// Test 1: createEntity
const entity = world.createEntity();
console.assert(entity instanceof Entity, 'Test Failed: createEntity should return an Entity instance.');
console.assert(world.entities[entity.id] === entity, 'Test Failed: Entity not stored correctly in world.');
console.log('Test 1 Passed: createEntity.');

// Test 2: getEntityById
const retrievedEntity = world.getEntityById(entity.id);
console.assert(retrievedEntity === entity, 'Test Failed: getEntityById did not retrieve the correct entity.');
console.log('Test 2 Passed: getEntityById.');

// Test 3: destroyEntity
const entityId = entity.id;
world.destroyEntity(entityId);
console.assert(typeof world.entities[entityId] === 'undefined', 'Test Failed: Entity not removed by destroyEntity.');
console.assert(typeof world.getEntityById(entityId) === 'undefined', 'Test Failed: getEntityById should return undefined for destroyed entity.');
console.log('Test 3 Passed: destroyEntity.');

// Test 4: addSystem
const testSystem = new TestSystem();
world.addSystem(testSystem);
console.assert(world.systems.includes(testSystem), 'Test Failed: System not added to world.');
console.log('Test 4 Passed: addSystem.');

// Test 5: update calls system.update
world.update(16.67); // Simulate a frame update
console.assert(testSystem.updated, 'Test Failed: System.update was not called by world.update.');
console.assert(testSystem.worldInstance === world, 'Test Failed: World instance not passed correctly to system.update.');
console.assert(testSystem.dtPassed === 16.67, 'Test Failed: Delta time not passed correctly to system.update.');
console.log('Test 5 Passed: update calls system.update correctly.');

// Test 6: removeSystem
world.removeSystem(testSystem);
console.assert(!world.systems.includes(testSystem), 'Test Failed: System not removed from world.');
console.log('Test 6 Passed: removeSystem.');

// Test 7: Update does not fail with no systems
const world2 = new World();
try {
    world2.update(10);
    console.log('Test 7 Passed: world.update with no systems does not crash.');
} catch (e) {
    console.assert(false, `Test Failed: world.update with no systems crashed. ${e}`);
}

// Test 8: Update does not fail with systems that don't have an update method (or it's not a function)
const world3 = new World();
world3.addSystem({}); // System without an update method
world3.addSystem({ update: "not a function" }); // System with update not being a function
try {
    world3.update(10);
    console.log('Test 8 Passed: world.update with invalid systems does not crash.');
} catch (e) {
    console.assert(false, `Test Failed: world.update with invalid systems crashed. ${e}`);
}

console.log('World Tests Finished.');
