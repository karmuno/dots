import Movement from '../Components/Movement.js';
import EnergyComponent from '../Components/EnergyComponent.js';
import MetabolizerComponent from '../Components/MetabolizerComponent.js';
// Assuming Dits are instances of a Dit class. If using a component to identify Dits, import that.
// import Dit from '../Entities/Dit.js'; // Or check entity.constructor.name === 'Dit'

// Vector Math Helpers
function dot(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y;
}

function subtract(v1, v2) {
  return { x: v1.x - v2.x, y: v1.y - v2.y };
}

function add(v1, v2) {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}

function multiplyScalar(v, scalar) {
  return { x: v.x * scalar, y: v.y * scalar };
}

function magnitude(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

function normalize(v) {
  const mag = magnitude(v);
  if (mag === 0) {
    return { x: 0, y: 0 }; // Or handle error/return as appropriate
  }
  return { x: v.x / mag, y: v.y / mag };
}

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
            // Dot-Dit collision and consumption logic
            const isEntityADot = entityA.constructor.name === 'Dot';
            const isEntityBDot = entityB.constructor.name === 'Dot';
            const isEntityADit = entityA.constructor.name === 'Dit'; // Assuming Dit class exists and is used
            const isEntityBDit = entityB.constructor.name === 'Dit'; // Assuming Dit class exists and is used

            if ((isEntityADot && isEntityBDit) || (isEntityADit && isEntityBDot)) {
                const dotEntity = isEntityADot ? entityA : entityB;
                const ditEntity = isEntityADit ? entityA : entityB;

                if (dotEntity.hasComponent('EnergyComponent') && dotEntity.hasComponent('MetabolizerComponent')) {
                    const energyComponent = dotEntity.getComponent('EnergyComponent');
                    const metabolizerComponent = dotEntity.getComponent('MetabolizerComponent');

                    const DIT_ENERGY_VALUE = 10; // As per HUNGER_METABOLISM_BUILD_PLAN.md
                    const energyGained = DIT_ENERGY_VALUE * metabolizerComponent.getEfficiency();

                    energyComponent.increaseEnergy(energyGained);
                    world.removeEntity(ditEntity.id); // Remove Dit from the world

                    // console.log(`Dot ${dotEntity.id} consumed Dit ${ditEntity.id} and gained ${energyGained} energy.`);

                    // After consumption, skip further collision response for this pair in this iteration.
                    // This means the Dit won't cause a physics bounce with the Dot that just ate it.
                    continue; // Skip to the next entity pair
                }
            }

            // Regular collision physics response if not a Dot-Dit consumption
            let normal = { x: 0, y: 0 };
            let penetrationDepth = 0; // Will be calculated later

            // Determine entities for Circle-Rectangle collision to get closestX, closestY
            let closestX, closestY; // Declared here to be accessible for normal calculation

            if (colliderA.type === 'rectangle' && colliderB.type === 'rectangle') {
              const overlapX = (colliderA.width / 2 + colliderB.width / 2) - Math.abs(transformA.position.x - transformB.position.x);
              const overlapY = (colliderA.height / 2 + colliderB.height / 2) - Math.abs(transformA.position.y - transformB.position.y);

              if (overlapX < overlapY) {
                normal.x = transformA.position.x < transformB.position.x ? -1 : 1;
                normal.y = 0;
                penetrationDepth = overlapX;
                // Ensure normal points from B to A
                if (transformA.position.x < transformB.position.x) { // A is left of B, normal should point right
                    normal.x = 1;
                } else { // A is right of B, normal should point left
                    normal.x = -1;
                }
              } else {
                normal.x = 0;
                normal.y = transformA.position.y < transformB.position.y ? -1 : 1;
                penetrationDepth = overlapY;
                // Ensure normal points from B to A
                if (transformA.position.y < transformB.position.y) { // A is above B, normal should point down
                    normal.y = 1;
                } else { // A is below B, normal should point up
                    normal.y = -1;
                }
              }
              // The normal calculated here is already from B to A if we consider A's reaction to B.
              // If A is to the left of B (A.x < B.x), A hit B's right side. Normal for A's reflection points left (-1,0).
              // To make it "from B to A": if A is left of B, B is to the right of A. Normal from B to A is (-1, 0).
              // Let's adjust:
              if (overlapX < overlapY) {
                if (transformA.position.x < transformB.position.x) { // A is left of B
                    normal.x = -1; // Normal from B to A is to the left
                } else { // A is right of B
                    normal.x = 1;  // Normal from B to A is to the right
                }
                normal.y = 0;
              } else {
                if (transformA.position.y < transformB.position.y) { // A is above B
                    normal.y = -1; // Normal from B to A is upwards
                } else { // A is below B
                    normal.y = 1;  // Normal from B to A is downwards
                }
                normal.x = 0;
              }


            } else if ((colliderA.type === 'circle' && colliderB.type === 'rectangle') || (colliderA.type === 'rectangle' && colliderB.type === 'circle')) {
              const circleEntity = colliderA.type === 'circle' ? entityA : entityB;
              const circleTransform = colliderA.type === 'circle' ? transformA : transformB;
              const circleCollider = colliderA.type === 'circle' ? colliderA : colliderB;
              const rectEntity = colliderA.type === 'rectangle' ? entityA : entityB;
              const rectTransform = colliderA.type === 'rectangle' ? transformA : transformB;
              const rectCollider = colliderA.type === 'rectangle' ? colliderA : colliderB;
              
              const radiusComponentCircle = circleEntity.getComponent('RadiusComponent');
              const r = radiusComponentCircle ? radiusComponentCircle.radius : circleCollider.radius;

              // closestX/Y logic is from the original collision detection for circle-rect
              closestX = clamp(circleTransform.position.x, rectTransform.position.x - rectCollider.width / 2, rectTransform.position.x + rectCollider.width / 2);
              closestY = clamp(circleTransform.position.y, rectTransform.position.y - rectCollider.height / 2, rectTransform.position.y + rectCollider.height / 2);

              let normalVec = {
                x: circleTransform.position.x - closestX,
                y: circleTransform.position.y - closestY
              };
              
              if (normalVec.x === 0 && normalVec.y === 0) {
                // Circle center is at the closest point on the rectangle.
                // This can happen if circle center is inside the rectangle or exactly on an edge/corner.
                // Determine normal based on minimum penetration from rectangle's perspective.
                // Normal should point from rectangle towards circle.

                const rectLeft = rectTransform.position.x - rectCollider.width / 2;
                const rectRight = rectTransform.position.x + rectCollider.width / 2;
                const rectTop = rectTransform.position.y - rectCollider.height / 2;
                const rectBottom = rectTransform.position.y + rectCollider.height / 2;

                // Calculate how much the circle *center* has passed the rect edges.
                // This is not the same as AABB overlap but gives a hint for normal direction from rect center towards circle center.
                // A better way is to calculate overlaps of the circle's bounding box with the rectangle's edges,
                // or distances from circle center to extended lines of rectangle edges.

                // Using overlaps of circle with the rectangle's faces:
                // Positive value means overlap.
                const overlapLeft = (circleTransform.position.x + r) - rectLeft;
                const overlapRight = rectRight - (circleTransform.position.x - r);
                const overlapTop = (circleTransform.position.y + r) - rectTop; // Corrected: circle Y + radius vs rect Top Y
                const overlapBottom = rectBottom - (circleTransform.position.y - r); // Corrected: rect Bottom Y vs circle Y - radius

                let minOverlap = Infinity;
                let chosenAxis = null;

                if (overlapLeft > 0 && overlapLeft < minOverlap) {
                  minOverlap = overlapLeft;
                  chosenAxis = 'left';
                }
                if (overlapRight > 0 && overlapRight < minOverlap) {
                  minOverlap = overlapRight;
                  chosenAxis = 'right';
                }
                if (overlapTop > 0 && overlapTop < minOverlap) {
                  minOverlap = overlapTop;
                  chosenAxis = 'top';
                }
                if (overlapBottom > 0 && overlapBottom < minOverlap) {
                  minOverlap = overlapBottom;
                  chosenAxis = 'bottom';
                }
                
                // Set dx, dy based on chosen axis (normal from rect towards circle)
                if (chosenAxis === 'left') { // Circle hit left face of rect
                  normalVec.x = -1; normalVec.y = 0;
                } else if (chosenAxis === 'right') { // Circle hit right face of rect
                  normalVec.x = 1; normalVec.y = 0;
                } else if (chosenAxis === 'top') { // Circle hit top face of rect
                  normalVec.x = 0; normalVec.y = -1;
                } else if (chosenAxis === 'bottom') { // Circle hit bottom face of rect
                  normalVec.x = 0; normalVec.y = 1;
                } else {
                  // Fallback: very degenerate case (e.g. circle center perfectly on rect center)
                  // Or if all overlaps are somehow zero or negative (shouldn't happen if collision detected)
                  // Attempt to use vector from rect center to circle center.
                  let vecRectToCircleX = circleTransform.position.x - rectTransform.position.x;
                  let vecRectToCircleY = circleTransform.position.y - rectTransform.position.y;
                  if (vecRectToCircleX === 0 && vecRectToCircleY === 0) { // Still zero?
                    normalVec.x = 1; normalVec.y = 0; // Default if truly stuck
                  } else {
                    // Normalize this vector
                    const magRectToCircle = magnitude({x: vecRectToCircleX, y: vecRectToCircleY});
                    normalVec.x = vecRectToCircleX / magRectToCircle;
                    normalVec.y = vecRectToCircleY / magRectToCircle;
                  }
                }
              }
              
              // Penetration depth for circle-rectangle
              // Recalculate distanceToClosestPoint if normalVec was (0,0) and now it's based on face normal
              // However, penetration depth is more about how much to push out.
              // Original distanceToClosestPoint is based on clamp logic.
              // If normalVec was (0,0), distanceToClosestPoint was 0. Penetration = r.
              // This is generally correct if the center is inside.
              const distanceToClosestPoint = magnitude({
                x: circleTransform.position.x - closestX, // original dx, dy before fix
                y: circleTransform.position.y - closestY
              });
              penetrationDepth = r - distanceToClosestPoint;
              // If penetration depth is negative or zero due to corrected normal logic path (e.g. if dx/dy were zero initially),
              // it implies the objects are just touching or separating along the new normal.
              // A more robust penetration depth might be needed if the initial dx/dy were zero.
              // For instance, if normalVec.x is now -1 (hit left face), penetration could be (cx+r) - rectLeft.
              if (normalVec.x === -1 && normalVec.y === 0) penetrationDepth = (circleTransform.position.x + r) - (rectTransform.position.x - rectCollider.width/2);
              else if (normalVec.x === 1 && normalVec.y === 0) penetrationDepth = (rectTransform.position.x + rectCollider.width/2) - (circleTransform.position.x - r);
              else if (normalVec.y === -1 && normalVec.x === 0) penetrationDepth = (circleTransform.position.y + r) - (rectTransform.position.y - rectCollider.height/2);
              else if (normalVec.y === 1 && normalVec.x === 0) penetrationDepth = (rectTransform.position.y + rectCollider.height/2) - (circleTransform.position.y - r);
              // Ensure penetration is not negative
              if (penetrationDepth < 0) penetrationDepth = 0;


              normal = normalize(normalVec);

              // Ensure normal points from B to A.
              // If entityA is the circle, normal is already (CirclePos - ClosestPointOnRect), which is from Rect (B) to Circle (A). This is correct.
              // If entityB is the circle, normalVec was (CirclePosB - ClosestPointOnRectA). We need to flip it to be from A to B.
              // Or, more consistently, always calculate from B (the rectangle) to A (the circle).
              // The current 'normal' is from the rectangle surface to the circle center.
              // If entityA is circle, normal is from B to A. (Correct)
              // If entityB is circle, normal is from A to B. (Needs to be flipped for consistent "from B to A" if B is rect, A is circle)

              if (entityB.getComponent('ColliderComponent').type === 'circle') { // If B is the circle, A is the rectangle
                // normalVec was from A (rect) to B (circle). We want from B to A, so we flip.
                // No, the logic for normal calculation is: normal = normalize(circlePos - closestPointOnRect)
                // If A is circle, normal = normalize(posA - closestToA_onB). This is from B to A. Correct.
                // If B is circle, normal = normalize(posB - closestToB_onA). This is from A to B. Needs flip.
                normal.x *= -1;
                normal.y *= -1;
              }
            }


            const isEntityADot = entityA.constructor.name === 'Dot';
            const isEntityBDot = entityB.constructor.name === 'Dot';
            const isEntityABoundary = entityA.constructor.name === 'BoundaryEntity' && colliderA.type === 'circle';
            const isEntityBBoundary = entityB.constructor.name === 'BoundaryEntity' && colliderB.type === 'circle';

            // TODO: Integrate Dot-Boundary logic with the new normal calculation if possible, or handle separately.
            // For now, the new normal calculation will proceed, and we'll see how to merge or adapt.

            if ((isEntityADot && isEntityBBoundary) || (isEntityBDot && isEntityABoundary)) {
              // This block has specific logic for Dot-Boundary. We need to reconcile this with the generalized normal.
              // The existing Dot-Boundary logic already calculates a normal and handles reflection.
              // Let's skip the new reflection for this specific case for now and use its own.
              const dotEntity = isEntityADot ? entityA : entityB;
              const boundaryEntity = isEntityADot ? entityB : entityA; 

              const transformDot = dotEntity.getComponent('Transform');
              const colliderDot = dotEntity.getComponent('ColliderComponent'); 
              const movementDot = dotEntity.getComponent('Movement'); 
              const transformBoundary = boundaryEntity.getComponent('Transform');
              const colliderBoundaryComponent = boundaryEntity.getComponent('ColliderComponent'); 

              const radiusComponentBoundary = boundaryEntity.getComponent('RadiusComponent');
              const effectiveBoundaryRadius = radiusComponentBoundary ? radiusComponentBoundary.radius : colliderBoundaryComponent.radius;

              const collisionVectorX = transformDot.position.x - transformBoundary.position.x;
              const collisionVectorY = transformDot.position.y - transformBoundary.position.y;
              let distance = Math.sqrt(collisionVectorX * collisionVectorX + collisionVectorY * collisionVectorY);
              let distanceForNormalCalculation = distance;
              const dotEffectiveRadius = Math.max(colliderDot.width, colliderDot.height) / 2;

              if (distance === 0) {
                distanceForNormalCalculation = 0.0001; // Avoid division by zero
                 // Apply a small nudge if centers are coincident to define a normal
                if (effectiveBoundaryRadius <= dotEffectiveRadius) {
                    transformDot.position.x += 0.01; 
                }
              }
              
              // Normal for Dot-Boundary (pointing from boundary center to dot center)
              let boundaryNormalX = collisionVectorX / distanceForNormalCalculation;
              let boundaryNormalY = collisionVectorY / distanceForNormalCalculation;
              
              // Positional Correction for Dot-Boundary
              if (distance > effectiveBoundaryRadius - dotEffectiveRadius || distance === 0 ) { // distance === 0 implies overlap if dot is larger or same size
                if (distance === 0 && effectiveBoundaryRadius <= dotEffectiveRadius) {
                     // Recalculate normal based on nudge if centers were coincident
                     const nudgedCollisionVectorX = transformDot.position.x - transformBoundary.position.x;
                     const nudgedCollisionVectorY = transformDot.position.y - transformBoundary.position.y;
                     const nudgedDistance = Math.sqrt(nudgedCollisionVectorX*nudgedCollisionVectorX + nudgedCollisionVectorY*nudgedCollisionVectorY);
                     if (nudgedDistance > 0) {
                        boundaryNormalX = nudgedCollisionVectorX / nudgedDistance;
                        boundaryNormalY = nudgedCollisionVectorY / nudgedDistance;
                     }
                }
                transformDot.position.x = transformBoundary.position.x + boundaryNormalX * (effectiveBoundaryRadius - dotEffectiveRadius);
                transformDot.position.y = transformBoundary.position.y + boundaryNormalY * (effectiveBoundaryRadius - dotEffectiveRadius);
              }

              // Velocity Adjustment for Dot-Boundary
              if (movementDot) {
                const dotProductCalc = movementDot.velocityX * boundaryNormalX + movementDot.velocityY * boundaryNormalY;
                if (dotProductCalc > 0) { 
                  movementDot.velocityX -= 2 * dotProductCalc * boundaryNormalX;
                  movementDot.velocityY -= 2 * dotProductCalc * boundaryNormalY;
                }
              }

            } else {
              // Default collision response for other types of collisions (USING NEW NORMAL)
              const movementA = entityA.hasComponent('Movement') ? entityA.getComponent('Movement') : null;
              const movementB = entityB.hasComponent('Movement') ? entityB.getComponent('Movement') : null;

              if (movementA && !movementB) { // A is movable, B is immovable
                const vA = { x: movementA.velocityX, y: movementA.velocityY };
                const dotProduct = dot(vA, normal);
                
                movementA.velocityX = vA.x - 2 * dotProduct * normal.x;
                movementA.velocityY = vA.y - 2 * dotProduct * normal.y;

              } else if (!movementA && movementB) { // B is movable, A is immovable
                const vB = { x: movementB.velocityX, y: movementB.velocityY };
                // Normal should be from A to B for this formula, so we use -normal
                const normalFromAToB = { x: -normal.x, y: -normal.y };
                const dotProduct = dot(vB, normalFromAToB);

                movementB.velocityX = vB.x - 2 * dotProduct * normalFromAToB.x;
                movementB.velocityY = vB.y - 2 * dotProduct * normalFromAToB.y;

              } else if (movementA && movementB) { // Both are movable
                const vA = { x: movementA.velocityX, y: movementA.velocityY };
                const vB = { x: movementB.velocityX, y: movementB.velocityY };

                const relativeVelocity = subtract(vA, vB); // vA - vB
                const dotProduct = dot(relativeVelocity, normal);

                // Apply collision response if objects have collided and both are movable.
                // The dotProduct check can be debated for perfectly elastic collisions with positional correction,
                // as the correction step should prevent sticking. If they are overlapping,
                // the velocity exchange should occur based on the normal of collision.
                // Removing the "if (dotProduct < 0)" condition means they will always exchange momentum if they are overlapping and both are movable.
                movementA.velocityX = vA.x - dotProduct * normal.x;
                movementA.velocityY = vA.y - dotProduct * normal.y;

                movementB.velocityX = vB.x + dotProduct * normal.x;
                movementB.velocityY = vB.y + dotProduct * normal.y;
              }
              // If neither is movable, no velocity change. (This comment is fine, refers to the if/else if chain above)

              // Positional Correction (Anti-Penetration) for non-Dot-Boundary collisions
              if (penetrationDepth > 0) {
                const correctionFactor = 0.5; // Distribute correction if both are movable
                const slop = 0.01; // Small value to prevent floating point issues and sticking

                if (movementA && !movementB) { // A is movable, B is immovable
                  // Move A by the full penetration depth along the normal (normal is from B to A)
                  transformA.position.x += normal.x * (penetrationDepth + slop);
                  transformA.position.y += normal.y * (penetrationDepth + slop);
                } else if (!movementA && movementB) { // B is movable, A is immovable
                  // Move B by the full penetration depth against the normal (normal is from B to A, so B moves along -normal)
                  transformB.position.x -= normal.x * (penetrationDepth + slop);
                  transformB.position.y -= normal.y * (penetrationDepth + slop);
                } else if (movementA && movementB) { // Both are movable
                  // Distribute the correction
                  transformA.position.x += normal.x * (penetrationDepth * correctionFactor + slop);
                  transformA.position.y += normal.y * (penetrationDepth * correctionFactor + slop);
                  
                  transformB.position.x -= normal.x * (penetrationDepth * correctionFactor + slop);
                  transformB.position.y -= normal.y * (penetrationDepth * correctionFactor + slop);
                }
                // If neither is movable, no positional correction is applied from here unless explicitly handled.
              }
            }
          }
        }
      }
    }
  }
}
