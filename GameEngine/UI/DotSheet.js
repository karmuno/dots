// GameEngine/UI/DotSheet.js
import EnergyComponent from '../Components/EnergyComponent.js';

/**
 * @class DotSheet
 * @description Manages the UI panel that displays information about a selected entity.
 */
export default class DotSheet {
  /**
   * @constructor
   * @param {string} panelId - The ID of the HTML element that will serve as the panel.
   */
  constructor(panelId) {
    this.panelElement = document.getElementById(panelId);
    if (!this.panelElement) {
      console.error(`DotSheet: Panel element with ID '${panelId}' not found.`);
      return;
    }
    this.selectedEntity = null;
    // Initial content can be set here or managed by default HTML in index.html
    this.panelElement.innerHTML = '<p>Select an inspectable entity to see its information.</p>';
  }

  /**
   * Displays information about the given entity in the panel.
   * @param {Entity|null} entity - The entity to display, or null to clear the panel.
   */
  displayEntityInfo(entity) {
    this.selectedEntity = entity; // Keep track of the selected entity

    if (!this.panelElement) return;

    if (!entity) {
      this.panelElement.innerHTML = '<p>No entity selected or entity is not inspectable.</p>';
      return;
    }

    // Ensure the entity has the necessary components
    const transform = entity.components.Transform;
    const appearance = entity.components.Appearance;
    const movement = entity.components.Movement;
    const energyComponent = entity.components.EnergyComponent; // Get the EnergyComponent
    // ID is a property of the entity itself
    const id = entity.id;

    // Check for core components, EnergyComponent is handled separately for its display block
    if (!transform || !appearance || !movement) {
      this.panelElement.innerHTML = `<p>Entity ${id} is missing core components (Transform, Appearance, or Movement) for display.</p>`;
      console.warn(`DotSheet: Entity ${id} is missing Transform, Appearance, or Movement components.`);
      return;
    }

    // Build the HTML content for the panel
    // Using a more structured approach for future expandability
    let htmlContent = '<h4>Entity Information</h4>';
    htmlContent += '<div class="info-group">'; // Group for basic info

    htmlContent += `<div class="info-item"><span class="info-label">ID:</span> ${id}</div>`;
    htmlContent += `<div class="info-item"><span class="info-label">Color:</span> ${appearance.color}</div>`;
    
    htmlContent += '</div>'; // End of basic info group
    htmlContent += '<div class="info-group">'; // Group for dynamic info

    htmlContent += `<div class="info-item"><span class="info-label">Position:</span> 
                    X: ${transform.position.x.toFixed(2)}, 
                    Y: ${transform.position.y.toFixed(2)}
                  </div>`;
    htmlContent += `<div class="info-item"><span class="info-label">Speed:</span> 
                    VX: ${movement.velocityX.toFixed(2)}, 
                    VY: ${movement.velocityY.toFixed(2)}
                  </div>`;
    htmlContent += '</div>'; // End of dynamic info group

    htmlContent += '<h4>Energy Status</h4>';
    htmlContent += '<div class="info-group">'; // Group for Energy

    if (energyComponent) {
        const currentEnergy = energyComponent.getEnergy(); // Using getter
        const maxEnergy = energyComponent.maxEnergy;

        htmlContent += `<div class="info-item"><span class="info-label">Energy:</span> ${currentEnergy.toFixed(1)} / ${maxEnergy}</div>`;
        htmlContent += `<div class="progress-bar-container"><div class="progress-bar energy" style="width: ${(currentEnergy / maxEnergy * 100).toFixed(0)}%;"></div></div>`;
    } else {
        htmlContent += '<div class="info-item">No EnergyComponent found.</div>';
    }
    htmlContent += '</div>'; // End of Energy group

    this.panelElement.innerHTML = htmlContent;
  }

  /**
   * Updates the displayed information for the currently selected entity.
   * This is intended to be called in the game loop for real-time updates.
   */
  update() {
    if (!this.panelElement || !this.selectedEntity) {
      // If no entity is selected, or panel doesn't exist, do nothing or ensure cleared state
      // this.displayEntityInfo(null); // Optionally clear if entity becomes null
      return;
    }

    // Re-fetch components as their properties might have changed
    const transform = this.selectedEntity.components.Transform;
    const movement = this.selectedEntity.components.Movement;
    const appearance = this.selectedEntity.components.Appearance; // For color, if it can change
    const id = this.selectedEntity.id;

    if (!transform || !movement || !appearance) {
        // Handle cases where components might have been removed dynamically (if possible in your engine)
        // Or if the entity is no longer valid.
        this.displayEntityInfo(null); // Clear panel if entity is no longer valid for display
        return;
    }
    
    // More efficient update: only update parts of the DOM that change,
    // but for simplicity, re-rendering the content is acceptable for a few fields.
    // For a more complex panel, consider updating individual DOM elements.
    this.displayEntityInfo(this.selectedEntity);
  }

  /**
   * Clears the panel and deselects any entity.
   */
  clearPanel() {
    this.selectedEntity = null;
    if (this.panelElement) {
      this.panelElement.innerHTML = '<p>Select an inspectable entity to see its information.</p>';
    }
  }
}

// Add basic CSS for .info-item, .info-label, .info-group to index.html if not already done.
// Example CSS to add to index.html <style> section:
/*
.info-group {
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid #eee;
}
.info-group:last-child {
    border-bottom: none;
}
.info-item {
    margin-bottom: 5px;
    font-size: 0.9em;
}
.info-label {
    font-weight: bold;
    color: #333;
}
*/
