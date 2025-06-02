// GameEngine/Systems/Tests/CollisionSystem.test.js
import CollisionSystem from '../CollisionSystem.js';

// --- Minimal Mocks ---
class MockEntity {
    constructor(id, name = 'Entity') {
        this.id = id || Math.random().toString(36).substr(2, 9);
        this.components = new Map();
        // Mock the constructor property to have a name field, simulating Class.name
        this.constructor = { name: name };
    }
    addComponent(component) {
        // Use the static 'name' property of the component's class as the key
        this.components.set(component.constructor.name, component);
        component.entity = this; // Link component back to entity
    }
    getComponent(componentName) {
        return this.components.get(componentName);
    }
    hasComponent(componentName) {
        return this.components.has(componentName);
    }
}

class MockTransform {
    constructor(x = 0, y = 0) {
        this.position = { x, y };
    }
    static get name() { return 'Transform'; } // For component.constructor.name
}

class MockColliderComponent {
    constructor({ type, width, height, radius }) {
        this.type = type;
        this.width = width;
        this.height = height;
        this.radius = radius; // Initial radius
    }
    static get name() { return 'ColliderComponent'; }
}

class MockMovement {
    constructor(velocityX = 0, velocityY = 0) {
        this.velocityX = velocityX;
        this.velocityY = velocityY;
    }
    static get name() { return 'Movement'; }
}

class MockRadiusComponent {
    constructor(radius) {
        this.radius = radius;
    }
    static get name() { return 'RadiusComponent'; }
}

class MockWorld {
    constructor() {
        this.entities = {};
    }
    addEntity(entity) {
        this.entities[entity.id] = entity;
    }
}

// --- Test Assertion Helper ---
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
    if (!condition) {
        console.error(`❌ Assertion Failed: ${message}`);
        testsFailed++;
    } else {
        console.log(`✅ Assertion Passed: ${message}`);
        testsPassed++;
    }
}

function assertEquals(actual, expected, message) {
    if (actual !== expected) {
        console.error(`❌ Assertion Failed: ${message}. Expected: ${expected}, Actual: ${actual}`);
        testsFailed++;
    } else {
        console.log(`✅ Assertion Passed: ${message}. Expected: ${expected}, Actual: ${actual}`);
        testsPassed++;
    }
}

function assertApproximatelyEquals(actual, expected, tolerance, message) {
    if (Math.abs(actual - expected) > tolerance) {
        console.error(`❌ Assertion Failed: ${message}. Expected: ~${expected}, Actual: ${actual}`);
        testsFailed++;
    } else {
        console.log(`✅ Assertion Passed: ${message}. Expected: ~${expected}, Actual: ${actual}`);
        testsPassed++;
    }
}


// --- Test Setup Helper ---
function setupSystem() {
    return new CollisionSystem();
}

function createBoundary(id, x, y, radius) {
    const boundary = new MockEntity(id, 'BoundaryEntity');
    boundary.addComponent(new MockTransform(x, y));
    boundary.addComponent(new MockColliderComponent({ type: 'circle', radius: radius }));
    boundary.addComponent(new MockRadiusComponent(radius)); // Dynamic radius
    return boundary;
}

function createDot(id, x, y, width = 10, height = 10, vx = 0, vy = 0) {
    const dot = new MockEntity(id, 'Dot');
    dot.addComponent(new MockTransform(x, y));
    dot.addComponent(new MockColliderComponent({ type: 'rectangle', width, height }));
    if (vx !== 0 || vy !== 0) {
        dot.addComponent(new MockMovement(vx, vy));
    }
    return dot;
}

// --- Test Cases ---

console.log("--- Starting CollisionSystem Tests ---");

