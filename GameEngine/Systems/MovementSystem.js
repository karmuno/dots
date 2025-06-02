class MovementSystem {
  update(world, dt) {
    // Iterate over all entities in the world
    for (const entity of Object.values(world.entities)) {
      // Check if the entity has the required components
      // We'll use strings for component names as defined in Entity.js
      if (entity.hasComponent('Transform') && entity.hasComponent('Movement')) {
        const transform = entity.getComponent('Transform');
        const movement = entity.getComponent('Movement');

        // Check if entity needs a new target due to collision
        if (movement.needsNewTarget) {
          const angle = Math.random() * 2 * Math.PI;
          const distance = Math.random() * 100;
          movement.targetX = transform.position.x + Math.cos(angle) * distance;
          movement.targetY = transform.position.y + Math.sin(angle) * distance;
          movement.needsNewTarget = false;
        }

        // New movement logic
        const diffX = movement.targetX - transform.position.x;
        const diffY = movement.targetY - transform.position.y;
        const distance = Math.sqrt(diffX * diffX + diffY * diffY);

        if (distance < 1) {
          movement.currentSpeedX = 0;
          movement.currentSpeedY = 0;
          // Optionally, snap to target or mark as arrived
          // transform.position.x = movement.targetX;
          // transform.position.y = movement.targetY;
        } else {
          const normX = diffX / distance;
          const normY = diffY / distance;

          const targetSpeedX = normX * movement.speed;
          const targetSpeedY = normY * movement.speed;

          let accelX = targetSpeedX - movement.currentSpeedX;
          let accelY = targetSpeedY - movement.currentSpeedY;

          const accelMagnitude = Math.sqrt(accelX * accelX + accelY * accelY);
          const actualAccel = movement.acceleration * dt;

          if (accelMagnitude > actualAccel) {
            accelX = (accelX / accelMagnitude) * actualAccel;
            accelY = (accelY / accelMagnitude) * actualAccel;
          }

          movement.currentSpeedX += accelX;
          movement.currentSpeedY += accelY;

          // Clamp speed to maximum speed
          const currentSpeedMagnitude = Math.sqrt(movement.currentSpeedX * movement.currentSpeedX + movement.currentSpeedY * movement.currentSpeedY);
          if (currentSpeedMagnitude > movement.speed) {
            movement.currentSpeedX = (movement.currentSpeedX / currentSpeedMagnitude) * movement.speed;
            movement.currentSpeedY = (movement.currentSpeedY / currentSpeedMagnitude) * movement.speed;
          }
        }

        transform.position.x += movement.currentSpeedX * dt;
        transform.position.y += movement.currentSpeedY * dt;
      }
    }
  }
}

export default MovementSystem;
