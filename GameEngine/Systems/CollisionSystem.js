import Movement from '../Components/Movement.js';

/**
 * @class CollisionSystem
 * @description Handles collision detection and response between entities.
 */
export default class CollisionSystem {
  /**
   * @method update
   * @param {World} world - The game world containing all entities.
   * @param {number} dt - The delta time since the last update, in seconds.
   */
  update(world, dt) {
    const entities = Object.values(world.entities);

    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entityA = entities[i];
        const entityB = entities[j];

        // Check for required components
        if (
          entityA.hasComponent('Transform') &&
          entityA.hasComponent('ColliderComponent') &&
          entityB.hasComponent('Transform') &&
          entityB.hasComponent('ColliderComponent')
        ) {
          const transformA = entityA.getComponent('Transform');
          const colliderA = entityA.getComponent('ColliderComponent');
          const transformB = entityB.getComponent('Transform');
          const colliderB = entityB.getComponent('ColliderComponent');

          // Assume rectangle vs. rectangle collision for now
          if (colliderA.type === 'rectangle' && colliderB.type === 'rectangle') {
            // Calculate bounding boxes (assuming origin is center)
            const leftA = transformA.position.x - colliderA.width / 2;
            const rightA = transformA.position.x + colliderA.width / 2;
            const topA = transformA.position.y - colliderA.height / 2;
            const bottomA = transformA.position.y + colliderA.height / 2;

            const leftB = transformB.position.x - colliderB.width / 2;
            const rightB = transformB.position.x + colliderB.width / 2;
            const topB = transformB.position.y - colliderB.height / 2;
            const bottomB = transformB.position.y + colliderB.height / 2;

            // Perform intersection test
            const haveCollided =
              leftA < rightB &&
              rightA > leftB &&
              topA < bottomB &&
              bottomA > topB;

            if (haveCollided) {
              // console.log(`Collision detected between ${entityA.id} and ${entityB.id}`);

              const movementA = entityA.hasComponent('Movement') ? entityA.getComponent('Movement') : null;
              const movementB = entityB.hasComponent('Movement') ? entityB.getComponent('Movement') : null;

              if (movementA) {
                movementA.velocityX *= -1;
                movementA.velocityY *= -1;
              }
              if (movementB) {
                movementB.velocityX *= -1;
                movementB.velocityY *= -1;
              }

              // Basic positional correction if both have movement components
              if (movementA && movementB && dt > 0) { // dt > 0 to prevent division by zero or NaN issues if dt is 0
                // Move entityA back slightly along its new (reversed) velocity vector
                // This is a simplified approach.
                transformA.position.x += movementA.velocityX * dt; // Using new velocity to move out
                transformA.position.y += movementA.velocityY * dt;
                
                // Optionally, do the same for entityB if they are still overlapping
                // For simplicity, just moving one entity might be enough to resolve immediate sticking
                // or move both by half the overlap if calculated.
                // For now, just moving A is a start. If B also moved by its new velocity * dt,
                // they would just pass through each other in the next frame.
                // A better correction would involve calculating overlap and separating them by that amount.
              }
            }
          }
        }
      }
    }
  }
}
