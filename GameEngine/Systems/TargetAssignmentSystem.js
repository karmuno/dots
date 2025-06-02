class TargetAssignmentSystem {
  update(world, dt) {
    // Iterate over all entities in the world
    for (const entity of Object.values(world.entities)) {
      // Check if the entity has the required components
      if (entity.hasComponent('Movement') && entity.hasComponent('Transform')) {
        const movement = entity.getComponent('Movement');
        // const transform = entity.getComponent('Transform'); // Not strictly needed for target assignment logic as described

        // Check if the entity has reached its target or needs an initial target
        // An entity is considered to have reached its target if its speed is negligible.
        // Also, assign a target if targetX and targetY are at their initial (0,0) or undefined state.
        const needsNewTarget =
          (Math.abs(movement.currentSpeedX) < 0.1 && Math.abs(movement.currentSpeedY) < 0.1) ||
          (movement.targetX === 0 && movement.targetY === 0); // Assuming (0,0) is the initial/unassigned state

        if (needsNewTarget) {
          movement.targetX = Math.random() * 800;
          movement.targetY = Math.random() * 600;
          // console.log(`Entity ${entity.id} assigned new target: (${movement.targetX.toFixed(2)}, ${movement.targetY.toFixed(2)})`);
        }
      }
    }
  }
}

export default TargetAssignmentSystem;
