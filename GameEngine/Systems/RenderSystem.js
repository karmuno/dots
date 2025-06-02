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
        // Sort entities by draw layer (entities without DrawLayer component get layer -1)
        const sortedEntities = Object.values(world.entities).sort((a, b) => {
            const layerA = a.components.DrawLayer ? a.components.DrawLayer.layer : -1;
            const layerB = b.components.DrawLayer ? b.components.DrawLayer.layer : -1;
            return layerA - layerB; // Lower layers first, higher layers on top
        });

        console.log("Rendering entities:", sortedEntities.length);
        for (const entity of sortedEntities) {
            const appearance = entity.components.Appearance;
            const transform = entity.components.Transform;

            console.log("Entity ID:", entity.id, "Has appearance:", !!appearance, "Has transform:", !!transform);
            if (appearance && transform) {
                const { x, y } = transform.position; // These are world coordinates
                const { color, shape } = appearance;
                console.log("Rendering entity at:", x, y, "color:", color, "shape:", shape);

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

                    if (entity === this.worldView.world.selectedEntity) {
                        context.strokeStyle = 'white';
                        context.lineWidth = 2;
                        context.beginPath();
                        // Draw outline slightly outside the filled circle
                        context.arc(x, y, radiusToUse + context.lineWidth / 2, 0, Math.PI * 2);
                        context.stroke();
                        context.closePath();
                    }
                } else if (shape === 'rectangle') {
                    const { width, height } = appearance;
                    // Assuming x, y from transform is top-left for rectangles as per typical canvas rect drawing
                    // If x,y is center, this would be: context.fillRect(x - width / 2, y - height / 2, width, height);
                    // Based on current Dot entity (spriteSize) and Collider (width/height), position is likely center.
                    // Let's adjust rectangle rendering to assume x,y is center for consistency.
                    const rectX = x - width / 2;
                    const rectY = y - height / 2;
                    context.fillRect(rectX, rectY, width, height);

                    if (entity === this.worldView.world.selectedEntity) {
                        context.strokeStyle = 'white';
                        context.lineWidth = 2;
                        // Draw outline slightly outside the filled rectangle
                        context.strokeRect(rectX - context.lineWidth / 2, rectY - context.lineWidth / 2, width + context.lineWidth, height + context.lineWidth);
                    }
                } else if (shape === 'sprite') {
                    const { spriteSize } = appearance; // spriteSize = { width, height }
                    const drawX = x - spriteSize.width / 2;
                    const drawY = y - spriteSize.height / 2;
                    context.fillRect(drawX, drawY, spriteSize.width, spriteSize.height);

                    if (entity === this.worldView.world.selectedEntity) {
                        context.strokeStyle = 'white';
                        context.lineWidth = 2;
                        // Draw outline slightly outside the filled sprite
                        context.strokeRect(drawX - context.lineWidth / 2, drawY - context.lineWidth / 2, spriteSize.width + context.lineWidth, spriteSize.height + context.lineWidth);
                    }
                }
                // Other shapes if any...
            }
        }
        // --- Rendering loop ends ---

        context.restore(); // Restore to the state before camera transform
    }
}

export default RenderSystem;
