import Movement from '../Components/Movement.js';

// Helper function to clamp a value between a min and max
function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

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

          let haveCollided = false;

          if (colliderA.type === 'rectangle' && colliderB.type === 'rectangle') {
            // RECTANGLE-RECTANGLE COLLISION
            const leftA = transformA.position.x - colliderA.width / 2;
            const rightA = transformA.position.x + colliderA.width / 2;
            const topA = transformA.position.y - colliderA.height / 2;
            const bottomA = transformA.position.y + colliderA.height / 2;

            const leftB = transformB.position.x - colliderB.width / 2;
            const rightB = transformB.position.x + colliderB.width / 2;
            const topB = transformB.position.y - colliderB.height / 2;
            const bottomB = transformB.position.y + colliderB.height / 2;

            haveCollided =
              leftA < rightB &&
              rightA > leftB &&
              topA < bottomB &&
              bottomA > topB;
          } else if (
            (colliderA.type === 'circle' && colliderB.type === 'rectangle') ||
            (colliderA.type === 'rectangle' && colliderB.type === 'circle')
          ) {
            // CIRCLE-RECTANGLE COLLISION
            const circleEntity = colliderA.type === 'circle' ? entityA : entityB;
            const circleCollider = colliderA.type === 'circle' ? colliderA : colliderB;
            const circleTransform = colliderA.type === 'circle' ? transformA : transformB;
            const rectCollider = colliderA.type === 'rectangle' ? colliderA : colliderB;
            const rectTransform = colliderA.type === 'rectangle' ? transformA : transformB;

            const cx = circleTransform.position.x;
            const cy = circleTransform.position.y;

            // Determine effective radius for the circle entity
            const radiusComponentCircle = circleEntity.getComponent('RadiusComponent');
            const r = radiusComponentCircle ? radiusComponentCircle.radius : circleCollider.radius;

            const rx = rectTransform.position.x;
            const ry = rectTransform.position.y;
            const rw = rectCollider.width;
            const rh = rectCollider.height;

            if (circleCollider.fill === false) {
              // Hollow circle collision - only detect when rectangle is trying to go outside
              const distanceFromCenter = Math.sqrt((rx - cx) * (rx - cx) + (ry - cy) * (ry - cy));
              const rectRadius = Math.max(rw, rh) / 2; // Rectangle's effective radius
              
              // Collision occurs when rectangle is trying to go outside the hollow circle
              haveCollided = distanceFromCenter + rectRadius > r;
            } else {
              // Standard filled circle collision
              const closestX = clamp(cx, rx - rw / 2, rx + rw / 2);
              const closestY = clamp(cy, ry - rh / 2, ry + rh / 2);

              const distanceX = cx - closestX;
              const distanceY = cy - closestY;
              const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

              haveCollided = distanceSquared < (r * r);
            }
          }

          if (haveCollided) {
            const isEntityADot = entityA.constructor.name === 'Dot';
            const isEntityBDot = entityB.constructor.name === 'Dot';
            const isEntityABoundary = entityA.constructor.name === 'BoundaryEntity' && colliderA.type === 'circle';
            const isEntityBBoundary = entityB.constructor.name === 'BoundaryEntity' && colliderB.type === 'circle';

            if ((isEntityADot && isEntityBBoundary) || (isEntityBDot && isEntityABoundary)) {
              const dotEntity = isEntityADot ? entityA : entityB;
              // Ensure boundaryEntity is correctly assigned based on which one is the Dot
              const boundaryEntity = isEntityADot ? entityB : entityA; 

              const transformDot = dotEntity.getComponent('Transform');
              const colliderDot = dotEntity.getComponent('ColliderComponent'); // Rectangle
              const movementDot = dotEntity.getComponent('Movement'); // May be null
              const transformBoundary = boundaryEntity.getComponent('Transform');
              // Get the ColliderComponent of the boundary first
              const colliderBoundaryComponent = boundaryEntity.getComponent('ColliderComponent'); // Circle

              // Determine effective radius for the boundary entity
              const radiusComponentBoundary = boundaryEntity.getComponent('RadiusComponent');
              const effectiveBoundaryRadius = radiusComponentBoundary ? radiusComponentBoundary.radius : colliderBoundaryComponent.radius;

              const collisionVectorX = transformDot.position.x - transformBoundary.position.x;
              const collisionVectorY = transformDot.position.y - transformBoundary.position.y;
              let distance = Math.sqrt(collisionVectorX * collisionVectorX + collisionVectorY * collisionVectorY);
              let distanceForNormalCalculation = distance;

              const dotEffectiveRadius = Math.max(colliderDot.width, colliderDot.height) / 2;

              if (distance === 0) {
                if (effectiveBoundaryRadius <= dotEffectiveRadius) {
                  // Centers are coincident AND dot is same size or larger than boundary hole.
                  // Nudge needed for positional correction direction.
                  transformDot.position.x += 0.01; 
                  // This nudge defines a direction. The actual push logic will correct to the boundary edge.
                  distanceForNormalCalculation = 0.0001; // Avoid division by zero for normal.
                } else {
                  // Centers are coincident BUT dot is smaller than boundary (clearly inside).
                  // No positional nudge. For velocity reflection, normal would be undefined.
                  // Let's use a tiny distance for normal to prevent NaN, but it won't be used if no velocity.
                  distanceForNormalCalculation = 0.0001;
                }
              }

              // Positional Correction: Ensure Dot is inside or on the edge
              // This should happen even if the dot has no movement component.
              if (distance > effectiveBoundaryRadius - dotEffectiveRadius) {
                // Use distanceForNormalCalculation for normal if original distance was 0.
                // Otherwise, original distance and vector are fine.
                const normalX = collisionVectorX / distanceForNormalCalculation; 
                const normalY = collisionVectorY / distanceForNormalCalculation;
                
                transformDot.position.x = transformBoundary.position.x + normalX * (effectiveBoundaryRadius - dotEffectiveRadius);
                transformDot.position.y = transformBoundary.position.y + normalY * (effectiveBoundaryRadius - dotEffectiveRadius);
                
                // After pushing, re-calculate distance for velocity adjustment if needed.
                // This is important if the push significantly changes the geometry for reflection.
                // However, for simple reflection, the original normal might still be valid or even preferred.
                // For now, we'll keep using the original normal for velocity.
              }

              // Velocity Adjustment: Reflect velocity if moving outwards
              // This part specifically requires a Movement component.
              if (movementDot) {
                // Use distanceForNormalCalculation for normal if original distance was 0.
                const normalX = collisionVectorX / distanceForNormalCalculation; 
                const normalY = collisionVectorY / distanceForNormalCalculation;
                const dotProduct = movementDot.velocityX * normalX + movementDot.velocityY * normalY;

                if (dotProduct > 0) { // Moving outwards or along the normal away from center
                  movementDot.velocityX -= 2 * dotProduct * normalX;
                  movementDot.velocityY -= 2 * dotProduct * normalY;
                }
                
                // Set flag to request new target after collision
                movementDot.needsNewTarget = true;
              }

            } else {
              // Default collision response for other types of collisions
              const movementA = entityA.hasComponent('Movement') ? entityA.getComponent('Movement') : null;
              const movementB = entityB.hasComponent('Movement') ? entityB.getComponent('Movement') : null;

              if (movementA) {
                movementA.velocityX *= -1;
                movementA.velocityY *= -1;
                movementA.needsNewTarget = true;
              }
              if (movementB) {
                movementB.velocityX *= -1;
                movementB.velocityY *= -1;
                movementB.needsNewTarget = true;
              }

              // Basic positional correction (optional, and might need refinement)
              if (movementA && dt > 0) { 
                transformA.position.x += movementA.velocityX * dt * 0.1; // Smaller correction factor
                transformA.position.y += movementA.velocityY * dt * 0.1;
              }
              if (movementB && dt > 0 && movementA) { // if A moved, B might also need to move
                 transformB.position.x += movementB.velocityX * dt * 0.1;
                 transformB.position.y += movementB.velocityY * dt * 0.1;
              } else if (movementB && dt > 0) { // If only B has movement
                 transformB.position.x += movementB.velocityX * dt * 0.1;
                 transformB.position.y += movementB.velocityY * dt * 0.1;
              }
            }
          }
        }
      }
    }
  }
}
