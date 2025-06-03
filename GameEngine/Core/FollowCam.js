import Camera from './Camera.js';

class FollowCam extends Camera {
    constructor(canvas, entityToFollow, zoomLevel = 2) { // zoomLevel can be adjusted
        super(canvas);
        this.entityToFollow = entityToFollow;
        this.zoom = zoomLevel; // Set a default zoom level for follow cam
        this.fixedZoom = zoomLevel; // Store the fixed zoom level

        // Calculate zoom to make ~25 screen pixels correspond to world radius
        // If entity has a radius component, use that, otherwise default to a world radius
        // For now, let's assume a default world radius of 10 units for the 25px target.
        // So, if 25 screen pixels = 10 world units * zoom, then zoom = 25 / 10 = 2.5
        // This needs to be more dynamic based on actual entity size later.
        // For now, we'll use a passed in zoomLevel or a default.
    }

    setTargetEntity(entity) {
        this.entityToFollow = entity;
    }

    // Override zoomBy to prevent changing zoom for FollowCam
    zoomBy(factor, mouseX, mouseY) {
        // FollowCam has a fixed zoom, so this method is disabled or does nothing
        // Or, if we want to allow temporary zoom adjustments, implement that logic here
        // For now, let's keep it fixed as per initial plan.
        console.log("FollowCam zoom is fixed and cannot be changed by zoomBy.");
    }

    update() {
        if (this.entityToFollow && this.entityToFollow.components.Transform) {
            const targetPosition = this.entityToFollow.components.Transform.position;
            this.x = targetPosition.x;
            this.y = targetPosition.y;
        }
        // Ensure zoom remains fixed
        this.zoom = this.fixedZoom;
    }

    // Override applyTransform if we need different behavior,
    // but the parent Camera's applyTransform should work fine.
    // applyTransform(context) {
    //     super.applyTransform(context);
    // }
}

export default FollowCam;
