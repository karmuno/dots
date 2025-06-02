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

            if (appearance && transform && appearance.shape === 'circle') {
                const { x, y } = transform.position;
                const { color, radius } = appearance;

                context.beginPath();
                context.arc(x, y, radius, 0, Math.PI * 2);
                context.fillStyle = color;
                context.fill();
                context.closePath();
            }
        }
    }
}

export default RenderSystem;