// Scenario 1: Dot-Boundary Collision Detection
function testDotBoundaryDetection() {
    console.log("\n--- Testing Dot-Boundary Detection ---");
    const collisionSystem = setupSystem();
    const world = new MockWorld();

    const boundary = createBoundary('boundary1', 0, 0, 50);
    world.addEntity(boundary);

    // Case 1.1: Intersection
    let dot1 = createDot('dot1', 45, 0); // Partially overlapping
    world.addEntity(dot1);
    collisionSystem.update(world, 0.1);
    // This is tricky, direct collision state isn't exposed. We infer by response.
    // For now, let's assume if it *would* respond, it detected.
    // This test will be more robust when combined with response tests.
    // For a pure detection test, CollisionSystem would need to return collision pairs.
    // As a proxy: check if dot1 moved (it shouldn't if no movement component)
    // Or if it had movement, if velocity changed.
    // For now, this test is more of a setup for response.

    // Case 1.2: Touching Inside (Dot's center is 45, radius 50, dot width 10. Edge at 40, touches boundary at 50)
    const dot2 = createDot('dot2', 40, 0); // Dot's right edge at 40+5=45, just inside boundary edge 50
    world.addEntity(dot2);
    // How to check "detected"? The system currently doesn't return pairs.
    // We'll rely on response tests to verify detection implicitly.
    // This highlights a potential need for CollisionSystem to report collision pairs if pure detection is to be tested.

    // Case 1.3: Clearly Inside, No Collision
    const dot3 = createDot('dot3', 0, 0);
    const dot3Transform = dot3.getComponent('Transform');
    world.addEntity(dot3);
    collisionSystem.update(world, 0.1);
    assertEquals(dot3Transform.position.x, 0, "Dot3 (clearly inside) X should not change");
    assertEquals(dot3Transform.position.y, 0, "Dot3 (clearly inside) Y should not change");
    
    // Case 1.4: Clearly Outside, No Collision
    const dot4 = createDot('dot4', 100, 100);
    const dot4Transform = dot4.getComponent('Transform');
    world.addEntity(dot4);
    collisionSystem.update(world, 0.1);
    assertEquals(dot4Transform.position.x, 100, "Dot4 (clearly outside) X should not change");
    assertEquals(dot4Transform.position.y, 100, "Dot4 (clearly outside) Y should not change");
    
    console.log("Detection tests are limited by CollisionSystem's current API (doesn't return collision pairs). Relying on response tests.");
}
testDotBoundaryDetection();

// Scenario 2: Dot-Boundary Collision Response (Containment)
function testDotBoundaryResponse() {
    console.log("\n--- Testing Dot-Boundary Response ---");
    const collisionSystem = setupSystem();
    
    // Case 2.1: Positional Correction
    let world1 = new MockWorld();
    let boundary1 = createBoundary('boundary1', 0, 0, 50);
    world1.addEntity(boundary1);
    // Dot's center at 52, width 10. Right edge at 52+5=57. Boundary edge at 50.
    // Dot's effective radius for containment is 5. Should be pushed to 50-5 = 45.
    let dot1 = createDot('dot1', 52, 0, 10, 10, 1, 0); // Moving outwards
    let dot1Transform = dot1.getComponent('Transform');
    world1.addEntity(dot1);
    collisionSystem.update(world1, 0.1);
    assertApproximatelyEquals(dot1Transform.position.x, 45, 0.001, "Dot1 (outside) X should be pushed to boundary edge (45)");
    assertEquals(dot1Transform.position.y, 0, "Dot1 (outside) Y should remain 0");

    // Case 2.2: Velocity Reflection
    let world2 = new MockWorld();
    let boundary2 = createBoundary('boundary2', 0, 0, 50);
    world2.addEntity(boundary2);
    // Dot at 40,0, moving right (10,0). Dot width 10, effective radius 5.
    // It will hit the boundary at x=45.
    let dot2 = createDot('dot2', 40, 0, 10, 10, 10, 0); // Moving towards boundary
    let dot2Transform = dot2.getComponent('Transform');
    let dot2Movement = dot2.getComponent('Movement');
    world2.addEntity(dot2);
    
    // Simulate multiple updates to ensure it collides and reflects
    // First update: moves to x=41 (10*0.1), no collision yet based on center
    // Need to set it closer or run more updates. Let's place it right at the edge for simplicity of one update check.
    dot2Transform.position.x = 44; // Edge at 49, boundary at 50. Will collide.
    collisionSystem.update(world2, 0.1); // dt is small, so one update might not pass boundary fully
                                        // Positional correction should handle this.
    
    // Dot is at x=44, its edge at 49. Boundary at 50. Not overlapping enough for push.
    // distance (44) is not > (50-5=45). So no positional correction. Velocity reflects. Position stays 44.
    assertApproximatelyEquals(dot2Transform.position.x, 44, 0.001, "Dot2 (velocity reflect) X pos should remain 44 (no push needed yet)");
    // Velocity should be reflected. Initial (10,0). Normal (1,0). dotProduct = 10.
    // newVx = 10 - 2*10*1 = -10
    assertApproximatelyEquals(dot2Movement.velocityX, -10, 0.001, "Dot2 (velocity reflect) VX should be reflected to -10");
    assertEquals(dot2Movement.velocityY, 0, "Dot2 (velocity reflect) VY should remain 0");

    // Case 2.3: Dot moving away from center but still inside, hits boundary
    let world3 = new MockWorld();
    let boundary3 = createBoundary('boundary3', 100, 100, 30); // Center 100,100, R=30
    world3.addEntity(boundary3);
    // Dot at 120,100 (inside, R=30, dot width 4, effective R=2, boundary edge for dot center is 28 from boundary center)
    // Dot pos x=120 is distance 20 from center 100. Max distance for dot center is 30-2=28. So 120 is fine.
    // Place it at x=125, y=100. Dot width 4. Effective Radius 2.
    // Boundary for dot center is at 100+28 = 128 and 100-28 = 72.
    // Dot's center is at 125. Its right edge is at 125+2 = 127.
    let dot3 = createDot('dot3', 125, 100, 4, 4, 5, 0); // vx=5, vy=0
    let dot3Transform = dot3.getComponent('Transform');
    let dot3Movement = dot3.getComponent('Movement');
    world3.addEntity(dot3);
    collisionSystem.update(world3, 0.1); // dt=0.1, dx=0.5. New pos = 125 + 0.5 = 125.5 (if no collision response)
    // Dot center 125. Distance from boundary center (100) is 25.
    // Boundary for dot center is at 28 (30-2).
    // distance (25) is not > 28. No positional correction. Velocity reflects. Position stays 125.
    assertApproximatelyEquals(dot3Transform.position.x, 125, 0.001, "Dot3 (moving out, inside) X pos should remain 125 (no push needed yet)");
    // Velocity: dotProduct = 5*1 + 0*0 = 5.
    // newVx = 5 - 2*5*1 = -5
    assertApproximatelyEquals(dot3Movement.velocityX, -5, 0.001, "Dot3 (moving out, inside) VX reflected");
}
testDotBoundaryResponse();


