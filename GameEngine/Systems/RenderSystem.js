class RenderSystem {
    constructor(worldView) {
        this.worldView = worldView;
    }

    render(world) {
        const context = this.worldView.getContext();
        this.worldView.clear();

        for (const entity of Object.values(world.entities)) {
            const appearance = entity.components.Appearance;
            const transform = entity.components.Transform;

            if (appearance && transform) {
                const { x, y } = transform.position;
                const { color, shape } = appearance;

                context.fillStyle = color;

                if (shape === 'circle') {
                    const { radius } = appearance;
                    context.beginPath();
                    context.arc(x, y, radius, 0, Math.PI * 2);
                    context.fill();
                    context.closePath();
                } else if (shape === 'rectangle') {
                    const { width, height } = appearance;
                    // For rectangles, x and y are typically the top-left corner.
                    // If your transform.position is center-based, you'll need to adjust.
                    // Assuming x, y from transform is top-left for now.
                    context.fillRect(x, y, width, height);
                }
            }
        }
    }
}

export default RenderSystem;
