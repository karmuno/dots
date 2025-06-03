import InspectableComponent from '../Components/InspectableComponent.js';

class UISystem {
    constructor(world, dotSheet, colorPicker, worldView) {
        this.world = world;
        this.dotSheet = dotSheet;
        this.colorPicker = colorPicker;
        this.worldView = worldView; // Store worldView
    }

    selectNextInspectableEntity() {
        if (!this.world || !this.world.entities) {
            console.warn("UISystem: World or entities not available.");
            return;
        }

        const inspectableEntities = Object.values(this.world.entities).filter(entity => 
            entity.components.InspectableComponent instanceof InspectableComponent
        );

        if (inspectableEntities.length === 0) {
            console.log("UISystem: No inspectable entities found.");
            // Optionally clear selection and info panel if no inspectable entities exist
            // this.world.selectedEntity = null;
            // if (this.dotSheet) this.dotSheet.clearDisplay(); 
            return;
        }

        let currentIndex = -1;
        if (this.world.selectedEntity) {
            currentIndex = inspectableEntities.findIndex(entity => entity === this.world.selectedEntity);
        }

        let nextIndex;
        if (currentIndex === -1 || currentIndex === inspectableEntities.length - 1) {
            // If nothing selected, or current is not inspectable, or current is the last, select the first
            nextIndex = 0;
        } else {
            // Select the next entity
            nextIndex = currentIndex + 1;
        }
        
        this.world.selectedEntity = inspectableEntities[nextIndex];

        if (this.dotSheet && typeof this.dotSheet.displayEntityInfo === 'function') {
            this.dotSheet.displayEntityInfo(this.world.selectedEntity);
        } else {
            console.warn("UISystem: DotSheet or displayEntityInfo method not available.");
        }

        // Update color picker to match the selected entity's color
        if (this.colorPicker && this.world.selectedEntity && this.world.selectedEntity.components.Appearance) {
            const color = this.world.selectedEntity.components.Appearance.color;
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            this.colorPicker.setColor(r, g, b, true); // Silent update to avoid triggering change event
        }

        console.log("UISystem: Selected entity:", this.world.selectedEntity ? this.world.selectedEntity.id : 'none');

        // Update FollowCam target
        const followCam = this.worldView ? this.worldView.getFollowCam() : null;
        if (followCam) {
            followCam.setTargetEntity(this.world.selectedEntity || null);
        }
    }

    selectPreviousInspectableEntity() {
        if (!this.world || !this.world.entities) {
            console.warn("UISystem: World or entities not available.");
            return;
        }

        const inspectableEntities = Object.values(this.world.entities).filter(entity =>
            entity.components.InspectableComponent instanceof InspectableComponent
        );

        if (inspectableEntities.length === 0) {
            console.log("UISystem: No inspectable entities found.");
            // Optionally clear selection if needed, similar to selectNextInspectableEntity
            // this.world.selectedEntity = null;
            // if (this.dotSheet) this.dotSheet.clearDisplay();
            return;
        }

        let currentIndex = -1;
        if (this.world.selectedEntity) {
            currentIndex = inspectableEntities.findIndex(entity => entity === this.world.selectedEntity);
        }

        let prevIndex;
        if (currentIndex === -1 || currentIndex === 0) {
            // If nothing selected, or current is not inspectable, or current is the first, select the last
            prevIndex = inspectableEntities.length - 1;
        } else {
            // Select the previous entity
            prevIndex = currentIndex - 1;
        }

        this.world.selectedEntity = inspectableEntities[prevIndex];

        if (this.dotSheet && typeof this.dotSheet.displayEntityInfo === 'function') {
            this.dotSheet.displayEntityInfo(this.world.selectedEntity);
        } else {
            console.warn("UISystem: DotSheet or displayEntityInfo method not available.");
        }

        // Update color picker to match the selected entity's color
        if (this.colorPicker && this.world.selectedEntity && this.world.selectedEntity.components.Appearance) {
            const color = this.world.selectedEntity.components.Appearance.color;
            // Assuming color is in hex format like #RRGGBB
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            this.colorPicker.setColor(r, g, b, true); // Silent update
        }

        console.log("UISystem: Selected entity (previous):", this.world.selectedEntity ? this.world.selectedEntity.id : 'none');

        // Update FollowCam target
        const followCam = this.worldView ? this.worldView.getFollowCam() : null;
        if (followCam) {
            followCam.setTargetEntity(this.world.selectedEntity || null);
        }
    }
}

export default UISystem;