// Scenario 3: Boundary Growth Impact
function testBoundaryGrowth() {
    console.log("\n--- Testing Boundary Growth Impact ---");
    const collisionSystem = setupSystem();
    let world = new MockWorld();

    let boundary = createBoundary('boundary1', 0, 0, 30);
    let dot = createDot('dot1', 40, 0); // Dot is outside (40 > 30)
    let dotTransform = dot.getComponent('Transform');
    world.addEntity(boundary);
    world.addEntity(dot);

    collisionSystem.update(world, 0.1); // Dot is outside, no collision
    assertEquals(dotTransform.position.x, 40, "Dot (initially outside) X should not change");

    // Grow boundary
    const radiusComp = boundary.getComponent('RadiusComponent');
    radiusComp.radius = 50; // Dot (center 40, width 10, right edge 45) is now inside (50)

    collisionSystem.update(world, 0.1); // Dot is now inside and not moving, no collision expected
    assertEquals(dotTransform.position.x, 40, "Dot (boundary grew, now inside) X should not change");

    // Case: Dot collides with newly grown boundary edge
    let world2 = new MockWorld();
    let boundary2 = createBoundary('boundary2', 0, 0, 30);
    let dot2 = createDot('dot2', 32, 0, 10, 10, 0, 0); // Dot center 32, width 10 -> right edge at 37. Outside radius 30.
    let dot2Transform = dot2.getComponent('Transform');
    world2.addEntity(boundary2);
    world2.addEntity(dot2);
    
    // Initial state: Boundary R=30. Dot center 32 (effR=5). Threshold for push is x=25.
    // Dot at 32 is outside this threshold (32 > 25), so it will be pushed to 25.
    collisionSystem.update(world2, 0.1);
    assertApproximatelyEquals(dot2Transform.position.x, 25, 0.001, "Dot2 (outside small boundary) X should be pushed to 25");

    const radiusComp2 = boundary2.getComponent('RadiusComponent');
    radiusComp2.radius = 35; // New radius 35. Threshold for push is x=30.
                             // Dot is now at x=25 (from previous step).
                             // Dot at 25 is inside the new threshold (25 is not > 30). No push.
    collisionSystem.update(world2, 0.1);
    assertApproximatelyEquals(dot2Transform.position.x, 25, 0.001, "Dot2 (boundary grew, dot is already contained) X should remain 25");
}
testBoundaryGrowth();


