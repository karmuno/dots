class MovementSystem {
  update(world, dt) {
    // Iterate over all entities in the world
    for (const entity of Object.values(world.entities)) {
      // Check if the entity has the required components
      // We'll use strings for component names as defined in Entity.js
      if (entity.hasComponent('Transform') && entity.hasComponent('Movement')) {
        const transform = entity.getComponent('Transform');
        const movement = entity.getComponent('Movement');

        // Actual movement logic
        transform.position.x += movement.velocityX * dt;
        transform.position.y += movement.velocityY * dt;
      }
    }
  }
}

export default MovementSystem;
