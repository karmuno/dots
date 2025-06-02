import MovementSystem from '../MovementSystem.js'; // Adjust path as necessary
import Transform from '../../Components/Transform.js'; // Assuming this is the real component path
import Movement from '../../Components/Movement.js';   // Assuming this is the real component path

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

// Helper for Movement component
const createMovement = (
  velocityX = 0, velocityY = 0,
  targetX = 0, targetY = 0,
  speed = 100, acceleration = 200,
  currentSpeedX = undefined, currentSpeedY = undefined // Allow undefined to use constructor defaults
) => {
  // If currentSpeedX/Y are undefined, the Movement constructor should use velocityX/Y
  const mov = new Movement(velocityX, velocityY, targetX, targetY, speed, acceleration);
  if (currentSpeedX !== undefined) mov.currentSpeedX = currentSpeedX;
  if (currentSpeedY !== undefined) mov.currentSpeedY = currentSpeedY;
  return mov;
};


describe('MovementSystem', () => {
  let movementSystem;

  beforeEach(() => {
    movementSystem = new MovementSystem();
  });

  test('entity moves towards target', () => {
    const transform = createTransform(0, 0);
    const movement = createMovement(0, 0, 100, 0, 10, 1000); // High acceleration
    const entity = mockEntity('e1', [transform, movement]);
    const world = mockWorld([entity]);

    // Initial state
    expect(transform.position.x).toBe(0);
    expect(transform.position.y).toBe(0);

    movementSystem.update(world, 0.1); // dt = 0.1s

    // Position should change
    expect(transform.position.x).toBeGreaterThan(0); // Moved towards target
    expect(transform.position.y).toBe(0); // No Y movement
    expect(movement.currentSpeedX).toBe(10); // Should reach max speed quickly

    // Simulate a few more steps
    for (let i = 0; i < 5; i++) {
      movementSystem.update(world, 0.1);
    }
    // x = 0 + 10*0.1 (initial step) + 5 * (10*0.1) = 1 + 5 = 6
    // currentSpeedX should be 10 (max speed)
    // position.x = prev_pos + currentSpeedX * dt
    // Step 1: x = 0 + 10 * 0.1 = 1
    // Step 2: x = 1 + 10 * 0.1 = 2
    // ... Step 6: x = 5 + 10 * 0.1 = 6
    expect(transform.position.x).toBeCloseTo(1 + 5 * 1); // 1 initial from first update, then 5 more
    expect(transform.position.y).toBe(0);
    expect(movement.currentSpeedX).toBe(10); // Still at max speed
  });

  test('acceleration works correctly and currentSpeed caps at speed', () => {
    const transform = createTransform(0, 0);
    // Target far away, low acceleration, high max speed
    const movement = createMovement(0, 0, 1000, 0, 100, 10);
    const entity = mockEntity('e1', [transform, movement]);
    const world = mockWorld([entity]);
    const dt = 1.0;

    // Frame 1
    movementSystem.update(world, dt);
    expect(movement.currentSpeedX).toBeCloseTo(10); // 0 + 10 * 1
    expect(transform.position.x).toBeCloseTo(10);   // 0 + 10 * 1

    // Frame 2
    movementSystem.update(world, dt);
    expect(movement.currentSpeedX).toBeCloseTo(20); // 10 + 10 * 1
    expect(transform.position.x).toBeCloseTo(10 + 20); // 10 (prev_pos) + 20 * 1 = 30

    // Accelerate up to max speed (100)
    // Takes 10 frames total to reach 100 speed at 10 accel
    // We've done 2 frames, 8 more needed.
    for (let i = 0; i < 8; i++) {
      movementSystem.update(world, dt);
    }
    expect(movement.currentSpeedX).toBeCloseTo(100); // Max speed
    // Position after 10s: sum of speeds 10,20,30..100 = 10*(10+1)/2 * 10 = 550. No, this is wrong.
    // Pos: 10 (f1) + 20 (f2) + 30 (f3) + ... + 100 (f10)
    // x_final = x_initial + v_0*t + 0.5*a*t^2 (if accel is constant and not capped by currentSpeed calculation)
    // Our system: v_new = v_old + a*dt. x_new = x_old + v_new*dt
    // f1: v=10, x=10
    // f2: v=20, x=10+20=30
    // f3: v=30, x=30+30=60
    // f4: v=40, x=60+40=100
    // f5: v=50, x=100+50=150
    // f6: v=60, x=150+60=210
    // f7: v=70, x=210+70=280
    // f8: v=80, x=280+80=360
    // f9: v=90, x=360+90=450
    // f10: v=100, x=450+100=550
    expect(transform.position.x).toBeCloseTo(550);


    // Frame 11 - speed should remain capped
    movementSystem.update(world, dt);
    expect(movement.currentSpeedX).toBeCloseTo(100); // Still 100 (max speed)
    expect(transform.position.x).toBeCloseTo(550 + 100); // 550 + 100 * 1 = 650
  });

  test('entity stops at target', () => {
    const transform = createTransform(99, 0);
    const movement = createMovement(0, 0, 100, 0, 10, 100); // speed 10, accel 100
    const entity = mockEntity('e1', [transform, movement]);
    const world = mockWorld([entity]);
    const dt = 0.05; // Small dt to not overshoot too much in one step

    // Entity is 1 unit away. Speed is 10. Accel is 100.
    // Target speed towards target is 10. Current speed is 0.
    // Accel applied: min(100 * 0.05, abs(10-0)) = min(5, 10) = 5.
    // currentSpeedX becomes 0 + 5 = 5.
    // position.x becomes 99 + 5 * 0.05 = 99 + 0.25 = 99.25

    movementSystem.update(world, dt);
    expect(movement.currentSpeedX).toBe(5);
    expect(transform.position.x).toBeCloseTo(99.25);

    // Next step: diffX = 100 - 99.25 = 0.75. Distance = 0.75
    // TargetSpeedX = (0.75 / 0.75) * 10 = 10.
    // Accel needed: 10 - 5 = 5.
    // Accel applied: min(100 * 0.05, 5) = min(5, 5) = 5.
    // currentSpeedX becomes 5 + 5 = 10.
    // position.x becomes 99.25 + 10 * 0.05 = 99.25 + 0.5 = 99.75
    movementSystem.update(world, dt);
    expect(movement.currentSpeedX).toBe(10);
    expect(transform.position.x).toBeCloseTo(99.75);

    // Next step: diffX = 100 - 99.75 = 0.25. Distance = 0.25
    // TargetSpeedX = 10.
    // Accel needed: 10 - 10 = 0.
    // Accel applied: 0.
    // currentSpeedX remains 10.
    // position.x becomes 99.75 + 10 * 0.05 = 99.75 + 0.5 = 100.25
    // Oops, it overshot. The system should stop it if distance < 1.
    // The current logic: if distance < 1, speed becomes 0.
    // In the previous step, distance was 0.25, which IS < 1.
    // So, currentSpeedX and currentSpeedY should have been set to 0.
    // Let's re-evaluate based on the actual code logic in MovementSystem.

    // Reset and re-test "stops at target" carefully
    transform.position.x = 99; // Reset position
    transform.position.y = 0;
    movement.currentSpeedX = 0; // Reset speed
    movement.currentSpeedY = 0;

    // Frame 1: Start at 99, target 100. speed=10, accel=100, dt=0.05
    // diffX = 1. distance = 1. (This is not < 1, so normal update)
    // normX = 1. targetSpeedX = 1*10 = 10.
    // accelX_needed = 10 - 0 = 10.
    // actualAccel = 100 * 0.05 = 5.
    // accelX_to_apply = min(10, 5) = 5. (No, it's not min, it's scaled if accelMagnitude > actualAccel. Here, 10 > 5, so accelX becomes 5)
    // This part was:
    //   let accelX = targetSpeedX - movement.currentSpeedX; // 10
    //   const accelMagnitude = Math.sqrt(accelX * accelX); // 10
    //   const actualAccelVal = movement.acceleration * dt; // 5
    //   if (accelMagnitude > actualAccelVal) { accelX = (accelX / accelMagnitude) * actualAccelVal; } // accelX = (10/10)*5 = 5
    movement.currentSpeedX += 5; // currentSpeedX = 5
    // Speed clamping: currentSpeedMagnitude = 5. movement.speed = 10. No clamping.
    // transform.position.x = 99 + 5 * 0.05 = 99.25.
    movementSystem.update(world, dt);
    expect(transform.position.x).toBeCloseTo(99.25);
    expect(movement.currentSpeedX).toBeCloseTo(5);

    // Frame 2: Start at 99.25, target 100. currentSpeedX = 5.
    // diffX = 0.75. distance = 0.75. (This IS < 1)
    // So, movement.currentSpeedX and currentSpeedY should become 0.
    // And position update will use these zero speeds.
    // transform.position.x = 99.25 + 0 * 0.05 = 99.25
    movementSystem.update(world, dt);
    expect(movement.currentSpeedX).toBe(0);
    expect(movement.currentSpeedY).toBe(0);
    expect(transform.position.x).toBeCloseTo(99.25); // Position stops updating

    // Frame 3: Should remain stopped
    movementSystem.update(world, dt);
    expect(movement.currentSpeedX).toBe(0);
    expect(movement.currentSpeedY).toBe(0);
    expect(transform.position.x).toBeCloseTo(99.25);
  });

  test('speed clamping works correctly', () => {
    const transform = createTransform(0, 0);
    // High acceleration, target far, speed limit 50
    const movement = createMovement(0, 0, 1000, 0, 50, 1000);
    const entity = mockEntity('e1', [transform, movement]);
    const world = mockWorld([entity]);
    const dt = 0.1; // dt=0.1s. Max accel this frame = 1000 * 0.1 = 100

    // Frame 1
    // TargetSpeedX is normX * 50 = 1 * 50 = 50.
    // currentSpeedX is 0.
    // accelX_needed = 50 - 0 = 50.
    // actualAccelVal (max accel this frame) = 1000 * 0.1 = 100.
    // Since accelMagnitude (50) is not > actualAccelVal (100), accelX_to_apply is 50.
    // movement.currentSpeedX becomes 0 + 50 = 50.
    // Speed clamping: currentSpeedMagnitude is 50. movement.speed is 50. No change due to clamping.
    // transform.position.x = 0 + 50 * 0.1 = 5.
    movementSystem.update(world, dt);
    expect(movement.currentSpeedX).toBeCloseTo(50);
    expect(transform.position.x).toBeCloseTo(5);

    // Frame 2: Current speed is already 50 (max).
    // TargetSpeedX is 50. currentSpeedX is 50.
    // accelX_needed = 50 - 50 = 0.
    // accelX_to_apply = 0.
    // movement.currentSpeedX remains 50.
    // transform.position.x = 5 + 50 * 0.1 = 10.
    movementSystem.update(world, dt);
    expect(movement.currentSpeedX).toBeCloseTo(50); // Still clamped at 50
    expect(transform.position.x).toBeCloseTo(10); // 5 (prev_pos) + 50 * 0.1
  });

  test('entity moves diagonally and stops', () => {
    const transform = createTransform(0, 0);
    // Target 30, 40 (distance 50). Speed 10. Accel 100.
    const movement = createMovement(0, 0, 30, 40, 10, 100);
    const entity = mockEntity('e1', [transform, movement]);
    const world = mockWorld([entity]);
    const dt = 0.1;

    // Expected normX = 30/50 = 0.6, normY = 40/50 = 0.8
    // TargetSpeedX = 0.6 * 10 = 6. TargetSpeedY = 0.8 * 10 = 8.

    // Frame 1: currentSpeed is (0,0)
    // Accel needed: (6,8). Magnitude is 10.
    // Max accel this frame: 100 * 0.1 = 10.
    // Accel to apply is (6,8) because magnitude 10 is not > 10.
    // currentSpeed becomes (6,8).
    // Position update: x = 0 + 6*0.1 = 0.6. y = 0 + 8*0.1 = 0.8
    movementSystem.update(world, dt);
    expect(movement.currentSpeedX).toBeCloseTo(6);
    expect(movement.currentSpeedY).toBeCloseTo(8);
    expect(transform.position.x).toBeCloseTo(0.6);
    expect(transform.position.y).toBeCloseTo(0.8);

    // Frame 2: currentSpeed is (6,8). TargetSpeed is (6,8).
    // Accel needed is (0,0).
    // currentSpeed remains (6,8).
    // Position update: x = 0.6 + 6*0.1 = 1.2. y = 0.8 + 8*0.1 = 1.6
    movementSystem.update(world, dt);
    expect(movement.currentSpeedX).toBeCloseTo(6);
    expect(movement.currentSpeedY).toBeCloseTo(8);
    expect(transform.position.x).toBeCloseTo(1.2);
    expect(transform.position.y).toBeCloseTo(1.6);

    // Keep updating until target is reached
    // Target is (30,40). Current position (1.2, 1.6)
    // Each step adds (0.6, 0.8) to position as currentSpeed is (6,8) and dt is 0.1
    // Number of steps from (0,0) to reach (30,40) at speed 10 (distance 50) is 50 / (10*dt*steps_per_second)
    // Distance per step = sqrt(0.6^2 + 0.8^2) = sqrt(0.36+0.64) = sqrt(1) = 1.
    // Total steps to cover distance 50 is 50 steps.
    // We have done 2 steps. 48 more steps.
    for (let i = 0; i < 48; i++) {
      movementSystem.update(world, dt);
    }
    // Position should be 1.2 + 48*0.6 = 1.2 + 28.8 = 30
    // Position should be 1.6 + 48*0.8 = 1.6 + 38.4 = 40
    expect(transform.position.x).toBeCloseTo(30.0);
    expect(transform.position.y).toBeCloseTo(40.0);
    expect(movement.currentSpeedX).toBeCloseTo(6); // Still moving at full speed just before arrival check
    expect(movement.currentSpeedY).toBeCloseTo(8);

    // Next update: distance to target (30,40) from (30,40) is 0.
    // This is < 1. So speeds should become 0.
    movementSystem.update(world, dt);
    expect(movement.currentSpeedX).toBe(0);
    expect(movement.currentSpeedY).toBe(0);
    expect(transform.position.x).toBeCloseTo(30.0); // Stays at target
    expect(transform.position.y).toBeCloseTo(40.0); // Stays at target
  });
});
