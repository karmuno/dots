import MetabolizerComponent from '../Components/MetabolizerComponent.js';
import NutrientComponent from '../Components/NutrientComponent.js';
import Transform from '../Components/Transform.js';
import ColliderComponent from '../Components/ColliderComponent.js';
import Dit from '../Entities/Dit.js'; // To create waste Dits

class EatingSystem {
  constructor(world) {
    this.world = world;
  }

  update(deltaTime) {
    if (!this.world || !this.world.entities) {
      return;
    }

    const entities = Object.values(this.world.entities);
    const dots = entities.filter(e => e.hasComponent('MetabolizerComponent') && e.hasComponent('ColliderComponent') && e.hasComponent('Transform') && e.constructor.name === 'Dot');
    const dits = entities.filter(e => e.hasComponent('NutrientComponent') && e.hasComponent('ColliderComponent') && e.hasComponent('Transform') && e.constructor.name === 'Dit');

    for (const dot of dots) {
      const dotMetabolizer = dot.getComponent('MetabolizerComponent');
      const dotTransform = dot.getComponent('Transform');
      const dotCollider = dot.getComponent('ColliderComponent');

      // Check if metabolizer has space
      if (dotMetabolizer.getTotalStoredNutrients() >= dotMetabolizer.getMaxStorage()) {
        continue; // Skip if storage is full
      }

      for (const dit of dits) {
        if (!this.world.entities[dit.id]) continue; // Dit might have been consumed by another dot in the same tick

        const ditNutrient = dit.getComponent('NutrientComponent');
        const ditTransform = dit.getComponent('Transform');
        const ditCollider = dit.getComponent('ColliderComponent');

        // Basic AABB collision detection
        // Assumes colliders are rectangles and positions are centers
        const dotLeft = dotTransform.position.x - dotCollider.width / 2;
        const dotRight = dotTransform.position.x + dotCollider.width / 2;
        const dotTop = dotTransform.position.y - dotCollider.height / 2;
        const dotBottom = dotTransform.position.y + dotCollider.height / 2;

        const ditLeft = ditTransform.position.x - ditCollider.width / 2;
        const ditRight = ditTransform.position.x + ditCollider.width / 2;
        const ditTop = ditTransform.position.y - ditCollider.height / 2;
        const ditBottom = ditTransform.position.y + ditCollider.height / 2;

        const haveCollided = dotLeft < ditRight && dotRight > ditLeft &&
                             dotTop < ditBottom && dotBottom > ditTop;

        if (haveCollided) {
          const availableStorage = dotMetabolizer.getMaxStorage() - dotMetabolizer.getTotalStoredNutrients();
          if (availableStorage <= 0) continue; // Double check, should have been caught earlier

          const absorbRed = Math.min(ditNutrient.getRed(), dotMetabolizer.getMaxRedAbsorption());
          const absorbGreen = Math.min(ditNutrient.getGreen(), dotMetabolizer.getMaxGreenAbsorption());
          const absorbBlue = Math.min(ditNutrient.getBlue(), dotMetabolizer.getMaxBlueAbsorption());

          // How much can actually be added to storage
          const { redAdded, greenAdded, blueAdded } = dotMetabolizer.addNutrients(absorbRed, absorbGreen, absorbBlue);

          if (redAdded > 0 || greenAdded > 0 || blueAdded > 0) {
            ditNutrient.decreaseNutrients(redAdded, greenAdded, blueAdded);

            if (ditNutrient.getTotalNutrients() <= 0) {
              this.world.removeEntity(dit.id);
            } else {
              // Create waste Dit with remaining nutrients
              // The Dit's appearance should update automatically if its constructor sets color from nutrients
              // or if it has a method to update appearance that gets called.
              // For simplicity, we assume the original Dit becomes the "waste" Dit by having its nutrients reduced.
              // Its appearance should be updated.
              if (dit.updateAppearanceColor) {
                 dit.updateAppearanceColor();
              }
              // According to the design: "If nutrient entity still has nutrients remaining, create new entity with remaining nutrients. Original nutrient entity is removed from world"
              // So, let's adhere to that.
              const wasteNutrients = {
                red: ditNutrient.getRed(),
                green: ditNutrient.getGreen(),
                blue: ditNutrient.getBlue()
              };
              const wasteDitId = `waste_${dit.id}_${Date.now()}`; // Ensure unique ID
              const wasteDit = new Dit(wasteDitId, ditTransform.position.x, ditTransform.position.y, wasteNutrients);
              this.world.addEntity(wasteDit);

              // Remove original Dit
              this.world.removeEntity(dit.id);
            }
          }
        }
      }
    }
  }
}

export default EatingSystem;