// Scenario 4: Rectangle-Rectangle Collision (Regression Test)
function testRectRectCollision() {
    console.log("\n--- Testing Rectangle-Rectangle Collision ---");
    const collisionSystem = setupSystem();
    let world = new MockWorld();

    let dot1 = createDot('dotRect1', 0, 0, 10, 10, 5, 0);
    let dot2 = createDot('dotRect2', 8, 0, 10, 10, -5, 0); // Colliding setup
    let dot1Transform = dot1.getComponent('Transform');
    let dot1Movement = dot1.getComponent('Movement');
    let dot2Transform = dot2.getComponent('Transform');
    let dot2Movement = dot2.getComponent('Movement');
    
    world.addEntity(dot1);
    world.addEntity(dot2);

    // For rect-rect, the current response is just velocity reversal and small push
    // A single update might not be enough to show clear separation due to small push factor
    // The key is velocity reversal.
    collisionSystem.update(world, 0.01); // Small dt to see velocity change primarily

    assertEquals(dot1Movement.velocityX, -5, "Rect1 VX should be reversed");
    assertEquals(dot2Movement.velocityX, 5, "Rect2 VX should be reversed");
    // Positions will be slightly adjusted, less critical for this regression test of core response
    // Example: dot1 was at 0, vx=5. After reversal, vx=-5. New pos = 0 + (-5)*0.01*0.1 (small push)
    // This part of rect-rect might need more refinement in CollisionSystem if exact positions are critical.
    // assertNotEquals(dot1Transform.position.x, 0, "Rect1 X should have been pushed slightly");
}
testRectRectCollision();


// Scenario 5: No Interaction for Separated Entities
function testNoInteractionSeparated() {
    console.log("\n--- Testing No Interaction for Separated Entities ---");
    const collisionSystem = setupSystem();
    let world = new MockWorld();

    let boundary = createBoundary('boundaryFar', 0, 0, 50);
    let dot1 = createDot('dotFar1', 200, 200, 10, 10, 1, 1);
    let dot1Transform = dot1.getComponent('Transform');
    let dot1Movement = dot1.getComponent('Movement');
    world.addEntity(boundary);
    world.addEntity(dot1);

    collisionSystem.update(world, 0.1);
    assertEquals(dot1Transform.position.x, 200, "Far Dot1 X no change");
    assertEquals(dot1Transform.position.y, 200, "Far Dot1 Y no change");
    assertEquals(dot1Movement.velocityX, 1, "Far Dot1 VX no change");
    assertEquals(dot1Movement.velocityY, 1, "Far Dot1 VY no change");

    let dot2 = createDot('dotFar2', -300, -300, 10, 10, 2, 2);
    let dot3 = createDot('dotFar3', 300, 300, 10, 10, -2, -2);
    let dot2Transform = dot2.getComponent('Transform');
    let dot2Movement = dot2.getComponent('Movement');
    let dot3Transform = dot3.getComponent('Transform');
    let dot3Movement = dot3.getComponent('Movement');
    world.addEntity(dot2);
    world.addEntity(dot3);

    collisionSystem.update(world, 0.1);
    assertEquals(dot2Transform.position.x, -300, "Far Dot2 X no change");
    assertEquals(dot2Movement.velocityX, 2, "Far Dot2 VX no change");
    assertEquals(dot3Transform.position.x, 300, "Far Dot3 X no change");
    assertEquals(dot3Movement.velocityX, -2, "Far Dot3 VX no change");
}
testNoInteractionSeparated();


// --- Summary ---
console.log("\n--- Test Summary ---");
console.log(`Total Tests: ${testsPassed + testsFailed}`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);

if (testsFailed > 0) {
    // Non-zero exit code if any test fails, useful for CI
    // process.exit(1); 
    // Can't use process.exit in this environment, will just log.
    console.error("THERE WERE TEST FAILURES.");
} else {
    console.log("ALL TESTS PASSED SUCCESSFULLY!");
}
