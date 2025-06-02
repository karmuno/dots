class Camera {
    constructor(canvas) {
        this.canvas = canvas; // Store canvas reference
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
    }

    pan(dx, dy) {
        this.x += dx / this.zoom; // Adjust pan speed by zoom level
        this.y += dy / this.zoom; // Adjust pan speed by zoom level
    }

    zoomBy(factor, mouseX, mouseY) {
        // mouseX and mouseY are canvas coordinates
        const prevZoom = this.zoom;
        this.zoom *= factor;
        this.zoom = Math.max(0.1, Math.min(this.zoom, 10)); // Clamp zoom level

        // Adjust camera position to zoom towards the mouse pointer
        // Convert mouse screen coordinates to world coordinates before zoom
        const worldMouseX = (mouseX - this.canvas.width / 2) / prevZoom + this.x;
        const worldMouseY = (mouseY - this.canvas.height / 2) / prevZoom + this.y;

        // Pan so the world point under the mouse remains under the mouse after zoom
        this.x = worldMouseX - (mouseX - this.canvas.width / 2) / this.zoom;
        this.y = worldMouseY - (mouseY - this.canvas.height / 2) / this.zoom;
    }

    applyTransform(context) {
        // Translate to the center of the canvas, scale, then pan
        context.translate(this.canvas.width / 2, this.canvas.height / 2);
        context.scale(this.zoom, this.zoom);
        context.translate(-this.x, -this.y);
    }
}

export default Camera;
