class RenderSystem {
    constructor(worldView) {
        this.worldView = worldView;
    }

    render(world) {
        const context = this.worldView.getContext();
        const camera = this.worldView.getCamera(); // Get the camera

        this.worldView.clear(); // Clear happens in screen space, before camera transform

        context.save(); // Save the current state (like transformations, fillStyle, etc.)
        camera.applyTransform(context); // Apply camera's pan and zoom

        // --- Rendering loop starts ---
        for (const entity of Object.values(world.entities)) {
            const appearance = entity.components.Appearance;
            const transform = entity.components.Transform;

            if (appearance && transform) {
                const { x, y } = transform.position; // These are world coordinates
                const { color, shape } = appearance;

                context.fillStyle = color;

                if (shape === 'circle') {
                    let radiusToUse;
                    if (entity.components.RadiusComponent) {
                        radiusToUse = entity.components.RadiusComponent.radius;
                    } else {
                        radiusToUse = appearance.radius; // Fallback to Appearance component's radius
                    }
                    // Ensure radiusToUse has a sensible default if both are undefined, e.g., 10
                    radiusToUse = radiusToUse || 10;

                    context.beginPath();
                    context.arc(x, y, radiusToUse, 0, Math.PI * 2); // Use radiusToUse
                    context.fill();
                    context.closePath();
                } else if (shape === 'rectangle') {
                    const { width, height } = appearance;
                    context.fillRect(x, y, width, height);
                }
                // Other shapes if any...
            }
        }
        // --- Rendering loop ends ---

        context.restore(); // Restore to the state before camera transform
    }
}

export default RenderSystem;
